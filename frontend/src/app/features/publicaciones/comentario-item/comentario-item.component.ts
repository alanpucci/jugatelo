import { HttpErrorResponse } from '@angular/common/http';
import { Component, inject, input, output, signal } from '@angular/core';
import { FormControl, ReactiveFormsModule, Validators } from '@angular/forms';
import { firstValueFrom } from 'rxjs';
import { AuthService } from '../../../core/auth.service';
import { ModalService } from '../../../core/modal.service';
import { ImagenRespaldoDirective } from '../../../shared/directivas/imagen-respaldo.directive';
import { TiempoRelativoPipe } from '../../../shared/pipes/tiempo-relativo.pipe';
import { ComentariosService } from '../comentarios.service';
import { ComentarioPublicacion } from '../publicacion.model';

@Component({
  selector: 'app-comentario-item',
  imports: [ReactiveFormsModule, ImagenRespaldoDirective, TiempoRelativoPipe],
  templateUrl: './comentario-item.component.html',
  styleUrl: './comentario-item.component.css',
})
export class ComentarioItemComponent {
  private readonly comentariosService = inject(ComentariosService);
  private readonly authService = inject(AuthService);
  private readonly modalService = inject(ModalService);

  readonly comentario = input<ComentarioPublicacion | null>(null);
  readonly editado = output<ComentarioPublicacion>();

  protected readonly editando = signal(false);
  protected readonly guardando = signal(false);
  protected readonly mensaje = new FormControl('', {
    nonNullable: true,
    validators: [Validators.required, Validators.maxLength(500)],
  });

  protected esAutor() {
    const comentario = this.comentario();
    const usuario = this.authService.usuarioActual();
    return !!comentario && !!usuario && comentario.usuario._id === usuario._id;
  }

  protected iniciarEdicion() {
    this.mensaje.setValue(this.comentario()?.mensaje ?? '');
    this.editando.set(true);
  }

  protected cancelar() {
    this.editando.set(false);
  }

  protected async guardar() {
    const comentario = this.comentario();
    const texto = this.mensaje.value.trim();
    if (!comentario || !texto || this.mensaje.invalid) {
      return;
    }

    this.guardando.set(true);
    try {
      const actualizado = await firstValueFrom(
        this.comentariosService.editar(comentario.publicacion, comentario._id, texto),
      );
      this.editado.emit(actualizado);
      this.editando.set(false);
    } catch (error) {
      this.mostrarError(error as HttpErrorResponse);
    }
    this.guardando.set(false);
  }

  private mostrarError(error: HttpErrorResponse) {
    if (error.status === 401) {
      return;
    }
    const mensaje = error.error?.message;
    this.modalService.mostrarError(Array.isArray(mensaje) ? mensaje.join('. ') : (mensaje ?? 'No pudimos conectar con el servidor'));
  }
}
