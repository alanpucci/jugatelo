export type TipoPublicacion = 'juego' | 'juntada';
export type OrdenPublicaciones = 'fecha' | 'meGusta';

export interface AutorPublicacion {
  _id: string;
  nombreUsuario: string;
  nombre: string;
  apellido: string;
  imagenPerfilUrl: string | null;
}

export interface AutorComentario {
  _id: string;
  nombreUsuario: string;
  imagenPerfilUrl: string | null;
}

export interface ComentarioPublicacion {
  _id: string;
  publicacion: string;
  usuario: AutorComentario;
  mensaje: string;
  modificado: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface Publicacion {
  _id: string;
  tipo: TipoPublicacion;
  titulo: string;
  descripcion: string;
  jugadoresMin: number | null;
  jugadoresMax: number | null;
  zona: string | null;
  fechaJuntada: string | null;
  cupo: number | null;
  imagenUrl: string | null;
  usuario: AutorPublicacion;
  cantidadMeGusta: number;
  meGustaDado: boolean;
  createdAt: string;
  updatedAt: string;
  comentarios?: ComentarioPublicacion[];
}

export interface FiltrosPublicaciones {
  orden: OrdenPublicaciones;
  tipo: TipoPublicacion | '';
  zona: string;
  offset: number;
  limit: number;
  usuarioId: string;
  comentarios: number;
}

export interface EstadoMeGusta {
  cantidadMeGusta: number;
  meGustaDado: boolean;
}

export interface JuntadaProxima {
  _id: string;
  titulo: string;
  zona: string;
  fechaJuntada: string;
  cupo: number | null;
}
