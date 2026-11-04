import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument, Types } from 'mongoose';

export type PublicacionDocument = HydratedDocument<Publicacion>;

export const TIPOS_PUBLICACION = ['juego', 'juntada'] as const;
export type TipoPublicacion = (typeof TIPOS_PUBLICACION)[number];

@Schema({ collection: 'publicaciones', timestamps: true })
export class Publicacion {
  @Prop({
    type: String,
    enum: TIPOS_PUBLICACION,
    required: true,
    immutable: true,
  })
  tipo: TipoPublicacion;

  @Prop({ required: true, trim: true, minlength: 3, maxlength: 100 })
  titulo: string;

  @Prop({ required: true, trim: true, minlength: 1, maxlength: 1000 })
  descripcion: string;

  @Prop({ type: Number, min: 1, max: 20, default: null })
  jugadoresMin: number | null;

  @Prop({ type: Number, min: 1, max: 20, default: null })
  jugadoresMax: number | null;

  @Prop({
    type: String,
    trim: true,
    minlength: 2,
    maxlength: 80,
    default: null,
  })
  zona: string | null;

  @Prop({ type: Date, default: null })
  fechaJuntada: Date | null;

  @Prop({ type: Number, min: 2, max: 50, default: null })
  cupo: number | null;

  @Prop({ type: String, default: null })
  imagenUrl: string | null;

  @Prop({ type: String, default: null })
  imagenPublicId: string | null;

  @Prop({ type: Types.ObjectId, ref: 'Usuario', required: true })
  usuario: Types.ObjectId;

  @Prop({ type: [{ type: Types.ObjectId, ref: 'Usuario' }], default: [] })
  meGusta: Types.ObjectId[];

  @Prop({ default: 0, min: 0 })
  cantidadMeGusta: number;

  @Prop({ default: true })
  activa: boolean;
}

export const PublicacionSchema = SchemaFactory.createForClass(Publicacion);
PublicacionSchema.index({ activa: 1, createdAt: -1 });
PublicacionSchema.index({ activa: 1, cantidadMeGusta: -1, createdAt: -1 });
PublicacionSchema.index({ activa: 1, tipo: 1, createdAt: -1 });
PublicacionSchema.index({ activa: 1, tipo: 1, zona: 1 });
PublicacionSchema.index({ usuario: 1, activa: 1, createdAt: -1 });
PublicacionSchema.index({ createdAt: 1 });
