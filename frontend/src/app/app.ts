import { Component, inject } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { SesionService } from './core/sesion.service';
import { NavbarComponent } from './layout/navbar/navbar.component';
import { ModalComponent } from './shared/modal/modal.component';

@Component({
  imports: [RouterOutlet, NavbarComponent, ModalComponent],
  selector: 'app-root',
  templateUrl: './app.html',
})
export class App {
  constructor() {
    inject(SesionService);
  }
}
