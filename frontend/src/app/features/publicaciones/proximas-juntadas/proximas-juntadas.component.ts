import { Component } from '@angular/core';

@Component({
  selector: 'app-proximas-juntadas',
  templateUrl: './proximas-juntadas.component.html',
  styleUrl: './proximas-juntadas.component.css',
})
export class ProximasJuntadasComponent {
  protected readonly juntadas = [
    { titulo: 'Tarde de Catan y Carcassonne', zona: 'Villa Crespo', dia: 'SÁB', numero: '08', hora: '20:00', cupo: 6 },
    { titulo: 'Noche de cartas: Dixit y UNO', zona: 'Palermo', dia: 'DOM', numero: '09', hora: '18:30', cupo: 8 },
    { titulo: 'Torneo de Carcassonne', zona: 'Caballito', dia: 'VIE', numero: '14', hora: '21:00', cupo: 4 },
  ];
}
