export interface Paginado<T> {
  datos: T[];
  total: number;
  offset: number;
  limit: number;
}
