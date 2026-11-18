# Bitácora de uso de IA generativa — Page2Screen (PIA)

**Fecha:** 18 de noviembre de 2026  
**Proyecto:** Page2Screen  
**Repositorio:** https://github.com/MayelaLopez28/Page2Screen  
**URL de producción:** _(pendiente de despliegue; se pegará aquí + capturas de móvil y recarga en `/obra/...`)_  
**Herramientas usadas:** Cursor (Composer), GitHub Copilot, Figma Make (solo prompts de diseño)  
**Modalidad:** trabajo **individual** (Mayela López).

> `docs/COPILOT.md` es el brief de diseño que le pasé a Copilot.  
> Esta bitácora documenta prompts, respuestas, lo que corregí y cómo lo validé.  
> Solo afirmo cambios que ya están en el repositorio (commits citados).

---

## Participación

| Integrante | Qué hice |
|---|---|
| Mayela López | Toda la aplicación, prompts, revisión crítica del código generado, integración de APIs, documentación del PIA y preparación del despliegue |

---

## Entrada 1 — De la especificación a la arquitectura

### Problema
Tenía la especificación completa de Page2Screen (tracker + puente libro↔película + APIs + UI) y necesitaba bajarla a una app React modular, no pantallas sueltas.

### Prompt (casi literal)
> esto es lo que deseo que haga la aplicacion  
> Desarrolla "Page2Screen", una plataforma web responsive (1280px a 360px) orientada a la recomendación cruzada entre literatura y cine…  
> Tecnologías: React + TypeScript + Vite + Tailwind CSS v4 + React Router.  
> Persistencia: Context API y localStorage…  
> APIs Externas: Consumo real de TMDB API (películas) y Open Library API (libros) mediante fetch y async/await…  
> Si falla la conexión o no hay token, el sistema debe caer elegantemente a un modo demostración (Mock Data)…

### Qué respondió la IA
Armó la estructura `pages/`, `components/`, `services/`, `context/`, hooks de búsqueda/detalle y el consumo dual de APIs con fallback a mock.

### Revisión crítica (error / riesgo que sí encontré)
La IA dejó **Open Library** como fuente principal de libros. Al probar búsquedas, muchas obras salían sin portada usable o con resultados pobres. Si hubiera dejado eso tal cual, el buscador se veía “roto” aunque la petición respondiera 200.

### Cambios que hice yo
- Cambié la implementación real a **Google Books** (`googleBooks.ts`) y dejé `openLibrary.ts` solo como reexport para no romper imports.
- Sumé un **catálogo local** con ISBN para portadas estables.
- Mantuve TMDB para cine y el mapa de géneros del recommender.

### Validación
- Buscador del header: películas (TMDB) + libros (catálogo / Google Books).
- Sin token: en consola aparece `[Page2Screen] Modo demostración TMDB…`.
- Evidencia verificable: commit `28c33f5` (*Cambios*) y archivos `src/services/googleBooks.ts`, `src/services/openLibrary.ts`.

---

## Entrada 2 — Cliente TMDB y el token en el navegador

### Problema
Necesitaba búsqueda, trending, discover y detalle de películas con `fetch`/`async-await`, sin tumbar la app si faltaba credencial o fallaba la red.

### Prompt (casi literal)
> Las solicitudes a TMDB deben utilizar una clave de API inyectada mediante variables de entorno (`VITE_TMDB_TOKEN`).  
> Implementa el servicio con Authorization Bearer, endpoints `/search/movie`, `/trending/movie/week`, `/discover/movie`, `/movie/{id}` y fallback a mock.

### Qué respondió la IA
Un `tmdb.ts` con `fetch`, mapeo a `SearchResult` y `try/catch` que devolvía mock si algo fallaba. El Bearer se armaba siempre que existiera `VITE_TMDB_TOKEN`.

### Revisión crítica
1. **Seguridad:** todo lo que empieza con `VITE_` se embebe en el JS del navegador. En producción cualquiera puede leer el token en DevTools.
2. **Fallback que esconde fallos:** si el token está mal (401) o hay error de red, el `catch` regresa mock y la UI “se ve bien”.
3. Si se define token **y** proxy a la vez, el cliente no debería mandar el Bearer (el token debe vivir solo en el servidor).

### Cambios que hice yo
- Añadí `VITE_TMDB_PROXY` y la constante `USE_PROXY` en `src/services/tmdb.ts`.
- Con proxy activo **no** se envía `Authorization` desde el navegador.
- Dejé `api/tmdb/[...path].js` (Vercel) para usar `TMDB_TOKEN` solo en el servidor.
- Regla de uso: en producción define `VITE_TMDB_PROXY=/api/tmdb` y **no** definas `VITE_TMDB_TOKEN`.

### Validación
- En código (tras el fix):  
  `isTmdbMockMode = !TMDB_TOKEN && !USE_PROXY`  
  y el Bearer solo si `!USE_PROXY && TMDB_TOKEN`.
