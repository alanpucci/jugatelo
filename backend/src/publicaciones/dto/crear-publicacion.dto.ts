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
  @IsIn(TIPOS_PUBLICACION, { message: 'El tipo debe ser juego o juntada' })
  tipo: TipoPublicacion;

  @IsString({ message: 'El título es obligatorio' })
  @Length(3, 100, { message: 'El título debe tener entre 3 y 100 caracteres' })
  titulo: string;

  @IsString({ message: 'La descripción es obligatoria' })
  @Length(1, 1000, {
    message: 'La descripción debe tener entre 1 y 1000 caracteres',
  })
  descripcion: string;

  @IsOptional()
  @Type(() => Number)
  @IsInt({ message: 'Los jugadores mínimos deben ser un número entero' })
  @Min(1, { message: 'Los jugadores mínimos deben ser al menos 1' })
  @Max(20, { message: 'Los jugadores mínimos no pueden ser más de 20' })
  jugadoresMin?: number;

  @IsOptional()
  @Type(() => Number)
  @IsInt({ message: 'Los jugadores máximos deben ser un número entero' })
  @Min(1, { message: 'Los jugadores máximos deben ser al menos 1' })
  @Max(20, { message: 'Los jugadores máximos no pueden ser más de 20' })
  jugadoresMax?: number;

  @IsOptional()
  @IsString({ message: 'La zona debe ser un texto' })
  @Length(2, 80, { message: 'La zona debe tener entre 2 y 80 caracteres' })
  zona?: string;

  @IsOptional()
  @Type(() => Date)
  @IsDate({ message: 'La fecha de la juntada no es válida' })
  fechaJuntada?: Date;

  @IsOptional()
  @Type(() => Number)
  @IsInt({ message: 'El cupo debe ser un número entero' })
  @Min(2, { message: 'El cupo debe ser al menos 2' })
  @Max(50, { message: 'El cupo no puede ser mayor a 50' })
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
