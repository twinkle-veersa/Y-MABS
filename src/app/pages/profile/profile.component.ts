import {
  ChangeDetectionStrategy,
  Component,
  computed,
  effect,
  HostListener,
  inject,
  signal
} from '@angular/core';
import { ReactiveFormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { ApiService } from '@shared/services/api.service';
import { UtilityService } from '@shared/services/utility.service';
import { ENDPOINTS, PROFILE, TABS, Tab } from '@constants/profile';
import { IconComponent } from '@shared/components/icon/icon.component';
import { DynamicFieldDirective } from '@shared/utils/dynamic-field.directive';
import { HeaderWrapComponent } from '@shared/layouts/header-wrap/header-wrap.component';
import { sanitizePhone } from '@shared/utils/utility.functions';

import {
  ReqInfo,
  ReqInfoUser,
  ReqPass,
  ReqSec,
  ResInfo,
  ResPass,
  ResSec,
  SecurityFormValue,
  SecurityQuestion,
  SecurityQuestionPayload
} from './profile.model';
import { matchPassword } from '@shared/utils/password-validations';
import { formatPhoneInObj } from '@shared/utils/utility.functions';
import { toSignal } from '@angular/core/rxjs-interop';
import { map } from 'rxjs';
import { DataService } from '@shared/services/data.service';
import { AlertService } from '@shared/services/alert.service';
import { ToastrService } from 'ngx-toastr';
import { isNetworkError } from '@shared/utils/http-error.utils';

@Component({
  selector: 'app-profile',
  imports: [
    ReactiveFormsModule,
    HeaderWrapComponent,
    IconComponent,
    DynamicFieldDirective,
    RouterLink
  ],
  templateUrl: './profile.component.html',
  styleUrl: './profile.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class ProfileComponent {
  readonly content = PROFILE.content;
  readonly forms = PROFILE.forms;
  readonly tabs = TABS;
  private util = inject(UtilityService);
  private api = inject(ApiService);
  private data = inject(DataService);
  private alert = inject(AlertService);
  private readonly toast = inject(ToastrService);
  activeTab = signal<Tab>(this.tabs[0]);
  hasUnsavedChanges = signal(false);
  groups = this.util.generateForm(this.forms);

  questionsRs = this.api.getRs<SecurityQuestion[]>(ENDPOINTS.securityOptions);
  securityRs = this.api.getRs<SecurityQuestionPayload[]>(
    ENDPOINTS.securityAnswers + '/' + this.api.tokenInfo()!.acctid
  );

  questionOptions = computed(() => {
    const options = this.questionsRs.value()?.Payload.filter(x => x.IsActive);
    return options?.map(x => ({ option: x.QuestionText, value: x.Id }));
  });

  questionValuesSignal = toSignal(
    this.groups.security?.valueChanges.pipe(
      map(x => {
        const { Id_1, Id_2, Id_3 } = x as { Id_1?: number; Id_2?: number; Id_3?: number };
        return [...new Set([Id_1, Id_2, Id_3].filter(x => typeof x === 'number'))];
      })
    ),
    { initialValue: [] }
  );

  @HostListener('window:beforeunload', ['$event'])
  canDeactivate(e: BeforeUnloadEvent): Promise<boolean> {
    if (this.hasUnsavedChanges() && this.api.token()) {
      if (e) e.preventDefault();
      return this.alert.confirm(PROFILE.exitConfirmation).then(confirmed => confirmed);
    }
    return Promise.resolve(true);
  }

  getQuestionOptions = (index: number) =>
    computed(() => {
      const selected = this.questionValuesSignal();
      const selectedQuestionId = this.groups.security.get(`Id_${index}`)?.value as number;
      return (
        this.questionOptions()?.filter(
          x => !selected.includes(x.value) || x.value === selectedQuestionId
        ) ?? []
      );
    });

  securityForm = computed(() => {
    [1, 2, 3].forEach(i => {
      const field = this.forms.security.find(f => f.name === `Id_${i}`);
      if (field) field.options = this.getQuestionOptions(i)();
    });
    return this.forms.security;
  });

  submitForm: Record<Tab, () => void> = {
    password: () => this.updatePassword(),
    security: () => this.updateSecurity(),
    info: () => this.updateInfo()
  };

  constructor() {
    this.groups.password.addValidators(matchPassword('Password', 'PasswordConfirmation'));

    effect(() => {
      const userDetail = this.data.userDetails();
      if (userDetail) this.groups.info.patchValue(formatPhoneInObj(userDetail));
    });

    effect(() => {
      const securityQuestions = this.securityRs.value()?.Payload;
      if (securityQuestions?.length) {
        securityQuestions.forEach((q, i) =>
          this.groups.security.get(`Id_${i + 1}`)?.setValue(q.SecurityQuestion.Id)
        );
      }
    });
  }

  updatePassword() {
    if (this.groups.password.valid) {
      const payload: ReqPass = {
        ...this.groups.password.value,
        UserName: this.api.tokenInfo()!.acctname
      } as ReqPass;
      this.api.call
        .post<ReqPass, ResPass>(ENDPOINTS.updatePassword, payload, { showSuccessToast: false })
        .subscribe({
          next: res => {
            if (res.Status === 'SUCCESS') {
              this.toast.success('Your password have been changed successfully!');
              this.hasUnsavedChanges.set(false);
            } else {
              const payloadMessage =
                (res.Payload as { Message?: string; message?: string }).Message ??
                (res.Payload as { Message?: string; message?: string }).message ??
                '';

              if (payloadMessage === 'New password matches a previous password.') {
                this.toast.error('New password matches a previous password.');
              } else if (payloadMessage === 'New password matches current account password.') {
                this.toast.error('New password matches current account password.');
              } else if (payloadMessage === 'The username/password does not match') {
                this.toast.error('Current Password does not match');
              } else {
                this.toast.error('Current Password does not match');
              }
            }
          },
          error: (error: unknown) => {
            if (!isNetworkError(error)) {
              this.toast.error('Something went wrong');
            }
          }
        });
    }
  }

  updateSecurity() {
    if (this.groups.security.valid) {
      const { CurrentPassword, ...sec } = this.groups.security.value as SecurityFormValue;
      const questionMap = Object.entries(sec).reduce((acc, [key, value]) => {
        if (!key.includes('_')) {
          return acc;
        }

        const [field, index] = key.split('_');

        return acc.set(
          index,
          Object.assign(acc.get(index) ?? {}, {
            [field]: field === 'Id' ? Number(value) : value
          })
        );
      }, new Map());

      const payload = {
        PortalAccountId: this.api.tokenInfo()!.acctid,
        CurrentPassword,
        SecurityQuestion: Array.from(questionMap.values())
      };

      this.api.call
        .post<ReqSec, ResSec>(ENDPOINTS.updateSecurity, payload as ReqSec, {
          showSuccessToast: false
        })
        .subscribe({
          next: res => {
            if (res.Status === 'SUCCESS') {
              if (res.Payload.ErrorMessage === 'No security question answers were updated') {
                this.toast.error('No security question answers were updated');
                return;
              }

              this.toast.success('Your Security Questions have been changed successfully!');
              this.hasUnsavedChanges.set(false);
              return;
            } else {
              this.toast.error('Current Password does not match');
            }
          },
          error: (error: unknown) => {
            console.error('updateSecurity error', error);
            if (!isNetworkError(error)) {
              this.toast.error('Something went wrong');
            }
          }
        });
      return;
    }
    this.groups.security.markAllAsTouched();
  }

  updateInfo() {
    if (this.groups.info.valid) {
      const payload = {
        MasterAccountId: this.api.tokenInfo()!.acctid,
        UserContactDetails: {
          ...(this.groups.info.value as ReqInfoUser),
          Phone: sanitizePhone(this.groups.info.get('Phone')?.value ?? '') || null,
          Fax: sanitizePhone(this.groups.info.get('Fax')?.value ?? '') || null,
          Id: null
        }
      };

      this.api.call
        .post<ReqInfo, ResInfo>(ENDPOINTS.updateInfo, payload, {
          showSuccessToast: false,
          showErrorToast: false
        })
        .subscribe({
          next: res => {
            if (res.Status === 'SUCCESS') {
              this.toast.success('Profile details are updated successfully!');
              this.hasUnsavedChanges.set(false);
            }
          },
          error: (error: unknown) => {
            if (!isNetworkError(error)) {
              this.toast.error('Something went wrong');
            }
          }
        });
    }
  }
}
