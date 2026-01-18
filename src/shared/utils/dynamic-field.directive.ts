import {
  ComponentRef,
  DestroyRef,
  Directive,
  inject,
  input,
  OnInit,
  Renderer2,
  ViewContainerRef
} from '@angular/core';
import { FormGroup } from '@angular/forms';
import { InputComponent } from '@shared/components/input/input.component';
import { RadioComponent } from '@shared/components/radio/radio.component';
import { SelectComponent } from '@shared/components/select/select.component';
import { CheckboxComponent } from '@shared/components/checkbox/checkbox.component';
import { DatepickerComponent } from '@shared/components/datepicker/datepicker.component';
import { FieldConfig, FieldType } from '@shared/models';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { UtilityService } from '@shared/services/utility.service';

type ComponentTypes =
  | typeof InputComponent
  | typeof SelectComponent
  | typeof RadioComponent
  | typeof CheckboxComponent
  | typeof DatepickerComponent;

type FieldComponent =
  | InputComponent
  | SelectComponent
  | RadioComponent
  | CheckboxComponent
  | DatepickerComponent;

const ComponentMap: Record<FieldType, ComponentTypes> = {
  text: InputComponent,
  select: SelectComponent,
  radio: RadioComponent,
  checkbox: CheckboxComponent,
  date: DatepickerComponent
};

@Directive({ selector: '[appDynamicField]' })
export class DynamicFieldDirective implements OnInit {
  readonly field = input.required<FieldConfig>();
  readonly group = input.required<FormGroup>();
  readonly flex = input<boolean>(false);

  private container = inject(ViewContainerRef);
  private renderer = inject(Renderer2);
  private util = inject(UtilityService);
  private destroyRef = inject(DestroyRef);
  private cmpRef!: ComponentRef<FieldComponent> | null;

  ngOnInit() {
    const cmp = ComponentMap[this.field().fieldType];
    const control = this.group().get(this.field().name);
    if (cmp !== undefined) {
      if (this.field().dependsOn !== undefined) {
        const controlDependsOn = this.group().get(this.field().dependsOn!);
        controlDependsOn?.valueChanges
          .pipe(takeUntilDestroyed(this.destroyRef))
          .subscribe((val: string | string[]) =>
            val
              ? val.includes(this.field().condition ?? '')
                ? !this.cmpRef && this.renderComponent(cmp)
                : this.destroyComponent()
              : this.destroyComponent()
          );
        const valueDependsOn = controlDependsOn?.value as string;
        if (
          valueDependsOn &&
          valueDependsOn.length &&
          valueDependsOn.includes(this.field().condition ?? '') &&
          !this.cmpRef
        ) {
          const restoreVal = control?.value as unknown;
          this.renderComponent(cmp);
          control?.setValue(restoreVal);
        }
      } else {
        this.renderComponent(cmp);
      }
    }
  }

  renderComponent(cmp: ComponentTypes) {
    this.cmpRef = this.container.createComponent(cmp);
    this.cmpRef.setInput('field', this.field());
    this.cmpRef.setInput('group', this.group());
    const { fieldSize } = this.field();
    const colClass = fieldSize != null ? (fieldSize > 0 ? 'col-md-' + fieldSize : 'col-md') : '';
    if (Boolean(this.cmpRef.location.nativeElement) && colClass) {
      this.renderer.addClass(this.cmpRef.location.nativeElement, colClass);
    }
    if (this.field().class != null) {
      this.renderer.addClass(this.cmpRef.location.nativeElement, this.field().class ?? '');
    }
    if (this.flex()) {
      this.renderer.addClass(this.cmpRef.location.nativeElement, 'flex-field');
      if (!(this.field().label ?? '')) {
        this.renderer.addClass(this.cmpRef.location.nativeElement, 'linked-field');
      }
    }
    this.updateValidations(this.field().validation);
  }

  updateValidations(validations = {}) {
    if (this.field().dependsOn) {
      const control = this.group().get(this.field().name);
      if (control) {
        control.setValidators(this.util.bindValidations(validations));
        control.updateValueAndValidity();
        control.reset();
      }
    }
  }

  destroyComponent() {
    this.container.remove();
    this.updateValidations();
    this.cmpRef = null;
  }
}
