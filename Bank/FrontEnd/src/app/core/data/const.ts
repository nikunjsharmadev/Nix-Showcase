import { provideHttpClient } from '@angular/common/http';
import {
  EnvironmentProviders,
  inject,
  provideAppInitializer,
  provideZoneChangeDetection,
} from '@angular/core';
import { provideRouter } from '@angular/router';
import { firstValueFrom } from 'rxjs';
import { ROUTES } from '../../app.routes';
import { AppStateService, HealthService } from '../services/service';

// CONSTS
export const APP_PROVIDERS: EnvironmentProviders[] = [
  provideAppInitializer(async () => {
    const health = inject(HealthService);
    const state = inject(AppStateService);
    try {
      await firstValueFrom(health.check());
      state.serverOnline.set(true);
    } catch {
      state.serverOnline.set(false);
    }
  }),
  provideRouter(ROUTES),
  provideZoneChangeDetection({ eventCoalescing: true }),
  provideHttpClient(),
] as const;
export const APP_STRING_LITERALS = {
  'bnk-auth': [
    'System Secure🔒',
    'Digital Banking Platform',
    'Sign In🔑',
    'Register🏷️',
  ],
  'bnk-login': [
    'Welcome Back',
    'Input your credentials to initialize your secure banking session.',
  ],
  'bnk-register': [
    'Register Banking Profile',
    'Setup digital credentials to connect your bank accounts.',
  ],
} as const;
export const VALIDATION_ERRORS: { [key: string]: string } = {
  required: 'This field is required*',
  email: 'Invalid email address*',
  minlength: 'Too short*',
} as const;
export const BACKEND_URLS = {
  auth: {
    login: '/auth/login',
    register: '/auth/register',
    verifyEmail: '/auth/verify-email',
    me: '/me',
  },
} as const;
