import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { HeaderComponent } from '@shared/layouts/header/header.component';
import { FooterComponent } from '@shared/layouts/footer/footer.component';
import { LoaderComponent } from '@shared/layouts/loader/loader.component';
import { ApiService } from '@shared/services/api.service';

@Component({
  selector: 'app-root',
  imports: [RouterOutlet, HeaderComponent, FooterComponent, LoaderComponent],
  templateUrl: './app.component.html',
  styleUrl: './app.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class AppComponent {
  api = inject(ApiService);
}
