import { Component, inject } from '@angular/core';
import { APP_STRING_LITERALS } from '../../../core/data/const';
import { AuthContextService } from '../../../core/services/service';
import { AuthTab } from '../../../core/data/enum';

@Component({
  selector: 'bnk-tab',
  imports: [],
  templateUrl: './tab.component.html',
  styleUrl: './tab.component.scss',
})
export class TabComponent {
  STRING_LITERALS = APP_STRING_LITERALS['bnk-auth'];
  private ctx = inject(AuthContextService);
  authTab = AuthTab;
  activeTab: AuthTab = this.ctx.activeTab();
  onTabChange(tab: AuthTab) {
    this.activeTab = tab;
    this.ctx.activeTab.set(tab);
  }
}
