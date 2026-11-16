import { Pipe, PipeTransform } from '@angular/core';

@Pipe({ name: 'nombreCompleto' })
export class NombreCompletoPipe implements PipeTransform {
  transform(usuario: { nombre: string; apellido: string }) {
    return `${usuario.nombre} ${usuario.apellido}`;
  }
}
