import { Perfil } from '../../usuarios/esquemas/usuario.schema.js';

export interface JwtPayload {
  id: string;
  correo: string;
  nombreUsuario: string;
  perfil: Perfil;
}
