import { Usuario } from '../features/usuarios/usuario.model';

export interface RespuestaAuth {
  usuario: Usuario;
  token: string;
}

export interface CredencialesLogin {
  correo: string;
  contrasena: string;
}

export interface RespuestaAutorizar {
  usuario: Usuario;
}
