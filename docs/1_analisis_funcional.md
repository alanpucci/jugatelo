# Doc 1 — Análisis funcional (TP #2 · Red social «Jugátelo»)

Adaptado del enunciado base `1_Analisis_funcional.pdf` (v1.0, 26/10/2026) a la temática de juegos de mesa. UTN FRA · TUP · Programación IV. Alcance: Sprints 1 a 4 (se excluyen 5 y 6). Stack: Angular · NestJS · MongoDB Atlas · JWT · Cloudinary.
Los tres documentos usan los mismos nombres de entidades, campos, rutas y módulos. Referencias: RF-xx (funcional), RNF-xx (no funcional), RN-xx (regla de negocio), CU-xx (caso de uso), E-xx (endpoint), S-xx (supuesto).

## 1. Descripción general

Red social de juegos de mesa: cada usuario registrado publica los juegos de mesa que tiene (título, descripción, imagen opcional, cantidad de jugadores) o arma una juntada en una zona (título, descripción, zona, fecha, cupo opcional). Los demás reaccionan con «Me gusta» y comentan, y pueden filtrar por tipo y por zona para encontrar con quién jugar. Solo se accede registrado y logueado. Dos proyectos: frontend Angular (standalone) y backend NestJS con MongoDB Atlas. Auth con JWT propio, contraseñas con bcrypt, imágenes en Cloudinary. Corrección por sprints semanales.

- **S-01** Temática «Jugátelo» (juegos de mesa); técnicamente: colección `publicaciones` con un campo `tipo` (`juego` o `juntada`), y campos `titulo` y `descripcion`.
- **S-04** Las publicaciones muestran el autor (nombreUsuario y foto). Así se sabe quién tiene el juego y quién organiza la juntada.

### 1.1 Alcance

| Sprint | Entrega principal |
|---|---|
| S1 | Proyectos creados y deployados. Registro y login contra el back. Pantallas Registro, Login, Publicaciones y Mi Perfil (maquetas). Favicon propio. |
| S2 | Publicaciones (juegos y juntadas): alta, listado paginado con orden y filtros por tipo y zona, me gusta, baja propia. Mi Perfil con datos, foto y últimas 3 publicaciones. |
| S3 | Pantalla Publicación con comentarios (agregar, editar, cargar más). JWT completo: autorizar, refrescar, pantalla Cargando, aviso de sesión, manejo de 401. |
| S4 | Funciones de admin: baja de cualquier publicación, Dashboard Usuarios y Dashboard Estadísticas. PWA, 3 pipes y 3 directivas propias. |

Fuera de alcance: Sprint 5 (recuperatorio) y 6 (final): perfiles de otros usuarios, scroll infinito, estadísticas adicionales, guardados y compartidos, edición del perfil propio (S-20).

### 1.2 Actores

| Actor | Descripción | Puede |
|---|---|---|
| Visitante no autenticado | Sin sesión válida | Ver Cargando, Login y Registro. Registrarse e iniciar sesión. |
| Usuario | Perfil «usuario» y habilitado = true | Publicar, listar, dar/quitar me gusta, comentar, editar sus comentarios, dar de baja sus publicaciones, ver Mi Perfil, extender la sesión. |
| Administrador | Perfil «administrador». Hereda todo lo del usuario | Dar de baja cualquier publicación; listar, crear, deshabilitar y rehabilitar usuarios; ver estadísticas. |

### 1.3 Decisiones técnicas

- Login por **correo + contraseña**. `correo` único; `nombreUsuario` también único.
- Contraseñas con **bcrypt (10 rondas)**; el login usa `bcrypt.compare`.
- **JWT** payload `{ sub, correo, nombreUsuario, perfil }`, vence en **15 min**. Se devuelve en el body de login y registro; el front lo guarda en localStorage y lo envía en `Authorization: Bearer <token>`. El refresco reenvía el token vigente a `POST /auth/refrescar` (sin refresh token separado).
- Imágenes de perfil y publicaciones: Multer (`FileInterceptor` con `memoryStorage`) → Cloudinary. En Mongo solo URL y public_id.
- Bajas lógicas con booleano: `usuarios.habilitado` y `publicaciones.activa`. Nada se borra físicamente.
- MongoDB Atlas. Hosting front/back: [COMPLETAR] (ej. Vercel/Netlify/Firebase; Render/Railway/Koyeb).

## 2. Requerimientos funcionales

### 2.1 Acceso y autenticación

| ID | Requerimiento | Sprint |
|---|---|---|
| RF-01 | Registrar usuario con nombre, apellido, correo, nombre de usuario, contraseña, repetir contraseña, fecha de nacimiento, descripción breve e imagen de perfil (campo file). | S1 |
| RF-02 | Validar que correo y nombreUsuario sean únicos; si existen, informar conflicto (409). | S1 |
| RF-03 | Guardar la contraseña hasheada con bcrypt. | S1 |
| RF-04 | Recibir la imagen de perfil, subirla a Cloudinary y guardar su URL. | S1 |
| RF-05 | Asignar perfil «usuario» por defecto a todo registro público. | S1 |
| RF-06 | Iniciar sesión con correo y contraseña sin encriptar; devolver todos los datos del usuario (excepto contrasena, RN-09). | S1 |
| RF-07 | Generar JWT en login y registro con payload `{ sub, correo, nombreUsuario, perfil }`, vence a los 15 min, devolverlo en la respuesta. | S3 |
| RF-08 | Guardar el token en localStorage al loguearse o registrarse. | S3 |
| RF-09 | Al iniciar la app mostrar Cargando y validar el token contra `/auth/autorizar`; si es válido ir a Publicaciones, si no a Login. | S3 |
| RF-10 | A los 10 min de iniciada la sesión, modal que avisa que quedan 5 min y ofrece extenderla; si acepta, refrescar el token. | S3 |
| RF-11 | Ante cualquier respuesta 401, redirigir al login para rehacer el token. | S3 |
| RF-12 | Sin sesión válida solo se ven Cargando, Login y Registro. | S3 |
| RF-13 | Impedir el login de un usuario deshabilitado y notificarle que no está autorizado. | S4 |

