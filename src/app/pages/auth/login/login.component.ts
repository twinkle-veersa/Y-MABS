import { ChangeDetectionStrategy, Component, inject, signal } from '@angular/core';
import { ReactiveFormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { ApiService } from '@shared/services/api.service';
import { UtilityService } from '@shared/services/utility.service';
import { InputComponent } from '@shared/components/input/input.component';
import { LOGIN } from '@constants/login';
import { ToastrService } from 'ngx-toastr';
import { IconComponent } from '@shared/components/icon/icon.component';

@Component({
  selector: 'app-login',
  imports: [ReactiveFormsModule, InputComponent, RouterLink, IconComponent],
  templateUrl: './login.component.html',
  styleUrl: './login.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class LoginComponent {
  readonly content = LOGIN;
  showInfobar = signal<boolean>(false);
  private util = inject(UtilityService);
  private toast = inject(ToastrService);
  private api = inject(ApiService);
  group = this.util.createGroup<LoginForm>(this.content.form);

  login() {
    const pwd = this.group.controls.Password.value;
    if (this.group.controls.Email.value && pwd) {
      this.api.call
        .post<LoginForm, LoginRes>('account/login', this.group.value as LoginForm)
        .subscribe({
          next: res => {
            const {
              AccessToken,
              RefreshToken,
              HasSecurityQuestionAnswered,
              ResetPasswordRequired
            } = res.Payload;
            if (AccessToken) {
              this.api.login(
                AccessToken,
                RefreshToken,
                HasSecurityQuestionAnswered,
                ResetPasswordRequired,
                pwd
              );
            } else {
              this.toast.error('Something went wront!', 'Error!');
            }
          },
          error: () => this.toast.error('Invalid Credentials', 'Error!')
        });
    }
  }
}

interface LoginForm {
  Email: string;
  Password: string;
}

export interface LoginRes {
  AccessToken: string;
  RefreshToken: string;
  IsFirstTimeLogin: boolean;
  HasSecurityQuestionAnswered: boolean;
  ResetPasswordRequired: boolean;
}
