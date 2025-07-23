import { ApplicationConfig } from '@angular/core';
import { provideRouter } from '@angular/router';
import { provideHttpClient, withInterceptors, HttpRequest, HttpHandlerFn } from '@angular/common/http';
import { routes } from './app.routes';
import { MockInterceptor } from './core/interceptors/mock.interceptor';

export const appConfig: ApplicationConfig = {
  providers: [
    provideRouter(routes),
    provideHttpClient(withInterceptors([
      (req: HttpRequest<unknown>, next: HttpHandlerFn) => {
        const interceptor = new MockInterceptor();
        return interceptor.intercept(req, { handle: next });
      }
    ]))
  ]
};