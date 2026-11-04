import { Routes } from '@angular/router';
import { authGuard, invitadoGuard } from './core/auth.guard';

export const routes: Routes = [
  { path: '', pathMatch: 'full', redirectTo: 'cargando' },
  {
    path: 'cargando',
    loadComponent: () => import('./features/autenticacion/cargando/cargando.component').then((m) => m.CargandoComponent),
  },
  {
    path: 'login',
    canActivate: [invitadoGuard],
    loadComponent: () => import('./features/autenticacion/login/login.component').then((m) => m.LoginComponent),
  },
  {
    path: 'registro',
    canActivate: [invitadoGuard],
    loadComponent: () => import('./features/autenticacion/registro/registro.component').then((m) => m.RegistroComponent),
  },
  {
    path: 'publicaciones',
    canActivate: [authGuard],
    loadComponent: () =>
      import('./features/publicaciones/publicaciones/publicaciones.component').then((m) => m.PublicacionesComponent),
  },
  {
    path: 'mi-perfil',
    canActivate: [authGuard],
    loadComponent: () => import('./features/perfil/mi-perfil/mi-perfil.component').then((m) => m.MiPerfilComponent),
  },
  { path: '**', redirectTo: 'publicaciones' },
];
