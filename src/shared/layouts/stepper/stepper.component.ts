import { KeyValuePipe } from '@angular/common';
import { ChangeDetectionStrategy, Component, input } from '@angular/core';
import { StepDetail } from '@shared/models';

@Component({
  selector: 'app-stepper',
  imports: [KeyValuePipe],
  templateUrl: './stepper.component.html',
  styleUrl: './stepper.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class StepperComponent {
  steps = input.required<Record<string, StepDetail>>();
  currentStep = input<number>(0);
}
