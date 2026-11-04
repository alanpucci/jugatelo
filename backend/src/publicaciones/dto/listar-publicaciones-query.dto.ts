import { Type } from 'class-transformer';
import {
  IsIn,
  IsInt,
  IsMongoId,
  IsOptional,
  IsString,
  Length,
  Max,
  Min,
} from 'class-validator';
import {
  TIPOS_PUBLICACION,
  type TipoPublicacion,
} from '../esquemas/publicacion.schema.js';

export const ORDENES = ['fecha', 'meGusta'] as const;
export type Orden = (typeof ORDENES)[number];

export class ListarPublicacionesQueryDto {
  @IsOptional()
  @IsIn(ORDENES, { message: 'El orden debe ser fecha o meGusta' })
  orden: Orden = 'fecha';

  @IsOptional()
  @IsIn(TIPOS_PUBLICACION, { message: 'El tipo debe ser juego o juntada' })
  tipo?: TipoPublicacion;

  @IsOptional()
  @IsString({ message: 'La zona debe ser un texto' })
  @Length(1, 80, { message: 'La zona debe tener entre 1 y 80 caracteres' })
  zona?: string;

  @IsOptional()
  @IsMongoId({ message: 'El usuarioId no es un id válido' })
  usuarioId?: string;

  @IsOptional()
  @Type(() => Number)
  @IsInt({ message: 'El offset debe ser un número entero' })
  @Min(0, { message: 'El offset no puede ser negativo' })
  offset: number = 0;

  @IsOptional()
  @Type(() => Number)
  @IsInt({ message: 'El limit debe ser un número entero' })
  @Min(1, { message: 'El limit debe ser al menos 1' })
  @Max(50, { message: 'El limit no puede ser mayor a 50' })
  limit: number = 10;

  @IsOptional()
  @Type(() => Number)
  @IsInt({ message: 'La cantidad de comentarios debe ser un número entero' })
  @Min(0, { message: 'La cantidad de comentarios no puede ser negativa' })
  @Max(5, { message: 'La cantidad de comentarios no puede ser mayor a 5' })
  comentarios: number = 0;
}
