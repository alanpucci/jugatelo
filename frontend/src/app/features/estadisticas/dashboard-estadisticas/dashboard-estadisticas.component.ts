import { HttpErrorResponse } from '@angular/common/http';
import { Component, ElementRef, OnDestroy, OnInit, inject, signal, viewChild } from '@angular/core';
import { FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { RouterLink } from '@angular/router';
import {
  ArcElement,
  BarController,
  BarElement,
  CategoryScale,
  Chart,
  DoughnutController,
  Filler,
  Legend,
  LineController,
  LineElement,
  LinearScale,
  PointElement,
  Tooltip,
} from 'chart.js';
import { firstValueFrom } from 'rxjs';
import { ModalService } from '../../../core/modal.service';
import { SpinnerComponent } from '../../../shared/spinner/spinner.component';
import { desdeAntesDeHasta, fechaLocal, hastaNoFutura } from '../../../shared/validadores/validadores';
import { ComentariosPorDia, RangoFechas } from '../estadisticas.model';
import { EstadisticasService } from '../estadisticas.service';

Chart.register(
  ArcElement,
  BarController,
  BarElement,
  CategoryScale,
  DoughnutController,
  Filler,
  Legend,
  LineController,
  LineElement,
  LinearScale,
  PointElement,
  Tooltip,
);

const DIAS_POR_DEFECTO = 30;
const MAXIMO_SEGMENTOS = 8;
const COLOR_SUPERFICIE = '#fdfbf4';
const COLOR_TEXTO = '#17233b';
const COLOR_TEXTO_SUAVE = '#5a6377';
const COLOR_GRILLA = 'rgba(23, 35, 59, 0.12)';
const COLOR_BARRAS = '#2a78d6';
const COLOR_LINEA = '#1baf7a';
const COLORES_SEGMENTOS = ['#2a78d6', '#eb6834', '#1baf7a', '#eda100', '#e87ba4', '#008300', '#6250d6', '#e34948'];
const FUENTE = "'Nunito', 'Segoe UI', Roboto, Helvetica, Arial, sans-serif";

@Component({
  selector: 'app-dashboard-estadisticas',
  imports: [ReactiveFormsModule, RouterLink, SpinnerComponent],
  templateUrl: './dashboard-estadisticas.component.html',
  styleUrl: './dashboard-estadisticas.component.css',
})
export class DashboardEstadisticasComponent implements OnInit, OnDestroy {
  private readonly estadisticasService = inject(EstadisticasService);
  private readonly modalService = inject(ModalService);

  private readonly lienzoBarras = viewChild<ElementRef<HTMLCanvasElement>>('lienzoBarras');
  private readonly lienzoLineas = viewChild<ElementRef<HTMLCanvasElement>>('lienzoLineas');
  private readonly lienzoDona = viewChild<ElementRef<HTMLCanvasElement>>('lienzoDona');

  private graficoBarras: Chart | undefined;
  private graficoLineas: Chart | undefined;
  private graficoDona: Chart | undefined;

  protected readonly cargando = signal(true);
  protected readonly total = signal(0);
  protected readonly hayBarras = signal(false);
  protected readonly hayLineas = signal(false);
  protected readonly hayDona = signal(false);
  protected readonly hoy = fechaLocal(new Date());

  protected readonly formulario = new FormGroup(
    {
      desde: new FormControl(this.fechaHaceDias(DIAS_POR_DEFECTO - 1), [Validators.required, hastaNoFutura]),
      hasta: new FormControl(this.hoy, [Validators.required, hastaNoFutura]),
    },
    { validators: desdeAntesDeHasta('desde', 'hasta') },
  );

  ngOnInit() {
    this.aplicar();
  }

  ngOnDestroy() {
    this.graficoBarras?.destroy();
    this.graficoLineas?.destroy();
    this.graficoDona?.destroy();
  }

  protected mensajeError(campo: 'desde' | 'hasta') {
    const control = this.formulario.controls[campo];
    if (control.hasError('required')) {
      return 'Elegí una fecha';
    }
    if (control.hasError('fechaFutura')) {
      return 'La fecha no puede ser posterior a hoy';
    }
    if (campo === 'hasta' && this.formulario.hasError('rangoInvalido')) {
      return 'La fecha hasta debe ser igual o posterior a la fecha desde';
    }
    return '';
  }

  protected async aplicar() {
    if (this.formulario.invalid) {
      this.formulario.markAllAsTouched();
      return;
    }
    const rango = this.formulario.value as RangoFechas;

    this.cargando.set(true);
    try {
      const [porUsuario, comentarios, porPublicacion] = await Promise.all([
        firstValueFrom(this.estadisticasService.publicacionesPorUsuario(rango)),
        firstValueFrom(this.estadisticasService.comentarios(rango)),
        firstValueFrom(this.estadisticasService.comentariosPorPublicacion(rango)),
      ]);
      this.cargando.set(false);
      this.total.set(comentarios.total);
      this.dibujarBarras(porUsuario.map((u) => u.nombreUsuario), porUsuario.map((u) => u.cantidad));
      const dias = this.completarDias(rango, comentarios.porDia);
      this.dibujarLineas(dias.map((d) => d.fecha), dias.map((d) => d.cantidad), comentarios.total);
      const segmentos = porPublicacion.slice(0, MAXIMO_SEGMENTOS);
      this.dibujarDona(segmentos.map((p) => p.titulo), segmentos.map((p) => p.cantidad));
    } catch (error) {
      this.cargando.set(false);
      this.modalService.mostrarError(this.mensajeDe(error as HttpErrorResponse));
    }
  }

  private dibujarBarras(etiquetas: string[], valores: number[]) {
    this.graficoBarras?.destroy();
    this.graficoBarras = undefined;
    this.hayBarras.set(valores.length > 0);
    const lienzo = this.lienzoBarras()?.nativeElement;
    if (!lienzo || valores.length === 0) {
      return;
    }
    this.graficoBarras = new Chart(lienzo, {
      type: 'bar',
      data: {
        labels: etiquetas,
        datasets: [
          {
            label: 'Publicaciones',
            data: valores,
            backgroundColor: COLOR_BARRAS,
            maxBarThickness: 24,
            borderRadius: { topLeft: 4, topRight: 4 },
            borderSkipped: 'bottom',
          },
        ],
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: { legend: { display: false } },
        scales: this.escalas(false),
      },
    });
  }

  private dibujarLineas(etiquetas: string[], valores: number[], total: number) {
    this.graficoLineas?.destroy();
    this.graficoLineas = undefined;
    this.hayLineas.set(total > 0);
    const lienzo = this.lienzoLineas()?.nativeElement;
    if (!lienzo || total === 0) {
      return;
    }
    this.graficoLineas = new Chart(lienzo, {
      type: 'line',
      data: {
        labels: etiquetas.map((fecha) => fecha.split('-').reverse().slice(0, 2).join('/')),
        datasets: [
          {
            label: 'Comentarios',
            data: valores,
            borderColor: COLOR_LINEA,
            backgroundColor: 'rgba(27, 175, 122, 0.1)',
            borderWidth: 2,
            borderJoinStyle: 'round',
            borderCapStyle: 'round',
            fill: true,
            tension: 0,
            pointRadius: 0,
            pointHoverRadius: 5,
            pointHoverBackgroundColor: COLOR_LINEA,
            pointHoverBorderColor: COLOR_SUPERFICIE,
            pointHoverBorderWidth: 2,
          },
        ],
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        interaction: { mode: 'index', intersect: false },
        plugins: { legend: { display: false } },
        scales: this.escalas(),
      },
    });
  }

  private dibujarDona(etiquetas: string[], valores: number[]) {
    this.graficoDona?.destroy();
    this.graficoDona = undefined;
    this.hayDona.set(valores.length > 0);
    const lienzo = this.lienzoDona()?.nativeElement;
    if (!lienzo || valores.length === 0) {
      return;
    }
    this.graficoDona = new Chart(lienzo, {
      type: 'doughnut',
      data: {
        labels: etiquetas,
        datasets: [
          {
            label: 'Comentarios',
            data: valores,
            backgroundColor: COLORES_SEGMENTOS.slice(0, valores.length),
            borderColor: COLOR_SUPERFICIE,
            borderWidth: 2,
          },
        ],
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        cutout: '62%',
        plugins: {
          legend: {
            position: 'bottom',
            labels: { color: COLOR_TEXTO, font: { family: FUENTE }, boxWidth: 12, boxHeight: 12 },
          },
        },
      },
    });
  }

  private escalas(mostrarEtiquetasX = true) {
    return {
      x: {
        grid: { display: false },
        border: { color: COLOR_GRILLA },
        ticks: {
          display: mostrarEtiquetasX,
          color: COLOR_TEXTO_SUAVE,
          font: { family: FUENTE },
          maxRotation: 45,
          autoSkipPadding: 12,
        },
      },
      y: {
        beginAtZero: true,
        grid: { color: COLOR_GRILLA },
        border: { display: false },
        ticks: { color: COLOR_TEXTO_SUAVE, font: { family: FUENTE }, precision: 0 },
      },
    };
  }

  private completarDias(rango: RangoFechas, porDia: ComentariosPorDia[]) {
    const cantidades = new Map(porDia.map((dia) => [dia.fecha, dia.cantidad]));
    const dias: ComentariosPorDia[] = [];
    const cursor = new Date(`${rango.desde}T00:00:00Z`);
    const fin = new Date(`${rango.hasta}T00:00:00Z`);
    while (cursor <= fin) {
      const fecha = cursor.toISOString().slice(0, 10);
      dias.push({ fecha, cantidad: cantidades.get(fecha) ?? 0 });
      cursor.setUTCDate(cursor.getUTCDate() + 1);
    }
    return dias;
  }

  private fechaHaceDias(dias: number) {
    const fecha = new Date();
    fecha.setDate(fecha.getDate() - dias);
    return fechaLocal(fecha);
  }

  private mensajeDe(error: HttpErrorResponse) {
    const mensaje = error.error?.message;
    if (Array.isArray(mensaje)) {
      return mensaje.join('. ');
    }
    return mensaje ?? 'No pudimos conectar con el servidor';
  }
}
