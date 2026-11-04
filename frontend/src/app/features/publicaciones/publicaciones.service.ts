import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { firstValueFrom } from 'rxjs';
import { environment } from '../../../environments/environment';
import { Paginado } from '../../core/paginado.model';
import { EstadoMeGusta, FiltrosPublicaciones, JuntadaProxima, Publicacion } from './publicacion.model';

@Injectable({ providedIn: 'root' })
export class PublicacionesService {
  private readonly http = inject(HttpClient);

  private precarga: { pagina?: Paginado<Publicacion>; juntadas?: JuntadaProxima[] } | undefined;

  async precargar(filtros: Partial<FiltrosPublicaciones>) {
    const [pagina, juntadas] = await Promise.all([
      firstValueFrom(this.listar(filtros)).catch(() => undefined),
      firstValueFrom(this.proximasJuntadas()).catch(() => undefined),
    ]);
    this.precarga = { pagina, juntadas };
  }

  tomarPaginaPrecargada() {
    const pagina = this.precarga?.pagina;
    if (this.precarga) {
      this.precarga.pagina = undefined;
    }
    return pagina;
  }

  tomarJuntadasPrecargadas() {
    const juntadas = this.precarga?.juntadas;
    if (this.precarga) {
      this.precarga.juntadas = undefined;
    }
    return juntadas;
  }

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
