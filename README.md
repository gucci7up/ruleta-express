# Ruleta Express

Sistema completo de ruleta express para locales de apuestas. 19 números (0–18), 2 tipos de apuesta (número y color), rondas automáticas cada 5 minutos, impresión térmica de tickets con QR, y panel de administración.

## Arquitectura

```
ruleta-express/
├── apps/
│   ├── api/        # NestJS + PostgreSQL + Redis + Socket.IO   → :3000
│   ├── pos/        # React — Terminal cajero (touch screen)     → :4001
│   ├── display/    # React — Pantalla TV/tablet                 → :4002
│   └── admin/      # React — Panel administrador               → :4003
└── packages/
    └── shared/     # Tipos TypeScript compartidos
```

## Requisitos

- Node.js 20+
- pnpm 9+
- Docker + Docker Compose

## Setup desarrollo local

```bash
# 1. Instalar dependencias
pnpm install

# 2. Levantar PostgreSQL y Redis
docker compose up -d postgres redis

# 3. Copiar y configurar variables de entorno
cp .env.example apps/api/.env
# Editar apps/api/.env con tus valores

# 4. Generar cliente Prisma y aplicar migraciones
cd apps/api
npx prisma migrate dev
npx prisma db seed

# 5. Levantar todo en modo desarrollo
cd ../..
pnpm dev
```

URLs en desarrollo:
- API + Swagger: http://localhost:3000/api/docs
- POS: http://localhost:5173
- Display: http://localhost:5174
- Admin: http://localhost:5175

### Credenciales seed

| Rol | Email | Password | PIN |
|-----|-------|----------|-----|
| Admin | admin@ruleta.com | admin123 | — |
| Operador | cajero@ruleta.com | operator123 | 1234 |

## Producción (Docker)

```bash
# 1. Copiar y configurar variables
cp .env.prod.example .env.prod
# Editar .env.prod con contraseñas seguras y URLs reales

# 2. Levantar todo
docker compose -f docker-compose.prod.yml --env-file .env.prod up -d

# 3. La primera vez: ejecutar seed (solo una vez)
docker compose -f docker-compose.prod.yml exec api npx prisma db seed
```

## Despliegue en Dokploy

### Cómo funciona la configuración en runtime

Los frontends (pos, display, admin) se construyen con placeholders (`__VITE_API_URL__`, etc.).  
Al arrancar cada contenedor, `docker-entrypoint.sh` reemplaza esos placeholders con las variables de entorno reales usando `sed`. Esto significa que **puedes cambiar las URLs desde Dokploy sin rebuildar la imagen**.

### Pasos

1. **Subir a GitHub** — hacer push del monorepo completo a tu repo en gucci7up

2. **En Dokploy → New Application → Docker Compose**
   - Source: GitHub → tu repo
   - Compose file: `docker-compose.prod.yml`

3. **Configurar variables de entorno en Dokploy** (pestaña Environment):
   ```
   POSTGRES_PASSWORD=password_muy_fuerte
   REDIS_PASSWORD=password_redis
   JWT_SECRET=64_caracteres_random
   JWT_REFRESH_SECRET=otros_64_caracteres
   API_URL=https://api.tudominio.com
   POS_URL=https://pos.tudominio.com
   BRANCH_ID=1
   ```

4. **Deploy** — Dokploy buildea y levanta todos los servicios

5. **Seed inicial** (solo una vez, desde Dokploy → Terminal del servicio `api`):
   ```bash
   npx prisma db seed
   ```

6. **Dominios en Dokploy** — asignar un dominio a cada servicio:
   - `api` → api.tudominio.com (puerto 3000)
   - `pos` → pos.tudominio.com (puerto 80)
   - `display` → display.tudominio.com (puerto 80)
   - `admin` → admin.tudominio.com (puerto 80)

> **CORS**: Asegúrate de que `API_URL` en Dokploy coincida exactamente con el dominio que usarás en el frontend. El API permite CORS desde cualquier origen en producción — ajustar en `apps/api/src/main.ts` si quieres restringirlo.

## Lógica del juego

### Números y colores
| Número | Color |
|--------|-------|
| 0 | Verde (×18) |
| 1, 3, 5, 7, 9, 11, 13, 15, 17 | Rojo (×2) |
| 2, 4, 6, 8, 10, 12, 14, 16, 18 | Negro (×2) |

### Tipos de apuesta
- **Por número** (0–18): paga ×18 si el número exacto sale
- **Por color** (Rojo/Negro/Verde): paga según multiplicador del color

### Ciclo de ronda
```
OPEN (4:30 min) → CLOSED (30s aviso) → DRAWING (~5s) → FINISHED → OPEN
```

### Ticket QR
El ticket impreso contiene un QR que apunta a `/ticket/:uuid` en el POS.
La página muestra el estado de la apuesta en tiempo real sin requerir login.

## Variables de entorno (API)

| Variable | Descripción |
|----------|-------------|
| `DATABASE_URL` | PostgreSQL connection string |
| `REDIS_URL` | Redis connection string |
| `JWT_SECRET` | Secret para access tokens (≥64 chars) |
| `JWT_REFRESH_SECRET` | Secret para refresh tokens (≥64 chars) |
| `PORT` | Puerto del servidor (default: 3000) |

## Variables de entorno (Frontends)

| Variable | App | Descripción |
|----------|-----|-------------|
| `VITE_API_URL` | pos, display, admin | URL base de la API |
| `VITE_SOCKET_URL` | pos, display | URL del servidor Socket.IO |
| `VITE_TICKET_BASE_URL` | pos | URL base para QR de tickets |
| `VITE_BRANCH_ID` | display | ID de sucursal a mostrar |

## Motor de sorteo

El sorteo usa `crypto.randomInt(0, 19)` por defecto. Para conectar una ruleta física:

1. Crear `apps/api/src/modules/draw/providers/physical-draw.provider.ts`
2. Implementar la interfaz `DrawProvider` (`draw(roundId): Promise<number>`)
3. Reemplazar en `apps/api/src/modules/draw/draw.module.ts`:
   ```typescript
   { provide: DRAW_PROVIDER, useClass: PhysicalDrawProvider }
   ```

## Scripts útiles

```bash
pnpm build          # Build todos los paquetes
pnpm test           # Tests de todos los paquetes
pnpm lint           # Lint de todos los paquetes

# Solo API
cd apps/api
npx prisma studio   # GUI para la base de datos
npx prisma migrate reset  # Reset completo (cuidado en producción)
```
