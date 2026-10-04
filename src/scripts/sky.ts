/**
 * Cielo del hero en WebGL: degradado de marca, resplandor de atardecer en el horizonte y un
 * mar de nubes en perspectiva que avanza hacia la cámara. `progress` (0–1) acelera el vuelo
 * y abre el horizonte a medida que el usuario hace scroll.
 */

const VERT = `
attribute vec2 a_pos;
void main() { gl_Position = vec4(a_pos, 0.0, 1.0); }
`;

const FRAG = `
precision mediump float;
uniform vec2 u_res;
uniform float u_time;
uniform float u_progress;

float hash(vec2 p) { return fract(sin(dot(p, vec2(127.1, 311.7))) * 43758.5453); }
float noise(vec2 p) {
  vec2 i = floor(p), f = fract(p);
  vec2 u = f * f * (3.0 - 2.0 * f);
  return mix(mix(hash(i), hash(i + vec2(1.0, 0.0)), u.x),
             mix(hash(i + vec2(0.0, 1.0)), hash(i + vec2(1.0, 1.0)), u.x), u.y);
}
float fbm(vec2 p) {
  float v = 0.0, a = 0.5;
  for (int i = 0; i < 5; i++) { v += a * noise(p); p = p * 2.03 + vec2(1.7, 9.2); a *= 0.5; }
  return v;
}

void main() {
  vec2 uv = gl_FragCoord.xy / u_res;
  float aspect = u_res.x / u_res.y;
  float horizon = 0.40 + u_progress * 0.06;

  // Cielo diurno sobre las nubes, con un leve tinte del púrpura de marca.
  vec3 zenith  = vec3(0.090, 0.180, 0.470);
  vec3 azure   = vec3(0.250, 0.470, 0.880);
  vec3 pale    = vec3(0.760, 0.860, 1.000);
  vec3 white   = vec3(0.985, 0.990, 1.000);
  vec3 shade   = vec3(0.560, 0.620, 0.860);
  vec3 sunTint = vec3(1.000, 0.960, 0.880);

  // Cielo por encima del horizonte
  float h = max(uv.y - horizon, 0.0) / (1.0 - horizon);
  vec3 sky = mix(pale, azure, smoothstep(0.0, 0.45, h));
  sky = mix(sky, zenith, smoothstep(0.40, 1.0, h));

  // Cirros altos que se deslizan despacio
  float wisp = fbm(vec2(uv.x * aspect * 1.2 + u_time * 0.012, h * 5.0));
  sky = mix(sky, white, smoothstep(0.55, 0.85, wisp) * 0.35 * (1.0 - h * 0.6));

  // Brillo del sol sobre el horizonte
  vec2 sunPos = vec2(0.5, horizon + 0.08);
  vec2 d = (uv - sunPos) * vec2(aspect, 1.0);
  float glow = exp(-dot(d, d) * (6.0 - u_progress * 2.0));
  vec3 col = sky + sunTint * glow * 0.35;

  // Mar de nubes en perspectiva por debajo del horizonte
  if (uv.y < horizon) {
    float y = horizon - uv.y;
    float z = 0.32 / (y + 0.012);
    float speed = 0.06 + u_progress * 0.55;
    vec2 cuv = vec2((uv.x - 0.5) * aspect * z, z + u_time * speed);
    float c = fbm(cuv * 0.55);
    float body = smoothstep(0.30, 0.75, c);
    float light = smoothstep(0.45, 0.95, fbm(cuv * 0.55 + vec2(0.08, -0.12)));
    float fog = smoothstep(0.0, 0.35, y);
    vec3 cloud = mix(shade, white, 0.35 + 0.65 * light);
    cloud = mix(mix(shade, azure, 0.35), cloud, body);
    col = mix(mix(pale, white, 0.5), cloud, fog);
    col += sunTint * glow * 0.12 * (1.0 - fog);
  }

  // Viñeta suave
  vec2 v = uv - 0.5;
  col *= 1.0 - dot(v, v) * 0.35;
  gl_FragColor = vec4(col, 1.0);
}
`;

