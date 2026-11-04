import { BadRequestException, Injectable, PipeTransform } from '@nestjs/common';

const REGEX_OBJECT_ID = /^[a-f\d]{24}$/i;

@Injectable()
export class ParseObjectIdPipe implements PipeTransform<string, string> {
  transform(valor: string) {
    if (!REGEX_OBJECT_ID.test(valor)) {
      throw new BadRequestException('El id no es válido');
    }
    return valor;
  }
}
