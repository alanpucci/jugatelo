import { HttpErrorResponse } from '@angular/common/http';
import { DatePipe } from '@angular/common';
import { Component, OnInit, inject, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import { AuthService } from '../../../core/auth.service';
import { ModalService } from '../../../core/modal.service';
import { ImagenRespaldoDirective } from '../../../shared/directivas/imagen-respaldo.directive';
import { PaginadorComponent } from '../../../shared/paginador/paginador.component';
import { PublicacionCardComponent } from '../../publicaciones/publicacion-card/publicacion-card.component';
import { Publicacion } from '../../publicaciones/publicacion.model';
import { PublicacionesService } from '../../publicaciones/publicaciones.service';

const POR_PAGINA = 3;

@Component({
  selector: 'app-mi-perfil',
  imports: [DatePipe, RouterLink, ImagenRespaldoDirective, PaginadorComponent, PublicacionCardComponent],
  templateUrl: './mi-perfil.component.html',
  styleUrl: './mi-perfil.component.css',
})
export class MiPerfilComponent implements OnInit {
  protected readonly authService = inject(AuthService);
  private readonly publicacionesService = inject(PublicacionesService);
  private readonly modalService = inject(ModalService);

  protected readonly cargando = signal(false);
  protected readonly publicaciones = signal<Publicacion[]>([]);
  protected readonly porPagina = POR_PAGINA;
  protected readonly total = signal(0);
  protected readonly offset = signal(0);

  ngOnInit() {
    this.cargar(0);
  }

  protected eliminada() {
    const nuevoTotal = this.total() - 1;
    const offset = this.offset() >= nuevoTotal && this.offset() > 0 ? this.offset() - POR_PAGINA : this.offset();
    this.cargar(offset);
  }

  protected cargar(offset = this.offset()) {
    const usuario = this.authService.usuarioActual();
    if (!usuario) {
      return;
    }
    this.cargando.set(true);
    this.publicacionesService.listar({ usuarioId: usuario._id, offset, limit: POR_PAGINA, comentarios: 3 }).subscribe({
      next: (pagina) => {
        this.publicaciones.set(pagina.datos);
        this.total.set(pagina.total);
        this.offset.set(pagina.offset);
        this.cargando.set(false);
      },
      error: (error: HttpErrorResponse) => {
        if (error.status !== 401) {
          this.modalService.mostrarError('No pudimos cargar tus publicaciones');
        }
        this.cargando.set(false);
      },
    });
  }
}
