import { Component, signal } from '@angular/core';
import { MiMesaComponent } from '../mi-mesa/mi-mesa.component';
import { ProximasJuntadasComponent } from '../proximas-juntadas/proximas-juntadas.component';

interface PublicacionEjemplo {
  autor: string;
  fecha: string;
  tipo: 'juego' | 'juntada';
  titulo: string;
  descripcion: string;
  detalle: string;
  cifra: string;
  etiqueta: string;
  meGusta: number;
  meGustaDado: boolean;
  imagenUrl: string | null;
}

@Component({
  imports: [MiMesaComponent, ProximasJuntadasComponent],
  selector: 'app-publicaciones',
  templateUrl: './publicaciones.component.html',
  styleUrl: './publicaciones.component.css',
})
export class PublicacionesComponent {
  protected readonly publicaciones = signal<PublicacionEjemplo[]>([
    {
      autor: 'ana.g',
      fecha: 'hace 2 horas',
      tipo: 'juntada',
      titulo: 'Tarde de Catan y Carcassonne',
      descripcion: 'Llevo Catan y Carcassonne. Hay mate y snacks, traigan ganas de jugar.',
      detalle: 'Villa Crespo, CABA · sábado 20:00',
      cifra: '6',
      etiqueta: 'lugares',
      meGusta: 12,
      meGustaDado: true,
      imagenUrl: 'ejemplo-juego.svg',
    },
    {
      autor: 'lucas.m',
      fecha: 'hace 1 día',
      tipo: 'juego',
      titulo: 'Dixit',
      descripcion: 'Lo tengo con las dos expansiones. Ideal para grupos que recién arrancan con los juegos de mesa.',
      detalle: 'Party game · 30 min',
      cifra: '3–8',
      etiqueta: 'jugadores',
      meGusta: 31,
      meGustaDado: false,
      imagenUrl: null,
    },
    {
      autor: 'sofi_92',
      fecha: 'hace 3 días',
      tipo: 'juego',
      titulo: 'Gloomhaven',
      descripcion: 'Campaña completa, sin spoilers. Busco gente para armar una mesa fija los domingos.',
      detalle: 'Campaña cooperativa',
      cifra: '1–4',
      etiqueta: 'jugadores',
      meGusta: 8,
      meGustaDado: false,
      imagenUrl: null,
    },
  ]);

  protected alternarMeGusta(titulo: string) {
    this.publicaciones.update((lista) =>
      lista.map((p) =>
        p.titulo === titulo
          ? { ...p, meGustaDado: !p.meGustaDado, meGusta: p.meGusta + (p.meGustaDado ? -1 : 1) }
          : p,
      ),
    );
  }
}
