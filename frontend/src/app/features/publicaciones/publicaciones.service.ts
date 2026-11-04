import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { environment } from '../../../environments/environment';
import { Paginado } from '../../core/paginado.model';
import { FiltrosPublicaciones, Publicacion } from './publicacion.model';

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
}