### 2.2 Navegación y despliegue

| ID | Requerimiento | Sprint |
|---|---|---|
| RF-14 | Navegar entre pantallas con una barra de navegación (sin límites de acceso en S1). | S1 |
| RF-15 | Publicar front y back en un hosting con URL pública en cada entrega. | S1–S4 |

### 2.3 Publicaciones

| ID | Requerimiento | Sprint |
|---|---|---|
| RF-16 | Crear publicación de tipo `juego` (título, descripción, jugadores mín./máx. opcionales, imagen opcional) o `juntada` (título, descripción, zona, fecha, cupo opcional, imagen opcional), relacionada al usuario del token. | S2 |
| RF-17 | Listar con cantidad limitada (offset/limit) y paginación, ordenadas por fecha por defecto. | S2 |
| RF-18 | Cambiar ordenamiento a cantidad de me gusta. | S2 |
| RF-19 | Filtrar publicaciones de un usuario (parámetro usuarioId). | S2 |
| RF-19b | Filtrar publicaciones por tipo (`juego` / `juntada`) y por zona (parámetros tipo y zona). | S2 |
| RF-20 | Mostrar cada publicación como componente (PublicacionCardComponent). | S2 |
| RF-21 | Dar «Me gusta» (uno por usuario y publicación). | S2 |
| RF-22 | Quitar «Me gusta» solo si el usuario lo había dado. | S2 |
| RF-23 | Dar de baja (lógica) mis propias publicaciones. | S2 |
| RF-24 | Ver la publicación en grande con sus comentarios (pantalla Publicación). | S3 |
| RF-25 | El admin puede dar de baja cualquier publicación desde Publicaciones y Publicación; la publicación y sus comentarios dejan de estar disponibles. | S4 |

### 2.4 Comentarios

| ID | Requerimiento | Sprint |
|---|---|---|
| RF-26 | Escribir un comentario en una publicación; se guarda con usuario y fecha. | S3 |
| RF-27 | Listar comentarios de una publicación, más recientes primero, primera carga limitada y botón «Cargar más» que agrega sin quitar los anteriores. | S3 |
| RF-28 | Editar el mensaje de un comentario propio; queda `modificado = true` y se muestra «(editado)». | S3 |

### 2.5 Perfil

| ID | Requerimiento | Sprint |
|---|---|---|
| RF-29 | Mi Perfil muestra todos los datos del usuario y su foto. | S2 |
| RF-30 | Mi Perfil muestra mis últimas 3 publicaciones y sus comentarios. | S2 |

### 2.6 Administración de usuarios

| ID | Requerimiento | Sprint |
|---|---|---|
| RF-31 | Dashboard Usuarios solo para perfil administrador (front y back). | S4 |
| RF-32 | Listar todos los usuarios. | S4 |
| RF-33 | Crear usuarios con los mismos datos del registro, eligiendo con 2 radio buttons el perfil «usuario» o «administrador». | S4 |
| RF-34 | Deshabilitar un usuario (baja lógica). | S4 |
| RF-35 | Rehabilitar un usuario (alta lógica). | S4 |

### 2.7 Estadísticas

| ID | Requerimiento | Sprint |
|---|---|---|
| RF-36 | Dashboard Estadísticas solo para admin, con selección de lapso (desde/hasta). | S4 |
| RF-37 | Gráfico: cantidad de publicaciones por cada usuario en el lapso. | S4 |
| RF-38 | Gráfico: cantidad de comentarios realizados en el lapso. | S4 |
| RF-39 | Gráfico: cantidad de comentarios en cada publicación en el lapso. | S4 |
| RF-40 | Los gráficos usan al menos 3 tipos distintos (barras, líneas, torta/dona). | S4 |

## 3. Requerimientos no funcionales

| ID | Requerimiento | Cómo se cumple | Sprint |
|---|---|---|---|
| RNF-01 | Diseño trabajado y uniforme | Paleta, tipografía y espaciados en variables globales; layout común con NavbarComponent; tarjetas, botones y formularios con el mismo estilo; adaptable a celular. | S1–S4 |
| RNF-02 | Modales en lugar de alert() | ModalService + ModalComponent únicos para info, error y confirmación. Ningún alert(), confirm() ni prompt(). | S1 |
| RNF-03 | Favicon propio | Ícono propio (dado/ficha de juego) en `src/favicon.ico` y en el manifest. | S1 |
| RNF-04 | PWA | `ng add @angular/pwa`: manifest, íconos, service worker. `/auth/*` y datos de la API no se cachean como estáticos. | S4 |
| RNF-05 | 3 pipes propios | tiempoRelativo, truncar, nombreCompleto. | S4 |
| RNF-06 | 3 directivas propias | appSoloAdmin, appImagenRespaldo, appMostrarContrasena. | S4 |
| RNF-07 | Status HTTP correctos | Nunca 200 en errores ni 400 en éxitos. Excepciones de Nest (BadRequest, Unauthorized, Forbidden, NotFound, Conflict); `@HttpCode(200)` donde un POST no crea recursos. | S1–S4 |
| RNF-08 | Seguridad básica | bcrypt; secreto JWT y credenciales en variables de entorno; CORS limitado a la URL del front; contrasena con `select: false`; nunca se devuelve el hash. | S1 |
| RNF-09 | Validación en ambas capas | Formularios reactivos en Angular + DTOs con class-validator y ValidationPipe global (whitelist, forbidNonWhitelisted, transform). | S1 |
| RNF-10 | Información clara | Mensajes en español por campo, spinners en botones durante peticiones, confirmación en modal antes de acciones destructivas. | S1–S4 |

