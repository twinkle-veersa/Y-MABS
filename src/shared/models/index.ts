import { ValidatorFn } from '@angular/forms';
import { ValType } from '@shared/utils/input.directive';

export interface Nav {
  icon: string;
  label: string;
  link: string[];
}

export interface SelectOptions {
  value: string | number;
  option: string;
}

export const fieldTypes = ['text', 'select', 'radio', 'checkbox', 'date'] as const;
export type FieldType = (typeof fieldTypes)[number];
export const fieldPositions = ['left', 'right', 'bottom'] as const;
export type FieldPositon = (typeof fieldPositions)[number];
export interface FieldConfig {
  fieldType: FieldType;
  class?: string;
  name: string; // FormControlName
  disabled?: boolean;
  value?: string | number;
  label?: string;
  placeholder?: string;
  options?: SelectOptions[]; // For dropdows and radios
  validation?: FieldValidations;
  inputValidation?: ValType;
  inputType?: 'text' | 'password' | 'tel' | 'number' | 'file'; // For input fields
  position?: string; // TODO Implement using this property with FieldPositon type instead of string
  fieldSize?: number; // INFO Here 0 (Zero) indicated auto sizing
  hint?: string;
  min?: Date;
  max?: Date;
  dependsOn?: string;
  condition?: string;
}

export interface FieldValidations {
  required?: boolean;
  pattern?: RegExp;
  email?: boolean;
  minLength?: number;
  maxLength?: number;
  minDate?: Date;
  maxDate?: Date;
  custom?: ValidatorFn[];
}

export interface StepDetail {
  title: string;
  isEnabled: boolean;
}
