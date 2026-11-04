# Sprint 2 — Tareas

Objetivo: publicar juegos y juntadas, listarlos paginados con orden y filtros por tipo y zona, dar y quitar me gusta, dar de baja las propias y ver Mi Perfil con las últimas 3 publicaciones.
Referencias: Doc 1 = `1_analisis_funcional.md` · Doc 2 = `2_modelo_de_datos_mongodb.md` · Doc 3 = `3_roadmap_por_sprints.md` (sección 4).

Estados: `[ ]` pendiente · `[~]` implementada, esperando validación · `[x]` validada.
Cada tarea se valida antes de pasar a la siguiente. Orden: primero el back (se prueba con Thunder Client/Postman), después el front.

---

## Back

### [~] S2-01 · Back: esquemas, guard JWT y ParseObjectIdPipe
- **Qué:** esquemas `Publicacion` (con sus 6 índices) y `Comentario` registrados en `PublicacionesModule`; `JwtAuthGuard` y `AuthService.obtenerUsuarioDelToken(peticion)` (401 sin token válido, 403 si el usuario está deshabilitado); `ParseObjectIdPipe` para los `:id` (400 si es inválido).
- **Docs:** Doc 2 §5 y §6 · Doc 1 RN-05, RN-14, S-09 · Doc 3 §4.3.
- **Validar:** al arrancar aparecen las colecciones y los índices en Atlas; cualquier ruta de `/publicaciones` sin token → 401; `/publicaciones/abc` → 400.
- **Depende de:** S1-05

### [~] S2-02 · Back: crear publicación — POST /publicaciones (E-05)
- **Qué:** `CrearPublicacionDto` y `validarCamposSegunTipo` (RN-14); `FileInterceptor('imagen')` con el validador de imagen; subida a `jugatelo/publicaciones`; usuario tomado del token; se elimina la imagen si falla el guardado.
- **Docs:** Doc 1 CU-05, E-05, RN-14 · Doc 3 §4.3.
- **Validar:** juego válido y juntada válida → 201; juntada sin zona o con fecha pasada → 400; juego con zona → 400; `jugadoresMin` > `jugadoresMax` → 400; imagen de 3 MB o `.gif` → 400; el documento queda con `activa: true` y `cantidadMeGusta: 0`.
- **Depende de:** S2-01

### [~] S2-03 · Back: listar publicaciones — GET /publicaciones (E-06)
- **Qué:** `ListarPublicacionesQueryDto` y el pipeline del Doc 2 §7.1 y §7.3: filtros `usuarioId`, `tipo` y `zona` (regex escapada), orden por fecha o me gusta, `offset`/`limit`, `meGustaDado`, autor y comentarios opcionales.
- **Docs:** Doc 1 CU-06, CU-11, E-06 · Doc 2 §7.1 a §7.3.
- **Validar:** con 25 publicaciones, offset 0 → 10, offset 20 → 5 y `total: 25`; `orden=meGusta` ordena por `cantidadMeGusta` y desempata por fecha; `usuarioId` devuelve solo las de ese usuario; `tipo=juntada&zona=crespo` filtra sin distinguir mayúsculas; `tipo=otro` → 400.
- **Depende de:** S2-02

### [~] S2-04 · Back: me gusta — POST y DELETE /publicaciones/:id/me-gusta (E-09, E-10)
- **Qué:** updates atómicos con `findOneAndUpdate` (Doc 2 §7.4): `$addToSet` + `$inc` y `$pull` + `$inc` en la misma operación.
- **Docs:** Doc 1 CU-07, RN-04, S-13 · Doc 2 §7.4.
- **Validar:** dar me gusta → 201; repetirlo → 409 y el contador sube solo 1; quitarlo → 200; quitar uno no dado → 404; id inexistente → 404.
- **Depende de:** S2-02

