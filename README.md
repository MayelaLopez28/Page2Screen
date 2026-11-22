# Page2Screen

Plataforma web responsive que conecta **libros y películas**: tracker personal, reseñas y **recomendaciones cruzadas** (“una historia lleva a otra”).

**Stack:** React 19 + TypeScript + Vite + Tailwind CSS v4 + React Router 7  
**Datos:** Context API + `localStorage` · APIs TMDB (cine) y Google Books (libros)

---

## Participación

**Modalidad: trabajo individual** (no hubo equipo).  
Autora única: **Mayela López**.

| Autora | Rol / qué hice (100 % del PIA) |
|---|---|
| Mayela López | Diseño e implementación de pantallas y componentes; servicios TMDB y Google Books (`fetch` + `async/await`); uso crítico de IA generativa (bitácora); variables de entorno y proxy; documentación; despliegue en Vercel y verificación en producción |

No hay coautores ni división de tareas con otra persona.

---

## Funcionalidades

- Explorar catálogo con filtros por **formato** (libros/películas) y por **género** (terror, romance, fantasía, etc.).
- Guardar en listas (**Por leer / Por ver**, leído/visto, DNF) con calificación, notas y fechas de registro.
- Ficha de detalle: sinopsis, promedio que incluye tu nota, obras **similares del mismo género**, **sugerencia cruzada** (con obra de referencia visible).
- Si ya se consumió: estado **Ya leíste / Ya viste** y opción **Volví a leerla/verla** para actualizar (o mantener) la opinión.
- Recomendaciones cruzadas a partir de pendientes o reseñas ≥ 3.5★; en el perfil, **No me interesa** descarta esa sugerencia y rotan al iniciar sesión.
- **Login** con usuario/contraseña o **crear perfil**; cerrar sesión desde el perfil.
- Perfil: **Historial** con fechas al seleccionar un título; leídos/vistas/DNF con portadas; amigos por código.
- Layout responsive (más ancho en desktop maximizado; historial usable en móvil).
- Estados de **carga / éxito / error** (toast breve; fallback demo si faltan claves).

---

## Desarrollo local

```bash
npm install
# Crea un .env local con las variables de la tabla (no se sube al repo)
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

| Variable | ¿Dónde? | Obligatoria | Descripción |
|---|---|---|---|
| `VITE_TMDB_TOKEN` | Cliente (Vite) | No, si usas proxy | Read Access Token TMDB v4. **Se embebe en el JS** |
| `VITE_TMDB_PROXY` | Cliente (Vite) | No | Base del proxy, p. ej. `/api/tmdb` |
| `TMDB_TOKEN` | Solo servidor (Vercel) | Sí, si usas proxy | Token secreto para `api/tmdb/[...path].js` (sin `VITE_`) |
| `VITE_GOOGLE_BOOKS_KEY` | Cliente (Vite) | No | API key de Google Books |

Las variables se configuran en un `.env` local o en el panel del hosting. **No hay `.env` / `.env.example` en el repositorio.**  
Sin claves, la app arranca en **modo demostración** (mock / catálogo local) y avisa por consola.

### Limitación conocida — seguridad del token

Cualquier `VITE_*` es pública en el bundle. En producción:

1. Configura `TMDB_TOKEN` en el panel del hosting (no en el repo).
2. Usa la función `api/tmdb/[...path].js`.
3. Define `VITE_TMDB_PROXY=/api/tmdb` y **no** subas `VITE_TMDB_TOKEN` al hosting si ya usas proxy.

Detalle de endpoints: ver documentación de API entregada por Teams (no está en este repo).

---

## APIs externas

| Servicio | Endpoints principales |
|---|---|
| TMDB | `/search/movie`, `/trending/movie/week`, `/discover/movie`, `/movie/{id}` |
| Google Books | `/volumes`, `/volumes/{id}` |

Implementación con `fetch` + `async/await` + JSON en `src/services/`.

---

## Despliegue (producción)

### Vercel (recomendado)

1. Importa el repo en [vercel.com](https://vercel.com) (rama con estos archivos, p. ej. `feature/pia-docs-deploy-api` o `main` tras merge).
2. Framework: Vite · Build: `npm run build` · Output: `dist`.
3. Variables en el panel de Vercel (no en Git):
   - `TMDB_TOKEN` = token secreto
   - `VITE_TMDB_PROXY` = `/api/tmdb`
   - `VITE_GOOGLE_BOOKS_KEY` = key (opcional)
4. `vercel.json` reescribe el SPA a `index.html` para que recargar `/obra/...` no dé 404.

### Netlify (alternativa)

- Build: `npm run build` · Publish: `dist`
- `public/_redirects` incluye `/* /index.html 200`

### Verificación post-deploy

- [ ] Home / Explorar carga
- [ ] Buscador con y sin resultados
- [ ] Recargar `/obra/libro/...` y `/obra/pelicula/...` (sin 404)
- [ ] Vista móvil
- [ ] Token solo en el hosting, no en el repo

**URL pública:** https://page2-screen.vercel.app  
**Capturas:** _(móvil + recarga de `/obra/...` — agregar al entregar)_  
**Repositorio:** https://github.com/MayelaLopez28/Page2Screen

---

## Flujo de ramas (EV04)

```
main                                 # línea principal (incluye docs PIA tras merge)
 ├── feature/copilot-ui-work-detail  # 9a9c77e — mejora UI Work Detail
 └── feature/pia-docs-deploy-api     # docs PIA, README, vercel, proxy, fix getBookDetails
```

---

## Documentación del PIA

Entrega por **MS Teams** (carpeta local `docs/`, ignorada por Git): bitácora de IA, API, Lighthouse/Axe, heurísticas y checklist de entrega.  
Variables de entorno: tabla de arriba (solo en local/hosting, no en Git).

**Para Teams:** URL pública + repo + `docs/BITACORA_IA.md` + `docs/API.md` (+ capturas y `docs/LIGHTHOUSE_AXE.md`).

---

## Estructura relevante

```
src/
  components/          # UI reutilizable
  pages/               # pantallas / rutas
  services/            # TMDB, Google Books, recommender
  context/             # biblioteca + perfil (localStorage)
  hooks/               # búsqueda, detalle, recomendaciones
api/
  tmdb/[...path].js    # proxy serverless TMDB (Vercel)
vercel.json            # rewrite SPA
public/_redirects      # rewrite SPA (Netlify)
```

