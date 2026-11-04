# Jugátelo

Red social de juegos de mesa. Los usuarios publican los juegos que tienen, arman juntadas en su zona, y comentan y dan «Me gusta» a las publicaciones de los demás.

- **Frontend:** Angular 22 (standalone, zoneless, signals) en [frontend/](frontend/)
- **Backend:** NestJS 12 + MongoDB Atlas (Mongoose) + JWT + Cloudinary en [backend/](backend/)
- **Documentación funcional:** [docs/](docs/) (análisis funcional, modelo de datos, roadmap por sprints y tareas)

## Arquitectura general

```
┌────────────────────────┐   HTTP/JSON + multipart    ┌─────────────────────────┐
│  Frontend (Angular)    │ ─────────────────────────▶ │  Backend (NestJS)       │
│  SPA, rutas lazy       │  Authorization: Bearer JWT │  API REST sin estado    │
│  token en localStorage │ ◀───────────────────────── │                         │
└────────────────────────┘                            └───────┬─────────┬───────┘
                                                              │         │
                                                   Mongoose   │         │  SDK
                                                              ▼         ▼
                                                     MongoDB Atlas   Cloudinary
                                                     (datos)         (imágenes)
```

- Arquitectura **cliente-servidor desacoplada**: una SPA consume una API REST.
- El backend es **stateless**: la sesión se mantiene con un JWT firmado, sin sesiones en servidor.
- Las imágenes (perfil y publicaciones) no se guardan en la base: se suben a Cloudinary y en MongoDB se persisten la URL y el `publicId` (para poder eliminarlas).

---

## Backend (`backend/`)

**Stack:** NestJS 12, TypeScript, Mongoose 9, `@nestjs/jwt`, bcrypt, class-validator / class-transformer, multer (memoria), Cloudinary. Tests con Vitest, lint con oxlint, ESM (`"type": "module"`).

### Estructura modular

Arquitectura en capas por módulos de dominio (Controller → Service → Schema):

```
backend/src/
├── main.ts                  Bootstrap: ValidationPipe global y CORS
├── app.module.ts            Módulo raíz: ConfigModule, MongooseModule, filtro global
├── auth/                    Registro, login, autorización y refresco de token
│   ├── dto/                 LoginDto, RegistroDto
│   ├── guards/              JwtAuthGuard
│   └── interfaces/          JwtPayload
├── usuarios/                Acceso a datos de usuarios (sin controller)
│   └── esquemas/            usuario.schema.ts
├── publicaciones/           Publicaciones (juegos / juntadas), Me gusta y comentarios
│   ├── dto/                 DTOs de creación, filtros y paginación
│   ├── esquemas/            publicacion.schema.ts, comentario.schema.ts
│   ├── publicaciones.controller.ts / .service.ts
│   └── comentarios.controller.ts / .service.ts
├── cloudinary/              Wrapper del SDK para subir/eliminar imágenes
└── comun/                   Piezas transversales
    ├── filtros/             ClaveDuplicadaFilter (error 11000 de Mongo → 409)
    ├── pipes/               ParseObjectIdPipe
    └── validadores/         Validación de imagen (≤ 2 MB, jpeg/png/webp)
```

### Módulos y dependencias

| Módulo | Responsabilidad | Depende de |
| --- | --- | --- |
| `AuthModule` | Endpoints `/auth/*`, firma y verificación de JWT, guard | `UsuariosModule`, `CloudinaryModule`, `JwtModule` |
| `UsuariosModule` | Persistencia de usuarios (`UsuariosService`) | Mongoose |
| `PublicacionesModule` | CRUD de publicaciones, Me gusta, comentarios | `AuthModule`, `CloudinaryModule`, Mongoose |
| `CloudinaryModule` | Subida y borrado de imágenes | SDK de Cloudinary |

### Decisiones de diseño