### [~] S2-05 · Back: baja lógica — DELETE /publicaciones/:id (E-08)
- **Qué:** solo el autor o un administrador; `activa = false`; 404 si no existe o ya está dada de baja.
- **Docs:** Doc 1 CU-08, RN-05, S-14 · Doc 2 §7.5.
- **Validar:** borrar una ajena con perfil usuario → 403; borrar la propia → 200, desaparece del listado y en Atlas queda `activa: false`.
- **Depende de:** S2-02

---

## Front

> Se aplican las reglas de código del frontend (`frontend/CLAUDE.md`).

### [~] S2-06 · Front: base de publicaciones
- **Qué:** `tokenInterceptor` (Bearer y manejo del 401, RN-10); modelos `Publicacion` y `Paginado<T>`; `PublicacionesService` (crear, listar, eliminar, darMeGusta, quitarMeGusta); `PaginadorComponent`; pipes `tiempoRelativo` y `truncar`; directiva `appImagenRespaldo`; validadores `fechaPosteriorAAhora` y `jugadoresCoherentes`.
- **Docs:** Doc 1 §5 (pipes y directivas), RN-10 · Doc 3 §4.2.
- **Validar:** compila; se ejercita en S2-07 a S2-10.
- **Depende de:** S1-08

### [~] S2-07 · Front: listado, filtros y carta
- **Qué:** `PublicacionesComponent` con selectores de orden y tipo, campo de zona, paginador (10 por página) y estado vacío; `PublicacionCardComponent` con `input()`/`output()`, cifra y detalle por tipo, «Finalizada» en juntadas pasadas (S-29), descripción truncada e imagen con respaldo.
- **Docs:** Doc 1 CU-06, §6.4, RF-20, S-29 · Doc 3 §4.2.
- **Validar:** cambiar orden, tipo o zona vuelve a la página 1; Anterior/Siguiente cambian de página; «Página X de Y» es correcto; sin datos aparece el mensaje vacío.
- **Depende de:** S2-03, S2-06

### [~] S2-08 · Front: nueva publicación
- **Qué:** `NuevaPublicacionComponent` en modal con selector de tipo; los campos que no corresponden al tipo se deshabilitan; vista previa de imagen y validaciones de RN-14; `FormData` a E-05; al publicar recarga la página 1 por fecha.
- **Docs:** Doc 1 CU-05, §6.4, RN-14.
- **Validar:** el modal se ve completo y por encima de la barra; publicar un juego y una juntada con imagen → aparecen primeros en el listado; los errores del back salen en modal.
- **Depende de:** S2-02, S2-07

### [~] S2-09 · Front: me gusta y eliminar
- **Qué:** el corazón alterna E-09 y E-10 y actualiza el contador con la respuesta; «Eliminar» visible solo para el autor, con confirmación por `ModalService`; al borrar recarga y retrocede de página si quedó vacía.
- **Docs:** Doc 1 CU-07, CU-08.
- **Validar:** el contador sube y baja sin recargar; «Eliminar» no aparece en publicaciones ajenas; al confirmar desaparece del listado.
- **Depende de:** S2-04, S2-05, S2-07

### [~] S2-10 · Front: Mi Perfil
- **Qué:** datos y foto del usuario actual (con respaldo) y sus últimas 3 publicaciones con hasta 3 comentarios (E-06 con `usuarioId`, `limit = 3`, `comentarios = 3`); mensaje «Todavía no publicaste nada» si no hay.
- **Docs:** Doc 1 CU-11, §6.6, S-09, S-12.
- **Validar:** se ven las 3 publicaciones más recientes del usuario; la sección de comentarios dice «Sin comentarios» hasta el Sprint 3.
- **Depende de:** S2-03, S2-06

---

## Cierre del sprint

### [ ] S2-11 · Deploy y verificación del sprint
- **Qué:** publicar back y front con los cambios y recorrer los criterios de aceptación (Doc 3 §4.6) sobre la URL pública.
- **Validar:** todos los ítems de Doc 3 §4.6 tildados; búsqueda de `alert(` sin resultados.
- **Depende de:** S2-08, S2-09, S2-10
