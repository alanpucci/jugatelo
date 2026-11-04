import { HttpErrorResponse, HttpInterceptorFn } from '@angular/common/http';
import { inject } from '@angular/core';
import { catchError, throwError } from 'rxjs';
import { AuthService } from './auth.service';
import { ModalService } from './modal.service';
import { TokenService } from './token.service';

export const tokenInterceptor: HttpInterceptorFn = (peticion, siguiente) => {
  const authService = inject(AuthService);
  const modalService = inject(ModalService);
  const token = inject(TokenService).leer();
  const peticionFinal = token
    ? peticion.clone({ setHeaders: { Authorization: `Bearer ${token}` } })
    : peticion;
  return siguiente(peticionFinal).pipe(
    catchError((error: HttpErrorResponse) => {
      if (error.status === 401) {
        authService.cerrarSesion();
        if (token) {
          modalService.mostrarError('Tu sesión venció. Iniciá sesión nuevamente para continuar.', 'Sesión vencida');
        }
      }
      return throwError(() => error);
    }),
  );
};
