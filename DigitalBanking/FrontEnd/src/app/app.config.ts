import { ApplicationConfig, provideZoneChangeDetection } from '@angular/core';
import { provideRouter } from '@angular/router';
import { provideHttpClient, withInterceptors } from '@angular/common/http';
import { authInterceptor } from './core/interceptors/interceptor';
import { ROUTES } from './app.routes';

export const appConfig: ApplicationConfig = {
  providers: [
    
  ],
};
