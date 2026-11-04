import { Component, OnInit, inject, signal } from '@angular/core';
import { firstValueFrom } from 'rxjs';
import { JuntadaProxima } from '../publicacion.model';
import { PublicacionesService } from '../publicaciones.service';

@Component({
  selector: 'app-proximas-juntadas',
  templateUrl: './proximas-juntadas.component.html',
  styleUrl: './proximas-juntadas.component.css',
})
export class ProximasJuntadasComponent implements OnInit {
  private readonly publicacionesService = inject(PublicacionesService);

  protected readonly juntadas = signal<JuntadaProxima[]>([]);

  async ngOnInit() {
    try {
      this.juntadas.set(await firstValueFrom(this.publicacionesService.proximasJuntadas()));
    } catch {
      this.juntadas.set([]);
    }
  }

  protected dia(juntada: JuntadaProxima) {
    return new Date(juntada.fechaJuntada).toLocaleDateString('es-AR', { weekday: 'short' }).replace('.', '').toUpperCase();
  }

  protected numero(juntada: JuntadaProxima) {
    return new Date(juntada.fechaJuntada).toLocaleDateString('es-AR', { day: '2-digit' });
  }

  protected hora(juntada: JuntadaProxima) {
    return new Date(juntada.fechaJuntada).toLocaleTimeString('es-AR', { hour: '2-digit', minute: '2-digit' });
  }

  protected cupo(juntada: JuntadaProxima) {
    return juntada.cupo === null ? 'sin cupo' : `${juntada.cupo} lugares`;
  }
}
