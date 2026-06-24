import { Component, output, signal } from '@angular/core';
import { ButtonComponent } from '../../../shared/components/button/button.component';
import { AuthTab } from '../../../shared/enums/bnk.enum';

@Component({
    selector: 'bnk-tab',
    imports: [ButtonComponent],
    templateUrl: './tab.component.html',
    styleUrl: './tab.component.scss'
})
export class TabComponent {
  authTab = AuthTab;
  activeTab: AuthTab = AuthTab.Login;
  changeTab = output<AuthTab>();

  onTabChange(tab: AuthTab) {
    this.changeTab.emit(tab);
    this.activeTab = tab;
  }
}
