import { ApplicationConfig, EnvironmentProviders, inject, provideAppInitializer, provideZoneChangeDetection } from '@angular/core';
import { provideRouter } from '@angular/router';
import { provideHttpClient, withInterceptors } from '@angular/common/http';
import { serviceFactory } from './core/services/service';
import { routesFactory } from './app.routes';
import { interceptorFactory } from './core/interceptors/interceptor';
// APP CONFIG
const createAppConfig = () => {
  const APP_INITIALIZER = async (): Promise<void> => {
    const { ServerHealthService } = serviceFactory;
    const serverHealthService = inject(ServerHealthService);
    await serverHealthService.check();
  };
  const APP_PROVIDERS = () => {
    const { getRoutes } = routesFactory;
    const { auth } = interceptorFactory;
    return [
      //
      provideAppInitializer(APP_INITIALIZER),
      provideRouter(getRoutes()),
      provideZoneChangeDetection({ eventCoalescing: true }),
      provideHttpClient(withInterceptors([auth])),
    ] as EnvironmentProviders[];
  };
  const APP_CONFIG: ApplicationConfig = { providers: APP_PROVIDERS() };
  return {
    APP_CONFIG,
  };
};
export const appConfigFactory = createAppConfig();
