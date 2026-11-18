# Page2Screen

Plataforma web responsive que conecta **libros y películas**: tracker personal, reseñas y **recomendaciones cruzadas** (“una historia lleva a otra”).

**Stack:** React 19 + TypeScript + Vite + Tailwind CSS v4 + React Router 7  
**Datos:** Context API + `localStorage` · APIs TMDB (cine) y Google Books (libros)

---

## Integrantes

| Integrante | Participación |
|---|---|
| Mayela López | Desarrollo de pantallas y servicios, integración de APIs, uso crítico de IA (bitácora), documentación y despliegue |

> Trabajo individual. Si se entrega en equipo (máx. 2), completar esta tabla con el aporte de cada persona.

---

## Funcionalidades

- Explorar tendencias y buscar obras (películas + libros).
- Guardar en listas (pendiente / leído o visto) con calificación y notas.
- Ficha de detalle con sinopsis, opiniones del círculo y **sugerencia cruzada**.
- Perfil social sin backend: código de perfil (Base64) para agregar amigos.
- Estados de **carga / éxito / error** (y fallback a datos demo si faltan claves).

---

## Desarrollo local

```bash
npm install
cp .env.example .env   # PowerShell: Copy-Item .env.example .env
# Completa VITE_TMDB_TOKEN y/o VITE_GOOGLE_BOOKS_KEY
npm run dev
```

| Script | Descripción |
|---|---|
| `npm run dev` | Servidor de desarrollo |
| `npm run build` | Build de producción (`tsc` + Vite) |
| `npm run preview` | Vista previa del build |
| `npm run lint` | ESLint |

---

## Variables de entorno

Ver `.env.example`. Resumen:

| Variable | Ámbito | Descripción |
|---|---|---|
| `VITE_TMDB_TOKEN` | Cliente (Vite) | Read Access Token TMDB v4. **Se embebe en el JS** |
| `VITE_TMDB_PROXY` | Cliente | Base URL del proxy (ej. `/api/tmdb`). Preferible en producción |
| `TMDB_TOKEN` | Solo servidor | Token real para `api/tmdb.js` (Vercel). Sin prefijo `VITE_` |
| `VITE_GOOGLE_BOOKS_KEY` | Cliente | API key de Google Books |

Sin claves, la app arranca en **modo demostración** (mock / catálogo local) y avisa por consola.

### Limitación conocida — seguridad del token

Cualquier variable `VITE_*` es pública en el bundle. Para producción académica o real:

1. Configura `TMDB_TOKEN` en el panel de Vercel (Environment Variables).
2. Despliega con la función `api/tmdb.js`.
3. En el hosting define `VITE_TMDB_PROXY=/api/tmdb` y **no** expongas `VITE_TMDB_TOKEN`.

Documentación detallada: [`docs/API.md`](docs/API.md).

---

## APIs externas

| Servicio | Endpoints principales | Doc |
|---|---|---|
| TMDB | `/search/movie`, `/trending/movie/week`, `/discover/movie`, `/movie/{id}` | [docs/API.md](docs/API.md) |
| Google Books | `/volumes`, `/volumes/{id}` | [docs/API.md](docs/API.md) |

Implementación: `fetch` + `async/await` + parseo JSON en `src/services/`.

---

## Despliegue (producción)

### Vercel (recomendado)

1. Importa el repo en [vercel.com](https://vercel.com).
2. Framework preset: Vite. Build: `npm run build`. Output: `dist`.
3. Variables de entorno en el proyecto:
   - `TMDB_TOKEN` = token secreto (servidor)
   - `VITE_TMDB_PROXY` = `/api/tmdb`
   - `VITE_GOOGLE_BOOKS_KEY` = key (opcional)
4. `vercel.json` reescribe rutas SPA a `index.html` (evita 404 al recargar `/obra/...`) y enruta el proxy.

### Netlify (alternativa)

- Build: `npm run build` · Publish: `dist`
- `public/_redirects` incluye `/* /index.html 200` para el SPA.

### Verificación post-deploy

- [ ] Home / Explorar carga
- [ ] Buscador devuelve películas (API real o mock consciente)
- [ ] Recargar `/obra/pelicula/<id>` no da 404
- [ ] Listas y perfil persisten en el navegador (`localStorage`)

**URL pública:** _(pegar aquí tras el deploy)_  
**Repositorio:** https://github.com/MayelaLopez28/Page2Screen

---

## Flujo de ramas (EV04)

```
main
 └── feature/copilot-ui-work-detail   # mejora UI Work Detail
 └── feature/pia-docs-deploy-api      # docs PIA, env, hosting, proxy
```

Commits descriptivos y PR hacia `main` (no un único commit “Cambios”).

---

## Documentación del PIA

| Entregable | Archivo |
|---|---|
| Bitácora de uso de IA | [`docs/BITACORA_IA.md`](docs/BITACORA_IA.md) |
| Brief Copilot (contexto de diseño) | [`docs/COPILOT.md`](docs/COPILOT.md) |
| Documentación de APIs | [`docs/API.md`](docs/API.md) |
| Variables de entorno | [`.env.example`](.env.example) |

---

## Estructura relevante

```
src/
  components/   # UI reutilizable
  pages/        # pantallas / rutas
  services/     # TMDB, Google Books, recommender
  context/      # biblioteca + perfil (localStorage)
  hooks/        # búsqueda, detalle, recomendaciones
api/
  tmdb.js       # proxy serverless (Vercel)
docs/           # bitácora, API, Copilot
```
