import { provideZoneChangeDetection } from "@angular/core";
import { bootstrapApplication } from '@angular/platform-browser';
import { AppComponent } from './app/app.component';
import { appConfigFactory } from './app/app.config';
// MAIN
const { APP_CONFIG } = appConfigFactory;
bootstrapApplication(AppComponent, {...APP_CONFIG, providers: [provideZoneChangeDetection(), ...APP_CONFIG.providers]});
