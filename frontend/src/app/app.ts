import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { ComentariosModalComponent } from './features/publicaciones/comentarios-modal/comentarios-modal.component';
import { NavbarComponent } from './layout/navbar/navbar.component';
import { ModalComponent } from './shared/modal/modal.component';

@Component({
  imports: [RouterOutlet, NavbarComponent, ComentariosModalComponent, ModalComponent],
  selector: 'app-root',
  templateUrl: './app.html',
})
export class App {}
