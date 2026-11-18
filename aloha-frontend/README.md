# ALOHA — My Learning Journal (frontend)

Diario digital de aprendizajes con estética **Tropical Kawaii + Pastel Productivity + Digital Scrapbook**.
React 19 · TypeScript estricto · Vite · React Router · Axios · Tailwind CSS v4 · React Hook Form + Zod ·
Recharts · react-day-picker · Lucide React · Nunito + Fredoka.

## Inicio rápido

```bash
npm install
cp .env.example .env      # ajusta VITE_API_URL a tu backend Spring Boot
npm run dev               # http://localhost:5173  (usa la API real)
npm run dev:demo          # sin backend: datos de demostración en el navegador
```

Cuenta de demostración (solo con `dev:demo`): `demo@aloha.app` / `aloha1234`.

| Script | Qué hace |
|---|---|
| `npm run dev` / `build` | Desarrollo / build de producción (**sin** código demo) |
| `npm run dev:demo` / `build:demo` | Igual, con el backend simulado activado |
| `npm run typecheck` | Comprobación de tipos (modo estricto) |

## Variables de entorno

| Variable | Por defecto | Descripción |
|---|---|---|
| `VITE_API_URL` | `http://localhost:8080/api` | URL base de la API REST |
| `VITE_API_WITH_CREDENTIALS` | `false` | Enviar cookies (si el JWT va en cookie HttpOnly) |
| `VITE_DEMO_MODE` | `false` | Activa el backend simulado. **Nunca en producción** |

## Arquitectura

```
src/
  lib/          apiClient (ÚNICA instancia de Axios), tokenStorage (JWT), errors, format, env…
  services/     auth, learning, category, tag, goal, stats  → solo hablan con la API
  types/        contrato de datos con el backend
  schemas/      validaciones Zod de todos los formularios
  context/      AuthProvider (sesión) y ToastProvider (mensajes)
  hooks/        useApi (cargando/error/recarga), useLearningFilters (filtros en la URL), …
  components/   ui/ (sistema de diseño), layout/, learning/, charts/, calendar/, goals/, illustrations/
  pages/        una por pantalla (cargadas con lazy)
  demo/         backend simulado — AISLADO, solo se carga con VITE_DEMO_MODE=true
  styles/       tokens CSS (@theme) y estilos base
```

- `App.tsx` solo define rutas. La lógica vive en páginas, hooks y servicios.
- Los colores, radios, sombras y animaciones son **variables CSS** en `src/styles/index.css`.
- Los filtros, la página y el día seleccionado viven en la URL (se pueden compartir y recargar).
- **Los datos demo no sustituyen a la API**: `src/demo` solo reemplaza el *transporte* de Axios
  y el build de producción no lo incluye (verificado).

## Seguridad de la sesión

- JWT en `Authorization: Bearer <token>` desde un interceptor de Axios.
- «Mantener sesión» → `localStorage`; si no → `sessionStorage`.
- El token se valida contra su `exp` antes de usarse; uno vencido nunca se envía.
- Un `401` en un endpoint protegido limpia la sesión y redirige a `/login`
  (un `401` en login/registro solo muestra el error).
- Rutas protegidas con `ProtectedRoute`; si el servidor no responde al restaurar la sesión se muestra
  una pantalla de reintento (no se cierra la sesión por una caída).
- El contenido enriquecido se renderiza con `react-markdown` **sin HTML crudo** (sin riesgo de XSS).
- Para máxima seguridad el backend puede emitir el JWT en una cookie `HttpOnly` y usar `VITE_API_WITH_CREDENTIALS=true`.

## Contrato de la API REST (Spring Boot)

Base: `VITE_API_URL`. Todas las rutas, salvo login/registro, exigen `Authorization: Bearer <jwt>`.
Fechas «día»: `YYYY-MM-DD`. Marcas de tiempo: ISO‑8601. Los tipos exactos están en `src/types/index.ts`.

