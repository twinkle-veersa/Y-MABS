import { AbstractControl, ValidationErrors, ValidatorFn } from '@angular/forms';
import { REGEX } from '@constants/regex';

const MIN_LENGTH = 12;
const VALIDATION_CHECKS = ['uppercase', 'lowercase', 'numeric', 'symbol', 'minLength'] as const;
export type Checks = (typeof VALIDATION_CHECKS)[number];
type RegexKeys = Exclude<Checks, 'minLength'>;
const REGX: Record<RegexKeys, RegExp> = REGEX;

export function checkPassword(): ValidatorFn {
  return (control: AbstractControl): ValidationErrors | null => {
    const value = (control.value ?? '') as string;
    if (value) {
      const checks = VALIDATION_CHECKS.reduce((a, x) => {
        const valid =
          x !== 'minLength' ? Boolean(value.match(REGX[x])?.length) : value.length > MIN_LENGTH;
        if (!valid) a.add(x);
        return a;
      }, new Set<Checks>());
      if (checks.size > 0) {
        const error = { weakPassword: Array.from(checks) };
        control.setErrors(error);
        return error;
      } else {
        control.setErrors(null);
        return null;
      }
    }
    return null;
  };
}

export function matchPassword(controlName: string, matchingControlName: string): ValidatorFn {
  return (ac: AbstractControl): ValidationErrors | null => {
    const control = ac.get(controlName);
    const matchingControl = ac.get(matchingControlName);
    if (control!.value !== matchingControl!.value) {
      const error = { MatchPassword: 'Passwords do not match.' };
      matchingControl!.setErrors(error);
      return error;
    } else {
      matchingControl!.setErrors(null);
      return null;
    }
  };
}
