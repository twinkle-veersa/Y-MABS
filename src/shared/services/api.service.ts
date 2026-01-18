import { computed, inject, Injectable, Signal, signal } from '@angular/core';
import { environment } from 'environments/environment';
import { HttpClient, HttpContext, HttpContextToken, httpResource } from '@angular/common/http';
import { ToastrService } from 'ngx-toastr';
import { Router } from '@angular/router';
import { jwtDecode } from 'jwt-decode';
import * as CryptoJS from 'crypto-js';
import { map, Observable } from 'rxjs';
import { PdfResponse } from 'app/pages/home/enrollment/enrollment.component';
import { LoginRes } from 'app/pages/auth/login/login.component';

export const LOADER_DISABLED = new HttpContextToken<boolean>(() => false);

@Injectable({ providedIn: 'root' })
export class ApiService {
  currentPWD = '';
  isLoading = signal(false);
  isProcessing = signal(false);
  private router = inject(Router);
  private http = inject(HttpClient);
  private toast = inject(ToastrService);
  private baseUrl = environment.portalUrl;
  readonly secret = environment.secretKey;
  public isRefreshTokenLoading = signal(false);
  isLoggedIn = computed(() => Boolean(this.token()));
  token = signal<string | null>(this.getDecryptedValue('token'));
  refreshToken = signal<string | null>(this.getDecryptedValue('rtoken'));
  expireTime = computed(() => (this.tokenInfo() ? this.tokenInfo()!.exp : null));
  tokenInfo = computed(() => (this.token() ? jwtDecode<TokenData>(this.token() ?? '') : null));
  isFirstTimeLoginFlow = signal<'security' | 'password' | null>(null);

  login(
    token: string,
    refreshToken: string,
    HasSecurityQuestionAnswered: boolean,
    ResetPasswordRequired: boolean,
    pwd: string
  ) {
    this.isFirstTimeLoginFlow.set(
      !HasSecurityQuestionAnswered ? 'security' : ResetPasswordRequired ? 'password' : null
    );
    this.token.set(token);
    this.refreshToken.set(refreshToken);
    if (!this.isFirstTimeLoginFlow()) this.saveTokens(token, refreshToken);
    const navigateTo = !HasSecurityQuestionAnswered
      ? 'first-time-login'
      : ResetPasswordRequired
        ? 'reset-password'
        : 'home';
    if (ResetPasswordRequired) this.currentPWD = pwd;

    this.router.navigate([`/${navigateTo}`]);
  }
  saveTokens(token = this.token()!, refreshToken = this.refreshToken()!) {
    sessionStorage.setItem('token', CryptoJS.AES.encrypt(token, this.secret).toString());
    sessionStorage.setItem('rtoken', CryptoJS.AES.encrypt(refreshToken, this.secret).toString());
  }
  logout() {
    this.http
      .post(this.baseUrl + 'account/logout', { Email: this.tokenInfo()!.acctname })
      .subscribe(this.handleLogout.bind(this));
  }
  clearLogin() {
    sessionStorage.clear();
    this.token.set(null);
    this.refreshToken.set(null);
  }
  handleLogout() {
    this.clearLogin();
    this.router.navigate(['/auth/logout']);
  }

  getNewToken() {
    if (this.isRefreshTokenLoading() || !this.expireTime()) return;
    const timeNow = new Date().getTime();
    // INFO pulling new token before 2 minute of expiry
    const refreshTime = (this.expireTime()! - 120) * 1000;
    // const refreshInterval = this.expireTime() ? refreshTime - timeNow : 900 * 1000;
    setTimeout(() => this.getNewToken(), 30000);
    if (refreshTime > timeNow) return;
    this.isRefreshTokenLoading.set(true);
    const context = new HttpContext();
    context.set(LOADER_DISABLED, true);
    this.isRefreshTokenLoading.set(true);
    return this.call
      .post<{ Email: string; RefreshToken: string }, LoginRes>(
        `account/refreshToken`,
        {
          Email: this.tokenInfo()!.acctname,
          RefreshToken: this.refreshToken() || ''
        },
        { context }
      )
      .subscribe({
        next: res => {
          if (res.Status === 'SUCCESS') {
            const { AccessToken, RefreshToken } = res.Payload;
            this.token.set(AccessToken);
            this.refreshToken.set(RefreshToken);
            sessionStorage.setItem(
              'token',
              CryptoJS.AES.encrypt(AccessToken, this.secret).toString()
            );
            sessionStorage.setItem(
              'rtoken',
              CryptoJS.AES.encrypt(RefreshToken, this.secret).toString()
            );
            this.isRefreshTokenLoading.set(false);
            this.getNewToken();
          }
        },
        error: () => this.isRefreshTokenLoading.set(false)
      });
  }

