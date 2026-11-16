import { HttpClient } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { environment } from '../../../environments/environment';
import { Usuario } from './usuario.model';

@Injectable({ providedIn: 'root' })
export class UsuariosService {
  private readonly http = inject(HttpClient);

  listar() {
    return this.http.get<Usuario[]>(`${environment.apiUrl}/usuarios`);
  }

  crear(formData: FormData) {
    return this.http.post<Usuario>(`${environment.apiUrl}/usuarios`, formData);
  }

  deshabilitar(id: string) {
    return this.http.delete<Usuario>(`${environment.apiUrl}/usuarios/${id}`);
  }

  habilitar(id: string) {
    return this.http.post<Usuario>(`${environment.apiUrl}/usuarios/${id}/habilitar`, {});
  }
}
