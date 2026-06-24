import { Component, signal } from '@angular/core';
import { LoginComponent } from './login/login.component';
import { RegisterComponent } from './register/register.component';
import { TabComponent } from './tab/tab.component';
import { AuthTab } from '../../shared/enums/bnk.enum';
@Component({
    selector: 'app-auth',
    imports: [LoginComponent, RegisterComponent, TabComponent],
    templateUrl: './auth.component.html',
    styleUrl: './auth.component.scss'
})
export class AuthComponent {
  authTab = AuthTab; // expose enum to template
  activeTab: AuthTab = AuthTab.Login;

  receiveChangeTab(tab: AuthTab) {
    this.activeTab = tab;
  }
}
