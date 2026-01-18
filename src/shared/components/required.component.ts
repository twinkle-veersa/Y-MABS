import { Component, ChangeDetectionStrategy } from '@angular/core';

@Component({
  selector: 'app-req',
  template: `<span class="red">*</span>`,
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class RequiredComponent {}
