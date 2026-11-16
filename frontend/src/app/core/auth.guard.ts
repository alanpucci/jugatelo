import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { AuthService } from './auth.service';
import { TokenService } from './token.service';

export const authGuard: CanActivateFn = (_ruta, estado) => {
  const authService = inject(AuthService);
  const tokenService = inject(TokenService);
  const router = inject(Router);

  if (authService.usuarioActual()) {
    return true;
  }
  if (tokenService.leer()) {
    return router.createUrlTree(['/cargando'], { queryParams: { destino: estado.url } });
  }
  return router.createUrlTree(['/login']);
};

export const invitadoGuard: CanActivateFn = () => {
  const tokenService = inject(TokenService);
  const router = inject(Router);

  if (tokenService.leer()) {
    return router.createUrlTree(['/cargando']);
  }
  return true;
};

export const adminGuard: CanActivateFn = () => {
  const authService = inject(AuthService);
  const router = inject(Router);

  if (authService.usuarioActual()?.perfil === 'administrador') {
    return true;
  }
  return router.createUrlTree(['/publicaciones']);
};
