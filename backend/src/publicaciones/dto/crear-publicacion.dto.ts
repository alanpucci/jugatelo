import { BadRequestException } from '@nestjs/common';
import { Type } from 'class-transformer';
import {
  IsDate,
  IsIn,
  IsInt,
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

export class CrearPublicacionDto {
  @IsIn(TIPOS_PUBLICACION)
  tipo: TipoPublicacion;

  @IsString()
  @Length(3, 100)
  titulo: string;

  @IsString()
  @Length(1, 1000)
  descripcion: string;

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  @Max(20)
  jugadoresMin?: number;

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  @Max(20)
  jugadoresMax?: number;

  @IsOptional()
  @IsString()
  @Length(2, 80)
  zona?: string;

  @IsOptional()
  @Type(() => Date)
  @IsDate()
  fechaJuntada?: Date;

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(2)
  @Max(50)
  cupo?: number;
}

export function validarCamposSegunTipo(dto: CrearPublicacionDto) {
  const errores: string[] = [];

  if (dto.tipo === 'juntada') {
    if (dto.zona === undefined) {
      errores.push('zona es obligatoria en una juntada');
    }
    if (dto.fechaJuntada === undefined) {
      errores.push('fechaJuntada es obligatoria en una juntada');
    } else if (dto.fechaJuntada.getTime() <= Date.now()) {
      errores.push('fechaJuntada debe ser posterior al momento actual');
    }
    if (dto.jugadoresMin !== undefined || dto.jugadoresMax !== undefined) {
      errores.push('jugadoresMin y jugadoresMax no corresponden a una juntada');
    }
  } else {
    if (
      dto.zona !== undefined ||
      dto.fechaJuntada !== undefined ||
      dto.cupo !== undefined
    ) {
      errores.push('zona, fechaJuntada y cupo no corresponden a un juego');
    }
    if (
      dto.jugadoresMin !== undefined &&
      dto.jugadoresMax !== undefined &&
      dto.jugadoresMin > dto.jugadoresMax
    ) {
      errores.push('jugadoresMin no puede ser mayor que jugadoresMax');
    }
  }

  if (errores.length > 0) {
    throw new BadRequestException(errores);
  }
}
