import { IsEmail, IsString, Matches } from 'class-validator';

export class LoginDto {
  @IsEmail({}, { message: 'El correo no tiene un formato válido' })
  correo: string;

  @IsString({ message: 'La contraseña es obligatoria' })
  @Matches(/^(?=.*[A-Z])(?=.*\d).{8,}$/, {
    message:
      'La contraseña debe tener al menos 8 caracteres, una mayúscula y un número',
  })
  contrasena: string;
}
