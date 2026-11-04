import { HttpErrorResponse } from '@angular/common/http';
import { Component, OnInit, inject, signal } from '@angular/core';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { firstValueFrom } from 'rxjs';
import { ModalService } from '../../../core/modal.service';
import { SpinnerComponent } from '../../../shared/spinner/spinner.component';
import { ComentariosComponent } from '../comentarios/comentarios.component';
import { PublicacionCardComponent } from '../publicacion-card/publicacion-card.component';
import { Publicacion } from '../publicacion.model';
import { PublicacionesService } from '../publicaciones.service';

@Component({
  selector: 'app-publicacion',
  imports: [RouterLink, PublicacionCardComponent, ComentariosComponent, SpinnerComponent],
  templateUrl: './publicacion.component.html',
  styleUrl: './publicacion.component.css',
})
export class PublicacionComponent implements OnInit {
  private readonly publicacionesService = inject(PublicacionesService);
  private readonly modalService = inject(ModalService);
  private readonly ruta = inject(ActivatedRoute);
  private readonly router = inject(Router);

  protected readonly publicacion = signal<Publicacion | null>(null);

  async ngOnInit() {
    const id = this.ruta.snapshot.paramMap.get('id') ?? '';
    try {
      this.publicacion.set(await firstValueFrom(this.publicacionesService.obtener(id)));
    } catch (error) {
      this.mostrarError(error as HttpErrorResponse);
    }
  }

  protected volver() {
    this.router.navigate(['/publicaciones']);
  }

  private mostrarError(error: HttpErrorResponse) {
    if (error.status === 401) {
      return;
    }
    if (error.status === 404 || error.status === 400) {
      this.modalService.mostrarError('Esta publicación ya no está disponible');
    } else {
      this.modalService.mostrarError('No pudimos conectar con el servidor');
    }
    this.volver();
  }
}
