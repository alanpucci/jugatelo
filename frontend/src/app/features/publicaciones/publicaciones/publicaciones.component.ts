import { HttpErrorResponse } from '@angular/common/http';
import { Component, OnInit, inject, signal } from '@angular/core';
import { ModalService } from '../../../core/modal.service';
import { PaginadorComponent } from '../../../shared/paginador/paginador.component';
import { TiempoRelativoPipe } from '../../../shared/pipes/tiempo-relativo.pipe';
import { MiMesaComponent } from '../mi-mesa/mi-mesa.component';
import { NuevaPublicacionComponent } from '../nueva-publicacion/nueva-publicacion.component';
import { ProximasJuntadasComponent } from '../proximas-juntadas/proximas-juntadas.component';
import { OrdenPublicaciones, Publicacion, TipoPublicacion } from '../publicacion.model';
import { PublicacionesService } from '../publicaciones.service';

const POR_PAGINA = 10;

@Component({
  imports: [
    MiMesaComponent,
    ProximasJuntadasComponent,
    NuevaPublicacionComponent,
    PaginadorComponent,
    TiempoRelativoPipe,
  ],
  selector: 'app-publicaciones',
  templateUrl: './publicaciones.component.html',
  styleUrl: './publicaciones.component.css',
})
export class PublicacionesComponent implements OnInit {
  private readonly publicacionesService = inject(PublicacionesService);
  private readonly modalService = inject(ModalService);

  protected readonly porPagina = POR_PAGINA;
  protected readonly mostrandoFormulario = signal(false);
  protected readonly cargando = signal(false);
  protected readonly publicaciones = signal<Publicacion[]>([]);
  protected readonly total = signal(0);
  protected readonly offset = signal(0);
  protected readonly orden = signal<OrdenPublicaciones>('fecha');
  protected readonly tipo = signal<TipoPublicacion | ''>('');
  protected readonly zona = signal('');

  ngOnInit() {
    this.cargar(0);
  }

  protected cambiarOrden(evento: Event) {
    this.orden.set((evento.target as HTMLSelectElement).value as OrdenPublicaciones);
    this.cargar(0);
  }

  protected cambiarTipo(evento: Event) {
    this.tipo.set((evento.target as HTMLSelectElement).value as TipoPublicacion | '');
    this.cargar(0);
  }

  protected cambiarZona(evento: Event) {
    this.zona.set((evento.target as HTMLInputElement).value.trim());
    this.cargar(0);
  }

  protected publicada() {
    this.mostrandoFormulario.set(false);
    this.orden.set('fecha');
    this.cargar(0);
  }

  protected cargar(offset = this.offset()) {
    this.cargando.set(true);
    this.publicacionesService
      .listar({
        orden: this.orden(),
        tipo: this.tipo(),
        zona: this.zona(),
        offset,
        limit: POR_PAGINA,
      })
      .subscribe({
        next: (pagina) => {
          this.publicaciones.set(pagina.datos);
          this.total.set(pagina.total);
          this.offset.set(pagina.offset);
          this.cargando.set(false);
        },
        error: (error: HttpErrorResponse) => {
          if (error.status !== 401) {
            this.modalService.mostrarError('No pudimos cargar las publicaciones');
          }
          this.cargando.set(false);
        },
      });
  }

  protected cifra(publicacion: Publicacion) {
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

  protected etiqueta(publicacion: Publicacion) {
    if (publicacion.tipo === 'juntada') {
      return publicacion.cupo === null ? 'sin cupo' : 'lugares';
    }
    return 'jugadores';
  }

  protected detalle(publicacion: Publicacion) {
    if (publicacion.tipo !== 'juntada' || !publicacion.fechaJuntada) {
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
}
