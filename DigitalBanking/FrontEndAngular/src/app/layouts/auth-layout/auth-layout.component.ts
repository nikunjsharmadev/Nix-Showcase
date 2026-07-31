import { Component } from '@angular/core';
import { APP_STRING_LITERALS } from '../../core/data/const';

@Component({
  selector: 'bnk-auth-layout',
  imports: [],
  templateUrl: './auth-layout.component.html',
  styleUrl: './auth-layout.component.scss',
})
export class AuthLayoutComponent {
  STRING_LITERALS = APP_STRING_LITERALS['bnk-auth'];
}
