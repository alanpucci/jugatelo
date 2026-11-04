import { HttpErrorResponse } from '@angular/common/http';
import { Component, OnInit, inject, input, signal } from '@angular/core';
import { FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { firstValueFrom } from 'rxjs';
import { ModalService } from '../../../core/modal.service';
import { ComentarioItemComponent } from '../comentario-item/comentario-item.component';
import { ComentariosService } from '../comentarios.service';
import { ComentarioPublicacion } from '../publicacion.model';

const POR_PAGINA = 5;

@Component({
  selector: 'app-comentarios',
  imports: [ReactiveFormsModule, ComentarioItemComponent],
  templateUrl: './comentarios.component.html',
  styleUrl: './comentarios.component.css',
})
export class ComentariosComponent implements OnInit {
  private readonly comentariosService = inject(ComentariosService);
  private readonly modalService = inject(ModalService);

  readonly publicacionId = input('');

  protected readonly comentarios = signal<ComentarioPublicacion[]>([]);
  protected readonly total = signal(0);
  protected readonly cargando = signal(false);
  protected readonly enviando = signal(false);

  protected readonly formulario = new FormGroup({
    mensaje: new FormControl('', {
      nonNullable: true,
      validators: [Validators.required, Validators.maxLength(500)],
    }),
  });
  protected readonly mensaje = this.formulario.controls.mensaje;

  ngOnInit() {
    this.cargarMas();
  }

  protected hayMas() {
    return this.comentarios().length < this.total();
  }

  protected async cargarMas() {
    if (!this.publicacionId()) {
      return;
    }
    this.cargando.set(true);
    try {
      const pagina = await firstValueFrom(
        this.comentariosService.listar(this.publicacionId(), this.comentarios().length, POR_PAGINA),
      );
      const cargados = new Set(this.comentarios().map((comentario) => comentario._id));
      const nuevos = pagina.datos.filter((comentario) => !cargados.has(comentario._id));
      this.comentarios.set([...this.comentarios(), ...nuevos]);
      this.total.set(pagina.total);
    } catch (error) {
      this.mostrarError(error as HttpErrorResponse);
    }
    this.cargando.set(false);
  }

  protected async enviar() {
    const texto = this.mensaje.value.trim();
    if (!texto || this.mensaje.invalid) {
      return;
    }

    this.enviando.set(true);
    try {
      const nuevo = await firstValueFrom(this.comentariosService.crear(this.publicacionId(), texto));
      this.comentarios.set([nuevo, ...this.comentarios()]);
      this.total.set(this.total() + 1);
      this.mensaje.reset();
    } catch (error) {
      this.mostrarError(error as HttpErrorResponse);
    }
    this.enviando.set(false);
  }

  protected reemplazar(actualizado: ComentarioPublicacion) {
    this.comentarios.set(
      this.comentarios().map((comentario) => (comentario._id === actualizado._id ? actualizado : comentario)),
    );
  }

  private mostrarError(error: HttpErrorResponse) {
    if (error.status === 401) {
      return;
    }
    const mensaje = error.error?.message;
    this.modalService.mostrarError(Array.isArray(mensaje) ? mensaje.join('. ') : (mensaje ?? 'No pudimos conectar con el servidor'));
  }
}
