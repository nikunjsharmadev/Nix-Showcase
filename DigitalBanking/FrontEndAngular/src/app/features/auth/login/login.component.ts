import { Component, effect, inject, signal } from '@angular/core';
import { APP_STRING_LITERALS } from '../../../core/data/const';
import { AuthContextService } from '../../../core/services/service';
import { FormControlComponent } from '../../../shared/components/form-control/form-control.component';
import { AuthTab } from '../../../core/data/enum';

@Component({
  selector: 'bnk-login',
  imports: [FormControlComponent],
  templateUrl: './login.component.html',
  styleUrl: './login.component.scss',
})
export class LoginComponent {
  STRING_LITERALS = APP_STRING_LITERALS['bnk-login'];
  private ctx = inject(AuthContextService);
  loginTab: boolean = false;
  fullyRendered = signal(false);
  constructor() {
    effect(() => {
      this.loginTab = this.ctx.activeTab() === AuthTab.Login;
    });
  }
  ngAfterViewInit() {
    requestAnimationFrame(() => {
      this.fullyRendered.set(true);
    });
  }
}
