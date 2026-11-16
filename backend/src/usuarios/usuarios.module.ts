import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { CloudinaryModule } from '../cloudinary/cloudinary.module.js';
import { Usuario, UsuarioSchema } from './esquemas/usuario.schema.js';
import { UsuariosService } from './usuarios.service.js';

@Module({
  imports: [
    CloudinaryModule,
    MongooseModule.forFeature([{ name: Usuario.name, schema: UsuarioSchema }]),
  ],
  providers: [UsuariosService],
  exports: [UsuariosService],
})
export class UsuariosModule {}