- **Autenticación JWT propia** (`JwtAuthGuard` + `AuthService.obtenerUsuarioDelToken`): el guard verifica el token y además consulta al usuario en base para confirmar que existe y está `habilitado`. El controlador vuelve a obtener el usuario para pasarlo al servicio.
- **Renovación de sesión:** `POST /auth/autorizar` devuelve el usuario del token vigente y `POST /auth/refrescar` emite un token nuevo. La expiración se configura con `JWT_EXPIRES_IN` (por defecto 15 min en desarrollo y 1 min en producción).
- **Validación en el borde:** `ValidationPipe` global con `whitelist`, `forbidNonWhitelisted` y `transform`; todo input entra por DTOs con class-validator. Los ids de ruta se validan con `ParseObjectIdPipe`.
- **Manejo de errores:** `ClaveDuplicadaFilter` (global, vía `APP_FILTER`) traduce los errores de índice único de MongoDB en `409 Conflict` con mensajes de dominio.
- **Subida de archivos:** `FileInterceptor` con `memoryStorage` (el archivo vive en memoria y se reenvía a Cloudinary); la validación de tamaño y tipo real (magic numbers) está en `crearPipeImagen()`. Si falla el alta del usuario luego de subir la imagen, se compensa eliminándola de Cloudinary.
- **Contraseñas:** hash con bcrypt (10 rondas); el campo `contrasena` tiene `select: false` en el esquema.
- **Borrado lógico:** las publicaciones tienen el flag `activa`; los usuarios, `habilitado`.
- **Unicidad case-insensitive** del nombre de usuario mediante índice con `collation` (`es`, strength 2); el correo se normaliza en minúsculas.

### Modelo de datos (MongoDB)

| Colección | Campos principales |
| --- | --- |
| `usuarios` | nombre, apellido, correo (único), nombreUsuario (único), contrasena (hash), fechaNacimiento, descripcion, imagenPerfilUrl / PublicId, perfil (`usuario` \| `administrador`), habilitado |
| `publicaciones` | tipo (`juego` \| `juntada`, inmutable), titulo, descripcion, jugadoresMin/Max, zona, fechaJuntada, cupo, imagenUrl / PublicId, usuario (ref), meGusta (array de refs), cantidadMeGusta, activa |
| `comentarios` | publicacion (ref), usuario (ref), mensaje (≤ 500), modificado |

Todas con `timestamps`. Las relaciones son por referencia (`ObjectId`); los «Me gusta» se embeben como array de usuarios con un contador desnormalizado (`cantidadMeGusta`) para ordenar rápido.

### API REST

Todas las rutas, salvo registro y login, requieren `Authorization: Bearer <token>`.

| Método | Ruta | Descripción |
| --- | --- | --- |
| POST | `/auth/registro` | Alta de usuario (multipart, `imagenPerfil` opcional) |
| POST | `/auth/login` | Devuelve usuario + token |
| POST | `/auth/autorizar` | Valida el token y devuelve el usuario |
| POST | `/auth/refrescar` | Emite un token nuevo |
| GET | `/publicaciones` | Listado paginado (`orden`, `tipo`, `zona`, `usuarioId`, `offset`, `limit`) |
| GET | `/publicaciones/proximas-juntadas` | Próximas juntadas (`limit`) |
| GET | `/publicaciones/:id` | Detalle |
| POST | `/publicaciones` | Crear (multipart, `imagen` opcional) |
| DELETE | `/publicaciones/:id` | Eliminar (baja lógica) |
| POST / DELETE | `/publicaciones/:id/me-gusta` | Dar / quitar «Me gusta» |
| GET / POST | `/publicaciones/:id/comentarios` | Listar (paginado) / crear |
| PUT | `/publicaciones/:id/comentarios/:comentarioId` | Editar comentario |

### Variables de entorno (`backend/.env`)

```
PORT=3000
FRONT_URL=http://localhost:4200
MONGODB_URI=mongodb+srv://USUARIO:CONTRASENA@CLUSTER.mongodb.net/jugatelo
JWT_SECRET=
JWT_EXPIRES_IN=            # opcional (15m dev / 1m prod por defecto)
CLOUDINARY_CLOUD_NAME=
CLOUDINARY_API_KEY=
CLOUDINARY_API_SECRET=
```

### Comandos

```bash
cd backend
npm install
npm run start:dev    # desarrollo con watch
npm run build && npm run start:prod
npm test             # unit tests (Vitest)
npm run test:e2e
npm run lint
```

---

## Frontend (`frontend/`)

**Stack:** Angular 22, standalone components (sin NgModules), **zoneless** con **signals**, `HttpClient` con interceptor funcional, Router con rutas lazy, formularios reactivos, Vitest + jsdom.

