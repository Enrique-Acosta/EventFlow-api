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
│   └── authMiddleware.js   # Búsqueda de usuario por email 
├── models/
│   ├── eventModel.js
│   └── userModel.js
├── repositories/
├── routes/
│   ├── eventsRouter.js
│   ├── healthRouter.js
│   └── sessionRouter.js
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

---

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

# 🧪 Casos probados

Se verificó el correcto funcionamiento de los siguientes escenarios:

- ✅ Registro exitoso.
- ✅ Registro con email duplicado.
- ✅ Login exitoso.
- ✅ Login con credenciales inválidas.
- ✅ Acceso a `/current` con un JWT válido.
- ✅ Acceso a `/current` sin cookie.
- ✅ Acceso a `/current` con un token manipulado.
- ✅ Logout.
- ✅ Acceso a `/current` luego del logout (401 Unauthorized).

---

# 📌 Variables de entorno

| Variable | Descripción |
|----------|-------------|
| PORT | Puerto donde se ejecuta la aplicación. |
| MONGO_URL | Cadena de conexión a MongoDB. |
| JWT_SECRET | Clave utilizada para firmar y validar los JWT. |
| COOKIE_SECRET | Clave utilizada para firmar las cookies mediante `cookie-parser`. |

---

# 🧪 Cómo probar el registro

Podés utilizar **Postman**, **Insomnia** o **Thunder Client**.

### URL

```
POST http://localhost:3000/api/sessions/register
```

### Headers

```
Content-Type: application/json
```

### Body

Seleccionar **raw → JSON** y enviar un objeto con los campos indicados en el ejemplo anterior.