import { HttpErrorResponse } from '@angular/common/http';
import { DatePipe } from '@angular/common';
import { Component, OnInit, inject, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import { AuthService } from '../../../core/auth.service';
import { ModalService } from '../../../core/modal.service';
import { TiempoRelativoPipe } from '../../../shared/pipes/tiempo-relativo.pipe';
import { Publicacion } from '../../publicaciones/publicacion.model';
import { PublicacionesService } from '../../publicaciones/publicaciones.service';

@Component({
  selector: 'app-mi-perfil',
  imports: [DatePipe, RouterLink, TiempoRelativoPipe],
  templateUrl: './mi-perfil.component.html',
  styleUrl: './mi-perfil.component.css',
})
export class MiPerfilComponent implements OnInit {
  protected readonly authService = inject(AuthService);
  private readonly publicacionesService = inject(PublicacionesService);
  private readonly modalService = inject(ModalService);

  protected readonly cargando = signal(false);
  protected readonly publicaciones = signal<Publicacion[]>([]);

  ngOnInit() {
    const usuario = this.authService.usuarioActual();
    if (!usuario) {
      return;
    }
    this.cargando.set(true);
    this.publicacionesService.listar({ usuarioId: usuario._id, limit: 3, comentarios: 3 }).subscribe({
      next: (pagina) => {
        this.publicaciones.set(pagina.datos);
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
