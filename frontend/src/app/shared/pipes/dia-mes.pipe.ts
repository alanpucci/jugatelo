import { Pipe, PipeTransform } from '@angular/core';

@Pipe({ name: 'diaMes' })
export class DiaMesPipe implements PipeTransform {
  transform(fecha: string) {
    const date = new Date(fecha);
    return {
      dia: date.toLocaleDateString('es-AR', { day: '2-digit' }),
      mes: date.toLocaleDateString('es-AR', { month: 'short' }).replace('.', '').toUpperCase(),
    };
  }
}
