import { Component, input, output } from '@angular/core';

@Component({
  selector: 'app-paginador',
  templateUrl: './paginador.component.html',
  styleUrl: './paginador.component.css',
})
export class PaginadorComponent {
  readonly total = input(0);
  readonly offset = input(0);
  readonly limit = input(10);
  readonly cambiado = output<number>();

  protected paginaActual() {
    return Math.floor(this.offset() / this.limit()) + 1;
  }

  protected totalPaginas() {
    return Math.max(1, Math.ceil(this.total() / this.limit()));
  }

  protected anterior() {
    this.cambiado.emit(Math.max(0, this.offset() - this.limit()));
  }

  protected siguiente() {
    this.cambiado.emit(this.offset() + this.limit());
  }
}
