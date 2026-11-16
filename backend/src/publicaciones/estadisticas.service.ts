import { BadRequestException, Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { RangoFechasQueryDto } from './dto/rango-fechas-query.dto.js';
import { Comentario } from './esquemas/comentario.schema.js';
import { Publicacion } from './esquemas/publicacion.schema.js';

const ZONA_HORARIA = 'America/Argentina/Buenos_Aires';
const TOP_PUBLICACIONES = 10;

@Injectable()
export class EstadisticasService {
  constructor(
    @InjectModel(Publicacion.name)
    private readonly publicacionModel: Model<Publicacion>,
    @InjectModel(Comentario.name)
    private readonly comentarioModel: Model<Comentario>,
  ) {}

  publicacionesPorUsuario(query: RangoFechasQueryDto) {
    const rango = this.armarRango(query);
    return this.publicacionModel.aggregate([
      { $match: { activa: true, ...rango } },
      { $group: { _id: '$usuario', cantidad: { $sum: 1 } } },
      {
        $lookup: {
          from: 'usuarios',
          localField: '_id',
          foreignField: '_id',
          as: 'u',
          pipeline: [{ $project: { nombreUsuario: 1 } }],
        },
      },
      { $unwind: '$u' },
      {
        $project: {
          _id: 0,
          usuarioId: '$_id',
          nombreUsuario: '$u.nombreUsuario',
          cantidad: 1,
        },
      },
      { $sort: { cantidad: -1, nombreUsuario: 1 } },
    ]);
  }

  async comentarios(query: RangoFechasQueryDto) {
    const rango = this.armarRango(query);
    const [resultado] = await this.comentarioModel.aggregate<{
      total: { cantidad: number }[];
      porDia: { fecha: string; cantidad: number }[];
    }>([
      { $match: rango },
      {
        $lookup: {
          from: 'publicaciones',
          localField: 'publicacion',
          foreignField: '_id',
          as: 'p',
          pipeline: [{ $match: { activa: true } }, { $project: { _id: 1 } }],
        },
      },
      { $match: { 'p.0': { $exists: true } } },
      {
        $facet: {
          total: [{ $count: 'cantidad' }],
          porDia: [
            {
              $group: {
                _id: {
                  $dateToString: {
                    format: '%Y-%m-%d',
                    date: '$createdAt',
                    timezone: ZONA_HORARIA,
                  },
                },
                cantidad: { $sum: 1 },
              },
            },
            { $sort: { _id: 1 } },
            { $project: { _id: 0, fecha: '$_id', cantidad: 1 } },
          ],
        },
      },
    ]);
    return {
      total: resultado.total[0]?.cantidad ?? 0,
      porDia: resultado.porDia,
    };
  }

  comentariosPorPublicacion(query: RangoFechasQueryDto) {
    const rango = this.armarRango(query);
    return this.comentarioModel.aggregate([
      { $match: rango },
      { $group: { _id: '$publicacion', cantidad: { $sum: 1 } } },
      {
        $lookup: {
          from: 'publicaciones',
          localField: '_id',
          foreignField: '_id',
          as: 'p',
          pipeline: [{ $match: { activa: true } }, { $project: { titulo: 1 } }],
        },
      },
      { $unwind: '$p' },
      { $sort: { cantidad: -1 } },
      { $limit: TOP_PUBLICACIONES },
      {
        $project: {
          _id: 0,
          publicacionId: '$_id',
          titulo: '$p.titulo',
          cantidad: 1,
        },
      },
    ]);
  }

  private armarRango({ desde, hasta }: RangoFechasQueryDto) {
    const inicio = new Date(`${desde}T00:00:00.000-03:00`);
    const fin = new Date(`${hasta}T23:59:59.999-03:00`);
    if (Number.isNaN(inicio.getTime()) || Number.isNaN(fin.getTime())) {
      throw new BadRequestException('Las fechas no son válidas');
    }
    if (inicio > fin) {
      throw new BadRequestException(
        'La fecha desde no puede ser posterior a la fecha hasta',
      );
    }
    return { createdAt: { $gte: inicio, $lte: fin } };
  }
}
