# Sprint 4 — Tareas

Objetivo: funciones de administrador (baja de cualquier publicación, Dashboard Usuarios, Dashboard Estadísticas con gráficos de Chart.js), bloqueo de usuarios deshabilitados, PWA, 3 pipes y 3 directivas propias.
Referencias: Doc 1 = `1_analisis_funcional.md` · Doc 2 = `2_modelo_de_datos_mongodb.md` · Doc 3 = `3_roadmap_por_sprints.md` (sección 6).

Estados: `[ ]` pendiente · `[~]` implementada, esperando validación · `[x]` validada.
Cada tarea se valida antes de pasar a la siguiente. Orden: primero el back (se prueba con Thunder Client/Postman), después el front.

---

## Back

### [~] S4-01 · Back: usuarios de administrador y bloqueo de deshabilitados (E-02, E-14 a E-17)
- **Qué:** `AdminGuard`; `UsuariosController` con `@UseGuards(JwtAuthGuard, AdminGuard)`: GET, POST (multipart), DELETE `/:id` y POST `/:id/habilitar` (`@HttpCode(200)`); `CrearUsuarioDto` = `RegistroDto` + `perfil`; la lógica de alta (hash, unicidad, Cloudinary) pasa a `UsuariosService` y la usan el registro y E-15; login con `habilitado = false` → 403 con el mensaje de RN-07; DELETE con el propio id → 400 (S-17).
- **Docs:** Doc 1 RN-03, RN-07, CU-12, E-14 a E-17, S-16, S-17 · Doc 2 §7.8.
- **Validar:** con perfil usuario `GET /usuarios` → 403; con admin → 200 sin `contrasena`; POST con perfil «administrador» → 201; correo repetido → 409; `DELETE /usuarios/<mi id>` → 400; deshabilitar a otro → 200 y su login → 403; habilitarlo → 200 y vuelve a ingresar; `POST /auth/registro` con `perfil` → 400.
- **Depende de:** S3-01

### [~] S4-02 · Back: estadísticas — GET /estadisticas/* (E-18, E-19, E-20)
- **Qué:** `EstadisticasController` en `PublicacionesModule` con `@UseGuards(JwtAuthGuard, AdminGuard)`; `RangoFechasQueryDto` (desde ≤ hasta, hora de Argentina); aggregations del Doc 2 §7.7 (se usa `aggregate` porque `populate` no alcanza para `$group`). El índice `{ createdAt: 1 }` no va en los schemas (commit 1b298c1): se crea en Atlas.
- **Docs:** Doc 1 RF-36 a RF-39, CU-13, E-18 a E-20, S-14, S-18 · Doc 2 §7.7.
- **Validar:** con admin y un rango con datos → 200 con la forma del Doc 1; `desde > hasta` o fecha inválida → 400; con perfil usuario → 403; un comentario de una publicación dada de baja no cuenta.
- **Depende de:** S4-01

### [~] S4-03 · Back: baja de cualquier publicación por administrador (E-08)
- **Qué:** verificar que `DELETE /publicaciones/:id` acepta administradores y que los comentarios de una publicación dada de baja responden 404. Revisado en el código, sin cambios: `PublicacionesService.eliminar` permite al autor o a `perfil = administrador`, y los tres endpoints de comentarios llaman a `asegurarPublicacionActiva` (404).
- **Docs:** Doc 1 RF-25, E-08.
- **Validar:** el admin elimina una publicación ajena → 200; `GET /publicaciones/:id/comentarios` de esa publicación → 404.
- **Depende de:** S4-01

---

## Front

> Se aplican las reglas de código del frontend (`frontend/CLAUDE.md`).

### [~] S4-04 · Front: acceso de administrador y usuario deshabilitado
- **Qué:** `adminGuard` (se aplica a las rutas `/dashboard/*` cuando se crean en S4-05 y S4-06); directiva `appSoloAdmin` y enlace «Dashboard» en el navbar; botón «Eliminar» de carta y detalle también para administradores; `LoginComponent` y `tokenInterceptor` (el proyecto no tiene `errorInterceptor` aparte) muestran por `ModalService` el 403 de usuario deshabilitado y sacan la sesión.
- **Docs:** Doc 1 RN-07, S-16 · Doc 3 §6.2.
- **Validar:** con perfil usuario el enlace no aparece y `/dashboard/usuarios` redirige a `/publicaciones`; el admin ve «Eliminar» en publicaciones ajenas; un deshabilitado ve el mensaje al loguearse y con sesión abierta es sacado en la siguiente petición.
- **Depende de:** S4-01

### [~] S4-05 · Front: Dashboard Usuarios
- **Qué:** `UsuariosService`; pipe `nombreCompleto`; ruta `/dashboard/usuarios` con `authGuard` y `adminGuard`; `DashboardUsuariosComponent` con tabla, Deshabilitar / Habilitar con confirmación (no sobre uno mismo) y «Nuevo usuario»; `FormularioUsuarioComponent` en modo admin con radio buttons de perfil.
- **Docs:** Doc 1 CU-12, §6.7 · Doc 3 §6.2.
- **Validar:** el listado coincide con la base; alta de admin → fila nueva; deshabilitar/habilitar cambia el estado; la fila propia no tiene acción.
- **Depende de:** S4-01, S4-04

### [ ] S4-06 · Front: Dashboard Estadísticas con Chart.js
- **Qué:** instalar `chart.js`; `EstadisticasService`; `DashboardEstadisticasComponent` con filtro desde/hasta (defecto últimos 30 días), `forkJoin` de E-18, E-19 y E-20, y tres gráficos (barras, líneas, dona) dibujados con Chart.js.
- **Docs:** Doc 1 CU-13, §6.8, RF-36 a RF-40 · Doc 3 §6.2.
- **Validar:** cambiar el lapso modifica los tres gráficos; `desde > hasta` muestra validación; sin datos aparece «Sin datos en el período».
- **Depende de:** S4-02, S4-04

### [ ] S4-07 · Front: PWA
- **Qué:** `ng add @angular/pwa`; manifest «Jugátelo» con colores e íconos; `ngsw-config` sin cachear `/auth/*`.
- **Docs:** Doc 1 RNF-04 · Doc 3 §6.2.
- **Validar:** build de producción servido por HTTPS aparece como instalable en Lighthouse.
- **Depende de:** S4-04

### [ ] S4-08 · Front: pipes, directivas y repaso visual
- **Qué:** revisar `tiempoRelativo`, `truncar`, `nombreCompleto`, `appSoloAdmin`, `appImagenRespaldo`, `appMostrarContrasena`; repaso de uniformidad (RNF-01).
- **Docs:** Doc 3 §6.2.
- **Validar:** los 3 pipes y las 3 directivas se usan en al menos una pantalla.
- **Depende de:** S4-05, S4-06

---

## Cierre del sprint

### [ ] S4-09 · Deploy y verificación del sprint
- **Qué:** publicar back y front y recorrer los criterios de aceptación (Doc 3 §6.6) sobre la URL pública.
- **Validar:** todos los ítems de Doc 3 §6.6 tildados; búsqueda de `alert(` sin resultados.
- **Depende de:** S4-03, S4-07, S4-08
