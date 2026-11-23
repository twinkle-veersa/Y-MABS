import { ChangeDetectionStrategy, Component, signal, viewChild } from '@angular/core';
import { SETTING_TABS, SettingTab } from '@constants/settings';
import { HeaderWrapComponent } from '@shared/layouts/header-wrap/header-wrap.component';
import { ESignTabComponent } from './e-sign-tab/e-sign-tab.component';
import { PracticeTabComponent } from './practice-tab/practice-tab.component';

@Component({
  selector: 'app-settings',
  imports: [HeaderWrapComponent, PracticeTabComponent, ESignTabComponent],
  templateUrl: './settings.component.html',
  styleUrl: './settings.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: { '(window:beforeunload)': 'onBeforeUnload($event)' }
})
export class SettingsComponent {
  readonly tabs = SETTING_TABS;
  readonly activeTab = signal<SettingTab>(this.tabs[0].id);

  private readonly practiceTab = viewChild.required(PracticeTabComponent);

  canNavigateOut(): Promise<boolean> {
    return this.practiceTab().canNavigateOut();
  }

  onBeforeUnload(event: BeforeUnloadEvent) {
    if (this.practiceTab().hasUnsavedChanges()) event.preventDefault();
  }
}
