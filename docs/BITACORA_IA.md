# Bitácora de uso de IA generativa — Page2Screen (PIA)

**Proyecto:** Page2Screen  
**Herramientas:** Cursor (Composer / agentes), GitHub Copilot, Figma Make (prompts de diseño)  
**Propósito:** dejar evidencia de uso **crítico** de IA: prompts, respuesta, revisión humana, cambios y validación.

> `docs/COPILOT.md` es el **brief de diseño** para Copilot. Esta bitácora es el entregable de uso crítico de IA.

---

## Integrantes y participación

| Integrante | Rol en la bitácora / código |
|---|---|
| Mayela López | Desarrollo de la app, integración TMDB + Google Books, prompts, revisión crítica, documentación PIA y despliegue |

*(Si el trabajo es en equipo de 2, agregar aquí el segundo integrante y qué prompts/archivos revisó cada quien.)*

---

## Entrada 1 — Especificación → arquitectura base

### Problema
Necesitaba convertir la especificación completa de Page2Screen (tracker + puente libro↔película + APIs + UI) en una app React modular sin inventar pantallas sueltas.

### Prompt (resumen)
> Desarrolla Page2Screen… React + TypeScript + Vite + Tailwind + Router… Context + localStorage… TMDB y Open Library con `fetch`/`async-await`… fallback mock si no hay token… CrossBridge… formulario estricto… perfil social con código Base64…

### Qué respondió la IA
Propuso estructura `pages/`, `components/`, `services/`, `context/`, hooks de búsqueda/detalle y consumo dual de APIs con modo demo.

### Revisión crítica (error / riesgo / mejora detectada)
La IA insistió en **Open Library** como fuente principal de libros. En la práctica las portadas y la cobertura eran inconsistentes frente al catálogo que necesitábamos. **Riesgo:** acoplar la UI solo a Open Library habría dejado búsquedas vacías o sin portada.

### Cambios hechos por mí
- Mantuve la fachada `openLibrary.ts` exportando desde `googleBooks.ts`.
- Combiné **catálogo local curado** + Google Books Volumes.
- Conservé TMDB para cine y el mapa de géneros del recommender.

### Validación
- Búsqueda combinada en header (películas + libros).
- Sin token: cae a mock/catálogo y avisa por `console.warn`.
- Con token: resultados reales de TMDB / volumes.

---

## Entrada 2 — Integración TMDB con Bearer token

### Problema
Consumir búsqueda, trending, discover y detalle de películas sin romper la app si falla la red o falta credencial.

### Prompt (resumen)
> Implementa el servicio TMDB con `VITE_TMDB_TOKEN`, `Authorization: Bearer`, endpoints `/search/movie`, `/trending/movie/week`, `/discover/movie`, `/movie/{id}` y fallback a mock.

### Qué respondió la IA
Un cliente con `fetch`, mapeo a `SearchResult`/`Work` y `try/catch` que devolvía mock ante error.

### Revisión crítica
Detecté un **riesgo de seguridad**: `VITE_*` se embebe en el bundle del navegador. Cualquiera puede leer el token en producción. La IA no priorizó proxy.

### Cambios hechos por mí
- Añadí soporte de `VITE_TMDB_PROXY` para apuntar a un proxy serverless.
- Documenté el riesgo en README / API / limitaciones.
- Añadí función `api/tmdb.js` (Vercel) que guarda el token en el servidor.

### Validación
- `isTmdbMockMode` solo cuando no hay token ni proxy.
- Build de producción sin `.env` → modo demo (esperado).
- Con variables en el hosting → llamadas reales.

---

## Entrada 3 — Mejora visual de Work Detail (Copilot)

### Problema
La ficha de obra cumplía funcionalmente, pero la jerarquía visual no transmitía “librería-cine boutique”.

### Prompt / contexto
Brief en `docs/COPILOT.md` (paleta papel/tinta, Libre Baskerville + IBM Plex Mono, portada protagonista, CrossSuggestionBox).

### Qué respondió la IA
Refactor de layout en `WorkDetailPage`, `CrossSuggestionBox` y `OpinionList` (más aire, tipografía, CTAs).

### Revisión crítica
Copilot tendía a **sobre-cardizar** o añadir decoración que competía con la portada. Pedí conservar rutas `/obra/:tipo/:id`, reseñas y bridge; rechacé estilos genéricos (purple/glow).

### Cambios hechos por mí
- Acepté la jerarquía y tipografía; descarté ruido visual.
- Verifiqué que guardar en lista, toast y sugerencia cruzada siguieran funcionando.

### Validación
- Rama `feature/copilot-ui-work-detail`, commit descriptivo.
- Revisión manual en móvil y escritorio de la ficha.

---

## Entrada 4 — Entrega PIA (docs + producción)

### Problema
El feedback del PIA exigía bitácora, README real, docs de API, `.env.example`, rewrites SPA y flujo de ramas; el README seguía siendo el de Vite.

### Prompt (esta sesión)
> Completa bitácora de IA (prompts + respuesta + crítica + validación), README de la app, documentación de `/search/movie` y `/volumes`, `.env.example`, config de hosting SPA, documentar riesgo del token / proxy, y rama `feature/...` con commits descriptivos.

### Qué respondió la IA
Generó los entregables de documentación, `vercel.json`, `public/_redirects`, proxy serverless y estructura de commits/PR.

### Revisión crítica
- No subir `.env` real (solo `.env.example`).
- No inventar URL de producción hasta verificar el deploy.
- Confirmar que `createBrowserRouter` necesita rewrite a `index.html` (sin eso, `/obra/...` da 404 al recargar).

### Cambios hechos por mí
- Redacté esta bitácora con crítica real (Open Library → Google Books; token en cliente).
- Revisé endpoints contra el código en `src/services/tmdb.ts` y `src/services/googleBooks.ts`.
- Configuré rewrites y variables documentadas para el hosting.

### Validación
- `npm run build` sin errores de TypeScript.
- Checklist de entrega: URL pública, repo, bitácora, docs API.

---

## Resumen de criterio aplicado

| Uso de IA | Qué acepté | Qué corregí / rechacé |
|---|---|---|
| Scaffold + APIs | Modularidad, fetch async, estados loading | Dependencia exclusiva de Open Library |
| TMDB | Endpoints y mapeo | Token expuesto → proxy + documentación del riesgo |
| Copilot UI | Jerarquía editorial Work Detail | Cards/decoración genérica |
| Docs PIA | Estructura de entregables | Afirmaciones sin evidencia en código |
