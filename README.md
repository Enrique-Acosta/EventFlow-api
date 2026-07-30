# EventFlow API

## 📖 Temática

API REST diseñada para administrar eventos, usuarios y autenticación mediante una arquitectura por capas con Node.js, Express y MongoDB.

La autenticación fue refactorizada utilizando **Passport.js**, centralizando la lógica de autenticación en estrategias independientes sin modificar el contrato externo de la API. Esta organización deja el proyecto preparado para incorporar nuevos proveedores de autenticación (Google, GitHub, OAuth, etc.) sin necesidad de modificar `app.js`.

---

## 🛠️ Tecnologías

- Node.js
- Express
- MongoDB
- Mongoose
- Passport.js
- passport-local
- passport-jwt
- bcrypt
- cookie-parser
- Dotenv
- JSON Web Token (JWT)

---

## ⚙️ Instalación

Clonar el repositorio.

Instalar las dependencias:

```bash
npm install
```

### Configuración de variables de entorno

Crear un archivo `.env` tomando como referencia `.env.example`.

Variables necesarias:

```env
PORT=
MONGO_URL=
JWT_SECRET=
COOKIE_SECRET=
```

---

## ▶️ Cómo ejecutar

### Modo desarrollo

```bash
npm run dev
```

### Modo producción

```bash
npm start
```

---

## 📁 Estructura del proyecto

```
src/
├── app.js
├── server.js
├── config/
│   ├── database.js         # Configuración de MongoDB
│   ├── env.js              # Variables de entorno
│   └── passport.config.js  # Estrategias Passport (register, login y current)
├── controllers/
│   ├── eventsController.js   
│   └── sessionController.js
├── dao/
├── middlewares/
│   └── authMiddleware.js   # Búsqueda de usuario por email y Autorizacion de roles
├── models/
│   ├── eventModel.js
│   └── userModel.js
├── repositories/
├── routes/
│   ├── eventsRouter.js   # Aplica middlwares de autorizacion en rutas protegidas
│   ├── healthRouter.js
│   └── sessionRouter.js  # Registro, login y current realizados con estrategias de passport
├── services/
├── utils/
│   ├── bcrypt.js           # Helpers para hash y validación de contraseñas
│   └── jwt.js              # Helpers para generar y validar JWT
└── .env.example
```

---

# 🔐 Autenticación con Passport

La autenticación de la API se implementa mediante **Passport.js**, centralizando las estrategias en `src/config/passport.config.js`.

Actualmente se encuentran implementadas las siguientes estrategias:

### Register

Gestiona el registro de nuevos usuarios.

Se encarga de:

- Validar los datos recibidos.
- Normalizar el email.
- Verificar que el email no exista previamente.
- Hashear la contraseña mediante bcrypt.
- Crear el usuario con el rol por defecto.

La ruta delega completamente la autenticación mediante:

```js
passport.authenticate("register")
```

---

### Login

Gestiona la autenticación del usuario.

Se encarga de:

- Validar las credenciales.
- Comparar la contraseña utilizando bcrypt.
- Retornar el usuario autenticado.

Una vez autenticado correctamente, el **controller** genera el JWT y crea la cookie HTTP Only firmada que contiene el token.

---

### Current

Protege el endpoint:

```
GET /api/sessions/current
```

La estrategia:

- Obtiene el JWT desde una cookie firmada.
- Verifica la firma y expiración del token.
- Busca el usuario en la base de datos.
- Disponibiliza el usuario autenticado mediante `req.user`.

---

### Escalabilidad

La configuración actual permite agregar nuevas estrategias de autenticación (Google, GitHub u otros proveedores OAuth) sin modificar `app.js`, únicamente registrando nuevas estrategias dentro de `passport.config.js`.

---

## 🌐 Endpoints disponibles

| Método | Ruta | Descripción |
|---------|------|-------------|
| GET | /api/health | Verifica que el servidor está activo. |
| GET | /api/events | Devuelve una lista de eventos (vacía en esta etapa). |
| GET | /api/sessions/current | Devuelve los datos del usuario autenticado mediante el token. |
| POST | /api/sessions/register | Registra un nuevo usuario. |
| POST | /api/sessions/login | Login de usuario. |
| POST | /api/sessions/logout | Cierra la sesión del usuario eliminando la cookie de autenticación. |
| POST | /api/event  | Permite crear un evento si tiene las credenciales necesarias|
| PUT |  /api/:eid   |  Verifica que el usuario autenticado sea el propietario del evento o tenga el rol admin. Actualmente no modifica el evento, solo valida la autorización.


