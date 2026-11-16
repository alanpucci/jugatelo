import { IsIn } from 'class-validator';
import { RegistroDto } from '../../auth/dto/registro.dto.js';
import { PERFILES, type Perfil } from '../esquemas/usuario.schema.js';

export class CrearUsuarioDto extends RegistroDto {
  @IsIn(PERFILES, { message: 'El perfil debe ser usuario o administrador' })
  perfil: Perfil;
}
