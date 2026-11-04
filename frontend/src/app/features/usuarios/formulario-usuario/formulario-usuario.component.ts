import { Component, OnInit, input, output, signal } from '@angular/core';
import { FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { contrasenaSegura, contrasenasIguales, fechaAnteriorAHoy } from '../../../shared/validadores/validadores';

export interface DatosFormularioUsuario {
  valores: Record<string, string>;
  imagen: File | null;
}

const TIPOS_IMAGEN = ['image/jpeg', 'image/png', 'image/webp'];
const TAMANO_MAXIMO = 2 * 1024 * 1024;
const SOLO_LETRAS = /^[\p{L} ]+$/u;

@Component({
  selector: 'app-formulario-usuario',
  imports: [ReactiveFormsModule],
  templateUrl: './formulario-usuario.component.html',
  styleUrl: './formulario-usuario.component.css',
})
export class FormularioUsuarioComponent implements OnInit {
  readonly esAdmin = input(false);
  readonly cargando = input(false);
  readonly textoBoton = input('Crear cuenta');
  readonly enviado = output<DatosFormularioUsuario>();

  protected readonly imagen = signal<File | null>(null);
  protected readonly vistaPrevia = signal<string | null>(null);
  protected readonly errorImagen = signal('');

  protected readonly formulario: FormGroup = new FormGroup(
    {
      nombre: new FormControl('', [Validators.required, Validators.minLength(2), Validators.maxLength(50), Validators.pattern(SOLO_LETRAS)]),
      apellido: new FormControl('', [Validators.required, Validators.minLength(2), Validators.maxLength(50), Validators.pattern(SOLO_LETRAS)]),
      correo: new FormControl('', [Validators.required, Validators.email]),
      nombreUsuario: new FormControl('', [Validators.required, Validators.minLength(3), Validators.maxLength(20), Validators.pattern(/^[a-zA-Z0-9._]+$/)]),
      contrasena: new FormControl('', [Validators.required, contrasenaSegura]),
      repetirContrasena: new FormControl('', [Validators.required]),
      fechaNacimiento: new FormControl('', [Validators.required, fechaAnteriorAHoy]),
      descripcion: new FormControl('', [Validators.maxLength(200)]),
    },
    { validators: contrasenasIguales('contrasena', 'repetirContrasena') },
  );

  ngOnInit() {
    if (this.esAdmin()) {
      this.formulario.addControl('perfil', new FormControl('usuario', [Validators.required]));
    }
  }

  protected longitudDescripcion() {
    return this.formulario.get('descripcion')?.value?.length ?? 0;
  }

  protected mensajeError(campo: string) {
    const control = this.formulario.get(campo);
    if (!control || !control.touched) {
      return '';
    }
    if (campo === 'repetirContrasena' && !control.hasError('required') && this.formulario.hasError('contrasenasDistintas')) {
      return 'Las contraseñas no coinciden';
    }
    if (control.hasError('required')) {
      return 'Este campo es obligatorio';
    }
    if (control.hasError('email')) {
      return 'El correo no tiene un formato válido';
    }
    if (control.hasError('minlength') || control.hasError('maxlength')) {
      const requerido = control.getError('minlength') ?? control.getError('maxlength');
      return control.hasError('minlength')
        ? `Debe tener al menos ${requerido.requiredLength} caracteres`
        : `No puede superar los ${requerido.requiredLength} caracteres`;
    }
    if (control.hasError('pattern')) {
      return campo === 'nombreUsuario'
        ? 'Solo letras, números, punto y guion bajo'
        : 'Solo se permiten letras y espacios';
    }
    if (control.hasError('contrasenaDebil')) {
      return 'La contraseña debe tener al menos 8 caracteres, una mayúscula y un número';
    }
    if (control.hasError('fechaFutura')) {
      return 'La fecha debe ser anterior a hoy';
    }
    return '';
  }

  protected seleccionarImagen(evento: Event) {
    const archivo = (evento.target as HTMLInputElement).files?.[0] ?? null;
    this.errorImagen.set('');
    this.imagen.set(null);
    this.vistaPrevia.set(null);

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

  protected enviar() {
    if (this.formulario.invalid || this.errorImagen()) {
      this.formulario.markAllAsTouched();
      return;
    }
    this.enviado.emit({
      valores: this.formulario.value as Record<string, string>,
      imagen: this.imagen(),
    });
  }
}
