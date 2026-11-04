import { Component, inject } from '@angular/core';
import { DatePipe } from '@angular/common';
import { RouterLink } from '@angular/router';
import { AuthService } from '../../../core/auth.service';

@Component({
  selector: 'app-mi-perfil',
  imports: [DatePipe, RouterLink],
  templateUrl: './mi-perfil.component.html',
  styleUrl: './mi-perfil.component.css',
})
export class MiPerfilComponent {
  protected readonly authService = inject(AuthService);

  protected readonly publicacionesEjemplo = [
    { titulo: 'Tarde de Catan y Carcassonne', fecha: 'hace 2 horas', comentarios: ['Me sumo, llevo el Dixit', 'Llego un poco más tarde'] },
    { titulo: 'Gloomhaven', fecha: 'hace 3 días', comentarios: [] as string[] },
  ];
}
