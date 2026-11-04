# Sprint 1 — Tareas

Objetivo: registro y login funcionando contra el back propio (Atlas + Cloudinary), pantallas base con navegación libre, favicon y deploy.
Referencias: Doc 1 = `1_analisis_funcional.md` · Doc 2 = `2_modelo_de_datos_mongodb.md` · Doc 3 = `3_roadmap_por_sprints.md` (sección 3).

Estados: `[ ]` pendiente · `[~]` implementada, esperando validación · `[x]` validada.
Cada tarea se valida antes de pasar a la siguiente. Orden: primero el back (se prueba con Thunder Client/Postman), después el front.

---

## Back

### [~] S1-01 · Back: base del proyecto y conexión a Atlas
- **Qué:** `ConfigModule` global con `.env` y `.env.example` (`.env` ignorado por git), `ValidationPipe` global (`whitelist`, `forbidNonWhitelisted`, `transform`), CORS con `FRONT_URL`, puerto desde `PORT`, y `MongooseModule.forRootAsync` leyendo `MONGODB_URI`.
- **Requiere acción tuya:** crear el cluster gratuito en Atlas, un usuario de base con permisos solo sobre la base `jugatelo` y habilitar el acceso de red. La URI la cargás vos en `.env`, nunca en el chat ni en el repo (Doc 2 §8.1).
- **Concepto clave:** variables de entorno, conexión asíncrona a la base y el pipeline de validación de Nest.
- **Docs:** Doc 3 §3.3 (primeros ítems) · Doc 1 RNF-08, RNF-09 · Doc 2 §8.1.
- **Validar:** `npm run start:dev` arranca y conecta a Atlas sin errores.
- **Depende de:** —

### [~] S1-02 · Back: usuarios (esquema, índices y servicio)
- **Qué:** `usuario.schema.ts` con todos los campos (`habilitado` incluido) e índices únicos de `correo` y `nombreUsuario` (collation `es`, strength 2); `UsuariosModule` y `UsuariosService` con búsqueda por correo (con `+contrasena`), búsqueda por nombreUsuario (con collation) y creación; función que mapea un usuario a la respuesta sin `contrasena` ni `imagenPerfilPublicId` (RN-09).
- **Concepto clave:** esquemas con decoradores, `select: false` y por qué el login necesita `+contrasena`.
- **Docs:** Doc 2 §4 completo · Doc 1 §7.1 (formato de usuario).
- **Validar:** al arrancar aparecen la colección `usuarios` y sus índices únicos en Atlas (pestaña Indexes).
- **Depende de:** S1-01

### [~] S1-03 · Back: Cloudinary, validación de imágenes y filtro de duplicados
- **Qué:** `CloudinaryModule` + `CloudinaryService.subirImagen(buffer, carpeta)` (devuelve `secure_url` y `public_id`) y `eliminarImagen(publicId)`; validador de imagen reutilizable (JPG/PNG/WEBP, máx. 2 MB) con `ParseFilePipe`; filtro de excepción que traduce el error E11000 de Mongo a 409.
- **Requiere acción tuya:** crear la cuenta gratuita de Cloudinary y cargar las variables `CLOUDINARY_*` en `.env`.
- **Concepto clave:** subir desde memoria (buffer) sin guardar archivos en disco; pipes y filtros de excepciones en Nest.
- **Docs:** Doc 1 RN-12, S-23, §1.3 · Doc 2 §4.4 (nota E11000) · Doc 3 §3.3.
- **Validar:** se ejercita completo en S1-04. Acá se verifica que compila y arranca.
- **Depende de:** S1-01

### [~] S1-04 · Back: registro — POST /auth/registro (E-01)
- **Qué:** `RegistroDto` (RN-01, S-07, S-24; sin campo `perfil`, RN-03) y interfaz `JwtPayload { id, correo, nombreUsuario, perfil }`; `AuthModule` con `JwtModule` (`expiresIn: '15m'`, secreto de `JWT_SECRET`), `AuthController` y `AuthService.registrar`: valida igualdad de contraseñas, verifica unicidad (409), `bcrypt.hash(…, 10)`, sube la imagen opcional a `jugatelo/perfiles`, guarda, firma el token y responde 201 `{ usuario, token }`. Si falla el guardado tras subir la imagen, elimina la imagen.
- **Concepto clave:** flujo completo de un endpoint (controller → service → modelo), DTOs con class-validator y hash de contraseñas.
- **Docs:** Doc 1 CU-01, E-01, RF-01 a RF-05, RN-01, RN-03 · Doc 3 §3.3, §3.6, §7.3.
- **Validar:** con Thunder Client: registro válido → 201 y documento en Atlas con `$2b$` e `imagenPerfilUrl` de Cloudinary; correo o nombreUsuario duplicado → 409; contraseña «abcdefgh» o «abc12345» → 400; `perfil=administrador` → 400; imagen de 3 MB o `.gif` → 400.
- **Depende de:** S1-02, S1-03

### [~] S1-05 · Back: login — POST /auth/login (E-02)
- **Qué:** `LoginDto` y `AuthService.login` con `@HttpCode(200)`: busca por correo con `+contrasena`, `bcrypt.compare`, 401 con mensaje único si falla, responde `{ usuario, token }`.
- **Concepto clave:** por qué el mensaje de error no revela si falló el correo o la contraseña.
- **Docs:** Doc 1 CU-02, E-02, RF-06.
- **Validar:** login correcto → 200 sin `contrasena`; contraseña errónea y correo inexistente → 401 con el mismo mensaje.
- **Depende de:** S1-04

