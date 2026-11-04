# Sprint 3 — Tareas

Objetivo: pantalla Publicación con comentarios (agregar, editar, cargar más) y JWT completo: token en localStorage, pantalla Cargando con `/auth/autorizar`, aviso de sesión con refresco y redirección ante 401.
Referencias: Doc 1 = `1_analisis_funcional.md` · Doc 2 = `2_modelo_de_datos_mongodb.md` · Doc 3 = `3_roadmap_por_sprints.md` (sección 5).

Estados: `[ ]` pendiente · `[~]` implementada, esperando validación · `[x]` validada.
Cada tarea se valida antes de pasar a la siguiente. Orden: primero el back (se prueba con Thunder Client/Postman), después el front.

---

## Back

### [~] S3-01 · Back: autorizar y refrescar — POST /auth/autorizar y /auth/refrescar (E-03, E-04)
- **Qué:** `autorizar` devuelve `{ usuario }` detrás de `JwtAuthGuard`; `refrescar` firma un token nuevo con la misma payload y 15 min. Ambos con `@HttpCode(200)`. Confirmar que el guard responde 401 ante token ausente, mal formado, con firma inválida o vencido.
- **Docs:** Doc 1 CU-03, E-03, E-04, RN-10 · Doc 3 §5.3.
- **Validar:** con token válido → 200 con `usuario` / `token`; el token decodificado tiene `{ sub, correo, nombreUsuario, perfil }` y `exp − iat = 900`; sin token, con token alterado o vencido → 401.
- **Depende de:** S1-05

### [~] S3-02 · Back: detalle de publicación — GET /publicaciones/:id (E-07)
- **Qué:** pipeline del Doc 2 §7.1 con `$match` por `_id`; `meGustaDado`, autor y datos de la publicación; 404 si no existe o `activa = false`.
- **Docs:** Doc 1 E-07, S-08 · Doc 2 §7.1.
- **Validar:** id válido → 200; id inexistente o dado de baja → 404; `/publicaciones/abc` → 400; sin token → 401.
- **Depende de:** S2-03

### [~] S3-03 · Back: comentarios — GET, POST y PUT (E-11, E-12, E-13)
- **Qué:** `ComentariosController` en `PublicacionesModule`; `CrearComentarioDto` / `EditarComentarioDto` (mensaje 1–500) y `PaginacionQueryDto` (offset 0, limit 5); listado de más reciente a más antiguo con autor populado; PUT solo para el autor y marca `modificado = true`.
- **Docs:** Doc 1 CU-09, CU-10, E-11 a E-13, RN-06 · Doc 2 §7.6.
- **Validar:** comentarios de a 5 del más reciente al más antiguo; mensaje vacío o de más de 500 → 400; editar uno ajeno → 403, el propio → 200 con `modificado: true`; publicación dada de baja → 404 en los tres.
- **Depende de:** S3-02

---

## Front

> Se aplican las reglas de código del frontend (`frontend/CLAUDE.md`).

### [~] S3-04 · Front: sesión, Cargando y manejo del 401
- **Qué:** `TokenService` con localStorage (clave `token`) y decodificación de `exp`; `CargandoComponent` (Spinner + E-03) como ruta inicial `/cargando`; activar `authGuard` e `invitadoGuard`; `tokenInterceptor` con 401 → borrar token, detener `SesionService`, modal y `/login`.
- **Docs:** Doc 1 CU-03, RN-10 · Doc 3 §5.2.
- **Validar:** recargar con token válido → Cargando → `/publicaciones`; sin token → `/login`; token alterado → 401 en la próxima petición, aviso y `/login`; `/mi-perfil` sin sesión redirige al login.
- **Depende de:** S3-01

### [ ] S3-05 · Front: aviso de vencimiento y extensión de sesión
- **Qué:** `SesionService` programa el aviso en (exp − 5 min); modal «¿Querés extender tu sesión?»; Sí → E-04 y reprograma; No → cierre al vencer (S-15); revisión al volver a la pestaña (`visibilitychange`); variable de entorno que acorta los tiempos en desarrollo.
- **Docs:** Doc 1 RF-10, S-15 · Doc 3 §5.2.
- **Validar:** a los 10 min del login aparece el modal; «Extender» entrega un token nuevo y reprograma; «No» cierra la sesión al vencer.
- **Depende de:** S3-04

### [ ] S3-06 · Front: pantalla Publicación
- **Qué:** ruta `/publicaciones/:id` con `PublicacionComponent` (E-07) reutilizando la carta; la carta del listado enlaza al detalle; 404 se informa por `ModalService`.
- **Docs:** Doc 1 CU-09, §6.5 · Doc 3 §5.2.
- **Validar:** desde el listado se abre el detalle; una publicación dada de baja muestra el aviso y vuelve al listado.
- **Depende de:** S3-02

### [ ] S3-07 · Front: comentarios
- **Qué:** `ComentariosComponent` (carga inicial offset 0 / limit 5, «Cargar más» acumulativo con descarte de repetidos por `_id`, oculto cuando cargados = total); `ComentarioItemComponent` con «(editado)» y edición en línea solo para el autor; formulario de nuevo comentario (1–500) con inserción al inicio.
- **Docs:** Doc 1 CU-09, CU-10, RN-06 · Doc 2 §7.6 · Doc 3 §5.2.
- **Validar:** llegan de a 5 del más reciente al más antiguo; «Cargar más» agrega sin borrar; editar el propio muestra «(editado)»; los ajenos no tienen botón de edición.
- **Depende de:** S3-03, S3-06

### [ ] S3-08 · Front: Mi Perfil con comentarios reales
- **Qué:** reemplazar «Sin comentarios» por los comentarios reales de cada publicación.
- **Docs:** Doc 1 CU-11, §6.6.
- **Validar:** las últimas 3 publicaciones muestran hasta 3 comentarios reales.
- **Depende de:** S3-03

---

## Cierre del sprint

### [ ] S3-09 · Deploy y verificación del sprint
- **Qué:** publicar back y front y recorrer los criterios de aceptación (Doc 3 §5.6) sobre la URL pública.
- **Validar:** todos los ítems de Doc 3 §5.6 tildados; búsqueda de `alert(` sin resultados.
- **Depende de:** S3-05, S3-07, S3-08
