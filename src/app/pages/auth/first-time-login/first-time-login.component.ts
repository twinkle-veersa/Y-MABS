import { ChangeDetectionStrategy, Component, computed, inject } from '@angular/core';
import { DynamicFieldDirective } from '@shared/utils/dynamic-field.directive';
import { HeaderWrapComponent } from '@shared/layouts/header-wrap/header-wrap.component';
import { FormTitleComponent } from '@shared/layouts/form-title/form-title.component';
import { FIRST_TIME_LOGIN } from '@constants/first-time-login';
import { UtilityService } from '@shared/services/utility.service';
import { ApiService } from '@shared/services/api.service';
import { toSignal } from '@angular/core/rxjs-interop';
import { ReactiveFormsModule } from '@angular/forms';
import { ENDPOINTS } from '@constants/profile';
import { ToastrService } from 'ngx-toastr';
import { Router } from '@angular/router';
import { map } from 'rxjs';

@Component({
  selector: 'app-first-time-login',
  imports: [ReactiveFormsModule, HeaderWrapComponent, FormTitleComponent, DynamicFieldDirective],
  templateUrl: './first-time-login.component.html',
  styleUrl: './first-time-login.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class FirstTimeLoginComponent {
  readonly content = FIRST_TIME_LOGIN.content;
  readonly form = FIRST_TIME_LOGIN.forms;
  private util = inject(UtilityService);
  private toast = inject(ToastrService);
  private router = inject(Router);
  private api = inject(ApiService);
  group = this.util.createGroup(this.form);
  questionsRs = this.api.getRs<SecurityQuestion[]>(ENDPOINTS.securityOptions);
  questionValuesSignal = toSignal(
    this.group?.valueChanges.pipe(
      map(x => {
        const { question1, question2, question3 } = x as {
          question1?: number;
          question2?: number;
          question3?: number;
        };
        return [...new Set([question1, question2, question3].filter(x => typeof x === 'number'))];
      })
    ),
    { initialValue: [] }
  );
  getQuestionOptions = (index: number) =>
    computed(() => {
      const selected = this.questionValuesSignal();
      const currentSelectedId = this.group.get(`question${index}`)?.value;
      return (
        this.questionsRs
          .value()
          ?.Payload.filter(
            x => x.IsActive && (!selected.includes(x.Id) || x.Id === currentSelectedId)
          )
          .map(x => ({ option: x.QuestionText, value: x.Id })) ?? []
      );
    });
  securityForm = computed(() => {
    [1, 2, 3].forEach(i => {
      const field = this.form.find(f => f.name === `question${i}`);
      if (field) {
        field.options = this.getQuestionOptions(i)();
      }
    });
    return this.form;
  });

  submit() {
    const SecurityAnswers = [1, 2, 3].map(x => {
      return {
        PortalAccountId: this.api.tokenInfo()!.acctid,
        SecurityQuestion: { Id: this.group.get(`question${x}`)?.value },
        Choice: null,
        Answer: this.group.get(`answer${x}`)?.value
      };
    });
    const req = {
      CurrentPassword: this.group.get('currentPassword')?.value,
      SecurityAnswers
    };
    this.api.call.post('securityQuestion/save', req).subscribe({
      next: res => {
        if (res.Status === 'SUCCESS') {
          this.api.isFirstTimeLoginFlow.set(null);
          this.toast.success(`Security Questions saved succesfully`);
          this.api.saveTokens();
          this.router.navigate(['/home']);
        }
      },
      error: err => console.error(err)
    });
  }
}

export interface SecurityQuestion {
  Id: number;
  QuestionType: QuestionType;
  SequenceNumber: string;
  QuestionText: string;
  IsActive: boolean;
  Choices: [];
}
interface QuestionType {
  QuestionTypePkId: number;
  Value: string;
  IsActive: boolean;
}
