# Backend SolsaFilms

API REST de administración con **Node.js**, **Supabase** y **bcrypt**.

## 1. Crear las tablas en Supabase

1. Abre el proyecto en [Supabase](https://supabase.com/dashboard).
2. Ve a **SQL Editor** → New query.
3. Pega y ejecuta el contenido de `sql/schema.sql`.

## 2. Obtener la service_role key

En el dashboard, pulsa **Connect** (o Project Settings → API) y copia:

- Project URL (ya está en `.env.example`)
- `service_role` (secret) — solo para el servidor, nunca en el frontend

## 3. Configurar el entorno

```bash
cd backend
copy .env.example .env
```

Edita `.env` y pega `SUPABASE_SERVICE_ROLE_KEY` y un `JWT_SECRET` propio.

## 4. Instalar y arrancar

```bash
npm install
npm run dev
```

La API queda en `http://localhost:3000`.

## Endpoints

| Método | Ruta | Auth | Descripción |
|--------|------|------|-------------|
| GET | `/api/health` | No | Estado del servicio |
| POST | `/api/auth/register` | No | Primer usuario = admin. Siguientes = empleado |
| POST | `/api/auth/login` | No | Login (compara bcrypt + JWT) |
| GET | `/api/auth/me` | Bearer | Perfil de la sesión |
| CRUD | `/api/usuarios` | Admin | Gestión de usuarios |
| CRUD | `/api/peliculas` | Empleado/Admin | Catálogo |
| CRUD | `/api/clientes` | Empleado/Admin | Clientes |
| CRUD | `/api/rentas` | Empleado/Admin | Rentas |
| PATCH | `/api/rentas/:id/devolver` | Empleado/Admin | Devolver película |

Las eliminaciones de películas, clientes y rentas requieren rol **admin**.

## Ejemplo de login

```http
POST /api/auth/register
Content-Type: application/json

{
  "nombre": "Adrian Admin",
  "email": "admin@solsafilms.com",
  "password": "Secreto123"
}
```

Luego envía en el resto de peticiones:

```
Authorization: Bearer <token>
```

Las contraseñas se guardan como hash bcrypt (`password_hash`). Nunca se devuelven en las respuestas JSON.
