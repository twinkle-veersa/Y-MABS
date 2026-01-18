import {
  ApplicationRef,
  ComponentRef,
  EnvironmentInjector,
  Injectable,
  createComponent,
  inject
} from '@angular/core';
import {
  AlertConfig,
  AlertPopUpComponent
} from '@shared/components/alert-pop-up/alert-pop-up.component';

@Injectable({ providedIn: 'root' })
export class AlertService {
  private appRef = inject(ApplicationRef);
  private environmentInjector = inject(EnvironmentInjector);

  confirm(message: string, options?: AlertConfig): Promise<boolean> {
    return new Promise<boolean>(resolve => {
      const componentRef: ComponentRef<AlertPopUpComponent> = createComponent(AlertPopUpComponent, {
        environmentInjector: this.environmentInjector
      });
      componentRef.setInput('message', message);
      if (options) {
        componentRef.setInput('config', options);
        // Object.entries(options).forEach(([k, v]) => componentRef.setInput(k, v));
      }
      this.appRef.attachView(componentRef.hostView);
      const domElement = componentRef.location.nativeElement as HTMLElement;
      if (domElement instanceof HTMLElement) {
        document.body.appendChild(domElement);
      }
      componentRef.instance.confirmation.subscribe((result: boolean) => {
        resolve(result);
        this.cleanup(componentRef, domElement);
      });
    });
  }

  private cleanup(componentRef: ComponentRef<AlertPopUpComponent>, el: HTMLElement): void {
    this.appRef.detachView(componentRef.hostView);
    document.body.removeChild(el);
    componentRef.destroy();
  }
}