---

## Front

> Se aplican las reglas de código del frontend (estructura por `features/`, `core/`, `shared/`, `layout/`; signals sin `computed()`; `input()`/`output()` con default; 3 archivos por componente; sin comentarios; código en español).

### [~] S1-06 · Front: base — estilos, entornos, HttpClient y modal
- **Qué:** variables globales (paleta, tipografía, espaciados) y estilos base de botones y formularios en `styles.css`; `environment.ts` / `environment.prod.ts` con `apiUrl`; `provideHttpClient` en `app.config.ts`; `ModalService` (estado con signal) y `ModalComponent` único para info, error y confirmación (la confirmación devuelve la decisión del usuario).
- **Concepto clave:** variables CSS globales, configuración por entorno y servicio + signal como estado global en una app zoneless.
- **Docs:** Doc 1 RNF-01, RNF-02 · Doc 3 §3.2.
- **Validar:** `ng serve` arranca; un botón de prueba temporal abre los tres tipos de modal (se borra al terminar).
- **Depende de:** —

### [~] S1-07 · Front: layout, Navbar y rutas con pantallas vacías
- **Qué:** `NavbarComponent`; rutas `/`, `/login`, `/registro`, `/publicaciones`, `/mi-perfil` y `**` sin guards (S-07), con componentes vacíos.
- **Concepto clave:** routing standalone y redirecciones.
- **Docs:** Doc 1 §6 (tabla de rutas), RF-14 · Doc 3 §3.2.
- **Validar:** se navega entre las cuatro pantallas sin recargar; `/` redirige a `/login`; una ruta inexistente va a `/publicaciones`.
- **Depende de:** S1-06

### [~] S1-08 · Front: núcleo de autenticación
- **Qué:** modelo `Usuario` y tipos de respuesta de auth; validadores propios `contrasenaSegura` (RN-01) y `contrasenasIguales`; `TokenService` (guardar/leer/borrar token en localStorage); `AuthService` (`registrar`, `login`, signal `usuarioActual`) que llama a E-01 y E-02.
- **Concepto clave:** servicios transversales en `core/`, estado con signals y validadores de formularios reactivos.
- **Docs:** Doc 1 E-01, E-02, RN-01, §1.3, §7.1 · Doc 2 §9 · Doc 3 §3.2.
- **Validar:** compila; se ejercita en S1-09 y S1-10.
- **Depende de:** S1-06, S1-05

### [~] S1-09 · Front: pantalla de registro
- **Qué:** `FormularioUsuarioComponent` reutilizable (nombre, apellido, correo, nombreUsuario, contraseña, repetir, fecha de nacimiento, descripción con contador, imagen con vista previa; mensajes por campo; `input()` para el modo admin con valor por defecto; `output()` que emite los datos) y `RegistroComponent`, que arma el `FormData`, llama a `AuthService.registrar`, maneja 409/400 con modal, guarda el token y navega a `/publicaciones`.
- **Concepto clave:** formularios reactivos, componentes con `input()`/`output()` y `FormData` con archivos.
- **Docs:** Doc 1 CU-01, §6.3 · Doc 3 §3.2.
- **Validar:** registrar un usuario real contra el back local; ver el documento en Atlas y la imagen en Cloudinary; probar el 409 y las validaciones.
- **Depende de:** S1-07, S1-08

### [~] S1-10 · Front: pantalla de login
- **Qué:** `LoginComponent` con correo + contraseña, mensajes de validación, spinner en el botón, 401 en modal, token guardado y navegación a `/publicaciones`.
- **Concepto clave:** consumo de un POST JSON y estados de carga con signals.
- **Docs:** Doc 1 CU-02, §6.2.
- **Validar:** login correcto → `/publicaciones`; credenciales erróneas → modal.
- **Depende de:** S1-07, S1-08

### [~] S1-11 · Front: maquetas de Publicaciones y Mi Perfil, favicon y título
- **Qué:** las dos pantallas con el diseño final y datos de ejemplo fijos (sin API; Mi Perfil muestra los datos de `usuarioActual`), favicon propio y título de la app.
- **Requiere acción tuya:** elegir o aportar el ícono.
- **Concepto clave:** maquetar con el estado ya existente.
- **Docs:** Doc 1 §6.4, §6.6, RNF-03 · Doc 3 §3.2.
- **Validar:** se ven coherentes con el resto de la app y la pestaña muestra el ícono.
- **Depende de:** S1-08, S1-07

---

## Cierre del sprint

### [ ] S1-12 · Deploy del back
- **Qué:** publicar el back en el hosting elegido con sus variables de entorno.
- **Requiere acción tuya:** elegir hosting (Render, Railway, Koyeb…) y crear la cuenta; yo guío y preparo lo necesario en el repo.
- **Validar:** E-01 y E-02 con Thunder Client contra la URL pública.
- **Depende de:** S1-05

### [ ] S1-13 · Deploy del front y verificación del sprint
- **Qué:** publicar el front con fallback de SPA y `apiUrl` de producción; anotar las URLs en los README; recorrer los criterios de aceptación (Doc 3 §3.6) y la definición de terminado (Doc 3 §1.1) sobre la URL pública.
- **Requiere acción tuya:** elegir hosting (Vercel, Netlify, Firebase…).
- **Validar:** registro y login funcionan desde la URL pública; todos los ítems tildados; búsqueda de `alert(` sin resultados.
- **Depende de:** S1-10, S1-11, S1-12
