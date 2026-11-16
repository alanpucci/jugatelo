import {
  CanActivate,
  ExecutionContext,
  ForbiddenException,
  Injectable,
} from '@nestjs/common';
import { AuthService } from '../auth.service.js';

@Injectable()
export class AdminGuard implements CanActivate {
  constructor(private readonly authService: AuthService) {}

  async canActivate(contexto: ExecutionContext) {
    const peticion = contexto.switchToHttp().getRequest();
    const usuario = await this.authService.obtenerUsuarioDelToken(peticion);
    if (usuario.perfil !== 'administrador') {
      throw new ForbiddenException('Solo un administrador puede hacer esto');
    }
    return true;
  }
}
