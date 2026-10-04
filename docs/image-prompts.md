# Navby — Prompts de imágenes (Nano Banana / Gemini)

> **Estado (2026-10-04):** los recursos 1, 2 y 3 ya están generados e integrados: `src/assets/hero/avion.png` (recorte transparente del verde), `src/assets/hero/cielo.jpg` y `public/og/navby-og.jpg`. Los originales siguen en la raíz del repo. Usa estos prompts solo para regenerarlos.

Este documento lista cada recurso, dónde va y el prompt exacto. Los prompts están en inglés porque los modelos de imagen responden con más precisión en ese idioma.

> **Transparencia:** los modelos de Gemini no generan un canal alfa fiable. Pide un fondo plano de un solo color (indicado en cada prompt) y recórtalo después (remove.bg, Photoshop «Seleccionar sujeto» o similar). Exporta el resultado en PNG con transparencia y revisa los bordes sobre fondo oscuro y claro.

---

## 1. Avión del hero — idéntico al placeholder (obligatorio)

No se describe el avión desde cero: se **edita a partir de la imagen de referencia**, para que conserve exactamente el mismo modelo, ángulo y pintura.

- **Cómo:** en Gemini (con Nano Banana Pro) **adjunta `avion.png`** (la imagen original de la raíz del repo, también en `src/assets/hero/avion-placeholder.png`) y pega el prompt.
- **Reemplaza:** `src/assets/hero/avion-placeholder.png`.
- **Usado en:** `src/components/Hero.astro` y `src/components/FinalCta.astro`.
- **Entrega:** PNG transparente, **mínimo 4000 px de ancho**, avión completo.
- **Al sustituirlo:** guarda el archivo con el mismo nombre y en `Hero.astro` cambia `widths={[600]}` por `widths={[800, 1400, 2000, 2800]}`.

```text
Recreate the airplane in the attached reference image as a high-resolution 4K photograph. Keep it IDENTICAL to the reference: the exact same aircraft model, the same perfectly head-on front view at cockpit height, the same camera angle and perspective, the same proportions, the same plain white/light-grey unbranded livery, the same cockpit window shapes, the same two engines under the wings, the same tail fin and the same neutral daylight lighting. Do not redesign, restyle, rotate or add anything.

Only changes allowed:
1. Increase resolution and sharpness to 4K with crisp, clean edges and realistic metal and paint detail.
2. Show the COMPLETE aircraft: extend the frame so both wingtips and the full vertical tail fin, which are cut off in the reference, are fully visible with generous empty margin on every side.
3. Replace the background with a flat solid pure green (#00FF00), no gradient, no shadow, no sky, no clouds.

No text, no logos, no watermark. Landscape 16:9 frame, airplane centered.
```

> **Si el resultado se desvía:** responde en el mismo chat con «Keep everything exactly as in the reference image, only make the wingtips and tail visible and upscale it». Repetir la instrucción en el hilo funciona mejor que empezar de nuevo.

### 1b. Variante con la perspectiva exacta de la foto original (recomendada)

El render actual salió **frontal y plano**: perdió la vista ligeramente desde abajo, el alabeo y la sensación de cercanía (motores grandes) de la foto original. En la web el alabeo se compensa rotando la imagen 4°, pero la perspectiva solo se recupera **ampliando la foto original en lugar de recrearla**. Hazlo en dos pasos dentro del mismo chat de Gemini, adjuntando la foto original del avión entre nubes:

**Paso 1 — ampliar sin cambiar nada:**

```text
Upscale this exact photograph to 4K resolution. This is a pure upscale and restoration task, not a redesign: keep every detail pixel-faithful to the original — the same camera position slightly below the aircraft, the same bank angle and wing tilt, the same perspective where the engines look large because the plane is close to the camera, the same framing, lighting and colors. Only increase resolution, recover fine detail on the fuselage, cockpit windows and engine fan blades, and remove compression artifacts. Do not change the composition.
```

**Paso 2 — aislar el avión:**

```text
Now keep the airplane exactly as it is in the upscaled image — same angle, tilt, perspective, size and position — and replace only the background (sky and clouds) with a flat solid pure green (#00FF00). Where the wingtips touch the frame edges, leave them as they are. No shadow, no gradient.
```

Después recorta el verde y guarda el resultado como `src/assets/hero/avion.png`. Si usas esta versión, quita el `rotate-[4deg]` del `<Image>` en `src/components/Hero.astro`, porque la inclinación ya vendrá en la foto.

---

## 2. Fondo del hero — cielo de nubes (obligatorio)

- **Crea:** `src/assets/hero/cielo.jpg` (también se acepta `.png` o `.webp`). **El hero lo detecta solo**: en cuanto exista ese archivo, sustituye al cielo animado de WebGL y se acerca al hacer scroll.
- **Entrega:** JPG de **al menos 3840×2160**, sin texto.
- **Composición obligatoria:** el horizonte de nubes a **~60 % desde arriba** (ahí se apoya el avión), el **centro libre** (ahí va el avión) y la **parte superior más oscura**, para que el titular blanco se lea bien.

```text
Breathtaking photorealistic view from a cruising airplane altitude above the clouds on a clear, bright day. The upper half of the frame is open sky: a deep saturated blue at the very top (#172E78) fading smoothly to bright azure (#4078E0) and to a soft pale blue near the horizon, with a few thin, delicate high cirrus streaks. A soft, diffuse sun glow sits just above the horizon at the center, without lens flare. The horizon line of the cloud layer is perfectly level and positioned at about 60% of the image height from the top. Below the horizon, an endless sea of fluffy white cumulus clouds stretches toward the camera with strong depth and perspective: bright sunlit tops, soft blue-violet shadows (#8F9EDB) in the valleys, closer clouds larger and more detailed at the bottom of the frame. The center of the image is calm and uncluttered, with no aircraft, no birds and no objects anywhere. Serene, optimistic, premium travel mood, crisp atmospheric clarity. No text, no logos, no watermark, no airplane, no wing, no window frame. Ultra-wide 16:9, 4K resolution, high dynamic range.
```

> **Para móvil** el fondo se recorta por los lados (`object-cover`, centrado en el 50 % / 60 %), así que nada importante debe quedar en los extremos izquierdo o derecho.

---

## 3. Imagen para compartir en redes (Open Graph)

- **Crea:** `public/og/navby-og-es.jpg` y `public/og/navby-og-en.jpg` (1200×630). Después añade `<meta property="og:image">` en `src/layouts/Layout.astro`.
- **Cómo:** adjunta **el avión final (n.º 1) y el cielo final (n.º 2)** para que la composición coincida con el hero.
- **Texto:** no lo pidas al modelo; se superpone después con el isologo oficial (`docs/branding/`) y el slogan en Albert Sans.

```text
Combine the two attached images into one photorealistic composition: place the airplane from the first image, unchanged, small and centered, flying head-on toward the camera just above the cloud horizon of the second image. Keep the airplane identical to its reference and the sky identical to its reference; match the lighting so the airplane looks naturally lit by the same daylight. Leave large clean negative space in the upper third for a headline. No text, no logos, no watermark. 1200x630.
```

---

## Lo que **no** se genera con IA

- **Capturas de la webapp:** la sección «Producto» usa una interfaz construida en HTML con datos ilustrativos. Cuando la webapp exista, se puede sustituir por capturas reales, pero nunca por imágenes generadas que simulen el producto.
- **Logotipos, testimonios o sellos de prensa:** no existen todavía y no deben inventarse.
