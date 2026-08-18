import { Component, effect, inject } from '@angular/core';
import { FormControlComponent } from '../../../shared/components/form-control/form-control.component';
import { APP_STRING_LITERALS } from '../../../core/data/const';
import { AuthContextService } from '../../../core/services/service';
import { AuthTab } from '../../../core/data/enum';

@Component({
  selector: 'bnk-register',
  imports: [FormControlComponent],
  templateUrl: './register.component.html',
  styleUrl: './register.component.scss',
})
export class RegisterComponent {
  STRING_LITERALS = APP_STRING_LITERALS['bnk-register'];
  private ctx = inject(AuthContextService);
  registerTab: boolean = this.ctx.activeTab() === AuthTab.Register;
  constructor() {
    effect(() => {
      this.registerTab = this.ctx.activeTab() === AuthTab.Register;
    });
  }
}
