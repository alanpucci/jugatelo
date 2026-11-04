import { HttpClient } from '@angular/common/http';
import { Injectable, inject, signal } from '@angular/core';
import { Router } from '@angular/router';
import { firstValueFrom } from 'rxjs';
import { environment } from '../../environments/environment';
import { Usuario } from '../features/usuarios/usuario.model';
import { CredencialesLogin, RespuestaAuth, RespuestaAutorizar } from './auth.model';
import { TokenService } from './token.service';

@Injectable({ providedIn: 'root' })
export class AuthService {
  private readonly http = inject(HttpClient);
  private readonly router = inject(Router);
  private readonly tokenService = inject(TokenService);

  readonly usuarioActual = signal<Usuario | null>(null);
  readonly haySesion = signal(!!this.tokenService.leer());

  async registrar(formData: FormData) {
    const respuesta = await firstValueFrom(
      this.http.post<RespuestaAuth>(`${environment.apiUrl}/auth/registro`, formData),
    );
    this.iniciarSesion(respuesta);
  }

  async login(credenciales: CredencialesLogin) {
    const respuesta = await firstValueFrom(
      this.http.post<RespuestaAuth>(`${environment.apiUrl}/auth/login`, credenciales),
    );
    this.iniciarSesion(respuesta);
  }

  async autorizar() {
    const respuesta = await firstValueFrom(
      this.http.post<RespuestaAutorizar>(`${environment.apiUrl}/auth/autorizar`, {}),
    );
    this.usuarioActual.set(respuesta.usuario);
    this.haySesion.set(true);
  }

  cerrarSesion() {
    this.tokenService.borrar();
    this.usuarioActual.set(null);
    this.haySesion.set(false);
    this.router.navigate(['/login']);
  }

  private iniciarSesion(respuesta: RespuestaAuth) {
    this.tokenService.guardar(respuesta.token);
    this.usuarioActual.set(respuesta.usuario);
    this.haySesion.set(true);
  }
}
