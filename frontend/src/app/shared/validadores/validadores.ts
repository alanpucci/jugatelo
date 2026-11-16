import { AbstractControl, ValidationErrors, ValidatorFn } from '@angular/forms';

const REGEX_CONTRASENA = /^(?=.*[A-Z])(?=.*\d).{8,}$/;

export const contrasenaSegura: ValidatorFn = (control: AbstractControl): ValidationErrors | null => {
  if (!control.value) {
    return null;
  }
  return REGEX_CONTRASENA.test(control.value) ? null : { contrasenaDebil: true };
};

export function contrasenasIguales(campo: string, campoRepetido: string): ValidatorFn {
  return (grupo: AbstractControl): ValidationErrors | null => {
    const contrasena = grupo.get(campo)?.value;
    const repetida = grupo.get(campoRepetido)?.value;
    return contrasena === repetida ? null : { contrasenasDistintas: true };
  };
}

export const fechaAnteriorAHoy: ValidatorFn = (control: AbstractControl): ValidationErrors | null => {
  if (!control.value) {
    return null;
  }
  const hoy = new Date().toISOString().slice(0, 10);
  return control.value < hoy ? null : { fechaFutura: true };
};

export const fechaPosteriorAAhora: ValidatorFn = (control: AbstractControl): ValidationErrors | null => {
  if (!control.value) {
    return null;
  }
  return new Date(control.value).getTime() > Date.now() ? null : { fechaPasada: true };
};

export const jugadoresCoherentes: ValidatorFn = (grupo: AbstractControl): ValidationErrors | null => {
  const minimo = grupo.get('jugadoresMin')?.value;
  const maximo = grupo.get('jugadoresMax')?.value;
  if (minimo == null || maximo == null || minimo === '' || maximo === '') {
    return null;
  }
  return Number(minimo) <= Number(maximo) ? null : { jugadoresIncoherentes: true };
};

export function fechaLocal(fecha: Date) {
  const mes = String(fecha.getMonth() + 1).padStart(2, '0');
  const dia = String(fecha.getDate()).padStart(2, '0');
  return `${fecha.getFullYear()}-${mes}-${dia}`;
}

export const hastaNoFutura: ValidatorFn = (control: AbstractControl): ValidationErrors | null => {
  if (!control.value) {
    return null;
  }
  return control.value <= fechaLocal(new Date()) ? null : { fechaFutura: true };
};

export function desdeAntesDeHasta(campoDesde: string, campoHasta: string): ValidatorFn {
  return (grupo: AbstractControl): ValidationErrors | null => {
    const desde = grupo.get(campoDesde)?.value;
    const hasta = grupo.get(campoHasta)?.value;
    if (!desde || !hasta) {
      return null;
    }
    return desde <= hasta ? null : { rangoInvalido: true };
  };
}
