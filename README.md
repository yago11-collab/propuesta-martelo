# Demo web · Talleres Mecánicos Martelo

Propuesta de diseño (MVP) para **Talleres Mecánicos Martelo**, taller mecánico en Rúa San Rosendo, 27 (A Coruña).
**Es una demo privada, no la web oficial:** lleva `noindex` y una banda superior de "Demo".

- Dirección visual: **A · "La fachada de siempre"** (azul del rótulo, rojo solo en botones, franja roja y amarilla como firma). Más detalle en el documento de identidad visual (interno, no incluido en el repositorio).
- **Stack:** HTML estático + Tailwind **compilado** + ~6 KB de JS sin dependencias. *Elegido frente al CDN de Tailwind (unos 300 KB de JS que se ejecuta en el navegador y hunde Lighthouse en móvil) y frente a Astro (innecesario para una sola página).*

---

## Estructura

```
public/                 ← ESTA es la carpeta que se publica (arrastrar a Netlify / Vercel)
  index.html            one-page
  aviso-legal.html      página mínima con marcadores [CONFIRMAR]
  privacidad.html       página mínima con marcadores [CONFIRMAR]
  css/styles.css        generado por Tailwind (no editar a mano)
  js/main.js            horario abierto/cerrado, formulario, mapa bajo demanda, animaciones
  fonts/                Archivo + Source Sans 3 (Google Fonts, autoalojadas)
  img/                  favicon, logotipo de PROPUESTA, imagen Open Graph provisional
  robots.txt · _headers (Netlify) · vercel.json (Vercel)
src/input.css           estilos fuente (Tailwind + componentes)
tailwind.config.js      paleta y tipografías
scripts/                capturas.mjs (Playwright), og.mjs + og.html (imagen Open Graph)
capturas/               capturas de escritorio (1440 px) y móvil (390 px)
```

## Ver en local

```bash
npm install
```
```bash
npm run build
```
```bash
npm run serve
```
Abre <http://localhost:8080>. Mientras editas estilos, `npm run dev` recompila el CSS al guardar.

> Ábrela siempre con un servidor local, no con doble clic en el `index.html`: en `file://` algunas rutas y el formulario no funcionan igual.

## Desplegar

- **Netlify:** entra en <https://app.netlify.com/drop> y arrastra la carpeta **`public/`**.
- **GitHub Pages:** la web se publica desde la rama `gh-pages`, que contiene solo `public/`. Para actualizarla después de hacer cambios:
  ```bash
  git subtree push --prefix public origin gh-pages
  ```
- **Vercel:** `npx vercel public`, o crea un proyecto en el panel con *Root Directory* = `public` y sin comando de build.

El CSS ya va compilado dentro de `public/`, así que no hace falta build en el servidor. `_headers` y `vercel.json` configuran la caché.

## Quitar el modo demo (al publicar la web oficial)

1. **Banda superior y avisos de demo:** en `index.html`, `aviso-legal.html` y `privacidad.html`, borra la clase `is-demo` de `<html lang="es" class="is-demo">`. Con eso desaparecen la banda, los avisos "Demo: …" de servicios y de "Cómo funciona" y la nota del pie. Todo lo que lleva `.demo-only` depende de esa clase.
2. **Indexación:** borra `<meta name="robots" content="noindex, nofollow">` en las tres páginas.
3. Añade `canonical`, `og:url`, `og:image` absoluta y `"url"`/`"image"` en el JSON-LD con el dominio real (los comentarios `[CONFIRMAR: dominio]` del `<head>` indican dónde).
4. Sustituye `img/og-placeholder.png` por una imagen real de 1200×630.

## Formulario de cita

En `public/js/main.js`:

```js
const FORM_ENDPOINT = '';                    // p. ej. 'https://formspree.io/f/abcdwxyz'
const FALLBACK_EMAIL = '[CONFIRMAR EMAIL]';
```

- **Con `FORM_ENDPOINT`:** envía a Formspree por `fetch` y muestra la confirmación o un error con el teléfono. Incluye el campo antispam `_gotcha`.
- **Vacío (como está ahora):** abre el programa de correo con un `mailto:` y todos los datos ya rellenos, dirigido a `FALLBACK_EMAIL`.
- Validación accesible: `aria-invalid`, mensajes de error asociados con `aria-describedby`, resumen con `role="alert"` y foco en el primer campo con error.

---

## ✅ Lista de marcadores `[CONFIRMAR]` para revisar con el cliente

