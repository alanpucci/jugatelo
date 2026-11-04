import { HttpErrorResponse } from '@angular/common/http';
import { firstValueFrom } from 'rxjs';
import { Component, OnInit, inject, input, output, signal } from '@angular/core';
import { AuthService } from '../../../core/auth.service';
import { ModalService } from '../../../core/modal.service';
import { ImagenRespaldoDirective } from '../../../shared/directivas/imagen-respaldo.directive';
import { TiempoRelativoPipe } from '../../../shared/pipes/tiempo-relativo.pipe';
import { TruncarPipe } from '../../../shared/pipes/truncar.pipe';
import { ComentariosModalService } from '../comentarios-modal/comentarios-modal.service';
import { ComentariosService } from '../comentarios.service';
import { ComentarioPublicacion, Publicacion } from '../publicacion.model';
import { PublicacionesService } from '../publicaciones.service';

@Component({
  selector: 'app-publicacion-card',
  imports: [ImagenRespaldoDirective, TiempoRelativoPipe, TruncarPipe],
  templateUrl: './publicacion-card.component.html',
  styleUrl: './publicacion-card.component.css',
})
export class PublicacionCardComponent implements OnInit {
  private readonly publicacionesService = inject(PublicacionesService);
  private readonly authService = inject(AuthService);
  private readonly modalService = inject(ModalService);
  private readonly comentariosService = inject(ComentariosService);
  private readonly comentariosModalService = inject(ComentariosModalService);

  readonly publicacion = input<Publicacion | null>(null);
  readonly detalleCompleto = input(false);
  readonly eliminada = output<void>();

  protected readonly cantidadMeGusta = signal(0);
  protected readonly meGustaDado = signal(false);
  protected readonly comentarios = signal<ComentarioPublicacion[] | undefined>(undefined);

  ngOnInit() {
    const publicacion = this.publicacion();
    if (!publicacion) {
      return;
    }
    this.cantidadMeGusta.set(publicacion.cantidadMeGusta);
    this.meGustaDado.set(publicacion.meGustaDado);
    this.comentarios.set(publicacion.comentarios);
  }

  protected verComentarios() {
    const publicacion = this.publicacion();
    if (publicacion) {
      this.comentariosModalService.abrir(publicacion, () => this.refrescarComentarios());
    }
  }

  private async refrescarComentarios() {
    const publicacion = this.publicacion();
    if (!publicacion || !this.comentarios()) {
      return;
    }
    try {
      const pagina = await firstValueFrom(this.comentariosService.listar(publicacion._id, 0, 3));
      this.comentarios.set(pagina.datos);
    } catch {
      return;
    }
  }

  protected alternarMeGusta() {
    const publicacion = this.publicacion();
    if (!publicacion) {
      return;
    }
    const peticion = this.meGustaDado()
      ? this.publicacionesService.quitarMeGusta(publicacion._id)
      : this.publicacionesService.darMeGusta(publicacion._id);
    peticion.subscribe({
      next: (estado) => {
        this.cantidadMeGusta.set(estado.cantidadMeGusta);
        this.meGustaDado.set(estado.meGustaDado);
      },
      error: (error: HttpErrorResponse) => this.mostrarError(error),
    });
  }

  protected puedeEliminar() {
    const publicacion = this.publicacion();
    const usuario = this.authService.usuarioActual();
    if (!publicacion || !usuario) {
      return false;
    }
    return publicacion.usuario._id === usuario._id;
  }

  protected async eliminar() {
    const publicacion = this.publicacion();
    if (!publicacion) {
      return;
    }
    const confirmado = await this.modalService.confirmar(
      '¿Eliminar esta publicación? Sus comentarios dejarán de verse.',
      'Eliminar publicación',
    );
    if (!confirmado) {
      return;
    }
    this.publicacionesService.eliminar(publicacion._id).subscribe({
      next: () => this.eliminada.emit(),
      error: (error: HttpErrorResponse) => this.mostrarError(error),
    });
  }

  protected cifra() {
    const publicacion = this.publicacion();
    if (!publicacion) {
      return '';
    }
    if (publicacion.tipo === 'juntada') {
      return publicacion.cupo === null ? '∞' : String(publicacion.cupo);
    }
    const { jugadoresMin: minimo, jugadoresMax: maximo } = publicacion;
    if (minimo === null && maximo === null) {
      return '?';
    }
    if (minimo === null || maximo === null || minimo === maximo) {
      return String(minimo ?? maximo);
    }
    return `${minimo}–${maximo}`;
  }

  protected etiqueta() {
    const publicacion = this.publicacion();
    if (publicacion?.tipo === 'juntada') {
      return publicacion.cupo === null ? 'sin cupo' : 'lugares';
    }
    return 'jugadores';
  }

  protected detalle() {
    const publicacion = this.publicacion();
    if (!publicacion || publicacion.tipo !== 'juntada' || !publicacion.fechaJuntada) {
      return '';
    }
    const fecha = new Date(publicacion.fechaJuntada);
    const texto = fecha.toLocaleString('es-AR', {
      weekday: 'short',
      day: '2-digit',
      month: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
    });
    const finalizada = fecha.getTime() < Date.now() ? ' · Finalizada' : '';
    return `${publicacion.zona} · ${texto}${finalizada}`;
  }

  private mostrarError(error: HttpErrorResponse) {
    if (error.status === 401) {
      return;
    }
    const mensaje = error.error?.message;
    this.modalService.mostrarError(Array.isArray(mensaje) ? mensaje.join('. ') : (mensaje ?? 'No pudimos conectar con el servidor'));
  }
}
