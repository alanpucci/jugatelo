import {
  Body,
  Controller,
  HttpCode,
  Post,
  Req,
  UploadedFile,
  UseInterceptors,
} from '@nestjs/common';
import type { Request } from 'express';
import { FileInterceptor } from '@nestjs/platform-express';
import { memoryStorage } from 'multer';
import { crearPipeImagen } from '../comun/validadores/imagen.validator.js';
import { AuthService } from './auth.service.js';
import { LoginDto } from './dto/login.dto.js';
import { RegistroDto } from './dto/registro.dto.js';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('registro')
  @UseInterceptors(
    FileInterceptor('imagenPerfil', { storage: memoryStorage() }),
  )
  registrar(
    @Body() dto: RegistroDto,
    @UploadedFile(crearPipeImagen()) imagen?: Express.Multer.File,
  ) {
    return this.authService.registrar(dto, imagen);
  }

  @Post('login')
  @HttpCode(200)
  login(@Body() dto: LoginDto) {
    return this.authService.login(dto);
  }

  @Post('autorizar')
  @HttpCode(200)
  autorizar(@Req() peticion: Request) {
    return this.authService.autorizar(peticion);
  }

  @Post('refrescar')
  @HttpCode(200)
  refrescar(@Req() peticion: Request) {
    return this.authService.refrescar(peticion);
  }
}