# 👤 Registro de usuarios

## Endpoint

```
POST /api/sessions/register
```

La validación y creación del usuario son gestionadas por la estrategia **register** de Passport.

### Body esperado

```json
{
  "first_name": "Nahuel",
  "last_name": "Acosta",
  "email": "nahuel@mail.com",
  "password": "12345678"
}
```

### Validaciones implementadas

1. Todos los campos son obligatorios.
2. El email debe tener un formato válido.
3. El email se almacena normalizado (trim y lowercase).
4. No se permite registrar emails duplicados.
5. La contraseña debe tener una longitud mínima de 8 caracteres.
6. La contraseña se almacena hasheada mediante bcrypt.

### Respuesta exitosa

```json
{
  "status": "success",
  "payload": {
    "id": "665f2a...",
    "first_name": "Nahuel",
    "last_name": "Acosta",
    "email": "nahuel@mail.com",
    "role": "user"
  }
}
```

### Posibles respuestas

| Código | Descripción |
|---------|-------------|
| 201 | Usuario registrado correctamente. |
| 400 | Datos inválidos o campos obligatorios faltantes. |
| 409 | El email ya se encuentra registrado. |
| 500 | Error interno del servidor. |

---

# 🔑 Login

## Endpoint

```
POST /api/sessions/login
```

La autenticación es realizada por la estrategia **login** de Passport. Una vez autenticado el usuario, el controlador genera el JWT y almacena el token en una cookie HTTP Only firmada.

### Body esperado

```json
{
  "email": "nahuel@mail.com",
  "password": "12345678"
}
```

### Validaciones implementadas

1. El usuario debe estar registrado.
2. La contraseña ingresada debe coincidir con la contraseña hasheada almacenada.
3. Si las credenciales son válidas, el controlador genera un token JWT.
4. El token se almacena en una cookie HTTP Only firmada.

### Respuesta exitosa

```json
{
  "status": "success",
  "message": "Login exitoso"
}
```

**Nota:** Además de la respuesta JSON, el servidor envía una cookie `jwt` firmada (`signed`) y `httpOnly` que contiene el token de autenticación.

### Posibles respuestas

| Código | Descripción |
|---------|-------------|
| 200 | Inicio de sesión exitoso. |
| 401 | Credenciales inválidas. |
| 500 | Error interno del servidor. |

---

# 👤 Usuario actual

## Endpoint

```
GET /api/sessions/current
```

### Requisitos

- El usuario debe estar autenticado.
- Debe enviar una cookie `jwt` firmada con un token válido.

El acceso a este endpoint está protegido mediante la estrategia **current** de Passport.

### Validaciones implementadas

1. Verifica que exista la cookie `jwt`.
2. Verifica que el token JWT sea válido y no haya expirado.
3. Busca el usuario asociado al token.
4. Si el token es válido, devuelve la información del usuario autenticado.

### Respuesta exitosa

```json
{
  "status": "success",
  "payload": {
    "id": "665f2a...",
    "email": "nahuel@mail.com",
    "role": "user"
  }
}
```

### Posibles respuestas

| Código | Descripción |
|---------|-------------|
| 200 | Información del usuario autenticado obtenida correctamente. |
| 401 | Usuario no autenticado, token inválido o expirado. |
| 500 | Error interno del servidor. |

---

# 🚪 Logout

## Endpoint

```
POST /api/sessions/logout
```

### Requisitos

- El usuario debe tener una sesión iniciada.

### Funcionalidad

1. Elimina la cookie `jwt`.
2. Finaliza la sesión del usuario.

Este endpoint no requiere Passport, ya que únicamente elimina la cookie de autenticación.

### Respuesta exitosa

```json
{
  "status": "success",
  "message": "Logout correcto"
}
```

### Posibles respuestas

| Código | Descripción |
|---------|-------------|
| 200 | Sesión cerrada correctamente. |
| 500 | Error interno del servidor. |

