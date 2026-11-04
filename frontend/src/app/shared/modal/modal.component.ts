import { Component, inject } from '@angular/core';
import { ModalService } from '../../core/modal.service';

@Component({
  selector: 'app-modal',
  templateUrl: './modal.component.html',
  styleUrl: './modal.component.css',
})
export class ModalComponent {
  protected readonly modalService = inject(ModalService);
}
