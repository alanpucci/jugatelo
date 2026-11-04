import { Injectable, signal } from '@angular/core';

export type TipoModal = 'info' | 'error' | 'confirmacion';

export interface EstadoModal {
  tipo: TipoModal;
  titulo: string;
  mensaje: string;
  textoConfirmar?: string;
  textoCancelar?: string;
}

@Injectable({ providedIn: 'root' })
export class ModalService {
  readonly estado = signal<EstadoModal | null>(null);
  private resolverConfirmacion: ((decision: boolean) => void) | null = null;

  mostrarInfo(mensaje: string, titulo = 'Listo') {
    this.estado.set({ tipo: 'info', titulo, mensaje });
  }

  mostrarError(mensaje: string, titulo = 'Ocurrió un problema') {
    this.estado.set({ tipo: 'error', titulo, mensaje });
  }

  confirmar(mensaje: string, titulo = 'Confirmar', textoConfirmar = 'Confirmar', textoCancelar = 'Cancelar') {
    this.estado.set({ tipo: 'confirmacion', titulo, mensaje, textoConfirmar, textoCancelar });
    return new Promise<boolean>((resolver) => {
      this.resolverConfirmacion = resolver;
    });
  }

  cerrar(decision = false) {
    this.estado.set(null);
    this.resolverConfirmacion?.(decision);
    this.resolverConfirmacion = null;
  }
}
