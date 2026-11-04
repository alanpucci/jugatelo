import { Component, inject } from '@angular/core';
import { RouterLink } from '@angular/router';
import { AuthService } from '../../../core/auth.service';

@Component({
  selector: 'app-mi-mesa',
  imports: [RouterLink],
  templateUrl: './mi-mesa.component.html',
  styleUrl: './mi-mesa.component.css',
})
export class MiMesaComponent {
  protected readonly authService = inject(AuthService);

  protected readonly zonas = [
    { nombre: 'Villa Crespo', cantidad: 5 },
    { nombre: 'Palermo', cantidad: 4 },
    { nombre: 'Caballito', cantidad: 3 },
    { nombre: 'Belgrano', cantidad: 2 },
    { nombre: 'San Telmo', cantidad: 2 },
  ];
}
