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

  leerExpiracion() {
    const token = this.leer();
    if (!token) {
      return null;
    }
    try {
      const base64 = token.split('.')[1].replace(/-/g, '+').replace(/_/g, '/');
      const payload = JSON.parse(atob(base64)) as { exp?: number };
      return payload.exp ? payload.exp * 1000 : null;
    } catch {
      return null;
    }
  }
}
