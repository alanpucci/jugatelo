import { Matches } from 'class-validator';

const REGEX_FECHA = /^\d{4}-\d{2}-\d{2}$/;

export class RangoFechasQueryDto {
  @Matches(REGEX_FECHA, { message: 'La fecha desde debe ser AAAA-MM-DD' })
  desde: string;

  @Matches(REGEX_FECHA, { message: 'La fecha hasta debe ser AAAA-MM-DD' })
  hasta: string;
}
