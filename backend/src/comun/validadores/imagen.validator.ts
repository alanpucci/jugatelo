import {
  FileTypeValidator,
  MaxFileSizeValidator,
  ParseFilePipe,
} from '@nestjs/common';

export const TAMANO_MAXIMO_IMAGEN = 2 * 1024 * 1024;

export function crearPipeImagen() {
  return new ParseFilePipe({
    fileIsRequired: false,
    validators: [
      new MaxFileSizeValidator({
        maxSize: TAMANO_MAXIMO_IMAGEN,
        message: 'La imagen no puede superar los 2 MB',
      }),
      new FileTypeValidator({
        fileType: /^image\/(jpeg|png|webp)$/,
        fallbackToMimetype: true,
        skipMagicNumbersValidation: false,
      }),
    ],
  });
}
