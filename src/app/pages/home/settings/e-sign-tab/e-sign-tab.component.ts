import { ChangeDetectionStrategy, Component, DestroyRef, inject, signal } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { delay, Observable, of } from 'rxjs';
import { ToastrService } from 'ngx-toastr';
import { E_SIGN_STORAGE_KEY, ENDPOINTS, ID_ME_MOCK, SETTING } from '@constants/settings';
import { IconComponent } from '@shared/components/icon/icon.component';
import { ApiService } from '@shared/services/api.service';
import { IdMeVerifyReq, IdMeVerifyRes } from '../settings.model';

@Component({
  selector: 'app-e-sign-tab',
  imports: [IconComponent],
  templateUrl: './e-sign-tab.component.html',
  styleUrl: './e-sign-tab.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class ESignTabComponent {
  readonly content = SETTING.eSign;

  private readonly api = inject(ApiService);
  private readonly toast = inject(ToastrService);
  private readonly destroyRef = inject(DestroyRef);

  readonly isActive = signal(sessionStorage.getItem(E_SIGN_STORAGE_KEY) === 'true');
  readonly isVerifying = signal(false);

  verify() {
    if (this.isVerifying()) return;
    this.isVerifying.set(true);
    this.verify$()
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: res => {
          this.isVerifying.set(false);
          if (res.Status !== 'SUCCESS') return;
          sessionStorage.setItem(E_SIGN_STORAGE_KEY, 'true');
          this.isActive.set(true);
        },
        error: () => {
          this.isVerifying.set(false);
          this.toast.error('ID.me verification failed. Please try again.', 'Error!');
        }
      });
  }

  private verify$(): Observable<{ Status: string; Payload: IdMeVerifyRes }> {
    if (ID_ME_MOCK.enabled) {
      return of(ID_ME_MOCK.response).pipe(delay(ID_ME_MOCK.delayMs));
    }
    const tokenInfo = this.api.tokenInfo();
    return this.api.call.post<IdMeVerifyReq, IdMeVerifyRes>(
      ENDPOINTS.idMeVerify,
      { Email: tokenInfo?.acctname ?? '', PortalAccountId: tokenInfo?.acctid ?? 0 },
      { showSuccessToast: false }
    );
  }
}
