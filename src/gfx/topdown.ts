// Top-down tile + prop textures, painted on canvas (no binary assets).
// Climate is applied later as a scene-wide color overlay, so these are the
// neutral "verdant" base tiles.
import { paintTexture, verticalGradient, withAlpha, radialGlow, seededRandom } from './painterly';

const TILE = 48;

export function paintTopdownTiles(scene: Phaser.Scene): void {
  // Grass — soft mottled green with a few darker blades
  paintTexture(scene, 'tile-grass', TILE, TILE, (ctx, w, h) => {
    ctx.fillStyle = verticalGradient(ctx, 0, 0, h, [
      [0, '#2f5331'],
      [1, '#24412a'],
    ]);
    ctx.fillRect(0, 0, w, h);
    const rnd = seededRandom(5);
    for (let i = 0; i < 22; i++) {
      ctx.fillStyle = withAlpha(rnd() > 0.5 ? '#3c6a3e' : '#1d3522', 0.6);
      const x = rnd() * w;
      const y = rnd() * h;
      ctx.fillRect(x, y, 2, rnd() > 0.6 ? 4 : 2);
    }
  });

  // Water — animated-looking ripples (static frame; scene tweens alpha)
  paintTexture(scene, 'tile-water', TILE, TILE, (ctx, w, h) => {
    ctx.fillStyle = verticalGradient(ctx, 0, 0, h, [
      [0, '#1d3b55'],
      [1, '#122a40'],
    ]);
    ctx.fillRect(0, 0, w, h);
    ctx.strokeStyle = withAlpha('#5f9fc4', 0.4);
    ctx.lineWidth = 1.5;
    const rnd = seededRandom(9);
    for (let i = 0; i < 4; i++) {
      const y = rnd() * h;
      ctx.beginPath();
      ctx.moveTo(0, y);
      ctx.quadraticCurveTo(w / 2, y + (rnd() - 0.5) * 8, w, y);
      ctx.stroke();
    }
  });

  // Sand / shore edge
  paintTexture(scene, 'tile-sand', TILE, TILE, (ctx, w, h) => {
    ctx.fillStyle = verticalGradient(ctx, 0, 0, h, [
      [0, '#6a6048'],
      [1, '#534a38'],
    ]);
    ctx.fillRect(0, 0, w, h);
  });

  // Rock obstacle (collider)
  paintTexture(scene, 'tile-rock', TILE, TILE, (ctx, w, h) => {
    ctx.clearRect(0, 0, w, h);
    ctx.fillStyle = '#3a3d4a';
    ctx.beginPath();
    ctx.ellipse(w / 2, h / 2 + 4, 19, 16, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = '#4a4e5e';
    ctx.beginPath();
    ctx.ellipse(w / 2 - 3, h / 2, 14, 11, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = withAlpha('#1a1c26', 0.5);
    ctx.beginPath();
    ctx.ellipse(w / 2, h - 8, 18, 5, 0, 0, Math.PI * 2);
    ctx.fill();
  });

  // Tree prop (collider, taller — drawn over the player when below it)
  paintTexture(scene, 'prop-tree', TILE, TILE * 2, (ctx, w, h) => {
    ctx.clearRect(0, 0, w, h);
    // trunk
    ctx.fillStyle = '#2c2418';
    ctx.fillRect(w / 2 - 4, h - 34, 8, 30);
    // canopy
    ctx.fillStyle = '#21401f';
    for (const [cx, cy, r] of [
      [w / 2, h - 50, 22],
      [w / 2 - 12, h - 40, 16],
      [w / 2 + 12, h - 42, 15],
    ] as Array<[number, number, number]>) {
      ctx.beginPath();
      ctx.arc(cx, cy, r, 0, Math.PI * 2);
      ctx.fill();
    }
    ctx.fillStyle = withAlpha('#3c6a3e', 0.7);
    ctx.beginPath();
    ctx.arc(w / 2 - 6, h - 56, 12, 0, Math.PI * 2);
    ctx.fill();
  });

  // Boss-room floor (cold stone)
  paintTexture(scene, 'tile-floor', TILE, TILE, (ctx, w, h) => {
    ctx.fillStyle = verticalGradient(ctx, 0, 0, h, [
      [0, '#2a2636'],
      [1, '#1c1a28'],
    ]);
    ctx.fillRect(0, 0, w, h);
    ctx.strokeStyle = withAlpha('#000000', 0.4);
    ctx.strokeRect(0.5, 0.5, w - 1, h - 1);
  });

  // Wall (collider)
  paintTexture(scene, 'tile-wall', TILE, TILE, (ctx, w, h) => {
    ctx.fillStyle = verticalGradient(ctx, 0, 0, h, [
      [0, '#3a3550'],
      [1, '#222032'],
    ]);
    ctx.fillRect(0, 0, w, h);
    ctx.fillStyle = withAlpha('#9fc8d4', 0.18);
    ctx.fillRect(0, 0, w, 3);
    ctx.strokeStyle = withAlpha('#000000', 0.5);
    ctx.strokeRect(0.5, 0.5, w - 1, h - 1);
  });

  // Sealed gate to the boss room (collider until opened)
  paintTexture(scene, 'gate', TILE, TILE, (ctx, w, h) => {
    ctx.fillStyle = '#1a1726';
    ctx.fillRect(0, 0, w, h);
    ctx.strokeStyle = '#b44dff';
    ctx.lineWidth = 2;
    ctx.strokeRect(4, 4, w - 8, h - 8);
    radialGlow(ctx, w / 2, h / 2, 16, '#b44dff', 0.5);
    ctx.fillStyle = '#e9c7ff';
    ctx.beginPath();
    ctx.arc(w / 2, h / 2, 4, 0, Math.PI * 2);
    ctx.fill();
  });

  // Exit portal to the next island
  paintTexture(scene, 'portal', 72, 72, (ctx, w, h) => {
    ctx.clearRect(0, 0, w, h);
    radialGlow(ctx, w / 2, h / 2, 34, '#5fd8ff', 0.6);
    radialGlow(ctx, w / 2, h / 2, 18, '#d8f6ff', 0.9);
    ctx.strokeStyle = withAlpha('#bdf3ff', 0.8);
    ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.ellipse(w / 2, h / 2, 24, 30, 0, 0, Math.PI * 2);
    ctx.stroke();
  });

  // Generic shadow blob placed under characters for grounding
  paintTexture(scene, 'shadow', 48, 20, (ctx, w, h) => {
    ctx.clearRect(0, 0, w, h);
    const g = ctx.createRadialGradient(w / 2, h / 2, 0, w / 2, h / 2, w / 2);
    g.addColorStop(0, 'rgba(0,0,0,0.45)');
    g.addColorStop(1, 'rgba(0,0,0,0)');
    ctx.fillStyle = g;
    ctx.beginPath();
    ctx.ellipse(w / 2, h / 2, w / 2, h / 2, 0, 0, Math.PI * 2);
    ctx.fill();
  });
}

export interface ClimateTheme {
  name: string;
  overlay: number; // tint color blended over the whole map
  overlayAlpha: number;
}

export const CLIMATES: ClimateTheme[] = [
  { name: 'Foresta Crepuscolare', overlay: 0x1a2a3a, overlayAlpha: 0.0 },
  { name: 'Distese Gelide', overlay: 0xbfe0ff, overlayAlpha: 0.28 },
  { name: 'Dune Roventi', overlay: 0xffb46a, overlayAlpha: 0.22 },
];
