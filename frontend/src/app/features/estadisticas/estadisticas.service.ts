import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { environment } from '../../../environments/environment';
import {
  ComentariosEnLapso,
  ComentariosPorPublicacion,
  PublicacionesPorUsuario,
  RangoFechas,
} from './estadisticas.model';

@Injectable({ providedIn: 'root' })
export class EstadisticasService {
  private readonly http = inject(HttpClient);

  publicacionesPorUsuario(rango: RangoFechas) {
    return this.http.get<PublicacionesPorUsuario[]>(`${environment.apiUrl}/estadisticas/publicaciones-por-usuario`, {
      params: this.armarParams(rango),
    });
  }

  comentarios(rango: RangoFechas) {
    return this.http.get<ComentariosEnLapso>(`${environment.apiUrl}/estadisticas/comentarios`, {
      params: this.armarParams(rango),
    });
  }

  comentariosPorPublicacion(rango: RangoFechas) {
    return this.http.get<ComentariosPorPublicacion[]>(`${environment.apiUrl}/estadisticas/comentarios-por-publicacion`, {
      params: this.armarParams(rango),
    });
  }

  private armarParams(rango: RangoFechas) {
    return new HttpParams().set('desde', rango.desde).set('hasta', rango.hasta);
  }
}
