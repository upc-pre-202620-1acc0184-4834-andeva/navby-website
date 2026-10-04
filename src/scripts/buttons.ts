/**
 * Efecto imán de los botones (inspirado en el sitio de referencia, implementación propia):
 * [data-magnetic] se deja atraer por el cursor y vuelve con un rebote elástico; su etiqueta
 * ([data-magnetic-label]) se desplaza un poco más para dar profundidad.
 * Delegado en el documento para cubrir también las islas de React que hidratan después.
 */

const MAX = 14; // px de desplazamiento máximo
const LABEL = 0.45; // desplazamiento extra de la etiqueta
const FOLLOW = 0.2; // suavizado por frame

interface MagnetState {
  x: number;
  y: number;
  tx: number;
  ty: number;
  raf: number;
  label: HTMLElement | null;
}

const states = new WeakMap<HTMLElement, MagnetState>();
const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

function paint(el: HTMLElement, s: MagnetState) {
  el.style.transform = `translate3d(${s.x.toFixed(2)}px, ${s.y.toFixed(2)}px, 0)`;
  if (s.label) {
    s.label.style.transform = `translate3d(${(s.x * LABEL).toFixed(2)}px, ${(s.y * LABEL).toFixed(2)}px, 0)`;
  }
}

function tick(el: HTMLElement, s: MagnetState) {
  s.x += (s.tx - s.x) * FOLLOW;
  s.y += (s.ty - s.y) * FOLLOW;
  paint(el, s);
  s.raf =
    Math.abs(s.tx - s.x) > 0.05 || Math.abs(s.ty - s.y) > 0.05
      ? requestAnimationFrame(() => tick(el, s))
      : 0;
}

function release(el: HTMLElement) {
  const s = states.get(el);
  if (!s) return;
  cancelAnimationFrame(s.raf);
  s.raf = 0;
  s.x = s.y = s.tx = s.ty = 0;
  const spring = 'transform 700ms cubic-bezier(0.34, 1.8, 0.5, 1)';
  el.style.transition = spring;
  if (s.label) s.label.style.transition = spring;
  paint(el, s);
}

if (!reduced) {
  document.addEventListener('pointermove', (event) => {
    if (event.pointerType !== 'mouse') return;
    const magnet = (event.target as Element | null)?.closest<HTMLElement>('[data-magnetic]');
    if (!magnet) return;

    let s = states.get(magnet);
    if (!s) {
      s = {
        x: 0,
        y: 0,
        tx: 0,
        ty: 0,
        raf: 0,
        label: magnet.querySelector('[data-magnetic-label]'),
      };
      states.set(magnet, s);
    }
    magnet.style.transition = 'none';
    if (s.label) s.label.style.transition = 'none';

    const r = magnet.getBoundingClientRect();
    const nx = Math.max(-1, Math.min(1, (event.clientX - (r.left + r.width / 2)) / (r.width / 2)));
    const ny = Math.max(-1, Math.min(1, (event.clientY - (r.top + r.height / 2)) / (r.height / 2)));
    s.tx = nx * MAX;
    s.ty = ny * MAX * 0.7;
    if (!s.raf) {
      const state = s;
      state.raf = requestAnimationFrame(() => tick(magnet, state));
    }
  });

  document.addEventListener('pointerout', (event) => {
    const from = (event.target as Element | null)?.closest<HTMLElement>('[data-magnetic]');
    if (!from) return;
    const to = event.relatedTarget as Node | null;
    if (to && from.contains(to)) return;
    release(from);
  });
}