### 3.1 Pipes propios

| Pipe | Uso | Ejemplo |
|---|---|---|
| tiempoRelativo | Fechas de publicaciones y comentarios en forma relativa | `{{ p.createdAt \| tiempoRelativo }}` → «hace 5 min» |
| truncar | Recorta la descripción en la tarjeta con «…» y «Leer más» | `{{ p.descripcion \| truncar:180 }}` |
| nombreCompleto | «Nombre Apellido» a partir del usuario (Mi Perfil, Dashboard Usuarios) | `{{ usuario \| nombreCompleto }}` |

### 3.2 Directivas propias

| Directiva | Tipo | Uso |
|---|---|---|
| `*appSoloAdmin` | Estructural | Renderiza el elemento solo si el usuario del token es administrador (link a Dashboard, botón de baja ajena). |
| `appImagenRespaldo` | Atributo | Si una imagen de Cloudinary falla o es null, reemplaza el src por el avatar o imagen por defecto. |
| `appMostrarContrasena` | Atributo | Alterna type="password"/"text" en campos de contraseña de Login, Registro y Dashboard Usuarios. |

### 3.3 Status HTTP

| Status | Cuándo | Ejemplos |
|---|---|---|
| 200 OK | Consulta o acción exitosa que no crea recurso | GET listados, login, autorizar, refrescar, DELETE baja lógica, PUT comentario, POST /usuarios/:id/habilitar |
| 201 Created | Se creó un recurso | Registro, alta de publicación, me gusta, comentario, alta de usuario |
| 400 Bad Request | Datos o parámetros inválidos | DTO inválido, ObjectId mal formado, archivo no permitido, desde > hasta |
| 401 Unauthorized | Token ausente, inválido o vencido; credenciales incorrectas | Login con contraseña errónea; ruta JWT sin token válido |
| 403 Forbidden | Autenticado sin permiso; usuario deshabilitado | Rutas admin con perfil usuario; baja de publicación ajena; editar comentario ajeno; login de deshabilitado |
| 404 Not Found | El recurso no existe o está dado de baja | Publicación inactiva, comentario inexistente, usuario inexistente |
| 409 Conflict | Choque con el estado actual | correo o nombreUsuario duplicado; me gusta repetido |

**Importante:** en Nest todo `@Post()` responde 201 por defecto. login, autorizar, refrescar y habilitar deben llevar `@HttpCode(HttpStatus.OK)`.

## 4. Reglas de negocio

| ID | Regla | Dónde se valida |
|---|---|---|
| RN-01 | Contraseña mínimo 8 caracteres, ≥1 mayúscula y ≥1 número (`^(?=.*[A-Z])(?=.*\d).{8,}$`) | Login, Registro y Dashboard Usuarios (front) · DTOs (back) |
| RN-02 | correo y nombreUsuario únicos (S-22) | Índices únicos + 409 |
| RN-03 | Perfil «usuario» por defecto. «administrador» solo lo asigna un admin desde E-15. El registro público no acepta el campo `perfil` (400). | RegistroDto / CrearUsuarioDto |
| RN-04 | Un solo «Me gusta» por usuario y publicación. Solo se quita si se había dado (S-13). | Update atómico condicional |
| RN-05 | Solo el autor o un admin da de baja una publicación. Al darla de baja se ocultan también sus comentarios (S-14). | PublicacionesService · filtro activa = true |
| RN-06 | Solo el autor edita su comentario; queda `modificado = true` y se muestra «(editado)». | ComentariosService |
| RN-07 | Usuario deshabilitado no puede loguearse: «Tu cuenta está deshabilitada. Contactá a un administrador.» (403). Con token vigente recibe 403 en rutas protegidas (S-16). | AuthService · JwtAuthGuard |
| RN-08 | A los 10 min de iniciada o extendida la sesión aparece el aviso con opción de extenderla; al aceptar se refresca el token y el contador se reinicia (S-15). | SesionService |
| RN-09 | Nunca se devuelve `contrasena` en ninguna respuesta. | `select: false` + mapeo de respuesta |
| RN-10 | Ante un 401 el front borra el token, muestra un aviso y redirige al login. | errorInterceptor |
| RN-11 | Publicaciones: titulo 3–100, descripcion 1–1000; comentarios: mensaje 1–500. (Valores supuestos, ajustables.) | Front + DTOs + esquema |
| RN-14 | Una `juntada` exige `zona` (2–80) y `fechaJuntada` posterior al momento de crearla; `cupo` es opcional (2–50). Un `juego` no admite zona, fecha ni cupo; `jugadoresMin`/`jugadoresMax` son opcionales (1–20, mín. ≤ máx.). Un campo que no corresponde al tipo → 400. | CrearPublicacionDto · esquema |
| RN-12 | Imágenes JPG, PNG o WEBP de hasta 2 MB (S-23). | ParseFilePipe (back) · validador (front) |
| RN-13 | Un admin no puede deshabilitarse a sí mismo (S-17). | UsuariosService |

## 5. Casos de uso principales

**CU-01 Registrarse** (S1 · Visitante · está en /registro · E-01)
1. Completa el formulario y opcionalmente elige imagen de perfil (vista previa).
2. El front valida y envía un FormData a E-01.
3. El back valida el DTO, verifica unicidad de correo y nombreUsuario, hashea la contraseña, sube la imagen a Cloudinary y guarda el usuario con perfil «usuario» y habilitado = true.
4. Responde 201 `{ usuario, token }`.
5. El front guarda el token, inicia el contador de sesión y navega a /publicaciones.

