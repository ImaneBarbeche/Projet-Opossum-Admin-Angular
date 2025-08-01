import { ApplicationConfig } from '@angular/core';
import { provideRouter } from '@angular/router';
import { provideHttpClient, withInterceptors, HttpRequest, HttpHandlerFn } from '@angular/common/http';
import { AuthInterceptor } from './core/interceptors/auth.interceptor';
import { routes } from './app.routes';
import { MockInterceptor } from './core/interceptors/mock.interceptor';

export const appConfig: ApplicationConfig = {
  providers: [
    provideRouter(routes),
    provideHttpClient(withInterceptors([
      // Interceptor Auth pour JWT sur routes admin
      (req: HttpRequest<unknown>, next: HttpHandlerFn) => {
        const interceptor = new AuthInterceptor();
        return interceptor.intercept(req, { handle: next });
      }
    ]))
  ]
};