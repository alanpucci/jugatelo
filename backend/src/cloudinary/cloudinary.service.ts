import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { v2 as cloudinary } from 'cloudinary';

export interface ImagenSubida {
  url: string;
  publicId: string;
}

@Injectable()
export class CloudinaryService {
  constructor(config: ConfigService) {
    cloudinary.config({
      cloud_name: config.getOrThrow<string>('CLOUDINARY_CLOUD_NAME'),
      api_key: config.getOrThrow<string>('CLOUDINARY_API_KEY'),
      api_secret: config.getOrThrow<string>('CLOUDINARY_API_SECRET'),
    });
  }

  subirImagen(buffer: Buffer, carpeta: string) {
    return new Promise<ImagenSubida>((resolver, rechazar) => {
      const flujo = cloudinary.uploader.upload_stream(
        { folder: carpeta },
        (error, resultado) => {
          if (error || !resultado) {
            rechazar(error ?? new Error('No se pudo subir la imagen'));
            return;
          }
          resolver({
            url: resultado.secure_url,
            publicId: resultado.public_id,
          });
        },
      );
      flujo.end(buffer);
    });
  }

  async eliminarImagen(publicId: string) {
    await cloudinary.uploader.destroy(publicId);
  }
}
