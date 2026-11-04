import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, PipelineStage, QueryFilter, Types } from 'mongoose';
import { CloudinaryService } from '../cloudinary/cloudinary.service.js';
import { UsuarioDocument } from '../usuarios/esquemas/usuario.schema.js';
import {
  CrearPublicacionDto,
  validarCamposSegunTipo,
} from './dto/crear-publicacion.dto.js';
import { ListarPublicacionesQueryDto } from './dto/listar-publicaciones-query.dto.js';
import { Publicacion } from './esquemas/publicacion.schema.js';

const CARPETA_PUBLICACIONES = 'jugatelo/publicaciones';

function escaparRegex(texto: string) {
  return texto.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

@Injectable()
export class PublicacionesService {
  constructor(
    @InjectModel(Publicacion.name)
    private readonly publicacionModel: Model<Publicacion>,
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

    const pipeline: PipelineStage[] = [
      { $match: filtro },
      { $sort: orden },
      { $skip: query.offset },
      { $limit: query.limit },
      {
        $lookup: {
          from: 'usuarios',
          localField: 'usuario',
          foreignField: '_id',
          as: 'usuario',
          pipeline: [
            {
              $project: {
                nombreUsuario: 1,
                nombre: 1,
                apellido: 1,
                imagenPerfilUrl: 1,
              },
            },
          ],
        },
      },
      { $unwind: '$usuario' },
      { $addFields: { meGustaDado: { $in: [usuario._id, '$meGusta'] } } },
      { $project: { meGusta: 0, imagenPublicId: 0, activa: 0, __v: 0 } },
    ];
    if (query.comentarios > 0) {
      pipeline.push(...this.etapaComentarios(query.comentarios));
    }

    const [datos, total] = await Promise.all([
      this.publicacionModel.aggregate(pipeline),
      this.publicacionModel.countDocuments(filtro),
    ]);
    return { datos, total, offset: query.offset, limit: query.limit };
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

  private etapaComentarios(cantidad: number): PipelineStage[] {
    return [
      {
        $lookup: {
          from: 'comentarios',
          let: { pid: '$_id' },
          pipeline: [
            { $match: { $expr: { $eq: ['$publicacion', '$$pid'] } } },
            { $sort: { createdAt: -1 } },
            { $limit: cantidad },
            {
              $lookup: {
                from: 'usuarios',
                localField: 'usuario',
                foreignField: '_id',
                as: 'usuario',
                pipeline: [
                  { $project: { nombreUsuario: 1, imagenPerfilUrl: 1 } },
                ],
              },
            },
            { $unwind: '$usuario' },
            { $project: { __v: 0 } },
          ],
          as: 'comentarios',
        },
      },
    ];
  }
}
