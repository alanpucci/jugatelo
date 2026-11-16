import {
  ForbiddenException,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import bcrypt from 'bcrypt';
import type { Request } from 'express';
import { UsuarioDocument } from '../usuarios/esquemas/usuario.schema.js';
import {
  UsuariosService,
  mapearUsuario,
} from '../usuarios/usuarios.service.js';
import { LoginDto } from './dto/login.dto.js';
import { RegistroDto } from './dto/registro.dto.js';
import { JwtPayload } from './interfaces/jwt-payload.interface.js';

const MENSAJE_DESHABILITADO =
  'Tu cuenta está deshabilitada. Contactá a un administrador.';

@Injectable()
export class AuthService {
  constructor(
    private readonly usuariosService: UsuariosService,
    private readonly jwtService: JwtService,
  ) {}

  async registrar(dto: RegistroDto, imagen?: Express.Multer.File) {
    const usuario = await this.usuariosService.crear(dto, imagen);
    return this.armarRespuesta(usuario);
  }

  async login(dto: LoginDto) {
    const usuario = await this.usuariosService.buscarPorCorreo(dto.correo);
    const coincide =
      usuario && (await bcrypt.compare(dto.contrasena, usuario.contrasena));

    if (!usuario || !coincide) {
      throw new UnauthorizedException('Correo o contraseña incorrectos');
    }

    if (!usuario.habilitado) {
      throw new ForbiddenException(MENSAJE_DESHABILITADO);
    }

    return this.armarRespuesta(usuario);
  }

  async autorizar(peticion: Request) {
    const usuario = await this.obtenerUsuarioDelToken(peticion);
    return { usuario: mapearUsuario(usuario) };
  }

  async refrescar(peticion: Request) {
    const usuario = await this.obtenerUsuarioDelToken(peticion);
    return { token: await this.firmarToken(usuario) };
  }

  async obtenerUsuarioDelToken(peticion: Request) {
    const [tipo, token] = peticion.headers.authorization?.split(' ') ?? [];

    if (tipo !== 'Bearer' || !token) {
      throw new UnauthorizedException('Sesión no válida');
    }

    let payload: JwtPayload;
    try {
      payload = await this.jwtService.verifyAsync<JwtPayload>(token);
    } catch {
      throw new UnauthorizedException('Sesión no válida');
    }

    const usuario = await this.usuariosService.buscarPorId(payload.sub);
    if (!usuario) {
      throw new UnauthorizedException('Sesión no válida');
    }
    if (!usuario.habilitado) {
      throw new ForbiddenException(MENSAJE_DESHABILITADO);
    }

    return usuario;
  }

  private firmarToken(usuario: UsuarioDocument) {
    const payload: JwtPayload = {
      sub: usuario.id,
      correo: usuario.correo,
      nombreUsuario: usuario.nombreUsuario,
      perfil: usuario.perfil,
    };

    return this.jwtService.signAsync(payload);
  }

  private async armarRespuesta(usuario: UsuarioDocument) {
    return {
      usuario: mapearUsuario(usuario),
      token: await this.firmarToken(usuario),
    };
  }
}
