import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Usuario, UsuarioDocument } from './esquemas/usuario.schema.js';

export type DatosNuevoUsuario = Pick<
  Usuario,
  'nombre' | 'apellido' | 'correo' | 'nombreUsuario' | 'contrasena'
> &
  Partial<
    Pick<Usuario, 'descripcion' | 'imagenPerfilUrl' | 'imagenPerfilPublicId'>
  > & { fechaNacimiento: Date };

export function mapearUsuario(usuario: UsuarioDocument) {
  const objeto: Partial<Usuario> & { __v?: number } = usuario.toObject();
  delete objeto.contrasena;
  delete objeto.imagenPerfilPublicId;
  delete objeto.__v;
  return objeto;
}

@Injectable()
export class UsuariosService {
  constructor(
    @InjectModel(Usuario.name) private readonly usuarioModel: Model<Usuario>,
  ) {}

  buscarPorCorreo(correo: string) {
    return this.usuarioModel
      .findOne({ correo: correo.toLowerCase() })
      .select('+contrasena');
  }

  buscarPorId(id: string) {
    return this.usuarioModel.findById(id);
  }

  buscarPorNombreUsuario(nombreUsuario: string) {
    return this.usuarioModel
      .findOne({ nombreUsuario })
      .collation({ locale: 'es', strength: 2 });
  }

  crear(datos: DatosNuevoUsuario) {
    return this.usuarioModel.create(datos);
  }
}
