import { Component, inject } from '@angular/core';
import { RouterLink } from '@angular/router';
import { AuthService } from '../../../core/auth.service';
import { ImagenRespaldoDirective } from '../../../shared/directivas/imagen-respaldo.directive';

@Component({
  selector: 'app-mi-mesa',
  imports: [RouterLink, ImagenRespaldoDirective],
  templateUrl: './mi-mesa.component.html',
  styleUrl: './mi-mesa.component.css',
})
export class MiMesaComponent {
  protected readonly authService = inject(AuthService);
}
