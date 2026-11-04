import { IsEmail, IsString, Matches } from 'class-validator';

export class LoginDto {
  @IsEmail()
  correo: string;

  @IsString()
  @Matches(/^(?=.*[A-Z])(?=.*\d).{8,}$/, {
    message:
      'La contraseña debe tener al menos 8 caracteres, una mayúscula y un número',
  })
  contrasena: string;
}
