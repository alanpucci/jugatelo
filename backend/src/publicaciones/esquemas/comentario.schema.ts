import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument, Schema as MongooseSchema, Types } from 'mongoose';

export type ComentarioDocument = HydratedDocument<Comentario>;

@Schema({ collection: 'comentarios', timestamps: true })
export class Comentario {
  @Prop({
    type: MongooseSchema.Types.ObjectId,
    ref: 'Publicacion',
    required: true,
  })
  publicacion: Types.ObjectId;

  @Prop({ type: MongooseSchema.Types.ObjectId, ref: 'Usuario', required: true })
  usuario: Types.ObjectId;

  @Prop({ required: true, trim: true, minlength: 1, maxlength: 500 })
  mensaje: string;

  @Prop({ default: false })
  modificado: boolean;
}

export const ComentarioSchema = SchemaFactory.createForClass(Comentario);
ComentarioSchema.index({ publicacion: 1, createdAt: -1 });
ComentarioSchema.index({ createdAt: 1 });
