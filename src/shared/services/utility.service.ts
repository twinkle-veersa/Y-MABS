import { effect, Injectable, signal } from '@angular/core';
import { FieldConfig, FieldValidations } from '@shared/models';
import { AbstractControl, FormControl, FormGroup, ValidatorFn, Validators } from '@angular/forms';
import { REGEX } from '@constants/regex';

@Injectable({ providedIn: 'root' })
export class UtilityService {
  isRequired(abstractControl: AbstractControl) {
    if (abstractControl?.validator) {
      const validator = abstractControl.validator({} as AbstractControl);
      return (validator && Boolean(validator['required'])) ?? false;
    }
    return false;
  }

  createGroup<T extends object>(fieldArr: FieldConfig[]) {
    const group = {};
    fieldArr.forEach(f =>
      Object.assign(group, {
        [f.name]: new FormControl(
          { value: f.value || f.fieldType === 'checkbox' ? [] : f.value, disabled: !!f.disabled },
          {
            validators: f.dependsOn ? [] : this.bindValidations(f.validation)
          }
        )
      })
    );
    return new FormGroup(group as FieldsGroup<T>);
  }

  generateForm<T extends object>(forms: T): FormStructure<T> {
    const groups = {};
    this.iterateObject(forms, groups);
    return groups as FormStructure<T>;
  }

  screenWidth = signal<number>(window.innerWidth);
  constructor() {
    effect(() => {
      const onResize = () => this.screenWidth.set(window.innerWidth);
      window.addEventListener('resize', onResize);
      onResize(); // Set initial value.

      return () => window.removeEventListener('resize', onResize);
    });
  }

  private iterateObject<T extends object>(obj: T, groups: object) {
    for (const [key, value] of Object.entries(obj)) {
      if (!Array.isArray(value) && typeof value === 'object' && value !== null) {
        Object.assign(groups, { [key]: {} });
        this.iterateObject(value, Object.values(groups)[Object.keys(groups).indexOf(key)]);
      } else if (Array.isArray(value) && value.length) {
        Object.assign(groups, { [key]: this.createGroup(value) });
      }
    }
  }
  bindValidations(validations: FieldValidations = {}) {
    const validators: ValidatorFn[] = [];
    // INFO Using type guards for better type safety
    if (validations.email === true) {
      validators.push(Validators.pattern(REGEX.email));
    }
    if (validations.required === true) {
      validators.push(Validators.required);
    }
    if (validations.pattern) {
      validators.push(Validators.pattern(validations.pattern));
    }
    if (typeof validations.minLength === 'number' && validations.minLength > 0) {
      validators.push(Validators.minLength(validations.minLength));
    }
    if (typeof validations.maxLength === 'number' && validations.maxLength > 0) {
      validators.push(Validators.maxLength(validations.maxLength));
    }
    if (validations.custom && validations.custom.length) {
      validations.custom.forEach(x => validators.push(x));
    }
    return Validators.compose([...validators]);
  }
}
type FieldsGroup<T> = { [K in keyof T]: FormControl<T[K]> };
type FormStructure<T> = {
  [K in keyof T]: T[K] extends FieldConfig[]
    ? FormGroup //FormGroup<NestedGroup<T[K]>>
    : T[K] extends object
      ? FormStructure<T[K]>
      : never;
};
// type NestedGroup<T extends FieldConfig[]> = {
//   // Dynamically infer the keys and types of the form controls from its value
//   [K in T[number]['name']]: FormControl<Extract<T[number], { name: K }>['value']>;
// };