### Contenido visible en la web
| # | Qué | Dónde |
|---|---|---|
| 1 | **Fotos reales** (fachada, interior, equipo). Hoy son marcadores `[FOTO DEL TALLER]` | `index.html` (hero) |
| 2 | **Servicios** que hacen realmente. La lista actual es genérica | `index.html` · sección Servicios (`<!-- CONFIRMAR CON EL CLIENTE -->`) |
| 3 | **Texto de "Cómo funciona"** (los 3 pasos) | `index.html` · sección Cómo funciona |
| 4 | **Logotipo:** el actual es una *propuesta* tipográfica, no su logo. ¿Lo aprueban o tienen uno? | Cabecera, pie, `img/logo-propuesta-martelo.svg`, `img/favicon.svg` |
| 5 | **Colores corporativos:** el azul, rojo y amarillo vienen de la fachada, pero podrían ser los de Sunoco | `tailwind.config.js` |
| 6 | **Año de fundación:** en 2018 había una placa "Aniversario 50", pero la sociedad civil consta desde 2004. Si lo confirman, añadir "Desde 19__" | Comentario en el hero de `index.html` |
| 7 | **Horario en festivos y vacaciones:** el indicador abierto/cerrado no los contempla | `index.html` (horario), `js/main.js` |

### Contacto y formulario
| # | Qué | Dónde |
|---|---|---|
| 8 | **Email del taller** `[CONFIRMAR EMAIL]` | `js/main.js`, `aviso-legal.html`, `privacidad.html` |
| 9 | **Endpoint de Formspree** (o mantener el `mailto:`) | `js/main.js` → `FORM_ENDPOINT` |

### Legal
| # | Qué | Dónde |
|---|---|---|
| 10 | Razón social exacta (consta como *Talleres Mecanicos Martelo S.C.*) | `aviso-legal.html`, `privacidad.html` |
| 11 | NIF | `aviso-legal.html`, `privacidad.html` |
| 12 | Autoría de las fotografías | `aviso-legal.html` |
| 13 | Plazo de conservación de datos | `privacidad.html` |
| 14 | Proveedor del formulario como encargado del tratamiento | `privacidad.html` |
| 15 | Revisión por asesoría legal de ambas páginas | `aviso-legal.html`, `privacidad.html` |

### Publicación
| # | Qué | Dónde |
|---|---|---|
| 16 | **Dominio** (canonical, Open Graph absoluto, `url`/`image` del JSON-LD, sitemap) | `<head>` de `index.html`, `robots.txt` |
| 17 | Imagen Open Graph definitiva | `img/og-placeholder.png` |

---

## Las 3 opciones de titular del hero

1. **"El taller de confianza del barrio"** ← *elegida.* Es el concepto en seis palabras y recoge lo que más repiten las reseñas (confianza, 19 menciones). Encaja con un taller de calle y de toda la vida.
2. "Honradez, buen precio y trato de siempre." Enumera los temas de las reseñas; más descriptiva, pero menos memorable.
3. "Gente seria para cuidar de tu coche." Sale de la reseña "Serios, puntuales, atentos."; muy cercana, pero no menciona la confianza.

---

## Datos usados (y de dónde salen)

Solo se usan datos verificados en Google Maps el 14/10/2026: nombre, dirección, teléfono, horario, valoración 4,8 con 164 reseñas, temas de las reseñas con sus menciones y las 3 reseñas textuales (firmadas como "Cliente en Google"). Las coordenadas del JSON-LD (43.3529812, -8.4128773) salen de la URL de la ficha. **No hay** servicios, precios, años, nombres, marcas ni garantías inventados: lo que no está confirmado lleva un marcador.

> Nota SEO: el `aggregateRating` del JSON-LD se ha incluido como se pidió, pero Google **no muestra estrellas** en los resultados para valoraciones "autopublicadas" de un `LocalBusiness`. Las estrellas de la ficha de Maps siguen saliendo igual.

## Comprobaciones realizadas

- **Lighthouse 12.8** (servidor local con gzip, igual que Netlify y Vercel):
  - Móvil: Rendimiento **100** · Accesibilidad **100** · Buenas prácticas **100** · SEO 63
  - Escritorio: **100 · 100 · 100** · SEO 63
  - El 63 de SEO se debe solo al `noindex` de la demo. Medido en una copia sin `noindex`: **SEO 100**.
- Un único H1 y jerarquía H1 → H2 → H3 correcta. Sin errores en consola. Sin desbordamiento horizontal a 390 px.
- `tel:+34981236598` en los 6 enlaces de llamada. Sin WhatsApp (es un fijo).
- Indicador abierto/cerrado probado con 9 casos: entre semana, mediodía, tarde, viernes noche, fin de semana y cambio a horario de invierno.
- Formulario: validación de campos vacíos y teléfono erróneo, `mailto:` con los datos, y envío a Formspree simulado (respuesta correcta y de error).
- Mapa: no se carga ningún iframe hasta pulsar "Ver mapa aquí".

## Regenerar capturas e imagen Open Graph

```bash
npm run serve
```
Y en otra terminal:
```bash
npm run capturas
```
```bash
npm run og
```
Las capturas usan el Chrome instalado en el equipo (`channel: 'chrome'`).