---

# 👥 Roles y permisos

La API implementa un sistema de autorización basado en roles. Cada usuario posee un rol que determina las acciones que puede realizar sobre los recursos de la plataforma.

## Roles

### Admin

Cuenta con acceso completo a la plataforma.

Puede:

- Crear eventos.
- Acceder y modificar cualquier evento.
- Gestionar recursos sin restricciones de propiedad.

---

### Organizer

Es el encargado de crear y administrar sus propios eventos.

Puede:

- Crear eventos.
- Modificar únicamente los eventos de los que es propietario.

---

### User

Representa a un usuario estándar de la plataforma.

Puede:

- Registrarse e iniciar sesión.
- Consultar la información permitida por la API.
- No puede crear ni modificar eventos.

---

## Matriz de permisos

| Funcionalidad | Admin | Organizer | User |
|---------------|:-----:|:---------:|:----:|
| Registrarse | ✅ | ✅ | ✅ |
| Iniciar sesión | ✅ | ✅ | ✅ |
| Consultar `/sessions/current` | ✅ | ✅ | ✅ |
| Consultar eventos | ✅ | ✅ | ✅ |
| Crear eventos | ✅ | ✅ | ❌ |
| Modificar sus propios eventos | ✅ | ✅ | ❌ |
| Modificar eventos de otros usuarios | ✅ | ❌ | ❌ |

---

# 🔍 Consulta de eventos

## Endpoint

```
GET /api/events
```

Permite obtener el listado de eventos registrados.

El endpoint es público y no requiere autenticación.

---

## Filtros disponibles

El endpoint permite filtrar, ordenar y paginar los resultados mediante parámetros de consulta.

| Parámetro | Descripción |
|-----------|-------------|
| `category` | Filtra eventos por categoría. |
| `status` | Filtra eventos por estado (`draft`, `published`, `cancelled`, `finished`). |
| `location` | Filtra eventos por ubicación. |
| `fromDate` | Obtiene eventos desde una fecha determinada. |
| `toDate` | Obtiene eventos hasta una fecha determinada. |
| `page` | Página actual de resultados. Valor por defecto: `1`. |
| `limit` | Cantidad de eventos por página. Valor por defecto: `10`. |
| `sort` | Campo utilizado para ordenar resultados. Valor por defecto: `date`. |

### Ejemplo

```
GET /api/events?category=Esports&location=Buenos Aires&page=1&limit=5
```

---

## Respuesta exitosa

```json
{
  "result": {
    "events": [],
    "pagination": {
      "total": 0,
      "page": 1,
      "limit": 10,
      "totalPages": 0
    }
  }
}
```

---

# 🎮 Creación de eventos

## Endpoint

```
POST /api/events
```

Permite crear un nuevo evento.

El acceso está restringido a usuarios autenticados con rol **admin** u **organizer**.

---

## Requisitos

- Estar autenticado mediante JWT.
- Poseer el rol **admin** o **organizer**.
- Completar todos los campos obligatorios.

---

## Body esperado

```json
{
  "title": "Torneo de League of Legends",
  "description": "Competencia abierta para equipos amateur.",
  "category": "Esports",
  "date": "2026-08-15T18:00:00.000Z",
  "location": "Buenos Aires",
  "price": 2500,
  "capacity": 16
}
```

---

## Validaciones implementadas

- El usuario debe estar autenticado.
- El usuario debe tener el rol **admin** u **organizer**.
- Todos los campos son obligatorios.
- La fecha del evento debe ser futura.
- La capacidad debe ser mayor que cero.
- El precio no puede ser negativo.
- El organizador se obtiene automáticamente desde el usuario autenticado.

---

## Respuesta exitosa

```json
{
  "status": "Success",
  "message": "Evento creado correctamente",
  "payload": {
    "_id": "...",
    "title": "Torneo de League of Legends",
    "description": "Competencia abierta para equipos amateur.",
    "category": "Esports",
    "date": "2026-08-15T18:00:00.000Z",
    "location": "Buenos Aires",
    "price": 2500,
    "capacity": 16,
    "status": "published",
    "organizer": "665f2a..."
  }
}
```

---

