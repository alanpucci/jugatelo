import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Post,
  Query,
  Req,
  UploadedFile,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import type { Request } from 'express';
import { memoryStorage } from 'multer';
import { AuthService } from '../auth/auth.service.js';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard.js';
import { ParseObjectIdPipe } from '../comun/pipes/parse-object-id.pipe.js';
import { crearPipeImagen } from '../comun/validadores/imagen.validator.js';
import { CrearPublicacionDto } from './dto/crear-publicacion.dto.js';
import { LimiteQueryDto } from './dto/limite-query.dto.js';
import { ListarPublicacionesQueryDto } from './dto/listar-publicaciones-query.dto.js';
import { PublicacionesService } from './publicaciones.service.js';

@Controller('publicaciones')
@UseGuards(JwtAuthGuard)
export class PublicacionesController {
  constructor(
    private readonly publicacionesService: PublicacionesService,
    private readonly authService: AuthService,
  ) {}

  @Get()
  async listar(
    @Query() query: ListarPublicacionesQueryDto,
    @Req() peticion: Request,
  ) {
    const usuario = await this.authService.obtenerUsuarioDelToken(peticion);
    return this.publicacionesService.listar(query, usuario);
  }

  @Get('proximas-juntadas')
  proximasJuntadas(@Query() query: LimiteQueryDto) {
    return this.publicacionesService.proximasJuntadas(query.limit);
  }

  @Get(':id')
  async obtenerPorId(
    @Param('id', ParseObjectIdPipe) id: string,
    @Req() peticion: Request,
  ) {
    const usuario = await this.authService.obtenerUsuarioDelToken(peticion);
    return this.publicacionesService.obtenerPorId(id, usuario);
  }

  @Post()
  @UseInterceptors(FileInterceptor('imagen', { storage: memoryStorage() }))
  async crear(
    @Body() dto: CrearPublicacionDto,
    @Req() peticion: Request,
    @UploadedFile(crearPipeImagen()) imagen?: Express.Multer.File,
  ) {
    const usuario = await this.authService.obtenerUsuarioDelToken(peticion);
    return this.publicacionesService.crear(dto, usuario, imagen);
  }

  @Delete(':id')
  async eliminar(
    @Param('id', ParseObjectIdPipe) id: string,
    @Req() peticion: Request,
  ) {
    const usuario = await this.authService.obtenerUsuarioDelToken(peticion);
    return this.publicacionesService.eliminar(id, usuario);
  }

  @Post(':id/me-gusta')
  async darMeGusta(
    @Param('id', ParseObjectIdPipe) id: string,
    @Req() peticion: Request,
  ) {
    const usuario = await this.authService.obtenerUsuarioDelToken(peticion);
    return this.publicacionesService.darMeGusta(id, usuario);
  }

  @Delete(':id/me-gusta')
  async quitarMeGusta(
    @Param('id', ParseObjectIdPipe) id: string,
    @Req() peticion: Request,
  ) {
    const usuario = await this.authService.obtenerUsuarioDelToken(peticion);
    return this.publicacionesService.quitarMeGusta(id, usuario);
  }
}
