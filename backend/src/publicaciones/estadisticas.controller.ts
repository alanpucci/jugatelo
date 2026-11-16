import { Controller, Get, Query, UseGuards } from '@nestjs/common';
import { AdminGuard } from '../auth/guards/admin.guard.js';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard.js';
import { RangoFechasQueryDto } from './dto/rango-fechas-query.dto.js';
import { EstadisticasService } from './estadisticas.service.js';

@Controller('estadisticas')
@UseGuards(JwtAuthGuard, AdminGuard)
export class EstadisticasController {
  constructor(private readonly estadisticasService: EstadisticasService) {}

  @Get('publicaciones-por-usuario')
  publicacionesPorUsuario(@Query() query: RangoFechasQueryDto) {
    return this.estadisticasService.publicacionesPorUsuario(query);
  }

  @Get('comentarios')
  comentarios(@Query() query: RangoFechasQueryDto) {
    return this.estadisticasService.comentarios(query);
  }

  @Get('comentarios-por-publicacion')
  comentariosPorPublicacion(@Query() query: RangoFechasQueryDto) {
    return this.estadisticasService.comentariosPorPublicacion(query);
  }
}
