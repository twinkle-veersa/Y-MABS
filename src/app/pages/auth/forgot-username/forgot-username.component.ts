import { ChangeDetectionStrategy, Component, inject, signal } from '@angular/core';
import { ReactiveFormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { HeaderWrapComponent } from '@shared/layouts/header-wrap/header-wrap.component';
import { FormTitleComponent } from '@shared/layouts/form-title/form-title.component';
import { IconComponent } from '@shared/components/icon/icon.component';
import { FORGOT_USERNAME } from '@constants/forgot-username';
import { DynamicFieldDirective } from '@shared/utils/dynamic-field.directive';
import { UtilityService } from '@shared/services/utility.service';
import { ApiService } from '@shared/services/api.service';

@Component({
  selector: 'app-forgot-username',
  imports: [
    RouterLink,
    DynamicFieldDirective,
    ReactiveFormsModule,
    HeaderWrapComponent,
    FormTitleComponent,
    IconComponent
  ],
  templateUrl: './forgot-username.component.html',
  styleUrl: './forgot-username.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class ForgotUsernameComponent {
  readonly content = FORGOT_USERNAME.content;
  readonly form = FORGOT_USERNAME.form;
  readonly message = FORGOT_USERNAME.message;
  private util = inject(UtilityService);
  private api = inject(ApiService);

  group = this.util.createGroup<Req>(this.form);
  status = signal<'SUCCESS' | 'ERROR' | null>(null);

  resetUsername() {
    if (this.group.valid) {
      this.api.call
        .post<Req, Res>('portal/account/forgotUsername', this.group.value as Req)
        .subscribe({ next: res => this.status.set(res.Status) });
    }
  }
}

interface Req {
  Email: string;
  FirstName: string;
  LastName: string;
}
interface Res {
  status: string;
}
