import { Injectable, effect, inject, untracked } from '@angular/core';
import { environment } from '../../environments/environment';
import { AuthService } from './auth.service';
import { ModalService } from './modal.service';
import { TokenService } from './token.service';

@Injectable({ providedIn: 'root' })
export class SesionService {
  private readonly authService = inject(AuthService);
  private readonly modalService = inject(ModalService);
  private readonly tokenService = inject(TokenService);

  private temporizadorAviso: ReturnType<typeof setTimeout> | undefined;
  private temporizadorVencimiento: ReturnType<typeof setTimeout> | undefined;
  private avisoMostrado = false;

  constructor() {
    effect(() => {
      if (this.authService.haySesion()) {
        untracked(() => {
          this.avisoMostrado = false;
          this.programar();
        });
      } else {
        untracked(() => this.detener());
      }
    });

    document.addEventListener('visibilitychange', () => {
      if (document.visibilityState === 'visible' && this.authService.haySesion()) {
        this.revisar();
      }
    });
  }

  private programar() {
    this.detener();
    const expiracion = this.tokenService.leerExpiracion();
    if (!expiracion) {
      return;
    }
    const restante = expiracion - Date.now();
    if (restante <= 0) {
      return;
    }

    if (!this.avisoMostrado) {
      const hastaAviso = Math.max(restante - environment.avisoAntesDeVencerMs, 0);
      this.temporizadorAviso = setTimeout(() => this.avisar(), hastaAviso);
    }
    this.temporizadorVencimiento = setTimeout(() => this.vencer(), restante);
  }

  private detener() {
    clearTimeout(this.temporizadorAviso);
    clearTimeout(this.temporizadorVencimiento);
  }

  private revisar() {
    const expiracion = this.tokenService.leerExpiracion();
    if (expiracion && expiracion <= Date.now()) {
      this.vencer();
      return;
    }
    this.programar();
  }

  private async avisar() {
    this.avisoMostrado = true;
    const minutos = environment.avisoAntesDeVencerMs / 60000;
    const textoMinutos = `${minutos.toLocaleString('es-AR', { maximumFractionDigits: 2 })} ${minutos === 1 ? 'minuto' : 'minutos'}`;
    const extender = await this.modalService.confirmar(
      `Tu sesión vence en ${textoMinutos}. ¿Querés extenderla?`,
      'Sesión por vencer',
      'Extender',
      'No',
    );
    if (!extender) {
      return;
    }

    try {
      await this.authService.refrescar();
      this.avisoMostrado = false;
      this.programar();
    } catch {
      return;
    }
  }

  private vencer() {
    this.modalService.cerrar(false);
    this.authService.cerrarSesion();
    this.modalService.mostrarError('Tu sesión venció. Iniciá sesión nuevamente para continuar.', 'Sesión vencida');
  }
}
