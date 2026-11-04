import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { environment } from '../../../environments/environment';
import { Paginado } from '../../core/paginado.model';
import { ComentarioPublicacion } from './publicacion.model';

@Injectable({ providedIn: 'root' })
export class ComentariosService {
  private readonly http = inject(HttpClient);

  listar(publicacionId: string, offset: number, limit: number) {
    const params = new HttpParams().set('offset', offset).set('limit', limit);
    return this.http.get<Paginado<ComentarioPublicacion>>(this.url(publicacionId), { params });
  }

  crear(publicacionId: string, mensaje: string) {
    return this.http.post<ComentarioPublicacion>(this.url(publicacionId), { mensaje });
  }

  editar(publicacionId: string, comentarioId: string, mensaje: string) {
    return this.http.put<ComentarioPublicacion>(`${this.url(publicacionId)}/${comentarioId}`, { mensaje });
  }

  private url(publicacionId: string) {
    return `${environment.apiUrl}/publicaciones/${publicacionId}/comentarios`;
  }
}
