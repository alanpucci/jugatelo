import { Pipe, PipeTransform } from '@angular/core';

@Pipe({ name: 'tiempoRelativo' })
export class TiempoRelativoPipe implements PipeTransform {
  transform(fecha: string) {
    const segundos = Math.floor((Date.now() - new Date(fecha).getTime()) / 1000);
    if (segundos < 60) {
      return 'hace unos segundos';
    }
    const minutos = Math.floor(segundos / 60);
    if (minutos < 60) {
      return `hace ${minutos} ${minutos === 1 ? 'minuto' : 'minutos'}`;
    }
    const horas = Math.floor(minutos / 60);
    if (horas < 24) {
      return `hace ${horas} ${horas === 1 ? 'hora' : 'horas'}`;
    }
    const dias = Math.floor(horas / 24);
    if (dias < 30) {
      return `hace ${dias} ${dias === 1 ? 'día' : 'días'}`;
    }
    return new Date(fecha).toLocaleDateString('es-AR');
  }
}