  getDocuments(formattedValue: string): Observable<PdfResponse> {
    return this.http
      .get(`${environment.portalv11Url}documents/${formattedValue}`, {
        responseType: 'arraybuffer'
      })
      .pipe(
        map((response: ArrayBuffer) => {
          return { data: response };
        })
      );
  }
  submitEnrollment(reqBody: object): Observable<{
    docID: string;
    caseID: string;
  }> {
    return this.http
      .post<{
        Payload: { DocID: string; CaseId: string };
      }>(`${environment.gateqayUrl}case/enroll/lantheusHealthcarePortal`, reqBody)
      .pipe(
        map(res => ({
          docID: res.Payload.DocID,
          caseID: res.Payload.CaseId
        }))
      );
  }

  getSignedDocument(caseId: string): Observable<Blob> {
    const docType = encodeURIComponent('RF - Lantheus Link Referral Form');

    return this.http.get(
      `https://ext-api.pharmacord.com/portalqa/api/v1.0/documents/signed/content/${caseId}?docType=${docType}`,
      { responseType: 'blob' }
    );
  }

  getDecryptedValue(key: string) {
    return sessionStorage.getItem(key)
      ? CryptoJS.AES.decrypt(sessionStorage.getItem(key)!, this.secret).toString(CryptoJS.enc.Utf8)
      : null;
  }

  call = {
    // INFO Here generic types <R> represents ResponseType & <Q> represents RequestType i.e, ReqBody/Parameter/QueryParameters
    get: <R, Q extends object = object>(
      endpoint: string,
      options?: { parameter?: string | number; query?: Q; baseUrl?: string }
    ) =>
      this.http.get<ApiReqRes<Q, R>>(
        (options?.baseUrl ?? this.baseUrl) +
          endpoint +
          (options?.parameter != null ? `/${options.parameter}` : ''),
        { params: options?.query ? options?.query : {} }
      ),

    post: <Q extends object, R>(
      endpoint: string,
      payload: Q,
      options?: { context: HttpContext; baseUrl?: string }
    ) =>
      this.http
        .post<
          ApiReqRes<Q, R & { Message: string } & { StatusMessage: string }>
        >(options?.baseUrl ?? this.baseUrl + endpoint, payload, options?.context ? { context: options.context } : {})
        .pipe(
          map(res => {
            const message = res.Payload?.Message ?? res.Payload?.StatusMessage;
            const errMsg = this.extractErrMsg(res.Errors);
            if (res.Status === 'SUCCESS' && message) {
              this.toast.success(message, 'Success');
            } else if (res.Status === 'ERROR') {
              // INFO Using timeout to wait for requester to handle this. If no msg shown by requester this will be shown...
              setTimeout(() => {
                if (this.toast.currentlyActive < 1) this.toast.error(errMsg, 'Error!');
              }, 0);
            }
            return res;
          })
        ),

    put: <Q extends object, R>(endpoint: string, payload: Q, baseUrl = this.baseUrl) =>
      this.http.put<ApiReqRes<Q, R>>(baseUrl + endpoint, payload),

    delete: (endpoint: string, baseUrl = this.baseUrl) => this.http.delete(baseUrl + endpoint)
  };

  getRs<R, Q extends object = object>(
    endpoint: string,
    params?: { baseUrl?: string; parameter?: Signal<unknown>; query?: Q }
  ) {
    return httpResource<ApiReqRes<Q, R>>(() => {
      const parameter = params?.parameter?.();
      const query = params?.query ?? {};
      const baseUrl = params?.baseUrl ?? this.baseUrl;
      const url = baseUrl + endpoint + (parameter != null ? `/${parameter}` : '');
      return { url, params: query };
    });
  }

  extractErrMsg(errs: Error[]): string {
    if (errs.length) {
      const msg = errs[0].Message;
      try {
        return (
          (
            JSON.parse(msg.substring(msg.indexOf('{'), msg.indexOf('}') + 1)) as {
              errorMessage?: string;
            }
          )?.errorMessage ?? ''
        );
      } catch {
        return 'Invalid inputs';
      }
    }
    return 'Something went wrong..!';
  }
}

interface ApiReqRes<Q, R> {
  ReferenceId: string;
  Timestamp: string;
  Status: 'SUCCESS' | 'ERROR';
  Payload: R;
  Errors: Error[];
  Warnings: unknown[];
  Parameters: Q;
}
interface Error {
  Code: string;
  Message: string;
}

interface TokenData {
  jti: string;
  sub: string;
  iat: number;
  aud: string;
  iss: string;
  exp: number;
  acct: string;
  acctid: number;
  acctname: string;
  role: string;
  facilities: number[];
  prescribers: number[];
  brand: string[];
}
