import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import Lenis from 'lenis';
import { initSky } from './sky';

gsap.registerPlugin(ScrollTrigger);

const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
const root = document.documentElement;
const $ = <T extends Element = HTMLElement>(sel: string, scope: ParentNode = document) =>
  scope.querySelector<T>(sel);
const $$ = <T extends Element = HTMLElement>(sel: string, scope: ParentNode = document) =>
  Array.from(scope.querySelectorAll<T>(sel));

/* -------------------------------------------------------------------------- */
/* Scroll suave                                                               */
/* -------------------------------------------------------------------------- */

if (!reduced) {
  const lenis = new Lenis({ duration: 1.15, anchors: { offset: -88 } });
  lenis.on('scroll', ScrollTrigger.update);
  gsap.ticker.add((time) => lenis.raf(time * 1000));
  gsap.ticker.lagSmoothing(0);
  // Expuesto para que el menú lateral pueda bloquear el scroll.
  (window as unknown as { navbyLenis: Lenis }).navbyLenis = lenis;
  if (import.meta.env.DEV) (window as unknown as { __lenis: Lenis }).__lenis = lenis;
}

/* -------------------------------------------------------------------------- */
/* Hero: cielo, aproximación del avión y vuelo sobre la cámara                */
/* -------------------------------------------------------------------------- */

const hero = $('[data-hero]');
const canvas = $<HTMLCanvasElement>('[data-sky]');
const sky = canvas ? initSky(canvas, { animate: !reduced }) : null;

if (hero && !reduced) {
  const plane = $('[data-plane]', hero);
  const planeWrap = $('[data-plane-wrap]', hero);
  const title = $('[data-hero-title]', hero);
  const lines = $$('[data-hero-line]', hero);
  const reveals = $$('[data-hero-reveal]', hero);
  const foot = $('[data-hero-foot]', hero);

  // Entrada: el avión aparece en el horizonte y se acerca.
  gsap.set(plane, { scale: 0.08, yPercent: 18, opacity: 0, filter: 'blur(6px)' });
  gsap.set(lines, { y: 0, yPercent: 110 });
  gsap.set(reveals, { y: 24, opacity: 0 });
  root.classList.remove('intro');

  const intro = gsap.timeline({ defaults: { ease: 'expo.out' } });
  intro
    .to(plane, { opacity: 1, duration: 0.6, ease: 'power1.out' }, 0)
    .to(plane, { scale: 1, yPercent: 0, filter: 'blur(0px)', duration: 2.8 }, 0)
    .to(lines, { yPercent: 0, duration: 1.3, stagger: 0.12 }, 0.45)
    .to(reveals, { y: 0, opacity: 1, duration: 1.1, stagger: 0.1 }, 1.2)
    .add(() => {
      // Vuelo en crucero: balanceo suave y continuo.
      gsap.to(plane, {
        y: -7,
        rotation: 0.6,
        duration: 3.2,
        ease: 'sine.inOut',
        yoyo: true,
        repeat: -1,
      });
    });

  // Scroll: el avión pasa por encima de la cámara y el cielo acelera.
  const pass = gsap.timeline({
    scrollTrigger: {
      trigger: hero,
      start: 'top top',
      end: '+=120%',
      pin: true,
      scrub: 0.6,
      onUpdate: (self) => sky?.setProgress(self.progress),
    },
  });
  pass
    .to(planeWrap, { scale: 6, yPercent: -38, ease: 'power3.in', duration: 1 }, 0)
    .to(planeWrap, { filter: 'blur(12px)', opacity: 0, ease: 'power2.in', duration: 0.3 }, 0.7)
    .to(
      title,
      { scale: 0.92, opacity: 0, filter: 'blur(10px)', ease: 'power2.in', duration: 0.55 },
      0.05,
    )
    .to(foot, { y: 40, opacity: 0, ease: 'power2.in', duration: 0.35 }, 0);

  // Con foto de cielo, la cámara también avanza entre las nubes.
  const skyPhoto = $('[data-sky-photo]', hero);
  if (skyPhoto) pass.to(skyPhoto, { scale: 1.35, yPercent: 6, ease: 'power1.in', duration: 1 }, 0);
} else {
  root.classList.remove('intro');
}

/* -------------------------------------------------------------------------- */
/* Secciones                                                                  */
/* -------------------------------------------------------------------------- */

