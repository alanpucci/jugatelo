import {
  ArgumentsHost,
  Catch,
  ConflictException,
  ExceptionFilter,
} from '@nestjs/common';
import { MongoServerError } from 'mongodb';

const MENSAJES: Record<string, string> = {
  correo: 'Ese correo ya está registrado',
  nombreUsuario: 'Ese nombre de usuario ya existe',
};

@Catch(MongoServerError)
export class ClaveDuplicadaFilter implements ExceptionFilter {
  catch(error: MongoServerError, host: ArgumentsHost) {
    const respuesta = host.switchToHttp().getResponse();

    if (error.code !== 11000) {
      respuesta
        .status(500)
        .json({ statusCode: 500, message: 'Internal server error' });
      return;
    }

    const campo = Object.keys(error.keyPattern ?? {})[0];
    const excepcion = new ConflictException(
      MENSAJES[campo] ?? 'El registro ya existe',
    );
    respuesta.status(409).json(excepcion.getResponse());
  }
}
