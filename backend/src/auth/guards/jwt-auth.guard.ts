import { CanActivate, ExecutionContext, Injectable } from '@nestjs/common';
import { AuthService } from '../auth.service.js';

@Injectable()
export class JwtAuthGuard implements CanActivate {
  constructor(private readonly authService: AuthService) {}

  async canActivate(contexto: ExecutionContext) {
    const peticion = contexto.switchToHttp().getRequest();
    await this.authService.obtenerUsuarioDelToken(peticion);
    return true;
  }
}
