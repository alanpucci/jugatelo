import { HttpErrorResponse } from '@angular/common/http';
import { Component, OnInit, inject, signal } from '@angular/core';
import { firstValueFrom } from 'rxjs';
import { AuthService } from '../../../core/auth.service';
import { ModalService } from '../../../core/modal.service';
import { ImagenRespaldoDirective } from '../../../shared/directivas/imagen-respaldo.directive';
import { NombreCompletoPipe } from '../../../shared/pipes/nombre-completo.pipe';
import { SpinnerComponent } from '../../../shared/spinner/spinner.component';
import {
  DatosFormularioUsuario,
  FormularioUsuarioComponent,
} from '../formulario-usuario/formulario-usuario.component';
import { Usuario } from '../usuario.model';
import { UsuariosService } from '../usuarios.service';

@Component({
  selector: 'app-dashboard-usuarios',
  imports: [FormularioUsuarioComponent, ImagenRespaldoDirective, NombreCompletoPipe, SpinnerComponent],
  templateUrl: './dashboard-usuarios.component.html',
  styleUrl: './dashboard-usuarios.component.css',
})
export class DashboardUsuariosComponent implements OnInit {
  private readonly authService = inject(AuthService);
  private readonly modalService = inject(ModalService);
  private readonly usuariosService = inject(UsuariosService);

  protected readonly usuarios = signal<Usuario[]>([]);
  protected readonly cargando = signal(true);
  protected readonly mostrandoFormulario = signal(false);
  protected readonly creando = signal(false);

  async ngOnInit() {
    try {
      this.usuarios.set(await firstValueFrom(this.usuariosService.listar()));
    } catch (error) {
      this.modalService.mostrarError(this.mensajeDe(error as HttpErrorResponse));
    }
    this.cargando.set(false);
  }

  protected esPropio(usuario: Usuario) {
    return usuario._id === this.authService.usuarioActual()?._id;
  }

  protected alternarFormulario() {
    this.mostrandoFormulario.update((valor) => !valor);
  }

  protected async crear(datos: DatosFormularioUsuario) {
    const formData = new FormData();
    Object.entries(datos.valores).forEach(([clave, valor]) => formData.append(clave, valor ?? ''));
    if (datos.imagen) {
      formData.append('imagenPerfil', datos.imagen);
    }

    this.creando.set(true);
    try {
      const usuario = await firstValueFrom(this.usuariosService.crear(formData));
      this.usuarios.update((lista) => [usuario, ...lista]);
      this.mostrandoFormulario.set(false);
      this.modalService.mostrarInfo('Usuario creado');
    } catch (error) {
      this.modalService.mostrarError(this.mensajeDe(error as HttpErrorResponse));
    }
    this.creando.set(false);
  }

  protected async deshabilitar(usuario: Usuario) {
    const confirmado = await this.modalService.confirmar(
      `¿Deshabilitar a @${usuario.nombreUsuario}? No podrá ingresar a la aplicación.`,
      'Deshabilitar usuario',
      'Deshabilitar',
    );
    if (!confirmado) {
      return;
    }
    await this.cambiarEstado(this.usuariosService.deshabilitar(usuario._id));
  }

  protected habilitar(usuario: Usuario) {
    return this.cambiarEstado(this.usuariosService.habilitar(usuario._id));
  }

  private async cambiarEstado(peticion: ReturnType<UsuariosService['habilitar']>) {
    try {
      const actualizado = await firstValueFrom(peticion);
      this.usuarios.update((lista) => lista.map((u) => (u._id === actualizado._id ? actualizado : u)));
    } catch (error) {
      this.modalService.mostrarError(this.mensajeDe(error as HttpErrorResponse));
    }
  }

  private mensajeDe(error: HttpErrorResponse) {
    const mensaje = error.error?.message;
    if (Array.isArray(mensaje)) {
      return mensaje.join('. ');
    }
    return mensaje ?? 'No pudimos conectar con el servidor';
  }
}