## Posibles respuestas

| Código | Descripción |
|---------|-------------|
| 201 | Evento creado correctamente. |
| 400 | Error de validación o faltan campos obligatorios. |
| 401 | Usuario no autenticado. |
| 403 | El usuario no posee permisos para crear eventos. |
| 500 | Error interno del servidor. |

---

# ✏️ Actualización de eventos

## Endpoint

```
PUT /api/events/:eid
```

Permite actualizar un evento existente.

Antes de realizar la modificación, la API verifica que el usuario autenticado sea el organizador del evento o tenga el rol **admin**.

---

## Requisitos

- Estar autenticado mediante JWT.
- El evento debe existir.
- Ser el propietario del evento o tener el rol **admin**.

---

## Validaciones implementadas

- El usuario debe estar autenticado.
- El evento debe existir.
- Solo el organizador del evento o un administrador pueden modificarlo.
- La fecha debe ser futura.
- La capacidad debe ser mayor que cero.
- El precio no puede ser negativo.

---

## Respuesta exitosa

```json
{
  "data": {
    "...": "Evento actualizado"
  }
}
```

---

## Posibles respuestas

| Código | Descripción |
|---------|-------------|
| 200 | Evento actualizado correctamente. |
| 400 | Error de validación. |
| 401 | Usuario no autenticado. |
| 403 | El usuario no tiene permisos sobre el evento. |
| 404 | Evento no encontrado. |
| 500 | Error interno del servidor. |

# 🧪 Casos probados

Se verificó el correcto funcionamiento de los siguientes escenarios:

### Autenticación

- ✅ Registro exitoso.
- ✅ Registro con email duplicado.
- ✅ Login exitoso.
- ✅ Login con credenciales inválidas.
- ✅ Acceso a `/current` con un JWT válido.
- ✅ Acceso a `/current` sin cookie.
- ✅ Acceso a `/current` con un token manipulado.
- ✅ Logout.
- ✅ Acceso a `/current` luego del logout (401 Unauthorized).

### Autorización

- ✅ Creación de eventos con un usuario autenticado con rol **admin**.
- ✅ Creación de eventos con un usuario autenticado con rol **organizer**.
- ✅ Intento de creación de eventos con un usuario sin permisos (403 Forbidden).
- ✅ Intento de creación de eventos sin autenticación (401 Unauthorized).
- ✅ Validación de propietario del evento para el endpoint `PUT /api/events/:eid`.
- ✅ Acceso al endpoint `PUT /api/events/:eid` como administrador.
- ✅ Acceso denegado al intentar modificar un evento perteneciente a otro usuario (403 Forbidden).
- ✅ Intento de acceso a un evento inexistente (404 Not Found).

---

# 📌 Variables de entorno

| Variable | Descripción |
|----------|-------------|
| PORT | Puerto donde se ejecuta la aplicación. |
| MONGO_URL | Cadena de conexión a MongoDB. |
| JWT_SECRET | Clave utilizada para firmar y validar los JWT. |
| COOKIE_SECRET | Clave utilizada para firmar las cookies mediante `cookie-parser`. |

---

# 🧪 Cómo probar la API

Podés utilizar **Postman**, **Insomnia** o **Thunder Client**.

### Registro de usuarios

**URL**

```
POST http://localhost:3000/api/sessions/register
```

**Headers**

```
Content-Type: application/json
```

**Body**

Seleccionar **raw → JSON** y enviar un objeto con los campos indicados en la sección **Registro de usuarios**.

---

### Login

**URL**

```
POST http://localhost:3000/api/sessions/login
```

Una vez autenticado, la API devolverá una **cookie HTTP Only** firmada que deberá enviarse automáticamente en las solicitudes protegidas.

---

### Crear un evento

**URL**

```
POST http://localhost:3000/api/events
```

**Requisitos**

- Haber iniciado sesión.
- Enviar la cookie JWT generada durante el login.
- Poseer el rol **admin** u **organizer**.

---

### Validar autorización sobre un evento

**URL**

```
PUT http://localhost:3000/api/events/:eid
```

**Requisitos**

- Haber iniciado sesión.
- Enviar la cookie JWT generada durante el login.
- Ser el propietario del evento o tener el rol **admin**.