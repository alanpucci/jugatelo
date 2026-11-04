import { Routes } from '@angular/router';

export const routes: Routes = [
  { path: '', pathMatch: 'full', redirectTo: 'login' },
  {
    path: 'login',
    loadComponent: () => import('./features/autenticacion/login/login.component').then((m) => m.LoginComponent),
  },
  {
    path: 'registro',
    loadComponent: () => import('./features/autenticacion/registro/registro.component').then((m) => m.RegistroComponent),
  },
  {
    path: 'publicaciones',
    loadComponent: () =>
      import('./features/publicaciones/publicaciones/publicaciones.component').then((m) => m.PublicacionesComponent),
  },
  {
    path: 'mi-perfil',
    loadComponent: () => import('./features/perfil/mi-perfil/mi-perfil.component').then((m) => m.MiPerfilComponent),
  },
  { path: '**', redirectTo: 'publicaciones' },
];
