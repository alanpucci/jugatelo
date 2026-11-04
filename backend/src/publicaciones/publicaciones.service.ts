import {
  ConflictException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, QueryFilter, Types } from 'mongoose';
import { CloudinaryService } from '../cloudinary/cloudinary.service.js';
import { UsuarioDocument } from '../usuarios/esquemas/usuario.schema.js';
import {
  CrearPublicacionDto,
  validarCamposSegunTipo,
} from './dto/crear-publicacion.dto.js';
import { ListarPublicacionesQueryDto } from './dto/listar-publicaciones-query.dto.js';
import { Comentario } from './esquemas/comentario.schema.js';
import { Publicacion } from './esquemas/publicacion.schema.js';

const CARPETA_PUBLICACIONES = 'jugatelo/publicaciones';

const CAMPOS_AUTOR = 'nombreUsuario nombre apellido imagenPerfilUrl';
const CAMPOS_EXCLUIDOS = '-imagenPublicId -activa -__v';

function escaparRegex(texto: string) {
  return texto.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

@Injectable()
export class PublicacionesService {
  constructor(
    @InjectModel(Publicacion.name)
    private readonly publicacionModel: Model<Publicacion>,
    @InjectModel(Comentario.name)
    private readonly comentarioModel: Model<Comentario>,
    private readonly cloudinaryService: CloudinaryService,
  ) {}

  async listar(query: ListarPublicacionesQueryDto, usuario: UsuarioDocument) {
    const filtro: QueryFilter<Publicacion> = { activa: true };
    if (query.usuarioId) {
      filtro.usuario = new Types.ObjectId(query.usuarioId);
    }
    if (query.tipo) {
      filtro.tipo = query.tipo;
    }
    if (query.zona) {
      filtro.zona = { $regex: escaparRegex(query.zona), $options: 'i' };
    }

    const orden: Record<string, 1 | -1> =
      query.orden === 'meGusta'
        ? { cantidadMeGusta: -1, createdAt: -1, _id: -1 }
        : { createdAt: -1, _id: -1 };

    const [publicaciones, total] = await Promise.all([
      this.publicacionModel
        .find(filtro)
        .sort(orden)
        .skip(query.offset)
        .limit(query.limit)
        .populate('usuario', CAMPOS_AUTOR)
        .select(CAMPOS_EXCLUIDOS)
        .lean(),
      this.publicacionModel.countDocuments(filtro),
    ]);

    const datos = await Promise.all(
      publicaciones.map(async (publicacion) => {
        const detalle = this.agregarMeGustaDado(publicacion, usuario);
        if (query.comentarios === 0) {
          return detalle;
        }
        return {
          ...detalle,
          comentarios: await this.ultimosComentarios(
            publicacion._id,
            query.comentarios,
          ),
        };
      }),
    );
    return { datos, total, offset: query.offset, limit: query.limit };
  }

  proximasJuntadas(limit = 3) {
    return this.publicacionModel
      .find({
        activa: true,
        tipo: 'juntada',
        fechaJuntada: { $gte: new Date() },
      })
      .sort({ fechaJuntada: 1, _id: 1 })
      .limit(limit)
      .select('titulo zona fechaJuntada cupo')
      .lean();
  }

  async obtenerPorId(id: string, usuario: UsuarioDocument) {
    const publicacion = await this.publicacionModel
      .findOne({ _id: id, activa: true })
      .populate('usuario', CAMPOS_AUTOR)
      .select(CAMPOS_EXCLUIDOS)
      .lean();
    if (!publicacion) {
      throw new NotFoundException('La publicación no existe');
    }
    return this.agregarMeGustaDado(publicacion, usuario);
  }

  async crear(
    dto: CrearPublicacionDto,
    usuario: UsuarioDocument,
    imagen?: Express.Multer.File,
  ) {
    validarCamposSegunTipo(dto);

    const subida = imagen
      ? await this.cloudinaryService.subirImagen(
          imagen.buffer,
          CARPETA_PUBLICACIONES,
        )
      : null;

    try {
      const publicacion = await this.publicacionModel.create({
        tipo: dto.tipo,
        titulo: dto.titulo,
        descripcion: dto.descripcion,
        jugadoresMin: dto.jugadoresMin,
        jugadoresMax: dto.jugadoresMax,
        zona: dto.zona,
        fechaJuntada: dto.fechaJuntada,
        cupo: dto.cupo,
        imagenUrl: subida?.url ?? null,
        imagenPublicId: subida?.publicId ?? null,
        usuario: usuario._id,
      });

      const objeto: Partial<Publicacion> & { __v?: number } =
        publicacion.toObject();
      delete objeto.imagenPublicId;
      delete objeto.meGusta;
      delete objeto.activa;
      delete objeto.__v;
      return { ...objeto, meGustaDado: false };
    } catch (error) {
      if (subida) {
        await this.cloudinaryService.eliminarImagen(subida.publicId);
      }
      throw error;
    }
  }

  async darMeGusta(id: string, usuario: UsuarioDocument) {
    const publicacion = await this.publicacionModel.findOneAndUpdate(
      { _id: id, activa: true, meGusta: { $ne: usuario._id } },
      { $addToSet: { meGusta: usuario._id }, $inc: { cantidadMeGusta: 1 } },
      { returnDocument: 'after', projection: { cantidadMeGusta: 1 } },
    );
    if (!publicacion) {
      await this.asegurarPublicacionActiva(id);
      throw new ConflictException('Ya diste me gusta a esta publicación');
    }
    return { cantidadMeGusta: publicacion.cantidadMeGusta, meGustaDado: true };
  }

  async quitarMeGusta(id: string, usuario: UsuarioDocument) {
    const publicacion = await this.publicacionModel.findOneAndUpdate(
      { _id: id, activa: true, meGusta: usuario._id },
      { $pull: { meGusta: usuario._id }, $inc: { cantidadMeGusta: -1 } },
      { returnDocument: 'after', projection: { cantidadMeGusta: 1 } },
    );
    if (!publicacion) {
      await this.asegurarPublicacionActiva(id);
      throw new ConflictException('No habías dado me gusta a esta publicación');
    }
    return { cantidadMeGusta: publicacion.cantidadMeGusta, meGustaDado: false };
  }

  async eliminar(id: string, usuario: UsuarioDocument) {
    const publicacion = await this.publicacionModel.findOne(
      { _id: id, activa: true },
      { usuario: 1 },
    );
    if (!publicacion) {
      throw new NotFoundException('La publicación no existe');
    }
    const esAutor = publicacion.usuario.equals(usuario._id);
    if (!esAutor && usuario.perfil !== 'administrador') {
      throw new ForbiddenException(
        'No tenés permiso para eliminar esta publicación',
      );
    }
    await this.publicacionModel.updateOne(
      { _id: id },
      { $set: { activa: false } },
    );
    return { mensaje: 'Publicación eliminada' };
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

  private agregarMeGustaDado<T extends { meGusta: Types.ObjectId[] }>(
    publicacion: T,
    usuario: UsuarioDocument,
  ) {
    const { meGusta, ...resto } = publicacion;
    return {
      ...resto,
      meGustaDado: meGusta.some((quien) => quien.equals(usuario._id)),
    };
  }

  private ultimosComentarios(publicacionId: Types.ObjectId, cantidad: number) {
    return this.comentarioModel
      .find({ publicacion: publicacionId })
      .sort({ createdAt: -1, _id: -1 })
      .limit(cantidad)
      .populate('usuario', 'nombreUsuario imagenPerfilUrl')
      .select('-__v')
      .lean();
  }
}
