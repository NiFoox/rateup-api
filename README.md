# RateUp API – Backend Contract

Este documento describe el contrato completo de la API del backend de RateUp, incluyendo rutas, DTOs, métodos HTTP, parámetros, estructuras de datos y reglas generales. Sirve como referencia para integrar el frontend con el backend.

Base URL: `http://localhost:3000/api`  
Formato de datos: JSON  
Autenticación: JWT (Bearer Token) en el header `Authorization`

---

# Autenticación

## POST `/auth/login`

Autentica un usuario.

**Body:**

```json
{
  "usernameOrEmail": "string",
  "password": "string",
  "rememberMe": false
}
```

**Response 200:**

```json
{
  "success": true,
  "accessToken": "string",
  "expiresAt": "string",
  "user": {
    "id": 1,
    "username": "string",
    "email": "string",
    "roles": ["USER", "ADMIN"]
  }
}
```

---

## POST `/auth/register`

Registra un usuario.

**Body:**

```json
{
  "username": "string",
  "email": "string",
  "password": "string",
  "roles": ["USER"],
  "isActive": "boolean"
}
```

**Response 201:**

```json
{
  "id": 1,
  "username": "string",
  "email": "string",
  "roles": ["USER"],
  "isActive": true,
  "createdAt": "string",
  "avatarUrl": null,
  "bio": null
}
```

---

## GET `/auth/me`

Devuelve el perfil privado del usuario autenticado.

**Headers:**
`Authorization: Bearer <token>`

**Response 200:**

```json
{
  "id": 1,
  "username": "string",
  "avatarUrl": null,
  "bio": null,
  "createdAt": "string",
  "email": "string",
  "roles": ["USER"],
  "stats": {
    "reviewsCount": 5,
    "reputation": {
      "upvotes": 10,
      "downvotes": 2,
      "score": 8,
      "likesRate": 0.83
    }
  }
}
```

---

# Usuarios

### Roles disponibles

* `"USER"`
* `"ADMIN"`

### UserDto

```json
{
  "id": 1,
  "username": "string",
  "email": "string",
  "roles": ["USER"],
  "isActive": true,
  "createdAt": "string",
  "avatarUrl": null,
  "bio": null
}
```

---

## GET `/users/profile/:id`

Perfil público de un usuario.

**Response 200 (PublicUserProfileDto):**

```json
{
  "id": 1,
  "username": "string",
  "avatarUrl": null,
  "bio": "string",
  "createdAt": "string",
  "stats": {
    "reviewsCount": 3,
    "reputation": {
      "upvotes": 4,
      "downvotes": 1,
      "score": 3,
      "likesRate": 0.75
    }
  }
}
```

---

## POST `/users` (ADMIN)

Crea un usuario.

**Body:**

```json
{
  "username": "string",
  "email": "string",
  "password": "string",
  "roles": ["USER"],
  "isActive": true,
}
```

**Response 201:** UserDto

---

## GET `/users` (ADMIN)

Lista de usuarios paginada.

**Query params:**

* `page`
* `pageSize`
* `search`

**Response 200:**

```json
{
  "page": 1,
  "pageSize": 10,
  "total": 50,
  "data": [ UserDto ]
}
```

---

## GET `/users/:id` (ADMIN)

Devuelve un usuario por id.
Respuesta: UserDto

---

## PATCH `/users/:id` (dueño o ADMIN)

Actualiza campos del usuario.

**Body (campos opcionales):**

```json
{
  "username": "string",
  "email": "string",
  "password": "string",
  "isActive": true,
  "avatarUrl": "string or null",
  "bio": "string or null"
}
```

**Response 200:** UserDto

---

## PATCH `/users/:id/roles` (ADMIN)

Actualiza los roles del usuario.

**Body:**

```json
{
  "roles": ["ADMIN", "USER"]
}
```

**Response 200:** UserDto

---

## DELETE `/users/:id` (ADMIN)

Elimina un usuario.
**Response 204** sin cuerpo.

---

# Games

### Game DTO

```json
{
  "id": 1,
  "name": "string",
  "description": "string",
  "genre": "string"
}
```

---

