import {
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { UsuarioDocument } from '../usuarios/esquemas/usuario.schema.js';
import { CrearComentarioDto } from './dto/crear-comentario.dto.js';
import { EditarComentarioDto } from './dto/editar-comentario.dto.js';
import { PaginacionQueryDto } from './dto/paginacion-query.dto.js';
import { Comentario } from './esquemas/comentario.schema.js';
import { Publicacion } from './esquemas/publicacion.schema.js';

const CAMPOS_AUTOR = 'nombreUsuario imagenPerfilUrl';

@Injectable()
export class ComentariosService {
  constructor(
    @InjectModel(Comentario.name)
    private readonly comentarioModel: Model<Comentario>,
    @InjectModel(Publicacion.name)
    private readonly publicacionModel: Model<Publicacion>,
  ) {}

  async listar(publicacionId: string, query: PaginacionQueryDto) {
    await this.asegurarPublicacionActiva(publicacionId);

    const filtro = { publicacion: new Types.ObjectId(publicacionId) };
    const [datos, total] = await Promise.all([
      this.comentarioModel
        .find(filtro)
        .sort({ createdAt: -1, _id: -1 })
        .skip(query.offset)
        .limit(query.limit)
        .populate('usuario', CAMPOS_AUTOR)
        .select('-__v')
        .lean(),
      this.comentarioModel.countDocuments(filtro),
    ]);
    return { datos, total, offset: query.offset, limit: query.limit };
  }

  async crear(
    publicacionId: string,
    dto: CrearComentarioDto,
    usuario: UsuarioDocument,
  ) {
    await this.asegurarPublicacionActiva(publicacionId);

    const comentario = await this.comentarioModel.create({
      publicacion: publicacionId,
      usuario: usuario._id,
      mensaje: dto.mensaje,
    });
    return this.obtenerPopulado(comentario._id);
  }

  async editar(
    publicacionId: string,
    comentarioId: string,
    dto: EditarComentarioDto,
    usuario: UsuarioDocument,
  ) {
    const comentario = await this.comentarioModel.findOne({
      _id: comentarioId,
      publicacion: publicacionId,
    });
    if (!comentario) {
      throw new NotFoundException('El comentario no existe');
    }
    await this.asegurarPublicacionActiva(publicacionId);
    if (!comentario.usuario.equals(usuario._id)) {
      throw new ForbiddenException('Solo el autor puede editar el comentario');
    }

    comentario.mensaje = dto.mensaje;
    comentario.modificado = true;
    await comentario.save();
    return this.obtenerPopulado(comentario._id);
  }

  private obtenerPopulado(id: Types.ObjectId) {
    return this.comentarioModel
      .findById(id)
      .populate('usuario', CAMPOS_AUTOR)
      .select('-__v')
      .lean();
  }

  private async asegurarPublicacionActiva(id: string) {
    const existe = await this.publicacionModel.exists({
      _id: id,
      activa: true,
    });
    if (!existe) {
      throw new NotFoundException('La publicación no existe');
    }
  }
}
