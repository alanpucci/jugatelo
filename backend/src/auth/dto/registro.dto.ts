import { Type } from 'class-transformer';
import {
  IsDate,
  IsEmail,
  IsOptional,
  IsString,
  Length,
  Matches,
  MaxDate,
  MaxLength,
} from 'class-validator';

const REGEX_CONTRASENA = /^(?=.*[A-Z])(?=.*\d).{8,}$/;

function finDeAyer() {
  const hoy = new Date();
  hoy.setHours(0, 0, 0, 0);
  return new Date(hoy.getTime() - 1);
}

export class RegistroDto {
  @IsString({ message: 'El nombre es obligatorio' })
  @Length(2, 50, { message: 'El nombre debe tener entre 2 y 50 caracteres' })
  @Matches(/^[\p{L} ]+$/u, {
    message: 'El nombre solo admite letras y espacios',
  })
  nombre: string;

  @IsString({ message: 'El apellido es obligatorio' })
  @Length(2, 50, { message: 'El apellido debe tener entre 2 y 50 caracteres' })
  @Matches(/^[\p{L} ]+$/u, {
    message: 'El apellido solo admite letras y espacios',
  })
  apellido: string;

  @IsEmail({}, { message: 'El correo no tiene un formato válido' })
  correo: string;

  @IsString({ message: 'El nombre de usuario es obligatorio' })
  @Length(3, 20, {
    message: 'El nombre de usuario debe tener entre 3 y 20 caracteres',
  })
  @Matches(/^[a-zA-Z0-9._]+$/, {
    message:
      'El nombre de usuario solo admite letras, números, punto y guion bajo',
  })
  nombreUsuario: string;

  @IsString({ message: 'La contraseña es obligatoria' })
  @Matches(REGEX_CONTRASENA, {
    message:
      'La contraseña debe tener al menos 8 caracteres, una mayúscula y un número',
  })
  contrasena: string;

  @IsString({ message: 'Tenés que repetir la contraseña' })
  repetirContrasena: string;

  @Type(() => Date)
  @IsDate({ message: 'La fecha de nacimiento no es válida' })
  @MaxDate(finDeAyer, {
    message: 'La fecha de nacimiento debe ser anterior a hoy',
  })
  fechaNacimiento: Date;

  @IsOptional()
  @IsString({ message: 'La descripción debe ser un texto' })
  @MaxLength(200, {
    message: 'La descripción no puede superar los 200 caracteres',
  })
  descripcion?: string;
}
