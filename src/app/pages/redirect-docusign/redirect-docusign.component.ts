import { ChangeDetectionStrategy, Component, inject, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';

@Component({
  selector: 'app-redirect-docusign',
  templateUrl: './redirect-docusign.component.html',
  styleUrl: './redirect-docusign.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class RedirectDocusignComponent implements OnInit {
  route = inject(ActivatedRoute);
  ngOnInit(): void {
    this.route.queryParams.subscribe(params => {
      if (params['event'] === 'signing_complete') {
        window.parent.postMessage('closeIframe', '/');
      }
    });
  }
}
