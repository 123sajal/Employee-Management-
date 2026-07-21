import {
  HttpInterceptorFn,
  HttpRequest,
  HttpHandlerFn,
  HttpErrorResponse,
} from '@angular/common/http';
import { inject }     from '@angular/core';
import { catchError } from 'rxjs/operators';
import { throwError } from 'rxjs';
import { AuthService }        from '../services/auth.service';
import { NotificationService } from '../services/notification.service';

export const authInterceptor: HttpInterceptorFn = (
  req: HttpRequest<unknown>,
  next: HttpHandlerFn
) => {
  const auth         = inject(AuthService);
  const notification = inject(NotificationService);
  const token        = auth.token();

  const authReq = token
    ? req.clone({ setHeaders: { Authorization: `Bearer ${token}` } })
    : req;

  return next(authReq).pipe(
    catchError((error: HttpErrorResponse) => {
      if (error.status === 401) {
        auth.logout();
        notification.error('Session expired. Please log in again.');
      } else if (error.status === 0) {
        notification.error('Cannot reach the server. Please check your connection.');
      } else if (error.status === 500) {
        notification.error('Server error. Please try again later.');
      }
      return throwError(() => error);
    })
  );
};
