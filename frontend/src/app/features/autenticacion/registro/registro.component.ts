import { HttpErrorResponse } from '@angular/common/http';
import { Component, inject, signal } from '@angular/core';
import { Router, RouterLink } from '@angular/router';
import { AuthService } from '../../../core/auth.service';
import { ModalService } from '../../../core/modal.service';
import {
  DatosFormularioUsuario,
  FormularioUsuarioComponent,
} from '../../usuarios/formulario-usuario/formulario-usuario.component';

@Component({
  selector: 'app-registro',
  imports: [FormularioUsuarioComponent, RouterLink],
  templateUrl: './registro.component.html',
  styleUrl: './registro.component.css',
})
export class RegistroComponent {
  private readonly authService = inject(AuthService);
  private readonly modalService = inject(ModalService);
  private readonly router = inject(Router);

  protected readonly cargando = signal(false);

  protected registrar(datos: DatosFormularioUsuario) {
    const formData = new FormData();
    Object.entries(datos.valores).forEach(([clave, valor]) => formData.append(clave, valor ?? ''));
    if (datos.imagen) {
      formData.append('imagenPerfil', datos.imagen);
    }

    this.cargando.set(true);
    this.authService.registrar(formData).subscribe({
      next: () => {
        this.cargando.set(false);
        this.router.navigate(['/publicaciones']);
        this.modalService.mostrarInfo('Tu cuenta fue creada. ¡Bienvenido a Jugátelo!', 'Bienvenido');
      },
      error: (error: HttpErrorResponse) => {
        this.cargando.set(false);
        this.modalService.mostrarError(this.mensajeDe(error));
      },
    });
  }

  private mensajeDe(error: HttpErrorResponse) {
    const mensaje = error.error?.message;
    if (Array.isArray(mensaje)) {
      return mensaje.join('. ');
    }
    return mensaje ?? 'No pudimos conectar con el servidor';
  }
}