Errores: 2a campos inválidos → mensajes bajo cada campo, botón deshabilitado · 3a correo/nombreUsuario repetido → 409, modal «Ese correo ya está registrado» / «Ese nombre de usuario ya existe» · 3b imagen no permitida o > 2 MB → 400, modal · 3c error al guardar tras subir imagen → se elimina la imagen subida y se informa.

**CU-02 Iniciar sesión** (S1; token S3; deshabilitado S4 · Visitante · /login · E-02)
1. Ingresa correo y contraseña. 2. El front valida formato y RN-01 y llama a E-02. 3. El back busca por correo, compara con bcrypt.compare y verifica habilitado. 4. Responde 200 `{ usuario, token }`. 5. El front guarda el token, inicia el contador y navega a /publicaciones.

Errores: 3a correo inexistente o contraseña incorrecta → 401, modal «Correo o contraseña incorrectos» (mismo mensaje, no revelar cuál falló) · 3b deshabilitado → 403, modal «Tu cuenta está deshabilitada. Contactá a un administrador.»

**CU-03 Validar sesión al abrir la app** (S3 · cualquier URL entra por /cargando · E-03)
1. Se muestra Cargando con spinner. 2. Si hay token en localStorage se llama a E-03. 3. 200: se guarda el usuario en AuthService, se programa el aviso según el exp del token y se redirige a /publicaciones (o la URL pedida).

Errores: 2a sin token → /login · 3a 401 → borra token y /login · 3b 403 (deshabilitado) → borra token, modal de aviso y /login · 3c back sin respuesta → mensaje «No pudimos conectar con el servidor» y botón Reintentar.

**CU-04 Extender la sesión** (S3 · Usuario · E-04)
1. Aparece modal «Tu sesión vence en 5 minutos. ¿Querés extenderla?». 2. Elige «Extender». 3. El front llama a E-04 con el token vigente. 4. 200: guarda el nuevo token y reinicia el contador de 10 min.
Errores: 2a elige «No» → se cierra el modal; al vencer el token se cierra la sesión (S-15) · 3a 401 → /login. Postcondición: token renovado por 15 min.

**CU-05 Publicar un juego o una juntada** (S2 · Usuario · /publicaciones · E-05, E-06)
1. «Nueva publicación». 2. Elige el tipo («Tengo un juego» / «Armo una juntada») y completa los campos del tipo: título y descripción; juego: jugadores mín./máx. opcionales; juntada: zona, fecha y cupo opcional; imagen opcional (vista previa). 3. El front envía FormData a E-05. 4. El back sube la imagen a Cloudinary y guarda con usuario = id del token. 5. 201: se cierra el formulario y el listado se recarga en la página 1 ordenado por fecha.
Errores: 3a validación por campo (RN-14) · 4a imagen inválida → 400, modal · 4b 401 → CU de sesión vencida. Postcondición: activa = true, cantidadMeGusta = 0.

**CU-06 Explorar publicaciones** (S2 · Usuario · E-06)
1. Se cargan 10 publicaciones por fecha (offset 0). 2. Cambia el orden a «Más me gusta» → offset 0 con orden=meGusta. 3. Filtra por tipo («Todos» / «Juegos» / «Juntadas») y escribe una zona → offset 0 con tipo y zona. 4. Navega con Anterior/Siguiente → offset = (página − 1) × 10.
Vacío: «Todavía no hay publicaciones. ¡Compartí tu primer juego o armá una juntada!».

**CU-07 Dar o quitar «Me gusta»** (S2 · Usuario · publicación activa · E-09, E-10)
1. Presiona el corazón sin me gusta → E-09. 2. 201: se marca y actualiza cantidadMeGusta. 3. Si ya estaba marcado → E-10 → 200, se desmarca.
Errores: 1a 409 (ya lo había dado, p. ej. desde otra pestaña) → se marca como dado sin mostrar error · 3a 404 «La publicación ya no está disponible» → se recarga el listado.

**CU-08 Dar de baja una publicación** (S2; admin S4 · autor o admin · E-08)
1. «Eliminar» (visible solo si es autor o admin). 2. Modal «¿Eliminar esta publicación? Sus comentarios dejarán de verse.». 3. E-08 → 200. 4. Se quita del listado (o se vuelve a /publicaciones si estaba en el detalle).
Errores: 3a 403 modal «No tenés permiso para eliminar esta publicación» · 3b 404 ya estaba dada de baja → se recarga. Postcondición: activa = false.

**CU-09 Ver una publicación y comentar** (S3 · Usuario · E-07, E-11, E-12)
1. Desde una tarjeta entra a /publicaciones/:id. 2. Se piden E-07 y E-11 (offset 0, limit 5). 3. Escribe un comentario y lo envía (E-12) → 201; aparece primero en la lista. 4. «Cargar más» → E-11 con offset = cantidad cargada; los nuevos se agregan debajo.
Errores: 2a 404 → pantalla «Esta publicación ya no está disponible» con botón Volver · 3a comentario vacío o > 500 → validación · 4a no hay más → el botón se oculta (cargados = total).

**CU-10 Editar mi comentario** (S3 · autor del comentario · E-13)
1. «Editar» (solo en sus comentarios). 2. Modifica y guarda. 3. E-13 → 200 con modificado = true. 4. Se muestra el texto con «(editado)».
Errores: 3a 403 no es el autor · 3b 404 comentario o publicación inexistente.

**CU-11 Ver Mi Perfil** (S2 · Usuario · /mi-perfil · E-06; datos del usuario desde E-02/E-03)
1. Entra a /mi-perfil. 2. Se muestran sus datos y foto. 3. Se pide E-06 con usuarioId = id propio, limit = 3, comentarios = 3. 4. Se muestran las 3 últimas publicaciones con hasta 3 comentarios cada una. Vacío: «Todavía no publicaste nada».

