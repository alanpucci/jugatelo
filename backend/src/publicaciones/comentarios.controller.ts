import {
  Body,
  Controller,
  Get,
  HttpCode,
  Param,
  Post,
  Put,
  Query,
  Req,
  UseGuards,
} from '@nestjs/common';
import type { Request } from 'express';
import { AuthService } from '../auth/auth.service.js';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard.js';
import { ParseObjectIdPipe } from '../comun/pipes/parse-object-id.pipe.js';
import { ComentariosService } from './comentarios.service.js';
import { CrearComentarioDto } from './dto/crear-comentario.dto.js';
import { EditarComentarioDto } from './dto/editar-comentario.dto.js';
import { PaginacionQueryDto } from './dto/paginacion-query.dto.js';

@Controller('publicaciones/:publicacionId/comentarios')
@UseGuards(JwtAuthGuard)
export class ComentariosController {
  constructor(
    private readonly comentariosService: ComentariosService,
    private readonly authService: AuthService,
  ) {}

  @Get()
  listar(
    @Param('publicacionId', ParseObjectIdPipe) publicacionId: string,
    @Query() query: PaginacionQueryDto,
  ) {
    return this.comentariosService.listar(publicacionId, query);
  }

  @Post()
  async crear(
    @Param('publicacionId', ParseObjectIdPipe) publicacionId: string,
    @Body() dto: CrearComentarioDto,
    @Req() peticion: Request,
  ) {
    const usuario = await this.authService.obtenerUsuarioDelToken(peticion);
    return this.comentariosService.crear(publicacionId, dto, usuario);
  }

  @Put(':comentarioId')
  @HttpCode(200)
  async editar(
    @Param('publicacionId', ParseObjectIdPipe) publicacionId: string,
    @Param('comentarioId', ParseObjectIdPipe) comentarioId: string,
    @Body() dto: EditarComentarioDto,
    @Req() peticion: Request,
  ) {
    const usuario = await this.authService.obtenerUsuarioDelToken(peticion);
    return this.comentariosService.editar(
      publicacionId,
      comentarioId,
      dto,
      usuario,
    );
  }
}
