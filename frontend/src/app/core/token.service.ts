import { Injectable } from '@angular/core';

const CLAVE_TOKEN = 'token';

@Injectable({ providedIn: 'root' })
export class TokenService {
  guardar(token: string) {
    localStorage.setItem(CLAVE_TOKEN, token);
  }

  leer() {
    return localStorage.getItem(CLAVE_TOKEN);
  }

  borrar() {
    localStorage.removeItem(CLAVE_TOKEN);
  }
}
