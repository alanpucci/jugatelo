import { HttpErrorResponse } from '@angular/common/http';
import { Component, inject, signal } from '@angular/core';
import { FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { AuthService } from '../../../core/auth.service';
import { ModalService } from '../../../core/modal.service';
import { contrasenaSegura } from '../../../shared/validadores/validadores';

@Component({
  selector: 'app-login',
  imports: [ReactiveFormsModule, RouterLink],
  templateUrl: './login.component.html',
  styleUrl: './login.component.css',
})
export class LoginComponent {
  private readonly authService = inject(AuthService);
  private readonly modalService = inject(ModalService);
  private readonly router = inject(Router);

  protected readonly cargando = signal(false);

  protected readonly formulario = new FormGroup({
    correo: new FormControl('', [Validators.required, Validators.email]),
    contrasena: new FormControl('', [Validators.required, contrasenaSegura]),
  });

  protected mensajeError(campo: 'correo' | 'contrasena') {
    const control = this.formulario.controls[campo];
    if (!control.touched) {
      return '';
    }
    if (campo === 'correo') {
      if (control.hasError('required')) {
        return 'Ingresá tu correo';
      }
      return control.hasError('email') ? 'El correo no tiene un formato válido' : '';
    }
    if (control.hasError('required') || control.hasError('contrasenaDebil')) {
      return 'La contraseña debe tener al menos 8 caracteres, una mayúscula y un número';
    }
    return '';
  }

  protected ingresar() {
    if (this.formulario.invalid) {
      this.formulario.markAllAsTouched();
      return;
    }

    this.cargando.set(true);
    this.authService.login(this.formulario.value as { correo: string; contrasena: string }).subscribe({
      next: () => {
        this.cargando.set(false);
        this.router.navigate(['/publicaciones']);
      },
      error: (error: HttpErrorResponse) => {
        this.cargando.set(false);
        this.modalService.mostrarError(this.mensajeDe(error));
      },
    });
  }

  private mensajeDe(error: HttpErrorResponse) {
    if (error.status === 401) {
      return 'Correo o contraseña incorrectos';
    }
    if (error.status === 403) {
      return 'Tu cuenta está deshabilitada. Contactá a un administrador.';
    }
    if (error.status === 0) {
      return 'No pudimos conectar con el servidor';
    }
    const mensaje = error.error?.message;
    return Array.isArray(mensaje) ? mensaje.join('. ') : (mensaje ?? 'Ocurrió un error inesperado');
  }
}
