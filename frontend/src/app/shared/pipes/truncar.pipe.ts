import { Pipe, PipeTransform } from '@angular/core';

@Pipe({ name: 'truncar' })
export class TruncarPipe implements PipeTransform {
  transform(texto: string, maximo = 180) {
    if (texto.length <= maximo) {
      return texto;
    }
    return `${texto.slice(0, maximo).trimEnd()}…`;
  }
}