export interface Sky {
  setProgress(value: number): void;
  destroy(): void;
}

function compile(gl: WebGLRenderingContext, type: number, source: string) {
  const shader = gl.createShader(type);
  if (!shader) return null;
  gl.shaderSource(shader, source);
  gl.compileShader(shader);
  if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
    gl.deleteShader(shader);
    return null;
  }
  return shader;
}

export function initSky(canvas: HTMLCanvasElement, { animate }: { animate: boolean }): Sky | null {
  const gl = canvas.getContext('webgl', {
    antialias: false,
    alpha: false,
    powerPreference: 'low-power',
  });
  if (!gl) return null;

  const vs = compile(gl, gl.VERTEX_SHADER, VERT);
  const fs = compile(gl, gl.FRAGMENT_SHADER, FRAG);
  const program = gl.createProgram();
  if (!vs || !fs || !program) return null;
  gl.attachShader(program, vs);
  gl.attachShader(program, fs);
  gl.linkProgram(program);
  if (!gl.getProgramParameter(program, gl.LINK_STATUS)) return null;
  gl.useProgram(program);

  const buffer = gl.createBuffer();
  gl.bindBuffer(gl.ARRAY_BUFFER, buffer);
  gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1, -1, 3, -1, -1, 3]), gl.STATIC_DRAW);
  const aPos = gl.getAttribLocation(program, 'a_pos');
  gl.enableVertexAttribArray(aPos);
  gl.vertexAttribPointer(aPos, 2, gl.FLOAT, false, 0, 0);

  const uRes = gl.getUniformLocation(program, 'u_res');
  const uTime = gl.getUniformLocation(program, 'u_time');
  const uProgress = gl.getUniformLocation(program, 'u_progress');

  // El cielo es blando: renderizar a resolución reducida ahorra GPU sin pérdida visible.
  const scale = Math.min(window.devicePixelRatio || 1, 1.5) * 0.6;
  let progress = 0;
  let raf = 0;
  let visible = true;
  const start = performance.now();

  const resize = () => {
    const w = Math.max(1, Math.round(canvas.clientWidth * scale));
    const h = Math.max(1, Math.round(canvas.clientHeight * scale));
    if (canvas.width !== w || canvas.height !== h) {
      canvas.width = w;
      canvas.height = h;
      gl.viewport(0, 0, w, h);
    }
  };

  const draw = (now: number) => {
    resize();
    gl.uniform2f(uRes, canvas.width, canvas.height);
    gl.uniform1f(uTime, animate ? (now - start) / 1000 : 4);
    gl.uniform1f(uProgress, progress);
    gl.drawArrays(gl.TRIANGLES, 0, 3);
  };

  const loop = (now: number) => {
    draw(now);
    raf = visible && animate ? requestAnimationFrame(loop) : 0;
  };

  const io = new IntersectionObserver(([entry]) => {
    visible = !!entry?.isIntersecting && !document.hidden;
    if (visible && animate && !raf) raf = requestAnimationFrame(loop);
  });
  io.observe(canvas);

  const onVisibility = () => {
    visible = !document.hidden;
    if (visible && animate && !raf) raf = requestAnimationFrame(loop);
  };
  document.addEventListener('visibilitychange', onVisibility);

  const ro = new ResizeObserver(() => !animate && draw(performance.now()));
  ro.observe(canvas);

  raf = requestAnimationFrame(loop);
  canvas.dataset.ready = 'true';

  return {
    setProgress(value) {
      progress = value;
      if (!animate) draw(performance.now());
    },
    destroy() {
      cancelAnimationFrame(raf);
      io.disconnect();
      ro.disconnect();
      document.removeEventListener('visibilitychange', onVisibility);
    },
  };
}