**CU-12 Gestionar usuarios** (S4 · Admin · /dashboard/usuarios · E-14 a E-17)
1. Entra y se lista con E-14. 2. «Nuevo usuario»: formulario de registro + radio buttons de perfil → E-15 → 201, se agrega a la tabla. 3. «Deshabilitar» → modal de confirmación → E-16 → 200, la fila muestra Deshabilitado. 4. «Habilitar» → E-17 → 200.
Errores: 1a perfil usuario → adminGuard redirige a /publicaciones (y el back respondería 403) · 2a 409 duplicado · 3a intenta deshabilitarse a sí mismo → botón deshabilitado en el front, 400 en el back.

**CU-13 Consultar estadísticas** (S4 · Admin · /dashboard/estadisticas · E-18, E-19, E-20)
1. Entra; rango por defecto = últimos 30 días. 2. Se piden E-18, E-19 y E-20 en paralelo. 3. Se dibujan barras (publicaciones por usuario), líneas + total (comentarios en el lapso) y dona (comentarios por publicación). 4. Cambia desde/hasta y «Aplicar» → se repiten las consultas.
Errores: 4a desde > hasta → validación en front, 400 en back · 3a sin datos → cada gráfico muestra «Sin datos en el período».

## 6. Pantallas

Todas las pantallas autenticadas comparten **NavbarComponent**: logo, «Publicaciones», «Mi Perfil», «Dashboard» (solo con `*appSoloAdmin`) y «Cerrar sesión» (S-26: borra el token y vuelve al login). Errores, éxitos y confirmaciones se muestran con **ModalComponent**.

| Ruta | Componente | Guards | Sprint | Descripción |
|---|---|---|---|---|
| `/` | — | — | S1 | Redirige a /cargando (S3). En S1–S2 redirige a /login. |
| `/cargando` | CargandoComponent | — | S3 | Spinner + validación del token con E-03. |
| `/login` | LoginComponent | invitadoGuard (S3) | S1 | Inicio de sesión por correo. |
| `/registro` | RegistroComponent | invitadoGuard (S3) | S1 | Alta pública de usuario. |
| `/publicaciones` | PublicacionesComponent | authGuard (S3) | S1 maqueta · S2 | Listado de juegos y juntadas. |
| `/publicaciones/:id` | PublicacionComponent | authGuard | S3 | Detalle con comentarios. |
| `/mi-perfil` | MiPerfilComponent | authGuard (S3) | S1 maqueta · S2 | Datos, foto y últimas 3. |
| `/dashboard/usuarios` | DashboardUsuariosComponent | authGuard + adminGuard | S4 | Gestión de usuarios. |
| `/dashboard/estadisticas` | DashboardEstadisticasComponent | authGuard + adminGuard | S4 | Gráficos. |
| `**` | — | — | S1 | Redirige a /publicaciones (los guards deciden). |

### 6.1 Cargando (S3 · pública · E-03)
Elementos: logo, spinner y texto «Abriendo el tablero…». Valida existencia del token en localStorage y su validez con E-03. Mensaje: «No pudimos conectar con el servidor» + botón Reintentar (si el back no responde). Redirección automática a /publicaciones (token válido) o /login (sin token, 401, 403).

### 6.2 Login (/login · S1 · E-02)
Campos: correo (email), contrasena (password con appMostrarContrasena). Validaciones: correo requerido y formato email; contrasena requerida y RN-01.
Mensajes: «Ingresá tu correo» · «El correo no tiene un formato válido» · «La contraseña debe tener al menos 8 caracteres, una mayúscula y un número» · 401: «Correo o contraseña incorrectos» · 403: «Tu cuenta está deshabilitada. Contactá a un administrador.»
Acciones: «Ingresar» (deshabilitado si el form es inválido; spinner mientras espera) · link «Crear cuenta».

### 6.3 Registro (/registro · S1 · E-01 · usa FormularioUsuarioComponent)
Campos: nombre · apellido · correo · nombreUsuario · contrasena · repetirContrasena · fechaNacimiento (date) · descripcion (textarea con contador 0/200) · imagenPerfil (file con vista previa).
Validaciones: nombre y apellido requeridos, 2–50 letras. correo requerido, email. nombreUsuario requerido, 3–20, letras, números, punto y guion bajo. contrasena RN-01. repetirContrasena igual a contrasena. fechaNacimiento requerida, anterior a hoy (S-24). descripcion opcional ≤ 200 (S-06). imagenPerfil opcional, JPG/PNG/WEBP ≤ 2 MB (S-05, S-23).
Mensajes: por campo, en español, bajo el input. 409: «Ese correo ya está registrado» / «Ese nombre de usuario ya existe». 201: se navega a Publicaciones con aviso de bienvenida. Acciones: «Crear cuenta» · link «Ya tengo cuenta».

### 6.4 Publicaciones (/publicaciones · S1 maqueta, S2 funcional · E-05, E-06, E-08, E-09, E-10)
Elementos: botón «Nueva publicación» (abre NuevaPublicacionComponent) · selector de orden «Más recientes» / «Más me gusta» · selector de tipo «Todos» / «Juegos» / «Juntadas» · campo de zona · lista de PublicacionCardComponent · PaginadorComponent.
Tarjeta: foto y nombreUsuario del autor · fecha (tiempoRelativo) · insignia del tipo (Juego / Juntada) · título · descripción (truncar) · juego: «2–4 jugadores» · juntada: zona, fecha de la juntada y cupo (con «Finalizada» si la fecha ya pasó) · imagen (appImagenRespaldo) · corazón con cantidadMeGusta · link «Ver comentarios» · «Eliminar» si es autor o admin.
Validaciones de nueva publicación: tipo requerido; titulo 3–100, descripcion 1–1000, imagen opcional JPG/PNG/WEBP ≤ 2 MB; juego: jugadoresMin/Max 1–20 y mín. ≤ máx.; juntada: zona 2–80 requerida, fechaJuntada requerida y futura, cupo 2–50 opcional (RN-14).
Mensajes: estado vacío · confirmación de baja · «Tu publicación se creó» · 404 al reaccionar sobre una publicación dada de baja.
Acciones: publicar · ordenar · paginar · dar/quitar me gusta · eliminar · abrir detalle.

