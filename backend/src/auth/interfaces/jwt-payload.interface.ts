import { Perfil } from '../../usuarios/esquemas/usuario.schema.js';

export interface JwtPayload {
  sub: string;
  correo: string;
  nombreUsuario: string;
  perfil: Perfil;
}