- Endpoints: `/search/movie`, `/trending/movie/week`, `/discover/movie`, `/movie/{id}?append_to_response=credits`.
- Commits: `2c6f10a` (proxy + `USE_PROXY`) y `b358f0e` (docs alineados); ambos en `main`.

---

## Entrada 3 — Mejora visual de Work Detail (Copilot)

### Problema
La ficha de obra ya funcionaba (guardar, reseña, sugerencia cruzada), pero no se sentía “librería-cine boutique”.

### Prompt / contexto (brief)
Usé el contenido de `docs/COPILOT.md`: paleta papel/tinta (`#F2F0E9`, `#1C1C1C`, `#6B6B6B`, `#D0CBC0`), tipografías Libre Baskerville + IBM Plex Mono, portada como protagonista, conservar rutas `/obra/:tipo/:id`.

### Qué respondió la IA
Cambios en `WorkDetailPage.tsx`, `CrossSuggestionBox.tsx` y `OpinionList.tsx` (más aire, mejor jerarquía, CTAs más claros).

### Revisión crítica
Copilot metía **más “cards” y decoración** de la que pedía el brief. Eso le quitaba protagonismo a la portada. También había que vigilar que no rompiera el bridge ni las reseñas.

### Cambios que hice yo
- Acepté tipografía y jerarquía.
- Quité / evité lo genérico (purple, glow, cards de más).
- Revisé a mano: toast al guardar, sugerencia cruzada y opiniones del círculo.

### Validación
- Commit en `main`: `9a9c77e` — *Mejora visual WorkDetail con copilot*.
- Rama remota `feature/copilot-ui-work-detail` apunta al **mismo** SHA `9a9c77e` (flujo EV04; se puede abrir/cerrar PR hacia `main` aunque el commit ya esté integrado).
- Archivos: `src/pages/WorkDetailPage.tsx`, `src/components/recommendations/CrossSuggestionBox.tsx`, `src/components/social/OpinionList.tsx`.

---

## Entrada 4 — Bug real en `getBookDetails` (doble fetch + catch vacío)

### Problema
Al revisar el detalle de libro asistido por IA, a veces “funcionaba” con texto genérico y no sabía si Google Books había fallado.

### Prompt (casi literal)
> Revisa `getBookDetails` en el servicio de libros: debe enriquecer el catálogo local con la sinopsis de Google Books por ISBN, manejar errores y no duplicar lógica de fetch.

### Qué había en el código (antes del fix)
1. Llamaba `fetchVolumes(...)` **y además** volvía a hacer `fetch` a la misma URL.
2. Ignoraba el primer resultado con `void results`.
3. Tenía un `catch { }` **vacío**.

```ts
const results = await fetchVolumes(`isbn:${catalog.isbn}`, 1);
const res = await fetch(url);
// ...
void results;
} catch {
}
```

### Revisión crítica
- Doble petición innecesaria.
- `catch` vacío: con key inválida o 429 la UI muestra sinopsis del catálogo y **parece éxito**.
- La IA entregó código que compila pero oculta fallos reales.

### Cambios que hice yo (aplicados en el repo)
- Eliminé la llamada duplicada y el `void results`.
- Reemplacé `catch { }` por `console.error` + `warnDemo`.
- El fallback al catálogo local se mantiene, pero ya deja rastro en consola.

### Validación (salida real con key inválida)

Prueba: ISBN `9780553293357` (catálogo) + `key=INVALID_KEY_TEST_PIA`.  
Google Books responde **HTTP 400** (“API key not valid”). El código del fix lanza `Error('Google Books 400')` y registra:

```text
[Page2Screen] getBookDetails (ISBN): Error: Google Books 400
[Page2Screen] Google Books (detalle tras error de API): usando catálogo local con portadas ISBN.
```

Evidencia en archivo: `src/services/googleBooks.ts` → `getBookDetails`.  
Commit del fix: `b358f0e` — *fix: getBookDetails sin catch vacío y docs alineados al repo* (en `main`).

---

## Evidencia post-despliegue (completar al publicar)

| Prueba | Evidencia |
|---|---|
| URL pública | _(pegar link)_ |
| Móvil | _(captura)_ |
| Recarga `/obra/libro/...` sin 404 | _(captura)_ |
| Recarga `/obra/pelicula/...` sin 404 | _(captura)_ |
| Token solo en hosting (no en repo) | Variables en panel Vercel / Netlify |

---

## Resumen de criterio

| Caso | Qué acepté de la IA | Qué corregí o rechacé |
|---|---|---|
| Arquitectura inicial | Módulos, fetch async, mock | Open Library como fuente principal → Google Books + catálogo |
| TMDB | Endpoints y mapeo | Token en cliente; Bearer con proxy; fallback que esconde 401 |
| Copilot UI | Jerarquía de Work Detail | Cards / estilo genérico |
| Servicio de libros | Idea de enriquecer por ISBN | Doble fetch + `catch` vacío + `void results` |