### 6.5 Publicación — detalle (/publicaciones/:id · S3 · E-07 a E-13)
Elementos: publicación a ancho completo (imagen, tipo, título, descripción completa, datos del juego o de la juntada, autor, fecha, me gusta) · formulario de comentario · lista de ComentarioItemComponent · botón «Cargar más».
Comentario: autor, fecha (tiempoRelativo), mensaje y «(editado)» si modificado = true. «Editar» solo para el autor (edición en línea con Guardar/Cancelar).
Validación: mensaje requerido, 1–500. Mensajes: «Todavía nadie comentó esta publicación» · 404: «Esta publicación ya no está disponible».
Acciones: comentar · editar comentario propio · cargar más · me gusta · eliminar (autor o admin, S4) · volver.

### 6.6 Mi Perfil (/mi-perfil · S1 maqueta, S2 funcional · E-06 con usuarioId, limit = 3, comentarios = 3 · E-08)
Elementos: foto de perfil (appImagenRespaldo) · nombreCompleto · nombreUsuario · correo · fechaNacimiento · descripcion · perfil · fecha de alta (createdAt) · últimas 3 publicaciones con hasta 3 comentarios cada una (S-12).
Mensajes: «Todavía no publicaste nada» · «Sin comentarios» (S-09). Acciones: abrir el detalle de cada publicación · eliminar las propias.

### 6.7 Dashboard Usuarios (/dashboard/usuarios · S4 · E-14 a E-17)
Tabla: foto, nombreCompleto, nombreUsuario, correo, perfil, estado (Habilitado/Deshabilitado), acciones · botón «Nuevo usuario» (abre FormularioUsuarioComponent en modo admin).
Alta: los mismos campos del Registro + radio buttons perfil: «usuario» (marcado por defecto) / «administrador». Validaciones: las del Registro; perfil requerido.
Mensajes: «¿Deshabilitar a @usuario? No podrá ingresar a la aplicación.» · 201 «Usuario creado» · 409 duplicado. Acciones: crear · deshabilitar · habilitar.

### 6.8 Dashboard Estadísticas (/dashboard/estadisticas · S4 · E-18, E-19, E-20)
Elementos: filtro desde/hasta (inputs date) + «Aplicar» · tarjeta con el total de comentarios · tres gráficos (ng2-charts): barras, líneas y dona.
Validaciones: desde y hasta requeridas; desde ≤ hasta; hasta ≤ hoy. Mensajes: «Sin datos en el período» por gráfico · error 400 en modal.

## 7. Tabla de endpoints

Guard: **Público** = sin token · **JWT** = JwtAuthGuard (token válido y usuario habilitado; deshabilitado → 403, S-16) · **Admin** = JwtAuthGuard + AdminGuard (perfil «administrador», si no 403). Todas las rutas JWT/Admin pueden devolver además 401 y 403 por usuario deshabilitado. Sin prefijo global (S-25: no se usa `/api`).

| ID | Método y ruta | Guard | Entrada | Éxito | Errores | Sprint |
|---|---|---|---|---|---|---|
| E-01 | POST /auth/registro | Público | multipart/form-data: nombre, apellido, correo, nombreUsuario, contrasena, repetirContrasena, fechaNacimiento, descripcion?, imagenPerfil? (archivo) | 201 `{ usuario, token }` | 400 validación o archivo inválido · 409 correo o nombreUsuario duplicado | S1 |
| E-02 | POST /auth/login | Público | JSON: correo, contrasena | 200 `{ usuario, token }` | 400 validación · 401 credenciales incorrectas · 403 usuario deshabilitado | S1 |
| E-03 | POST /auth/autorizar | JWT | Header `Authorization: Bearer <token>` | 200 `{ usuario }` | 401 token ausente, inválido o vencido · 403 deshabilitado | S3 |
| E-04 | POST /auth/refrescar | JWT | Header `Authorization: Bearer <token>` | 200 `{ token }` | 401 · 403 deshabilitado | S3 |
| E-05 | POST /publicaciones | JWT | multipart: tipo (juego\|juntada), titulo, descripcion, imagen? (archivo); juego: jugadoresMin?, jugadoresMax?; juntada: zona, fechaJuntada, cupo? | 201 publicación creada | 400 validación o archivo inválido · 401 | S2 |
| E-06 | GET /publicaciones | JWT | Query: orden=fecha\|meGusta (def. fecha) · tipo=juego\|juntada? · zona? (contiene, sin distinguir mayúsculas) · usuarioId? · offset (def. 0) · limit (def. 10, máx. 50) · comentarios (def. 0, máx. 5) | 200 `{ datos, total, offset, limit }` | 400 query inválida · 401 | S2 |
| E-07 | GET /publicaciones/:id | JWT | Param: id | 200 publicación | 400 id inválido · 401 · 404 inexistente o dada de baja | S3 |
| E-08 | DELETE /publicaciones/:id | JWT (autor o admin) | Param: id | 200 `{ mensaje }` | 400 id inválido · 401 · 403 no es autor ni admin · 404 | S2 (admin: S4) |
| E-09 | POST /publicaciones/:id/me-gusta | JWT | Param: id | 201 `{ cantidadMeGusta, meGustaDado: true }` | 400 · 401 · 404 · 409 ya dio me gusta | S2 |
| E-10 | DELETE /publicaciones/:id/me-gusta | JWT | Param: id | 200 `{ cantidadMeGusta, meGustaDado: false }` | 400 · 401 · 404 publicación inexistente o me gusta no dado | S2 |
| E-11 | GET /publicaciones/:publicacionId/comentarios | JWT | Param: publicacionId · Query: offset (def. 0) · limit (def. 5, máx. 50) | 200 `{ datos, total, offset, limit }` | 400 · 401 · 404 inexistente o dada de baja | S3 |
| E-12 | POST /publicaciones/:publicacionId/comentarios | JWT | JSON: mensaje | 201 comentario | 400 validación · 401 · 404 publicación | S3 |
| E-13 | PUT /publicaciones/:publicacionId/comentarios/:comentarioId | JWT (autor del comentario) | JSON: mensaje | 200 comentario con modificado: true | 400 validación · 401 · 403 no es el autor · 404 comentario o publicación | S3 |
| E-14 | GET /usuarios | Admin | — | 200 `[ usuario ]` | 401 · 403 no es administrador | S4 |
| E-15 | POST /usuarios | Admin | multipart: mismos campos que E-01 + perfil (usuario\|administrador) | 201 usuario | 400 validación · 401 · 403 · 409 correo o nombreUsuario duplicado | S4 |
| E-16 | DELETE /usuarios/:id | Admin | Param: id | 200 usuario con habilitado: false | 400 id inválido o auto-deshabilitarse · 401 · 403 · 404 | S4 |
| E-17 | POST /usuarios/:id/habilitar | Admin | Param: id | 200 usuario con habilitado: true | 400 id inválido · 401 · 403 · 404 | S4 |
| E-18 | GET /estadisticas/publicaciones-por-usuario | Admin | Query: desde, hasta (AAAA-MM-DD) | 200 `[ { usuarioId, nombreUsuario, cantidad } ]` | 400 fechas inválidas o desde > hasta · 401 · 403 | S4 |
| E-19 | GET /estadisticas/comentarios | Admin | Query: desde, hasta | 200 `{ total, porDia: [ { fecha, cantidad } ] }` | 400 · 401 · 403 | S4 |
| E-20 | GET /estadisticas/comentarios-por-publicacion | Admin | Query: desde, hasta | 200 `[ { publicacionId, titulo, cantidad } ]` | 400 · 401 · 403 | S4 |

