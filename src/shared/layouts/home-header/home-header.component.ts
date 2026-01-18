import { ChangeDetectionStrategy, Component, computed, inject, input, output } from '@angular/core';
import { DataService } from '@shared/services/data.service';
import { RouterLink } from '@angular/router';
import { DatePipe } from '@angular/common';

@Component({
  selector: 'app-home-header',
  imports: [RouterLink, DatePipe],
  templateUrl: './home-header.component.html',
  styleUrl: './home-header.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class HomeHeaderComponent {
  readonly today = new Date();
  private data = inject(DataService);
  hasUpload = input<boolean>(false);
  hasEnrollment = computed(() => !!this.data.activePrescribers()?.length);
  upload = output();
  emitUpload() {
    this.upload.emit();
  }
}
