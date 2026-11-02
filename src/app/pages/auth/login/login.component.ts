import { ChangeDetectionStrategy, Component, inject, signal } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { ReactiveFormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { merge } from 'rxjs';
import { map, startWith } from 'rxjs/operators';
import { ApiService } from '@shared/services/api.service';
import { UtilityService } from '@shared/services/utility.service';
import { InputComponent } from '@shared/components/input/input.component';
import { LOGIN } from '@constants/login';
import { ToastrService } from 'ngx-toastr';

@Component({
  selector: 'app-login',
  imports: [ReactiveFormsModule, InputComponent, RouterLink],
  templateUrl: './login.component.html',
  styleUrl: './login.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class LoginComponent {
  readonly content = LOGIN;
  readonly submitted = signal(false);
  private util = inject(UtilityService);
  private toast = inject(ToastrService);
  private api = inject(ApiService);
  group = this.util.createGroup<LoginForm>(this.content.form);

  /** Figma a2: Log In stays disabled until username + password are valid */
  readonly canSubmit = toSignal(
    merge(this.group.statusChanges, this.group.valueChanges).pipe(
      startWith(null),
      map(() => this.group.valid)
    ),
    { initialValue: this.group.valid }
  );

  login() {
    this.submitted.set(true);
    this.group.markAllAsTouched();

    if (this.group.invalid) {
      return;
    }

    const pwd = this.group.controls.Password.value;
    this.api.call
      .post<LoginForm, LoginRes>('account/login', this.group.value as LoginForm)
      .subscribe({
        next: res => {
          const { AccessToken, RefreshToken, HasSecurityQuestionAnswered, ResetPasswordRequired } =
            res.Payload;
          if (AccessToken) {
            this.api.login(
              AccessToken,
              RefreshToken,
              HasSecurityQuestionAnswered,
              ResetPasswordRequired,
              pwd
            );
          } else {
            this.toast.error('Something went wrong!', 'Error!');
          }
        },
        error: () => this.toast.error('Invalid Credentials', 'Error!')
      });
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