### 7.1 Formato de respuestas

usuario (E-01, E-02, E-03, E-14…; **nunca** incluye `contrasena` ni `imagenPerfilPublicId`):
```json
{
  "_id": "6718a2f0c1e4b2a9d0f1a001",
  "nombre": "Ana", "apellido": "Gómez",
  "correo": "ana@mail.com", "nombreUsuario": "ana.g",
  "fechaNacimiento": "2001-05-14T00:00:00.000Z",
  "descripcion": "Me gustan los juegos de estrategia y las tardes de mesa",
  "imagenPerfilUrl": "https://res.cloudinary.com/.../perfiles/ana.webp",
  "perfil": "usuario", "habilitado": true,
  "createdAt": "2026-10-20T13:02:11.000Z", "updatedAt": "2026-10-20T13:02:11.000Z"
}
```

publicación (E-05, E-06, E-07) — los campos `zona`, `fechaJuntada` y `cupo` solo aparecen en las juntadas; `jugadoresMin` y `jugadoresMax` solo en los juegos (si se cargaron). `meGustaDado` se calcula para el usuario del token; `meGusta[]` no se expone:
```json
{
  "_id": "6718b0aac1e4b2a9d0f1a0f3",
  "tipo": "juntada",
  "titulo": "Tarde de Catan y Carcassonne",
  "descripcion": "Llevo Catan y Carcassonne. Hay mate y snacks, traigan ganas de jugar.",
  "zona": "Villa Crespo, CABA",
  "fechaJuntada": "2026-11-08T20:00:00.000Z",
  "cupo": 6,
  "imagenUrl": "https://res.cloudinary.com/.../publicaciones/x1.webp",
  "usuario": { "_id": "6718a2f0c1e4b2a9d0f1a001", "nombreUsuario": "ana.g",
               "nombre": "Ana", "apellido": "Gómez", "imagenPerfilUrl": "https://..." },
  "cantidadMeGusta": 12, "meGustaDado": true,
  "createdAt": "2026-10-21T22:15:40.000Z", "updatedAt": "2026-10-21T22:40:02.000Z",
  "comentarios": [ /* solo si se pidió comentarios > 0 (E-06) */ ]
}
```

comentario (E-11, E-12, E-13):
```json
{
  "_id": "6718c3d1c1e4b2a9d0f1a2b7",
  "publicacion": "6718b0aac1e4b2a9d0f1a0f3",
  "usuario": { "_id": "6718a2f0c1e4b2a9d0f1a009", "nombreUsuario": "tomi_r", "imagenPerfilUrl": null },
  "mensaje": "Me sumo, llevo el Dixit",
  "modificado": false,
  "createdAt": "2026-10-21T22:30:00.000Z", "updatedAt": "2026-10-21T22:30:00.000Z"
}
```

Paginado y error:
```json
{ "datos": [ ], "total": 47, "offset": 10, "limit": 10 }
{ "statusCode": 409, "message": "Ese correo ya está registrado", "error": "Conflict" }
```

## 8. Supuestos

