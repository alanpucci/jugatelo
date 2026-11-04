import { HttpErrorResponse } from '@angular/common/http';
import { Component, OnInit, inject, output, signal } from '@angular/core';
import { FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { ModalService } from '../../../core/modal.service';
import { fechaPosteriorAAhora, jugadoresCoherentes } from '../../../shared/validadores/validadores';
import { TipoPublicacion } from '../publicacion.model';
import { PublicacionesService } from '../publicaciones.service';

const TIPOS_IMAGEN = ['image/jpeg', 'image/png', 'image/webp'];
const TAMANO_MAXIMO = 2 * 1024 * 1024;

type Campo = 'titulo' | 'descripcion' | 'jugadoresMin' | 'jugadoresMax' | 'zona' | 'fechaJuntada' | 'cupo';

@Component({
  selector: 'app-nueva-publicacion',
  imports: [ReactiveFormsModule],
  templateUrl: './nueva-publicacion.component.html',
  styleUrl: './nueva-publicacion.component.css',
})
export class NuevaPublicacionComponent implements OnInit {
  private readonly publicacionesService = inject(PublicacionesService);
  private readonly modalService = inject(ModalService);

  readonly publicada = output<void>();
  readonly cancelada = output<void>();

  protected readonly cargando = signal(false);
  protected readonly imagen = signal<File | null>(null);
  protected readonly vistaPrevia = signal<string | null>(null);
  protected readonly errorImagen = signal('');

  protected readonly formulario = new FormGroup(
    {
      tipo: new FormControl<TipoPublicacion>('juego', { nonNullable: true }),
      titulo: new FormControl('', [Validators.required, Validators.minLength(3), Validators.maxLength(100)]),
      descripcion: new FormControl('', [Validators.required, Validators.maxLength(1000)]),
      jugadoresMin: new FormControl<number | null>(null, [Validators.min(1), Validators.max(20)]),
      jugadoresMax: new FormControl<number | null>(null, [Validators.min(1), Validators.max(20)]),
      zona: new FormControl('', [Validators.required, Validators.minLength(2), Validators.maxLength(80)]),
      fechaJuntada: new FormControl('', [Validators.required, fechaPosteriorAAhora]),
      cupo: new FormControl<number | null>(null, [Validators.min(2), Validators.max(50)]),
    },
    { validators: jugadoresCoherentes },
  );

  ngOnInit() {
    this.aplicarTipo('juego');
    this.formulario.controls.tipo.valueChanges.subscribe((tipo) => this.aplicarTipo(tipo));
  }

  protected esJuntada() {
    return this.formulario.controls.tipo.value === 'juntada';
  }

  protected longitud(campo: 'titulo' | 'descripcion') {
    return this.formulario.controls[campo].value?.length ?? 0;
  }

  protected mensajeError(campo: Campo) {
    const control = this.formulario.controls[campo];
    if (!control.touched || control.disabled) {
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
    if (control.hasError('min')) {
      return `Debe ser al menos ${control.getError('min').min}`;
    }
    if (control.hasError('max')) {
      return `No puede ser mayor a ${control.getError('max').max}`;
    }
    if (control.hasError('fechaPasada')) {
      return 'La fecha debe ser posterior a este momento';
    }
    return '';
  }

  protected errorJugadores() {
    const { jugadoresMin, jugadoresMax } = this.formulario.controls;
    if (!jugadoresMin.touched || !jugadoresMax.touched) {
      return '';
    }
    return this.formulario.hasError('jugadoresIncoherentes') ? 'El mínimo no puede ser mayor que el máximo' : '';
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

    const formData = new FormData();
    for (const [campo, valor] of Object.entries(this.formulario.value)) {
      if (valor === undefined || valor === null || valor === '') {
        continue;
      }
      formData.append(campo, campo === 'fechaJuntada' ? new Date(valor as string).toISOString() : String(valor));
    }
    const imagen = this.imagen();
    if (imagen) {
      formData.append('imagen', imagen);
    }

    this.cargando.set(true);
    this.publicacionesService.crear(formData).subscribe({
      next: () => {
        this.cargando.set(false);
        this.publicada.emit();
        this.modalService.mostrarInfo('Tu publicación fue creada.');
      },
      error: (error: HttpErrorResponse) => {
        this.cargando.set(false);
        this.modalService.mostrarError(this.mensajeDe(error));
      },
    });
  }

  private aplicarTipo(tipo: TipoPublicacion) {
    const { jugadoresMin, jugadoresMax, zona, fechaJuntada, cupo } = this.formulario.controls;
    const deJuego = [jugadoresMin, jugadoresMax];
    const deJuntada = [zona, fechaJuntada, cupo];
    const [activar, desactivar] = tipo === 'juntada' ? [deJuntada, deJuego] : [deJuego, deJuntada];
    activar.forEach((control) => control.enable());
    desactivar.forEach((control) => control.disable());
  }

  private mensajeDe(error: HttpErrorResponse) {
    if (error.status === 0) {
      return 'No pudimos conectar con el servidor';
    }
    const mensaje = error.error?.message;
    return Array.isArray(mensaje) ? mensaje.join('. ') : (mensaje ?? 'Ocurrió un error inesperado');
  }
}
