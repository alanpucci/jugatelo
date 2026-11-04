import { Injectable, signal } from '@angular/core';
import { Publicacion } from '../publicacion.model';

@Injectable({ providedIn: 'root' })
export class ComentariosModalService {
  readonly publicacion = signal<Publicacion | null>(null);
  private alCerrar: (() => void) | null = null;

  abrir(publicacion: Publicacion, alCerrar: () => void) {
    this.alCerrar = alCerrar;
    this.publicacion.set(publicacion);
  }

  cerrar() {
    this.publicacion.set(null);
    this.alCerrar?.();
    this.alCerrar = null;
  }
}