| Método | Ruta | Cuerpo / parámetros | Respuesta |
|---|---|---|---|
| POST | `/auth/register` | `{name,email,password}` | `201 {token,user}` |
| POST | `/auth/login` | `{email,password}` | `{token,user}` |
| GET | `/auth/me` | — | `User` |
| PUT | `/users/me` | `{name,bio,avatar}` | `User` |
| PUT | `/users/me/password` | `{currentPassword,newPassword}` | `204` |
| GET | `/learnings` | `page` (base 0), `size`, `search`, `categoryId`, `tag`, `favorite`, `from`, `to`, `sort` (`learnedAt,desc` · `learnedAt,asc` · `updatedAt,desc` · `title,asc`) | `Page<Learning>` (forma de Spring `Page`) |
| GET | `/learnings/{id}` | — | `Learning` |
| POST | `/learnings` | `{title,summary,content,categoryId,tags[],source,learnedAt,favorite}` | `201 Learning` (crea las etiquetas que no existan) |
| PUT | `/learnings/{id}` | igual que POST | `Learning` |
| PATCH | `/learnings/{id}/favorite` | `{favorite}` | `Learning` |
| DELETE | `/learnings/{id}` | — | `204` |
| GET | `/learnings/discovery` | — | `Learning` o `204` |
| GET / POST | `/categories` | `{name,description,color,icon}` | `Category[]` / `201 Category` |
| PUT / DELETE | `/categories/{id}` | — | `Category` / `204` (los aprendizajes quedan sin categoría) |
| GET | `/tags` | — | `Tag[]` |
| PUT / DELETE | `/tags/{id}` | `{name}` | `Tag` / `204` |
| GET / POST | `/goals` | `?status=ACTIVE\|COMPLETED\|ARCHIVED` / `{title,description,targetCount,deadline,status}` | `Goal[]` / `201 Goal` |
| PUT / DELETE | `/goals/{id}` | — | `Goal` / `204` |
| PATCH | `/goals/{id}/status` | `{status}` | `Goal` |
| GET | `/stats/summary` | — | `StatsSummary` |
| GET | `/stats/activity` | `days` | `[{date,count}]` |
| GET | `/stats/calendar` | `from`, `to` | `[{date,count}]` |
| GET | `/stats/categories` | — | `[{categoryId,name,color,icon,count}]` |
| GET | `/stats/monthly` | `months` | `[{month:'YYYY-MM',count}]` |

**Errores** (recomendado): `{ "message": "...", "fieldErrors": { "title": "no puede estar vacío" } }`.
Los `fieldErrors` se muestran junto a cada campo; `message` aparece como aviso general del formulario.
`Goal.currentCount` lo calcula el backend (aprendizajes entre la creación del objetivo y su fecha límite).

**CORS**: permite el origen del frontend y la cabecera `Authorization`.

## Pantallas

Panel · Cuaderno (cronológico) · Crear/editar aprendizaje (editor Markdown con vista previa) · Detalle ·
Biblioteca (tarjetas con filtros y paginación) · Categorías y etiquetas · Calendario · Objetivos ·
Estadísticas · Perfil y preferencias · Login y registro.

Transversal: buscador global (`Ctrl/⌘ + K`), navegación lateral + menú móvil, confirmaciones al eliminar,
mensajes de éxito/error, skeletons, estados vacíos ilustrados, errores de conexión con reintento,
favoritos optimistas y opción «Reducir animaciones».

## Verificación realizada

- `tsc` en modo estricto sin errores; el build de producción no contiene código demo.
- 26 pruebas de navegador (Playwright) sobre todos los módulos y el CRUD, incluido móvil sin scroll horizontal.
- 10 pruebas de contrato con la API simulada por red: cabecera Bearer, endpoints, 401, token vencido,
  servidor caído y reintento.
- Auditoría de accesibilidad axe-core (WCAG 2.1 AA + buenas prácticas): 0 problemas en todas las pantallas.
