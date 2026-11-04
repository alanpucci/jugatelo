export type Perfil = 'usuario' | 'administrador';

export interface Usuario {
  _id: string;
  nombre: string;
  apellido: string;
  correo: string;
  nombreUsuario: string;
  fechaNacimiento: string;
  descripcion: string;
  imagenPerfilUrl: string | null;
  perfil: Perfil;
  habilitado: boolean;
  createdAt: string;
  updatedAt: string;
}
