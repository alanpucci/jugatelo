import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument } from 'mongoose';

export type UsuarioDocument = HydratedDocument<Usuario>;
export const PERFILES = ['usuario', 'administrador'] as const;
export type Perfil = (typeof PERFILES)[number];

@Schema({ collection: 'usuarios', timestamps: true })
export class Usuario {
  @Prop({ required: true, trim: true, minlength: 2, maxlength: 50 })
  nombre: string;

  @Prop({ required: true, trim: true, minlength: 2, maxlength: 50 })
  apellido: string;

  @Prop({ required: true, trim: true, lowercase: true, unique: true })
  correo: string;

  @Prop({
    required: true,
    trim: true,
    minlength: 3,
    maxlength: 20,
    match: /^[a-zA-Z0-9._]+$/,
  })
  nombreUsuario: string;

  @Prop({ required: true, select: false })
  contrasena: string;

  @Prop({ required: true })
  fechaNacimiento: Date;

  @Prop({ trim: true, maxlength: 200, default: '' })
  descripcion: string;

  @Prop({ type: String, default: null })
  imagenPerfilUrl: string | null;

  @Prop({ type: String, default: null })
  imagenPerfilPublicId: string | null;

  @Prop({ type: String, enum: PERFILES, default: 'usuario' })
  perfil: Perfil;

  @Prop({ default: true })
  habilitado: boolean;
}

export const UsuarioSchema = SchemaFactory.createForClass(Usuario);
UsuarioSchema.index(
  { nombreUsuario: 1 },
  { unique: true, collation: { locale: 'es', strength: 2 } },
);
