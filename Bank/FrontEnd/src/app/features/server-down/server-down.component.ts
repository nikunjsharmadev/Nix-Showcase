import { Component, inject } from '@angular/core';
import { Router } from '@angular/router';
import { serviceFactory } from '../../core/services/service';
const { ServerHealthService } = serviceFactory;
// SERVER DOWN
@Component({
  selector: `bnk-server-down`,
  template: ` <!--  -->
    <section class="main-container">
      <section class="container">
        <section class="icon">⚠️</section>
        <h1>Server Temporarily Unavailable</h1>
        <p>We're sorry! Our server is currently down for maintenance or experiencing technical issues.</p>
        <p class="small">Please try again in a few minutes.</p>
        <button type="button" (click)="retry()" [disabled]="retrying">{{ retrying ? 'checking...' : 'Retry' }}</button>
      </section>
    </section>`,
})
export class ServerDownComponent {
  private serverHealthService = inject(ServerHealthService);
  private router = inject(Router);
  retrying = false;
  retry = async () => {
    this.retrying = true;
    try {
      const online = await this.serverHealthService.check();
      if (online) await this.router.navigate(['/dashboard']);
    } finally {
      this.retrying = false;
    }
  };
}