## POST `/games` (ADMIN)

Crea un juego.

**Body:**

```json
{
  "name": "string",
  "description": "string",
  "genre": "string"
}
```

**Response 201:** Game

---

## GET `/games/:id`

Devuelve un juego.

**Response 200:** Game

---

## GET `/games`

Lista de juegos, con soporte de paginación y filtros.

**Query params:**

- `page` (number, opcional, default: 1)
- `limit` (number, opcional, default: 20)
- `search` (string, opcional) – busca por nombre o descripción (ILIKE)
- `genre` (string, opcional)
- `all` (boolean, opcional) – si es `true`, ignora paginación y devuelve todos los juegos

**Response 200 (modo paginado, `all` ausente o `false`):**

```json
{
  "page": 1,
  "limit": 20,
  "total": 47,
  "data": [
    {
      "id": 1,
      "name": "string",
      "description": "string",
      "genre": "string"
    }
  ]
}

**Response 200 (modo all=true):**

[
  {
    "id": 1,
    "name": "string",
    "description": "string",
    "genre": "string"
  }
]

---

## PATCH `/games/:id` (ADMIN)

Actualiza un juego.

**Body (parcial):**

```json
{
  "name": "string",
  "description": "string",
  "genre": "string"
}
```

**Response 200:** Game

---

## DELETE `/games/:id` (ADMIN)

Elimina un juego.
**Response 204** sin cuerpo.

---

# Home

## GET `/home/top-games`

Devuelve juegos destacados.

**Query params:**

* `limit`
* `minReviews`

**Response 200:**

```json
{
  "limit": 10,
  "minReviews": 1,
  "count": 3,
  "items": [
    {
      "id": 1,
      "name": "string",
      "genre": "string",
      "avgScore": 4.5,
      "reviewCount": 12
    }
  ]
}
```

---

## GET `/home/trending-reviews`

Devuelve reseñas con actividad reciente.

**Query params:**

* `limit`
* `days`

**Response 200:**

```json
{
  "limit": 10,
  "days": 7,
  "count": 5,
  "items": [
    {
      "id": 1,
      "content": "string",
      "score": 4,
      "createdAt": "string",
      "voteScore": 5,
      "user": { "id": 1, "username": "string" },
      "game": { "id": 1, "name": "string", "genre": "string" }
    }
  ]
}
```

---

# Reviews

### Review DTO

```json
{
  "id": 1,
  "gameId": 2,
  "userId": 3,
  "content": "string",
  "score": 5,
  "createdAt": "string",
  "updatedAt": "string"
}
```

---

### ReviewWithRelationsDTO

```json
{
  "id": 1,
  "content": "string",
  "score": 4,
  "createdAt": "string",
  "updatedAt": "string",
  "user": {
    "id": 1,
    "username": "string",
    "email": "string"
  },
  "game": {
    "id": 1,
    "name": "string",
    "genre": "string"
  }
}
```

---

## GET `/reviews/me` (login/auth requerido)

Lista paginada de reviews creadas por el usuario autenticado.

**Auth:**

- Header `Authorization: Bearer <token>`

**Query params:**

- `page` (number, opcional, default: 1)
- `pageSize` (number, opcional, default: 10, máx: 100)
- `gameId` (number, opcional) – filtra por juego dentro de las reviews del usuario

**Response 200:**

```json
{
  "page": 1,
  "pageSize": 10,
  "total": 12,
  "data": [
    {
      "id": 1,
      "gameId": 3,
      "userId": 5,
      "content": "string",
      "score": 8,
      "createdAt": "2025-11-28T03:00:00.000Z",
      "updatedAt": "2025-11-28T03:00:00.000Z"
    }
  ]
}
```

---

## POST `/reviews` (login requerido)

Crea una reseña.

**Body:**

```json
{
  "gameId": 1,
  "content": "string",
  "score": 4
}
```

**Response 201:** Review

---

## GET `/reviews/:id`

Obtiene una reseña por id.
**Response 200:** Review

---

## GET `/reviews`

Lista pública de reviews con paginación y filtros.

**Query params:**

- `page` (number, opcional, default: 1)
- `pageSize` (number, opcional, default: 10, máx: 100)
- `gameId` (number, opcional)
- `userId` (number, opcional)

**Response 200:**

```json
{
  "page": 1,
  "pageSize": 10,
  "total": 50,
  "data": [
    {
      "id": 1,
      "gameId": 3,
      "userId": 5,
      "content": "string",
      "score": 8,
      "createdAt": "2025-11-28T03:00:00.000Z",
      "updatedAt": "2025-11-28T03:00:00.000Z"
    }
  ]
}
```

---

## GET `/reviews/:id/details`

Detalle ampliado de reseña.
**Response 200:** ReviewWithRelationsDTO

---

## GET `/reviews/:id/full`

Detalle completo: review, comments, votes.

**Query params:**

* `commentsPage`
* `commentsPageSize`

**Response 200:**

```json
{
  "reviewId": 1,
  "review": ReviewWithRelationsDTO,
  "comments": {
    "page": 1,
    "pageSize": 10,
    "count": 2,
    "items": [ ReviewCommentWithUserDTO ]
  },
  "votes": {
    "upvotes": 10,
    "downvotes": 2,
    "score": 8
  }
}
```

---

## PATCH `/reviews/:id` (dueño o ADMIN)

Actualiza una reseña.

**Body (opcional):**

```json
{
  "content": "string",
  "score": 3
}
```

**Response 200:** Review

---

## DELETE `/reviews/:id` (dueño o ADMIN)

Elimina una reseña.
**Response 204** sin cuerpo.

---

# Comentarios de Reviews

### ReviewComment DTO

```json
{
  "id": 1,
  "reviewId": 1,
  "userId": 2,
  "content": "string",
  "createdAt": "string",
  "updatedAt": "string"
}
```

### ReviewCommentWithUserDTO

```json
{
  "id": 1,
  "reviewId": 1,
  "content": "string",
  "createdAt": "string",
  "updatedAt": "string",
  "user": {
    "id": 2,
    "username": "string"
  }
}
```

---

## POST `/reviews/:reviewId/comments` (login requerido)

Crea un comentario.

**Body:**

```json
{
  "content": "string"
}
```

**Response 201:** ReviewComment

---

## GET `/reviews/:reviewId/comments`

Lista de comentarios sin datos de usuario.

**Query params:**

* `page`
* `pageSize`

**Response 200:**

```json
{
  "page": 1,
  "pageSize": 10,
  "data": [ ReviewComment ]
}
```

---

## GET `/reviews/:reviewId/comments/details`

Lista de comentarios con datos de usuario.

**Query params:**

* `page`
* `pageSize`

**Response 200:**

```json
{
  "page": 1,
  "pageSize": 10,
  "data": [ ReviewCommentWithUserDTO ]
}
```

---

## PATCH `/reviews/:reviewId/comments/:commentId` (dueño o ADMIN)

Actualiza un comentario.

**Body:**

```json
{
  "content": "string"
}
```

**Response 200:** ReviewComment

---

## DELETE `/reviews/:reviewId/comments/:commentId` (dueño o ADMIN)

Elimina un comentario.
**Response 204** sin cuerpo.

---

# Votos de Reviews

### Vote Summary DTO

```json
{
  "reviewId": 1,
  "upvotes": 10,
  "downvotes": 2,
  "score": 8
}
```

---

## GET `/reviews/:reviewId/votes`

Obtiene el resumen de votos.

**Response 200:** Vote Summary DTO

---

## PUT `/reviews/:reviewId/votes` (login requerido)

Crea o actualiza un voto.

**Body:**

```json
{
  "value": 1
}
```

**Response 200:** Vote Summary DTO actualizado

---

## DELETE `/reviews/:reviewId/votes` (login requerido)

Elimina el voto del usuario.
**Response 204** sin cuerpo.

---

# Códigos de respuesta comunes

* **200 OK**
* **201 Created**
* **204 No Content**
* **400 Bad Request**
* **401 Unauthorized**
* **403 Forbidden**
* **404 Not Found**
* **409 Conflict**
* **422 Unprocessable Entity**
* **500 Internal Server Error**
