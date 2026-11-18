# Documentación de APIs externas — Page2Screen

La app consume dos servicios en la nube para enriquecer el catálogo. El código vive en `src/services/tmdb.ts` (cine) y `src/services/googleBooks.ts` (libros; reexportado por `openLibrary.ts`).

---

## 1. TMDB (The Movie Database)

| Ítem | Valor |
|---|---|
| Base URL | `https://api.themoviedb.org/3` |
| Auth | Header `Authorization: Bearer <TMDB_READ_ACCESS_TOKEN>` |
| Variable local | `VITE_TMDB_TOKEN` |
| Proxy opcional | `VITE_TMDB_PROXY` (p. ej. `/api/tmdb`) |
| Formato | JSON |
| Cliente | `fetch` + `async/await` |

### Endpoints usados

#### `GET /search/movie`

| Parámetro | Tipo | Uso en Page2Screen |
|---|---|---|
| `query` | string | Texto del buscador |
| `language` | string | `es-MX` y `en-US` en paralelo |
| `page` | number | `1` |
| `include_adult` | boolean | `false` |

**Respuesta (simplificada):**

```json
{
  "page": 1,
  "results": [
    {
      "id": 550,
      "title": "Fight Club",
      "release_date": "1999-10-15",
      "poster_path": "/path.jpg",
      "genre_ids": [18, 53]
    }
  ],
  "total_results": 1
}
```

**Mapeo interno:** `id` → `m_{id}`, `poster_path` → `https://image.tmdb.org/t/p/w500{path}`.

#### `GET /trending/movie/week`

| Parámetro | Valor |
|---|---|
| `language` | `es-MX` |

Usado en Explorar / tendencias.

#### `GET /discover/movie`

| Parámetro | Valor |
|---|---|
| `with_genres` | ID de género TMDB |
| `language` | `es-MX` |
| `sort_by` | `popularity.desc` |
| `vote_count.gte` | `3000` |

Usado por el motor de recomendaciones cruzadas.

#### `GET /movie/{id}`

| Parámetro | Valor |
|---|---|
| `append_to_response` | `credits` |
| `language` | `es-MX` |

Usado en la ficha de detalle (`/obra/pelicula/:id`).

### Restricciones y límites TMDB

- Requiere cuenta y **Read Access Token (v4)** en [themoviedb.org](https://www.themoviedb.org/settings/api).
- Rate limit orientativo: ~40–50 req/s por IP; la app hace como máximo 2 búsquedas paralelas (es + en).
- Imágenes: CDN `image.tmdb.org`; sin poster → fallback tipográfico en UI.
- **Seguridad:** no conviene exponer el token en el cliente. Preferir `VITE_TMDB_PROXY` + función serverless (`api/tmdb/[...path].js` en Vercel) con `TMDB_TOKEN` solo en el servidor.

### Manejo de errores (app)

| Situación | Comportamiento |
|---|---|
| Sin token ni proxy | Modo demo (`isTmdbMockMode`) + `console.warn` |
| HTTP no OK / red | Catch → mock / catálogo local |
| Detalle inexistente | `null` → empty/error en UI |

---

## 2. Google Books API

| Ítem | Valor |
|---|---|
| Base URL | `https://www.googleapis.com/books/v1` |
| Auth | Query `key` (opcional pero recomendada) |
| Variable | `VITE_GOOGLE_BOOKS_KEY` |
| Formato | JSON |

> Open Library se evaluó al inicio; la implementación final usa **Google Books Volumes** + catálogo local con portadas ISBN (Open Library Covers CDN solo para imágenes).

### Endpoints usados

#### `GET /volumes`

| Parámetro | Tipo | Uso |
|---|---|---|
| `q` | string | Texto libre, `subject:...` o `isbn:...` |
| `maxResults` | number | 8–12 |
| `printType` | string | `books` |
| `key` | string | API key |

**Respuesta (simplificada):**

```json
{
  "kind": "books#volumes",
  "totalItems": 120,
  "items": [
    {
      "id": "zyTCAlFPjgYC",
      "volumeInfo": {
        "title": "The Hobbit",
        "authors": ["J.R.R. Tolkien"],
        "publishedDate": "1937",
        "description": "...",
        "pageCount": 310,
        "categories": ["Fiction / Fantasy"],
        "averageRating": 4.5,
        "ratingsCount": 1200,
        "industryIdentifiers": [
          { "type": "ISBN_13", "identifier": "9780547928227" }
        ],
        "imageLinks": {
          "thumbnail": "http://books.google.com/..."
        }
      }
    }
  ]
}
```

**Mapeo interno:** preferimos ISBN → `b_isbn_{isbn}`; si no hay ISBN → `b_gb_{volumeId}`. Portada: Open Library Covers por ISBN o `imageLinks` en HTTPS.

#### `GET /volumes/{id}`

Detalle de un volume concreto (cuando el id no es ISBN de catálogo).

### Restricciones y límites Google Books

- Cuota diaria por proyecto en Google Cloud (varía; 429 = rate limit).
- Sin `key` la app **no llama** a la API remota y usa solo el catálogo local.
- Algunos volúmenes no traen `imageLinks` ni ISBN → se filtran o se usa fallback local.

### Manejo de errores (app)

| Situación | Comportamiento |
|---|---|
| Sin API key | Solo catálogo local |
| HTTP 429 | Error capturado → catálogo / resultados locales |
| Otro error HTTP / red | `console.error` + fallback |
| Búsqueda vacía | Aviso demo + subset del catálogo |

---

## 3. Integración en la UI (estados)

| Flujo | Loading | Éxito | Error / vacío |
|---|---|---|---|
| Búsqueda global | Skeleton / texto “Buscando…” | Lista combinada películas+libros | Mensaje sin resultados |
| Detalle de obra | Estado loading en ficha | Metadatos + sinopsis + bridge | Mensaje / null |
| Explorar | Grid skeleton | Tendencias | Fallback mock/catálogo |
| Recomendación cruzada | Loading en CrossBridge | Sugerencia + razón | Oculta / vacío |

La lógica de red está centralizada en `services/`; las páginas/hooks solo orquestan estados para no duplicar `fetch`.

---

## 4. Variables de entorno

| Variable | ¿Dónde? | Obligatoria | Para qué |
|---|---|---|---|
| `VITE_TMDB_TOKEN` | Cliente (Vite) | No, si usas proxy | Read Access Token TMDB v4. **Se publica en el JS del navegador** |
| `VITE_TMDB_PROXY` | Cliente (Vite) | No | Base del proxy, p. ej. `/api/tmdb` |
| `TMDB_TOKEN` | Solo servidor (Vercel) | Sí, si usas proxy | Token secreto para `api/tmdb/[...path].js`. **Sin** prefijo `VITE_` |
| `VITE_GOOGLE_BOOKS_KEY` | Cliente (Vite) | No | API key de Google Books. Sin ella no se llama a `/volumes` |

**Producción recomendada:** define solo `VITE_TMDB_PROXY=/api/tmdb` + `TMDB_TOKEN` en el servidor. **No definas `VITE_TMDB_TOKEN`** si usas proxy.

En `src/services/tmdb.ts`, el Bearer solo se envía cuando hay token **y no** hay proxy (`USE_PROXY`). Si defines ambas variables a la vez, gana el proxy (no se manda Bearer desde el cliente). Si solo defines `VITE_TMDB_TOKEN` (sin proxy), el Bearer sí va en el navegador — eso es el riesgo documentado.

Comportamiento sin claves: TMDB entra en modo demo (`isTmdbMockMode = !TMDB_TOKEN && !USE_PROXY`); Google Books usa solo el catálogo local.
