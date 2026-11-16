import {
  BadRequestException,
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import bcrypt from 'bcrypt';
import { Model } from 'mongoose';
import { RegistroDto } from '../auth/dto/registro.dto.js';
import { CloudinaryService } from '../cloudinary/cloudinary.service.js';
import { ActualizarPerfilDto } from './dto/actualizar-perfil.dto.js';
import { Perfil, Usuario, UsuarioDocument } from './esquemas/usuario.schema.js';

const CARPETA_PERFILES = 'jugatelo/perfiles';

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
    private readonly cloudinaryService: CloudinaryService,
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

  listar() {
    return this.usuarioModel
      .find()
      .select('-imagenPerfilPublicId -__v')
      .sort({ createdAt: -1 })
      .lean();
  }

  async crear(
    dto: RegistroDto,
    imagen?: Express.Multer.File,
    perfil: Perfil = 'usuario',
  ) {
    if (dto.contrasena !== dto.repetirContrasena) {
      throw new BadRequestException('Las contraseñas no coinciden');
    }

    if (await this.buscarPorCorreo(dto.correo)) {
      throw new ConflictException('Ese correo ya está registrado');
    }
    if (await this.buscarPorNombreUsuario(dto.nombreUsuario)) {
      throw new ConflictException('Ese nombre de usuario ya existe');
    }

    const contrasena = await bcrypt.hash(dto.contrasena, 10);
    const subida = imagen
      ? await this.cloudinaryService.subirImagen(
          imagen.buffer,
          CARPETA_PERFILES,
        )
      : null;

    try {
      return await this.usuarioModel.create({
        nombre: dto.nombre,
        apellido: dto.apellido,
        correo: dto.correo,
        nombreUsuario: dto.nombreUsuario,
        contrasena,
        fechaNacimiento: dto.fechaNacimiento,
        descripcion: dto.descripcion,
        imagenPerfilUrl: subida?.url ?? null,
        imagenPerfilPublicId: subida?.publicId ?? null,
        perfil,
      });
    } catch (error) {
      if (subida) {
        await this.cloudinaryService.eliminarImagen(subida.publicId);
      }
      throw error;
    }
  }

  async actualizarPerfil(
    usuario: UsuarioDocument,
    dto: ActualizarPerfilDto,
    imagen?: Express.Multer.File,
  ) {
    if (dto.nombreUsuario) {
      const existente = await this.buscarPorNombreUsuario(dto.nombreUsuario);
      if (existente && existente.id !== usuario.id) {
        throw new ConflictException('Ese nombre de usuario ya existe');
      }
    }

    const subida = imagen
      ? await this.cloudinaryService.subirImagen(
          imagen.buffer,
          CARPETA_PERFILES,
        )
      : null;
    const publicIdAnterior = usuario.imagenPerfilPublicId;

    usuario.set(dto);
    if (subida) {
      usuario.imagenPerfilUrl = subida.url;
      usuario.imagenPerfilPublicId = subida.publicId;
    }

    try {
      await usuario.save();
    } catch (error) {
      if (subida) {
        await this.cloudinaryService.eliminarImagen(subida.publicId);
      }
      throw error;
    }

    if (subida && publicIdAnterior) {
      await this.cloudinaryService.eliminarImagen(publicIdAnterior);
    }
    return mapearUsuario(usuario);
  }

  deshabilitar(id: string, idSolicitante: string) {
    if (id === idSolicitante) {
      throw new BadRequestException('No podés deshabilitarte a vos mismo');
    }
    return this.cambiarHabilitado(id, false);
  }

  habilitar(id: string) {
    return this.cambiarHabilitado(id, true);
  }

  private async cambiarHabilitado(id: string, habilitado: boolean) {
    const usuario = await this.usuarioModel.findByIdAndUpdate(
      id,
      { $set: { habilitado } },
      { new: true },
    );
    if (!usuario) {
      throw new NotFoundException('El usuario no existe');
    }
    return mapearUsuario(usuario);
  }
}
