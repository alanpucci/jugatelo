import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { environment } from '../../../environments/environment';
import { Paginado } from '../../core/paginado.model';
import { EstadoMeGusta, FiltrosPublicaciones, JuntadaProxima, Publicacion } from './publicacion.model';

@Injectable({ providedIn: 'root' })
export class PublicacionesService {
  private readonly http = inject(HttpClient);

  crear(formData: FormData) {
    return this.http.post<Publicacion>(`${environment.apiUrl}/publicaciones`, formData);
  }

  listar(filtros: Partial<FiltrosPublicaciones>) {
    let params = new HttpParams();
    for (const [clave, valor] of Object.entries(filtros)) {
      if (valor !== '' && valor !== undefined && valor !== null) {
        params = params.set(clave, valor);
      }
    }
    return this.http.get<Paginado<Publicacion>>(`${environment.apiUrl}/publicaciones`, { params });
  }

  proximasJuntadas() {
    return this.http.get<JuntadaProxima[]>(`${environment.apiUrl}/publicaciones/proximas-juntadas`);
  }

  obtener(id: string) {
    return this.http.get<Publicacion>(`${environment.apiUrl}/publicaciones/${id}`);
  }

  eliminar(id: string) {
    return this.http.delete<{ mensaje: string }>(`${environment.apiUrl}/publicaciones/${id}`);
  }

  darMeGusta(id: string) {
    return this.http.post<EstadoMeGusta>(`${environment.apiUrl}/publicaciones/${id}/me-gusta`, {});
  }

  quitarMeGusta(id: string) {
    return this.http.delete<EstadoMeGusta>(`${environment.apiUrl}/publicaciones/${id}/me-gusta`);
  }
}
