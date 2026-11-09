## ¿De qué trata tu app?
Page2Screen es una web app que conecta **libros y películas**. El usuario explora un catálogo, guarda obras (leídas/vistas o pendientes), escribe reseñas opcionales y recibe **recomendaciones cruzadas**: si vio una película, se le sugiere un libro afín (y al revés), con una razón temática clara (“una historia lleva a otra”).

Stack: React + TypeScript + Vite + Tailwind + React Router. Datos de TMDB (cine) y Google Books / catálogo curado (libros).

## ¿Quién es tu usuario?
Lectores y cinéfilos de **18–35 años** que:
- quieren un tracker visual de lo que consumen;
- descubren obras en el “otro” formato;
- valoran diseño limpio, tipografía legible y portadas reales.

Pantalla objetivo de esta mejora: **Work Detail** (ficha de libro/película).

## ¿Qué personalidad quieres transmitir?
Editorial y cultural: como una **librería-cine boutique**.
- Sereno, confiable, con mucho aire.
- Brand **Page2Screen** visible.
- Portadas como protagonistas; texto con jerarquía clara (serif en títulos, mono en meta/UI).
- Sin ruido visual (sin glow, sin cards innecesarias, sin purple genérico).

## Paleta de colores (4 HEX)
1. **Papel / fondo:** `#F2F0E9`
2. **Tinta / texto y acento principal:** `#1C1C1C`
3. **Texto secundario / meta:** `#6B6B6B`
4. **Línea / bordes suaves:** `#D0CBC0`

Complementos (no cuentan como los 4 principales): superficie `#F7F5F0`, error `#B42318`.

## Tipografía
- Títulos: Libre Baskerville (serif)
- UI / labels / cuerpo auxiliar: IBM Plex Mono

## Notas para Copilot
- Conservar funcionalidad (navegación, reseñas, bridge cruzado, sesiones).
- Mobile-first y accesible (contraste, foco, tipografía legible).
- Reutilizar componentes existentes (`Header`, `WorkCard`, `StarRating`, `CrossSuggestionBox`).
- No borrar código fundamental ni romper rutas `/obra/:tipo/:id`.