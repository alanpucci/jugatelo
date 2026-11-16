import { Directive, ElementRef, OnInit, Renderer2, inject } from '@angular/core';

@Directive({
  selector: 'input[appMostrarContrasena]',
})
export class MostrarContrasenaDirective implements OnInit {
  private readonly elemento = inject<ElementRef<HTMLInputElement>>(ElementRef);
  private readonly renderer = inject(Renderer2);

  ngOnInit() {
    const campo = this.elemento.nativeElement;
    const boton = this.renderer.createElement('button');
    this.renderer.setAttribute(boton, 'type', 'button');
    this.renderer.addClass(boton, 'alternar-contrasena');
    this.renderer.appendChild(boton, this.renderer.createText('Mostrar'));
    this.renderer.listen(boton, 'click', () => {
      const visible = campo.type === 'password';
      campo.type = visible ? 'text' : 'password';
      boton.textContent = visible ? 'Ocultar' : 'Mostrar';
    });
    this.renderer.insertBefore(campo.parentNode, boton, campo.nextSibling);
  }
}
