import { Component, inject } from '@angular/core';
import { ComentariosComponent } from '../comentarios/comentarios.component';
import { ComentariosModalService } from './comentarios-modal.service';

@Component({
  selector: 'app-comentarios-modal',
  imports: [ComentariosComponent],
  templateUrl: './comentarios-modal.component.html',
  styleUrl: './comentarios-modal.component.css',
})
export class ComentariosModalComponent {
  protected readonly modalService = inject(ComentariosModalService);
}
