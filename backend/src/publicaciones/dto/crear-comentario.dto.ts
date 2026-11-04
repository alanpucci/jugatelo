import { Transform } from 'class-transformer';
import { IsString, Length } from 'class-validator';

export class CrearComentarioDto {
  @Transform(({ value }: { value: unknown }) =>
    typeof value === 'string' ? value.trim() : value,
  )
  @IsString({ message: 'El mensaje es obligatorio' })
  @Length(1, 500, { message: 'El mensaje debe tener entre 1 y 500 caracteres' })
  mensaje: string;
}
