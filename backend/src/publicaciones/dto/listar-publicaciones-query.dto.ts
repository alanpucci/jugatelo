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
  @IsIn(ORDENES)
  orden: Orden = 'fecha';

  @IsOptional()
  @IsIn(TIPOS_PUBLICACION)
  tipo?: TipoPublicacion;

  @IsOptional()
  @IsString()
  @Length(1, 80)
  zona?: string;

  @IsOptional()
  @IsMongoId()
  usuarioId?: string;

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(0)
  offset: number = 0;

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  @Max(50)
  limit: number = 10;

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(0)
  @Max(5)
  comentarios: number = 0;
}
