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
  @IsString()
  @Length(2, 50)
  @Matches(/^[\p{L} ]+$/u, { message: 'nombre solo admite letras y espacios' })
  nombre: string;

  @IsString()
  @Length(2, 50)
  @Matches(/^[\p{L} ]+$/u, {
    message: 'apellido solo admite letras y espacios',
  })
  apellido: string;

  @IsEmail()
  correo: string;

  @IsString()
  @Length(3, 20)
  @Matches(/^[a-zA-Z0-9._]+$/, {
    message: 'nombreUsuario solo admite letras, números, punto y guion bajo',
  })
  nombreUsuario: string;

  @IsString()
  @Matches(REGEX_CONTRASENA, {
    message:
      'La contraseña debe tener al menos 8 caracteres, una mayúscula y un número',
  })
  contrasena: string;

  @IsString()
  repetirContrasena: string;

  @Type(() => Date)
  @IsDate()
  @MaxDate(finDeAyer, {
    message: 'fechaNacimiento debe ser anterior a hoy',
  })
  fechaNacimiento: Date;

  @IsOptional()
  @IsString()
  @MaxLength(200)
  descripcion?: string;
}
