import { Directive, TemplateRef, ViewContainerRef, effect, inject } from '@angular/core';
import { AuthService } from '../../core/auth.service';

@Directive({
  selector: '[appSoloAdmin]',
})
export class SoloAdminDirective {
  private readonly plantilla = inject(TemplateRef);
  private readonly contenedor = inject(ViewContainerRef);
  private readonly authService = inject(AuthService);

  constructor() {
    effect(() => {
      this.contenedor.clear();
      if (this.authService.usuarioActual()?.perfil === 'administrador') {
        this.contenedor.createEmbeddedView(this.plantilla);
      }
    });
  }
}
