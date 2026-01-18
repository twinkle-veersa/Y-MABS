import { ChangeDetectionStrategy, Component, computed, inject, signal } from '@angular/core';
import { Router } from '@angular/router';
import { FORGOT_PASSWORD, STEPS, FormStep } from '@constants/forgot-password';
import { DynamicFieldDirective } from '@shared/utils/dynamic-field.directive';
import { HeaderWrapComponent } from '@shared/layouts/header-wrap/header-wrap.component';
import { FormTitleComponent } from '@shared/layouts/form-title/form-title.component';
import { FullpageAlertsComponent } from '@shared/layouts/fullpage-alerts/fullpage-alerts.component';
import { ReactiveFormsModule } from '@angular/forms';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { InputComponent } from '@shared/components/input/input.component';
import { IconComponent } from '@shared/components/icon/icon.component';
import { matchPassword } from '@shared/utils/password-validations';
import { UtilityService } from '@shared/services/utility.service';
import { ApiService } from '@shared/services/api.service';
import { FieldConfig } from '@shared/models';
import { ToastrService } from 'ngx-toastr';

@Component({
  selector: 'app-forgot-password',
  imports: [
    RouterLink,
    ReactiveFormsModule,
    DynamicFieldDirective,
    FullpageAlertsComponent,
    HeaderWrapComponent,
    FormTitleComponent,
    InputComponent,
    IconComponent
  ],
  templateUrl: './forgot-password.component.html',
  styleUrl: './forgot-password.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class ForgotPasswordComponent {
  router = inject(Router);
  readonly content = FORGOT_PASSWORD.content;
  readonly forms = FORGOT_PASSWORD.forms;
  readonly route = inject(ActivatedRoute);
  private util = inject(UtilityService);
  private toast = inject(ToastrService);
  private api = inject(ApiService);
  readonly pwd = this.api.currentPWD;
  isReset = signal(false);
  uuid = signal<string>('');
  groups = this.util.generateForm(this.forms);
  currentStep = signal<FormStep>(STEPS[0]);
  securityQuestionAnswer: SecurityAnswer[] = [];

  usernameRs = this.api.getRs<{ Username: string }>(`facilityAccount/password/reset`, {
    parameter: this.uuid
  });
  username = computed(() => this.usernameRs.value()?.Payload.Username);

  submitForm: Record<FormStep, () => void> = {
    email: () => this.validateAndGetQuestions(),
    security: () => this.saveSecurityAnswers(),
    password: () => this.updatePassword(),
    success: () => true
  };

  constructor() {
    this.groups.password.addValidators(matchPassword('Password', 'PasswordConfirmation'));
    const path = this.route.snapshot.routeConfig?.path;
    if (path && (path.includes('create-password') || path.includes('reset-password'))) {
      this.isReset.set(true);
      this.currentStep.set(STEPS[2]);
      if (path.includes('reset-password')) return;
      if (path.includes('create-password')) {
        const uuid = this.route.snapshot.paramMap.get('uuid');
        if (uuid && uuid.length > 15) {
          this.uuid.set(uuid);
        } else {
          this.router.navigate(['/']);
        }
      }
    }
  }

  nextStep() {
    if (this.groups[this.currentStep()].valid) this.submitForm[this.currentStep()]();
  }

  validateAndGetQuestions() {
    this.api.call
      .get(`securityQuestions`, {
        query: this.groups.email.value as SecurityQuestionReq
      })
      .subscribe({
        next: res => {
          if (res?.Status === 'SUCCESS' && Array.isArray(res?.Payload)) {
            const securityQuestions = (res.Payload as SecurityQuestionResponseItem[]).map(
              (item): FieldConfig => ({
                fieldType: 'text',
                label: item.SecurityQuestion.QuestionText,
                name: `${item.SecurityQuestion.Id}`,
                placeholder: 'Enter your answer',
                validation: { required: true }
              })
            );
            this.groups.security = this.util.createGroup(securityQuestions);
            FORGOT_PASSWORD.forms.security = securityQuestions;
            this.currentStep.update(c => STEPS[STEPS.indexOf(c) + 1]);
          }
        }
      });
  }

  saveSecurityAnswers() {
    this.securityQuestionAnswer = Object.entries(this.groups.security.value).map(
      ([qId, Answer]) => {
        return { SecurityQuestion: { Id: +qId }, Answer } as SecurityAnswer;
      }
    );
    this.currentStep.update(c => STEPS[STEPS.indexOf(c) + 1]);
  }

  updatePassword() {
    const UserName = this.groups.email.get('userName')?.value as string;
    const Password = this.groups.password.get('Password')?.value as string;
    const PasswordConfirmation = this.groups.password.get('PasswordConfirmation')?.value as string;

    if (this.groups.password.valid) {
      if (this.isReset()) {
        const resetPayload: ResetPasswordPayload = {
          Password,
          PasswordConfirmation,
          ...(this.uuid()
            ? {
                UUID: this.api.tokenInfo()?.jti || this.uuid(),
                Username: this.api.tokenInfo()?.acctname || ''
              }
            : {
                CurrentPassword: this.pwd,
                UserName: this.api.tokenInfo()?.acctname || ''
              })
        };

        const endpoint = this.uuid()
          ? 'facilityAccount/password/reset'
          : 'portal/account/person/updatePassword';

        this.api.call
          .post<ResetPasswordPayload, ResetPasswordResponse>(endpoint, resetPayload)
          .subscribe({
            next: res => {
              if (res.Status === 'SUCCESS') {
                this.api.isFirstTimeLoginFlow.set(null);
                this.api.clearLogin();
                this.currentStep.update(c => STEPS[STEPS.indexOf(c) + 1]);
              } else {
                this.toast.error(res.Errors?.[0]?.Message || 'Failed to change password');
              }
            },
            error: () => {
              this.toast.error('There was an error in Reset Password!');
            }
          });
      } else if (this.securityQuestionAnswer.length) {
        const userPayload: UserPayload = {
          UserName,
          Password,
          PasswordConfirmation,
          SecurityAnswers: this.securityQuestionAnswer
        };

        this.api.call.post('portal/account/resetPassword', userPayload).subscribe({
          next: res => {
            if (res.Status === 'ERROR') {
              const errMsg = res?.Errors?.[0]?.Message;
              if (errMsg?.includes('QC not matching')) {
                this.toast.error('Your Answers for security Question responses are not correct');
              } else {
                this.toast.error(errMsg || 'Error resetting password');
              }
            } else {
              this.currentStep.update(c => STEPS[STEPS.indexOf(c) + 1]);
            }
          }
        });
      } else {
        this.toast.error('Security answers are missing.');
      }
    } else {
      this.toast.error('Password form is invalid.');
    }
  }

  logoutAndRedirect(): void {
    this.api.clearLogin();
    this.router.navigate(['/login']);
  }
}
interface SecurityQuestionReq {
  userName: string;
  email: string;
}
interface SecurityQuestionResponseItem {
  Id: number;
  SecurityQuestion: {
    Id: number;
    QuestionId: number | null;
    QuestionText: string;
    IsActive: boolean;
  };
  IsActive: boolean;
}

export interface SecurityAnswer {
  SecurityQuestion: { Id: number };
  Choice: string | null;
  Answer: string;
}

export interface UserPayload {
  UserName: string;
  Password: string;
  PasswordConfirmation: string;
  SecurityAnswers: SecurityAnswer[];
}

interface ResetPasswordPayload {
  Username?: string;
  UserName?: string;
  Password: string;
  PasswordConfirmation: string;
  UUID?: string;
  CurrentPassword?: string;
}
interface ResetPasswordResponse {
  Status: string;
  Message?: string;
  StatusMessage?: string;
}