| ID | Supuesto |
|---|---|
| S-01 | Temática «Jugátelo»: cada publicación es un juego de mesa que alguien tiene (`tipo = juego`) o una juntada en una zona (`tipo = juntada`). Se mantiene el nombre del enunciado para la colección (`publicaciones`) y el campo `titulo`. |
| S-02 | El enunciado llama al cuerpo «mensaje» (general) y «descripción» (Sprint 2): en publicaciones se usa `descripcion`; en comentarios, `mensaje`. |
| S-03 | Cada publicación admite **una** imagen opcional (la caja del juego, el lugar). Si fueran varias, el campo pasaría a array (pregunta al docente). |
| S-27 | Juegos y juntadas comparten la colección `publicaciones` (diferenciados por `tipo`): así me gusta, comentarios, baja y estadísticas se reutilizan sin duplicar código. |
| S-28 | `zona` es texto libre (barrio/localidad). El filtro por zona busca coincidencia parcial sin distinguir mayúsculas ni tildes de forma estricta (regex escapada). No hay geolocalización. |
| S-29 | Una juntada cuya `fechaJuntada` ya pasó no se oculta ni se da de baja sola: se muestra con la insignia «Finalizada». |
| S-30 | `cupo` es informativo: no hay inscripción ni lista de asistentes. Quien quiere ir lo dice en los comentarios. |
| S-04 | Las publicaciones muestran el autor (nombreUsuario y foto). Se ve siempre quién tiene el juego o quién organiza la juntada. |
| S-05 | La imagen de perfil es opcional; sin ella se muestra un avatar por defecto (`imagenPerfilUrl = null`). |
| S-06 | La descripción breve es opcional, máximo 200 caracteres. |
| S-07 | El back también recibe `repetirContrasena` y valida que coincida (no se guarda). |
| S-08 | Se agrega E-07 (GET /publicaciones/:id) para la pantalla Publicación. |
| S-09 | Mi Perfil (S2) pide comentarios, pero el controller de comentarios es del S3: en S2 se crea el esquema Comentario y E-06 acepta `comentarios`; hasta el S3 la sección mostrará «Sin comentarios». |
| S-10 | Publicaciones: 10 por página (offset/limit), paginación tradicional con Anterior/Siguiente e indicador «Página X de Y». |
| S-11 | Comentarios: 5 por carga; «Cargar más» pide el siguiente bloque y lo agrega debajo. |
| S-12 | Mi Perfil muestra hasta 3 comentarios (los más recientes) por publicación, con enlace al detalle. |
| S-13 | Me gusta repetido → 409. Quitar un me gusta no dado → 404. |
| S-14 | Una publicación dada de baja (y sus comentarios) no se muestra en ninguna pantalla ni cuenta en estadísticas. Los comentarios no se modifican: se ocultan filtrando por publicación activa. |
| S-15 | Si el usuario no extiende la sesión, al vencer el token (15 min) se cierra la sesión y se redirige al login con mensaje en modal. |
| S-16 | Usuario deshabilitado con token vigente recibe 403 en cualquier ruta protegida; el front cierra la sesión y muestra el aviso. |
| S-17 | Un admin no puede deshabilitarse a sí mismo (400). |
| S-18 | Estadísticas: rango inclusivo [00:00, 23:59:59] en hora de Argentina (America/Argentina/Buenos_Aires). Por defecto, últimos 30 días. «Comentarios por publicación» muestra las 10 publicaciones con más comentarios en el lapso. |
| S-19 | «Comentarios realizados en un lapso» se muestra como total + serie por día (gráfico de líneas). |
| S-20 | Edición del perfil propio: fuera de alcance hasta confirmar con el docente. |
| S-21 | Listado de usuarios sin paginación (volumen bajo). |
| S-22 | `correo` se guarda en minúsculas; `nombreUsuario` es único sin distinguir mayúsculas. |
| S-23 | Imágenes: JPG, PNG o WEBP, máximo 2 MB. |
| S-24 | fechaNacimiento: fecha válida anterior a hoy (sin edad mínima). |
| S-25 | Rutas del back sin prefijo global (no se usa `/api`). |
| S-26 | La barra de navegación incluye «Cerrar sesión» (borra el token y vuelve al login). |

## 9. Anexo — Nomenclatura común

Idéntica en los tres documentos.

| Concepto | Back (NestJS) | Front (Angular) | MongoDB |
|---|---|---|---|
| Autenticación | AuthModule · AuthController (/auth) · JwtAuthGuard · AdminGuard | AuthService · TokenService · SesionService · authGuard · adminGuard · invitadoGuard · authInterceptor · errorInterceptor | usa usuarios |
| Usuario | UsuariosModule · UsuariosController (/usuarios) · UsuariosService · Usuario | UsuariosService · FormularioUsuarioComponent · modelo Usuario | usuarios |
| Publicación (juego o juntada) | PublicacionesModule · PublicacionesController (/publicaciones) · PublicacionesService · Publicacion | PublicacionesService · PublicacionCardComponent · NuevaPublicacionComponent | publicaciones |
| Me gusta | PublicacionesController (/publicaciones/:id/me-gusta) | PublicacionesService | publicaciones.meGusta[] + cantidadMeGusta |
| Comentario | ComentariosController (/publicaciones/:publicacionId/comentarios) · ComentariosService · Comentario | ComentariosService · ComentariosComponent · ComentarioItemComponent | comentarios |
| Estadísticas | EstadisticasController (/estadisticas) · EstadisticasService | EstadisticasService · DashboardEstadisticasComponent | aggregations |
| Imágenes | CloudinaryModule · CloudinaryService | — | *Url + *PublicId |
| Modales | — | ModalService · ModalComponent | — |

| Colección / objeto | Campos |
|---|---|
| usuarios | _id, nombre, apellido, correo, nombreUsuario, contrasena, fechaNacimiento, descripcion, imagenPerfilUrl, imagenPerfilPublicId, perfil, habilitado, createdAt, updatedAt |
| publicaciones | _id, tipo, titulo, descripcion, jugadoresMin, jugadoresMax, zona, fechaJuntada, cupo, imagenUrl, imagenPublicId, usuario, meGusta, cantidadMeGusta, activa, createdAt, updatedAt |
| comentarios | _id, publicacion, usuario, mensaje, modificado, createdAt, updatedAt |
| Payload JWT | `{ sub, correo, nombreUsuario, perfil }` · vence a los 15 min (exp = iat + 900 s) |
| Valores de perfil | «usuario» (por defecto) · «administrador» |
