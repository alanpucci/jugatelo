import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  Param,
  Post,
  Req,
  UploadedFile,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import type { Request } from 'express';
import { memoryStorage } from 'multer';
import { AuthService } from '../auth/auth.service.js';
import { AdminGuard } from '../auth/guards/admin.guard.js';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard.js';
import { ParseObjectIdPipe } from '../comun/pipes/parse-object-id.pipe.js';
import { crearPipeImagen } from '../comun/validadores/imagen.validator.js';
import { CrearUsuarioDto } from './dto/crear-usuario.dto.js';
import { UsuariosService, mapearUsuario } from './usuarios.service.js';

@Controller('usuarios')
@UseGuards(JwtAuthGuard, AdminGuard)
export class UsuariosController {
  constructor(
    private readonly usuariosService: UsuariosService,
    private readonly authService: AuthService,
  ) {}

  @Get()
  listar() {
    return this.usuariosService.listar();
  }

  @Post()
  @UseInterceptors(
    FileInterceptor('imagenPerfil', { storage: memoryStorage() }),
  )
  async crear(
    @Body() dto: CrearUsuarioDto,
    @UploadedFile(crearPipeImagen()) imagen?: Express.Multer.File,
  ) {
    const usuario = await this.usuariosService.crear(dto, imagen, dto.perfil);
    return mapearUsuario(usuario);
  }

  @Delete(':id')
  async deshabilitar(
    @Param('id', ParseObjectIdPipe) id: string,
    @Req() peticion: Request,
  ) {
    const solicitante = await this.authService.obtenerUsuarioDelToken(peticion);
    return this.usuariosService.deshabilitar(id, solicitante.id);
  }

  @Post(':id/habilitar')
  @HttpCode(200)
  habilitar(@Param('id', ParseObjectIdPipe) id: string) {
    return this.usuariosService.habilitar(id);
  }
}