### Estructura por capas

```
frontend/src/app/
├── app.config.ts       Providers: HttpClient + tokenInterceptor, Router, inicializador de SesionService
├── app.routes.ts       Rutas con loadComponent (lazy) y guards
├── core/               Servicios singleton y lógica transversal
│   ├── auth.service.ts       Usuario actual (signal), login, registro, logout
│   ├── token.service.ts      Lectura/escritura del JWT en localStorage y su expiración
│   ├── token.interceptor.ts  Agrega Bearer; ante 401 cierra sesión y avisa
│   ├── auth.guard.ts         authGuard / invitadoGuard
│   ├── sesion.service.ts     Temporizadores de aviso y vencimiento de sesión
│   ├── modal.service.ts      Modales de confirmación y error
│   └── *.model.ts            Tipos compartidos (auth, paginado)
├── features/           Una carpeta por dominio funcional
│   ├── autenticacion/        cargando, login, registro
│   ├── publicaciones/        listado, detalle, card, nueva publicación, mi mesa,
│   │                         próximas juntadas, comentarios (+ modal), servicios y modelos
│   ├── perfil/               mi-perfil
│   └── usuarios/             formulario-usuario reutilizable
├── layout/navbar/      Barra de navegación
└── shared/             Componentes y utilidades reutilizables y sin dominio
    ├── modal, spinner, paginador
    ├── pipes (tiempo-relativo, truncar)
    ├── directivas (imagen-respaldo)
    └── validadores
```

Regla de dependencias: `features` → `core` / `shared`; `core` y `shared` no dependen de `features`.

### Decisiones de diseño

- **Componentes standalone + lazy loading:** cada pantalla se carga bajo demanda con `loadComponent`.
- **Estado con signals:** el estado de UI (listas, filtros, paginación, usuario actual) vive en `signal`s dentro de componentes y servicios `providedIn: 'root'`; no hay librería de estado externa.
- **Servicios por feature:** `PublicacionesService` y `ComentariosService` encapsulan las llamadas HTTP; los componentes no usan `HttpClient` directamente.
- **Sesión:**
  - El JWT se guarda en `localStorage` (`TokenService`) y el interceptor lo adjunta a cada request.
  - `authGuard` protege las rutas privadas; `invitadoGuard` impide entrar a login/registro con sesión.
  - Si hay token pero aún no se cargó el usuario, se redirige a `/cargando`, que valida el token contra `/auth/autorizar` y retoma el `destino` original.
  - `SesionService` lee la expiración del token, avisa antes de que venza (`avisoAntesDeVencerMs`) ofreciendo extenderla vía `/auth/refrescar`, y cierra la sesión al vencer. Un `effect` con `onCleanup` gestiona los temporizadores.
  - Ante cualquier `401`, el interceptor cierra la sesión y muestra el aviso.
- **Precarga durante «Cargando»:** mientras se valida la sesión, `PublicacionesService.precargar()` trae la primera página de publicaciones y las próximas juntadas en paralelo; el listado las consume una sola vez (`tomarPaginaPrecargada`) y evita el doble pedido.
- **Paginación por `offset`/`limit`** con un `PaginadorComponent` compartido y el tipo genérico `Paginado<T>`.
- **Configuración por entorno:** `src/environments/environment.ts` (dev: API local, aviso a 14 min) y `environment.prod.ts` (API desplegada, aviso a 30 s, acorde al token de 1 min).

### Rutas

| Ruta | Acceso | Pantalla |
| --- | --- | --- |
| `/cargando` | pública | Validación de sesión y precarga |
| `/login`, `/registro` | solo invitados | Autenticación |
| `/publicaciones` | autenticado | Listado, filtros, nueva publicación |
| `/publicaciones/:id` | autenticado | Detalle y comentarios |
| `/mi-perfil` | autenticado | Perfil y publicaciones propias |

### Comandos

```bash
cd frontend
npm install
npm start        # http://localhost:4200
npm run build
npm test
```

---

## Puesta en marcha rápida

1. Crear `backend/.env` con las variables listadas arriba.
2. `cd backend && npm install && npm run start:dev` (API en `http://localhost:3000`).
3. `cd frontend && npm install && npm start` (app en `http://localhost:4200`).
