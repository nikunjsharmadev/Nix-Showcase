import { Component } from '@angular/core';
import { LoginComponent } from './login/login.component';
import { RegisterComponent } from './register/register.component';
import { TabComponent } from '../../shared/components/tab/tab.component';
import { AuthLayoutComponent } from '../../layouts/auth-layout/auth-layout.component';
@Component({
  selector: 'app-auth',
  imports: [
    AuthLayoutComponent,
    TabComponent,
    LoginComponent,
    RegisterComponent,
  ],
  templateUrl: './auth.component.html',
  styleUrl: './auth.component.scss',
})
export class AuthComponent {}
