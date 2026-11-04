import { HttpErrorResponse } from '@angular/common/http';
import { Component, OnInit, inject, signal } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { AuthService } from '../../../core/auth.service';
import { ModalService } from '../../../core/modal.service';
import { TokenService } from '../../../core/token.service';
import { PublicacionesService } from '../../publicaciones/publicaciones.service';
import { SpinnerComponent } from '../../../shared/spinner/spinner.component';

@Component({
  selector: 'app-cargando',
  imports: [SpinnerComponent],
  templateUrl: './cargando.component.html',
  styleUrl: './cargando.component.css',
})
export class CargandoComponent implements OnInit {
  private readonly authService = inject(AuthService);
  private readonly tokenService = inject(TokenService);
  private readonly modalService = inject(ModalService);
  private readonly publicacionesService = inject(PublicacionesService);
  private readonly router = inject(Router);
  private readonly ruta = inject(ActivatedRoute);

  protected readonly sinConexion = signal(false);

  ngOnInit() {
    this.validarSesion();
  }

  protected async validarSesion() {
    if (!this.tokenService.leer()) {
      this.router.navigate(['/login']);
      return;
    }

    this.sinConexion.set(false);
    try {
      await this.authService.autorizar();
      const destino = this.destino();
      const espera = new Promise((resolver) => setTimeout(resolver, 3000));
      if (destino === '/publicaciones') {
        // Los datos se piden mientras dura la espera, así la pantalla aparece ya completa.
        await Promise.all([
          espera,
          this.publicacionesService.precargar({ orden: 'fecha', offset: 0, limit: 10, comentarios: 3 }),
        ]);
      } else {
        await espera;
      }
      this.router.navigateByUrl(destino);
    } catch (error) {
      const estado = (error as HttpErrorResponse).status;
      if (estado === 403) {
        this.authService.cerrarSesion();
        this.modalService.mostrarError('Tu usuario está deshabilitado y no está autorizado a ingresar.', 'Sin autorización');
      } else if (estado !== 401) {
        this.sinConexion.set(true);
      }
    }
  }

  private destino() {
    const destino = this.ruta.snapshot.queryParamMap.get('destino');
    return destino && destino.startsWith('/') ? destino : '/publicaciones';
  }
}