if (!reduced) {
  // Titulares y párrafos: aparecen una sola vez al entrar.
  const reveals = $$('[data-reveal]');
  gsap.set(reveals, { y: 28, opacity: 0 });
  ScrollTrigger.batch(reveals, {
    start: 'top 88%',
    once: true,
    onEnter: (batch) =>
      gsap.to(batch, { y: 0, opacity: 1, duration: 1.1, ease: 'expo.out', stagger: 0.08 }),
  });

  // Declaración: las palabras se iluminan con la lectura.
  const statement = $('[data-statement]');
  if (statement) {
    gsap.fromTo(
      $$('[data-word]', statement),
      { opacity: 0.14 },
      {
        opacity: 1,
        stagger: 0.08,
        ease: 'none',
        scrollTrigger: { trigger: statement, start: 'top 78%', end: 'bottom 52%', scrub: true },
      },
    );
  }

  // Cómo funciona: la ruta se dibuja y los pasos aterrizan en orden.
  const how = $('[data-how]');
  const route = $<SVGPathElement>('[data-route]');
  if (how) {
    const tl = gsap.timeline({
      scrollTrigger: { trigger: how, start: 'top 65%', end: 'bottom 70%', scrub: 0.8 },
    });
    if (route) {
      const len = route.getTotalLength();
      gsap.set(route, { strokeDasharray: len, strokeDashoffset: len });
      tl.to(route, { strokeDashoffset: 0, ease: 'none', duration: 1 }, 0);
    }
    $$('[data-step]', how).forEach((step, i) => {
      tl.from(step, { y: 40, opacity: 0, duration: 0.3, ease: 'power2.out' }, i * 0.33);
    });
  }

  // Producto: la ventana se asienta y las piezas flotantes encajan.
  const showcase = $('[data-showcase]');
  if (showcase) {
    const floats = $$('[data-float]', showcase);
    const offsets = [
      { x: -90, y: -60, rotation: -8 },
      { x: 110, y: 20, rotation: 9 },
      { x: -60, y: 90, rotation: 6 },
    ];
    const tl = gsap.timeline({
      scrollTrigger: { trigger: showcase, start: 'top 85%', end: 'center 55%', scrub: 0.9 },
    });
    tl.from(
      $('[data-window]', showcase),
      { y: 80, scale: 0.94, opacity: 0.4, ease: 'power2.out', duration: 1 },
      0,
    ).from($$('[data-piece]', showcase), { y: 24, opacity: 0, stagger: 0.12, duration: 0.5 }, 0.3);
    floats.forEach((el, i) => {
      tl.from(
        el,
        { ...offsets[i % offsets.length], opacity: 0, ease: 'power3.out', duration: 0.7 },
        0.25 + i * 0.12,
      );
    });
    $$<SVGPathElement>('[data-map-route]', showcase).forEach((p, i) => {
      const len = p.getTotalLength();
      gsap.set(p, { strokeDasharray: len, strokeDashoffset: len });
      tl.to(p, { strokeDashoffset: 0, ease: 'none', duration: 0.45 }, 0.45 + i * 0.4);
    });
    tl.from(
      $$('[data-meter]', showcase),
      { scaleX: 0, stagger: 0.1, duration: 0.5, ease: 'power2.out' },
      0.7,
    );
  }

  // Demostraciones del mecanismo.
  $$('[data-feature]').forEach((feature) => {
    const tl = gsap.timeline({ scrollTrigger: { trigger: feature, start: 'top 72%', once: true } });

    const scatter = $('[data-scatter]', feature);
    if (scatter) {
      tl.from($$('[data-dot]', scatter), {
        scale: 0,
        transformOrigin: '50% 50%',
        duration: 0.6,
        ease: 'back.out(2)',
        stagger: { each: 0.015, from: 'random' },
      }).from(
        $('[data-best]', scatter),
        { scale: 0, transformOrigin: '50% 50%', duration: 0.9, ease: 'elastic.out(1, 0.55)' },
        '-=0.2',
      );
    }

    const fare = $('[data-fare]', feature);
    if (fare) {
      tl.from(fare.children, { y: 26, opacity: 0, duration: 0.8, ease: 'expo.out', stagger: 0.14 });
    }

    const timeline = $('[data-timeline]', feature);
    if (timeline) {
      tl.from($$('[data-seg]', timeline), {
        scaleX: 0,
        duration: 0.7,
        ease: 'power3.inOut',
        stagger: 0.35,
      });
    }
  });

  // Tablero de salidas: los caracteres giran antes de asentarse.
  const board = $('[data-board]');
  if (board) {
    const GLYPHS = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789%+';
    ScrollTrigger.create({
      trigger: board,
      start: 'top 75%',
      once: true,
      onEnter: () => {
        $$('[data-flap]', board).forEach((cell, i) => {
          const finalChar = cell.dataset.flap ?? ' ';
          const label = $('[data-flap-char]', cell);
          if (!label || finalChar === ' ') return;
          let ticks = 8 + Math.floor(i * 1.6);
          const id = window.setInterval(() => {
            ticks -= 1;
            label.textContent =
              ticks <= 0 ? finalChar : GLYPHS[Math.floor(Math.random() * GLYPHS.length)]!;
            gsap.fromTo(
              label,
              { yPercent: -30, opacity: 0.4 },
              { yPercent: 0, opacity: 1, duration: 0.08 },
            );
            if (ticks <= 0) window.clearInterval(id);
          }, 55);
        });
      },
    });
  }

  // Cierre: el avión despega desde el borde inferior.
  const finalPlane = $('[data-final-plane]');
  if (finalPlane) {
    gsap.fromTo(
      finalPlane,
      { yPercent: 60, scale: 0.85 },
      {
        yPercent: 18,
        scale: 1,
        ease: 'none',
        scrollTrigger: {
          trigger: finalPlane,
          start: 'top bottom',
          end: 'bottom bottom',
          scrub: true,
        },
      },
    );
  }
}

window.addEventListener('load', () => ScrollTrigger.refresh());
