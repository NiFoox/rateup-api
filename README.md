# RateUp

Proyecto de 'Desarrollo De Software'

## Endpoints principales

### Juegos
- `GET /games/?all=true` - obtiene todos los juegos
- `GET /games?page=1&limit=10` - obtiene los juegos paginado
- `GET /games/{id}` – obtiene un juego por identificador.
- `POST /games` – crea juegos (requiere `name`, `description`, `genre`).
- `PATCH /games/{id}` – actualiza datos de un juego (`name`, `description`, `genre`).
- `DELETE /games/{id}` – elimina un juego.

### Reseñas
- `POST /reviews`
- `PUT /reviews/{id}`

### Usuarios
- `GET /api/users/{id}` – obtiene un usuario por identificador.
- `GET /api/users?page=1&pageSize=10&search=texto` – lista usuarios con paginación y búsqueda por nombre de usuario o correo.
- `POST /api/users` – crea usuarios (requiere `username`, `email`, `password`).
- `PUT /api/users/{id}` – actualiza datos del usuario (`username`, `email`, `isActive`).
- `DELETE /api/users/{id}` – elimina un usuario.

### Autenticación
- `POST /api/auth/login` – valida credenciales con `usernameOrEmail` y `password` y devuelve un token temporal.

Consulta los archivos `src/user/user.http` y `src/user/migrations/script.sql` para ejemplos de uso y datos de semilla.
