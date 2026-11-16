import { HttpErrorResponse } from '@angular/common/http';
import { DatePipe } from '@angular/common';
import { Component, OnInit, inject, signal } from '@angular/core';
import { FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { fechaAnteriorAHoy } from '../../../shared/validadores/validadores';
import { AuthService } from '../../../core/auth.service';
import { ModalService } from '../../../core/modal.service';
import { ImagenRespaldoDirective } from '../../../shared/directivas/imagen-respaldo.directive';
import { NombreCompletoPipe } from '../../../shared/pipes/nombre-completo.pipe';
import { PaginadorComponent } from '../../../shared/paginador/paginador.component';
import { PublicacionCardComponent } from '../../publicaciones/publicacion-card/publicacion-card.component';
import { Publicacion } from '../../publicaciones/publicacion.model';
import { PublicacionesService } from '../../publicaciones/publicaciones.service';

const POR_PAGINA = 3;
const TIPOS_IMAGEN = ['image/jpeg', 'image/png', 'image/webp'];
const TAMANO_MAXIMO = 2 * 1024 * 1024;
const SOLO_LETRAS = /^[\p{L} ]+$/u;

@Component({
  selector: 'app-mi-perfil',
  imports: [DatePipe, ReactiveFormsModule, RouterLink, ImagenRespaldoDirective, NombreCompletoPipe, PaginadorComponent, PublicacionCardComponent],
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

  protected readonly editando = signal(false);
  protected readonly guardando = signal(false);
  protected readonly imagen = signal<File | null>(null);
  protected readonly vistaPrevia = signal<string | null>(null);
  protected readonly errorImagen = signal('');

  protected readonly formulario = new FormGroup({
    nombre: new FormControl('', [Validators.required, Validators.minLength(2), Validators.maxLength(50), Validators.pattern(SOLO_LETRAS)]),
    apellido: new FormControl('', [Validators.required, Validators.minLength(2), Validators.maxLength(50), Validators.pattern(SOLO_LETRAS)]),
    nombreUsuario: new FormControl('', [Validators.required, Validators.minLength(3), Validators.maxLength(20), Validators.pattern(/^[a-zA-Z0-9._]+$/)]),
    fechaNacimiento: new FormControl('', [Validators.required, fechaAnteriorAHoy]),
    descripcion: new FormControl('', [Validators.maxLength(200)]),
  });

  ngOnInit() {
    this.cargar(0);
  }

  protected editar() {
    const usuario = this.authService.usuarioActual();
    if (!usuario) {
      return;
    }
    this.formulario.reset({
      nombre: usuario.nombre,
      apellido: usuario.apellido,
      nombreUsuario: usuario.nombreUsuario,
      fechaNacimiento: usuario.fechaNacimiento.slice(0, 10),
      descripcion: usuario.descripcion,
    });
    this.limpiarImagen();
    this.editando.set(true);
  }

  protected cancelar() {
    this.editando.set(false);
  }

  protected mensajeError(campo: 'nombre' | 'apellido' | 'nombreUsuario' | 'fechaNacimiento' | 'descripcion') {
    const control = this.formulario.controls[campo];
    if (!control.touched) {
      return '';
    }
    if (control.hasError('required')) {
      return 'Este campo es obligatorio';
    }
    if (control.hasError('minlength')) {
      return `Debe tener al menos ${control.getError('minlength').requiredLength} caracteres`;
    }
    if (control.hasError('maxlength')) {
      return `No puede superar los ${control.getError('maxlength').requiredLength} caracteres`;
    }
    if (control.hasError('pattern')) {
      return campo === 'nombreUsuario' ? 'Solo letras, números, punto y guion bajo' : 'Solo se permiten letras y espacios';
    }
    if (control.hasError('fechaFutura')) {
      return 'La fecha debe ser anterior a hoy';
    }
    return '';
  }

  protected seleccionarImagen(evento: Event) {
    const archivo = (evento.target as HTMLInputElement).files?.[0] ?? null;
    this.limpiarImagen();
    if (!archivo) {
      return;
    }
    if (!TIPOS_IMAGEN.includes(archivo.type)) {
      this.errorImagen.set('La imagen debe ser JPG, PNG o WEBP');
      return;
    }
    if (archivo.size > TAMANO_MAXIMO) {
      this.errorImagen.set('La imagen no puede superar los 2 MB');
      return;
    }
    this.imagen.set(archivo);
    const lector = new FileReader();
    lector.onload = () => this.vistaPrevia.set(lector.result as string);
    lector.readAsDataURL(archivo);
  }

  protected async guardar() {
    if (this.formulario.invalid || this.errorImagen()) {
      this.formulario.markAllAsTouched();
      return;
    }
    const formData = new FormData();
    Object.entries(this.formulario.getRawValue()).forEach(([clave, valor]) => formData.append(clave, valor ?? ''));
    const imagen = this.imagen();
    if (imagen) {
      formData.append('imagenPerfil', imagen);
    }

    this.guardando.set(true);
    try {
      await this.authService.actualizarPerfil(formData);
      this.editando.set(false);
      this.modalService.mostrarInfo('Tus datos fueron actualizados', 'Perfil actualizado');
    } catch (error) {
      const mensaje = (error as HttpErrorResponse).error?.message;
      this.modalService.mostrarError(
        Array.isArray(mensaje) ? mensaje.join('. ') : (mensaje ?? 'No pudimos guardar los cambios'),
      );
    } finally {
      this.guardando.set(false);
    }
  }

  private limpiarImagen() {
    this.imagen.set(null);
    this.vistaPrevia.set(null);
    this.errorImagen.set('');
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
