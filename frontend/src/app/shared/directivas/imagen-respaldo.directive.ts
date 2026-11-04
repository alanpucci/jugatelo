import { Directive, ElementRef, inject, input } from '@angular/core';

@Directive({
  selector: 'img[appImagenRespaldo]',
  host: { '(error)': 'alFallar()' },
})
export class ImagenRespaldoDirective {
  private readonly elemento = inject<ElementRef<HTMLImageElement>>(ElementRef);

  readonly appImagenRespaldo = input('imagen-respaldo.svg');

  protected alFallar() {
    const imagen = this.elemento.nativeElement;
    const respaldo = this.appImagenRespaldo() || 'imagen-respaldo.svg';
    if (!imagen.src.endsWith(respaldo)) {
      imagen.src = respaldo;
    }
  }
}
