// Painterly rendering toolkit (Ori / Dust-inspired). Textures are drawn at
// runtime on HTML5 canvases — gradients, soft shadows and translucent
// layering instead of pixel matrices. Every helper works in texture-local
// coordinates; callers compose them inside paintTexture().

export type PaintFn = (ctx: CanvasRenderingContext2D, w: number, h: number) => void;

export function paintTexture(
  scene: Phaser.Scene,
  key: string,
  width: number,
  height: number,
  draw: PaintFn,
): void {
  if (scene.textures.exists(key)) return;
  const texture = scene.textures.createCanvas(key, width, height);
  if (!texture) return;
  const ctx = texture.getContext();
  ctx.clearRect(0, 0, width, height);
  draw(ctx, width, height);
  texture.refresh();
}

// Soft radial glow — the core building block of the Ori look.
export function radialGlow(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  radius: number,
  color: string,
  innerAlpha = 1,
): void {
  const g = ctx.createRadialGradient(x, y, 0, x, y, radius);
  g.addColorStop(0, withAlpha(color, innerAlpha));
  g.addColorStop(0.55, withAlpha(color, innerAlpha * 0.35));
  g.addColorStop(1, withAlpha(color, 0));
  ctx.fillStyle = g;
  ctx.beginPath();
  ctx.arc(x, y, radius, 0, Math.PI * 2);
  ctx.fill();
}

export function softEllipse(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  rx: number,
  ry: number,
  fill: string | CanvasGradient,
  blur = 0,
  blurColor = 'rgba(0,0,0,0.5)',
): void {
  ctx.save();
  if (blur > 0) {
    ctx.shadowBlur = blur;
    ctx.shadowColor = blurColor;
  }
  ctx.fillStyle = fill;
  ctx.beginPath();
  ctx.ellipse(x, y, rx, ry, 0, 0, Math.PI * 2);
  ctx.fill();
  ctx.restore();
}

export function verticalGradient(
  ctx: CanvasRenderingContext2D,
  x: number,
  y0: number,
  y1: number,
  stops: Array<[number, string]>,
): CanvasGradient {
  const g = ctx.createLinearGradient(x, y0, x, y1);
  for (const [offset, color] of stops) g.addColorStop(offset, color);
  return g;
}

// '#rrggbb' (or rgba()) -> rgba() with the requested alpha
export function withAlpha(color: string, alpha: number): string {
  if (color.startsWith('rgba')) return color.replace(/[\d.]+\)$/, `${alpha})`);
  const n = parseInt(color.slice(1), 16);
  const r = (n >> 16) & 0xff;
  const g = (n >> 8) & 0xff;
  const b = n & 0xff;
  return `rgba(${r},${g},${b},${alpha})`;
}

// Deterministic pseudo-random (so backgrounds are stable across reloads)
export function seededRandom(seed: number): () => number {
  let s = seed >>> 0;
  return () => {
    s = (s * 1664525 + 1013904223) >>> 0;
    return s / 0xffffffff;
  };
}
