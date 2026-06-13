// All painted textures for Duck Souls (Ori / Dust-inspired look).
// Characters, tiles and atmosphere layers are drawn with canvas gradients
// and soft light — no binary assets, no pixel grids.
import {
  paintTexture,
  radialGlow,
  softEllipse,
  verticalGradient,
  withAlpha,
  seededRandom,
} from './painterly';

// ---------------------------------------------------------------- player --

interface DuckPose {
  legA: number; // forward offset of near leg
  legB: number; // forward offset of far leg
  legLift: number; // legs tucked when jumping
  wingLift: number; // wing rotation hint (0..1)
}

function drawDuck(ctx: CanvasRenderingContext2D, pose: DuckPose): void {
  const bodyX = 34;
  const bodyY = 36;

  // Faint spirit aura behind everything (the "Ori glow")
  radialGlow(ctx, bodyX + 6, bodyY - 4, 34, '#9fe8ff', 0.14);

  // Legs + webbed feet (behind body)
  ctx.strokeStyle = '#c97f2e';
  ctx.lineWidth = 3;
  ctx.lineCap = 'round';
  const footY = 56 - pose.legLift;
  for (const [hipX, off] of [
    [bodyX - 4, pose.legB],
    [bodyX + 6, pose.legA],
  ] as Array<[number, number]>) {
    ctx.beginPath();
    ctx.moveTo(hipX, bodyY + 10);
    ctx.lineTo(hipX + off, footY);
    ctx.stroke();
    softEllipse(ctx, hipX + off + 3, footY, 6, 2.6, '#e8923a');
  }

  // Tail feathers
  ctx.fillStyle = '#e6d7b4';
  ctx.beginPath();
  ctx.moveTo(bodyX - 14, bodyY - 2);
  ctx.quadraticCurveTo(bodyX - 28, bodyY - 12, bodyX - 24, bodyY + 2);
  ctx.quadraticCurveTo(bodyX - 20, bodyY + 8, bodyX - 12, bodyY + 6);
  ctx.closePath();
  ctx.fill();

  // Body — cream with soft top light and warm under-shadow
  softEllipse(
    ctx,
    bodyX,
    bodyY,
    19,
    14,
    verticalGradient(ctx, bodyX, bodyY - 14, bodyY + 14, [
      [0, '#fdf3da'],
      [0.55, '#f2e6c9'],
      [1, '#cdb38c'],
    ]),
  );

  // Wing
  ctx.save();
  ctx.translate(bodyX - 2, bodyY + 1);
  ctx.rotate(-pose.wingLift * 0.7);
  softEllipse(
    ctx,
    0,
    0,
    11,
    7.5,
    verticalGradient(ctx, 0, -8, 8, [
      [0, '#e9d9b4'],
      [1, '#c9b48d'],
    ]),
  );
  ctx.restore();

  // Head
  softEllipse(
    ctx,
    48,
    20,
    10.5,
    10,
    verticalGradient(ctx, 48, 10, 30, [
      [0, '#fdf3da'],
      [1, '#e8d9b6'],
    ]),
  );

  // Beak
  ctx.fillStyle = '#e8923a';
  ctx.beginPath();
  ctx.moveTo(56, 17);
  ctx.quadraticCurveTo(70, 19, 57, 24);
  ctx.quadraticCurveTo(54, 21, 56, 17);
  ctx.closePath();
  ctx.fill();

  // Knight cloak — indigo, sweeping from head over the back, teal rim light
  const cloak = verticalGradient(ctx, 30, 6, 44, [
    [0, '#2e2e52'],
    [0.6, '#23233a'],
    [1, '#1a1a2e'],
  ]);
  ctx.fillStyle = cloak;
  ctx.beginPath();
  ctx.moveTo(44, 8);
  ctx.quadraticCurveTo(52, 6, 55, 13); // hood crest over the head
  ctx.quadraticCurveTo(50, 12, 46, 15);
  ctx.quadraticCurveTo(34, 16, 26, 26);
  ctx.quadraticCurveTo(16, 36, 20, 46);
  ctx.quadraticCurveTo(28, 50, 36, 48);
  ctx.quadraticCurveTo(24, 42, 28, 30);
  ctx.quadraticCurveTo(34, 18, 44, 8);
  ctx.closePath();
  ctx.fill();

  // Rim light on the cloak edge
  ctx.save();
  ctx.strokeStyle = withAlpha('#7fd4e8', 0.65);
  ctx.lineWidth = 1.6;
  ctx.shadowBlur = 4;
  ctx.shadowColor = '#7fd4e8';
  ctx.beginPath();
  ctx.moveTo(44, 8);
  ctx.quadraticCurveTo(30, 18, 26, 30);
  ctx.quadraticCurveTo(23, 39, 22, 45);
  ctx.stroke();
  ctx.restore();

  // Eye with glint
  ctx.fillStyle = '#141420';
  ctx.beginPath();
  ctx.arc(51, 18, 2.4, 0, Math.PI * 2);
  ctx.fill();
  ctx.fillStyle = 'rgba(255,255,255,0.9)';
  ctx.beginPath();
  ctx.arc(51.9, 17.2, 0.9, 0, Math.PI * 2);
  ctx.fill();
}

export function paintDuckFrames(scene: Phaser.Scene): void {
  const poses: Record<string, DuckPose> = {
    'duck-idle-0': { legA: 2, legB: -2, legLift: 0, wingLift: 0 },
    'duck-walk-0': { legA: 7, legB: -6, legLift: 0, wingLift: 0.1 },
    'duck-walk-1': { legA: -5, legB: 6, legLift: 0, wingLift: 0.1 },
    'duck-jump-0': { legA: -6, legB: -9, legLift: 6, wingLift: 1 },
  };
  for (const [key, pose] of Object.entries(poses)) {
    paintTexture(scene, key, 76, 62, (ctx) => drawDuck(ctx, pose));
  }
}

// --------------------------------------------------------------- enemies --

export function paintShade(scene: Phaser.Scene): void {
  paintTexture(scene, 'shade-0', 64, 58, (ctx) => {
    // Mist halo, then layered body blobs, then glowing eyes
    radialGlow(ctx, 32, 26, 30, '#5a3a8c', 0.35);
    softEllipse(
      ctx,
      32,
      26,
      20,
      16,
      verticalGradient(ctx, 32, 10, 42, [
        [0, '#44305e'],
        [0.5, '#2c1f3d'],
        [1, 'rgba(28,18,42,0)'],
      ]),
      8,
      'rgba(40,25,65,0.8)',
    );
    // Wispy tendrils
    for (const [x, r] of [
      [20, 6],
      [32, 8],
      [45, 5],
    ] as Array<[number, number]>) {
      const g = ctx.createRadialGradient(x, 44, 0, x, 44, r * 2);
      g.addColorStop(0, 'rgba(44,31,61,0.8)');
      g.addColorStop(1, 'rgba(44,31,61,0)');
      ctx.fillStyle = g;
      ctx.beginPath();
      ctx.arc(x, 44, r * 2, 0, Math.PI * 2);
      ctx.fill();
    }
    // Eyes
    for (const ex of [24, 40]) {
      radialGlow(ctx, ex, 23, 7, '#b44dff', 0.9);
      ctx.fillStyle = '#e9c7ff';
      ctx.beginPath();
      ctx.arc(ex, 23, 2.2, 0, Math.PI * 2);
      ctx.fill();
    }
  });
}

function drawFrog(ctx: CanvasRenderingContext2D, jumping: boolean): void {
  const baseY = jumping ? 26 : 30;
  // Body
  softEllipse(
    ctx,
    30,
    baseY,
    21,
    14,
    verticalGradient(ctx, 30, baseY - 14, baseY + 14, [
      [0, '#5d8f4c'],
      [0.6, '#3f6b35'],
      [1, '#2c4d26'],
    ]),
    6,
    'rgba(20,40,18,0.7)',
  );
  // Belly
  softEllipse(ctx, 30, baseY + 6, 13, 6, withAlpha('#9cc24a', 0.5));
  // Spikes with glowing tips
  for (const [sx, sh] of [
    [18, 12],
    [28, 15],
    [38, 12],
  ] as Array<[number, number]>) {
    ctx.fillStyle = '#9cc24a';
    ctx.beginPath();
    ctx.moveTo(sx - 4, baseY - 10);
    ctx.lineTo(sx, baseY - 10 - sh);
    ctx.lineTo(sx + 4, baseY - 9);
    ctx.closePath();
    ctx.fill();
    radialGlow(ctx, sx, baseY - 10 - sh, 4, '#d3f17e', 0.8);
  }
  // Eyes
  for (const ex of [14, 46]) {
    softEllipse(ctx, ex, baseY - 8, 4.5, 4.5, '#2c4d26');
    radialGlow(ctx, ex, baseY - 8, 5, '#ff5a40', 0.8);
    ctx.fillStyle = '#ffd2c2';
    ctx.beginPath();
    ctx.arc(ex, baseY - 8, 1.5, 0, Math.PI * 2);
    ctx.fill();
  }
  // Legs
  ctx.strokeStyle = '#2c4d26';
  ctx.lineWidth = 4;
  ctx.lineCap = 'round';
  if (jumping) {
    for (const [x0, y0, x1, y1] of [
      [14, baseY + 10, 6, 44],
      [46, baseY + 10, 54, 44],
    ] as Array<[number, number, number, number]>) {
      ctx.beginPath();
      ctx.moveTo(x0, y0);
      ctx.quadraticCurveTo((x0 + x1) / 2 - 4, y0 + 8, x1, y1);
      ctx.stroke();
    }
  } else {
    softEllipse(ctx, 13, baseY + 11, 7, 4.5, '#2c4d26');
    softEllipse(ctx, 47, baseY + 11, 7, 4.5, '#2c4d26');
  }
}

export function paintFrog(scene: Phaser.Scene): void {
  paintTexture(scene, 'frog-sit', 60, 48, (ctx) => drawFrog(ctx, false));
  paintTexture(scene, 'frog-jump', 60, 48, (ctx) => drawFrog(ctx, true));
}

// ------------------------------------------------------- world & objects --

export function paintPlatform(scene: Phaser.Scene): void {
  paintTexture(scene, 'platform', 64, 64, (ctx, w, h) => {
    ctx.fillStyle = verticalGradient(ctx, 0, 0, h, [
      [0, '#3c3c58'],
      [0.4, '#2c2c42'],
      [1, '#1d1d2c'],
    ]);
    ctx.fillRect(0, 0, w, h);
    // Mossy top
    ctx.fillStyle = verticalGradient(ctx, 0, 0, 14, [
      [0, withAlpha('#5f8f5c', 0.95)],
      [1, withAlpha('#5f8f5c', 0)],
    ]);
    ctx.fillRect(0, 0, w, 14);
    // Cool top-edge light
    ctx.fillStyle = withAlpha('#aee3d8', 0.5);
    ctx.fillRect(0, 0, w, 2);
    // Cracks
    const rnd = seededRandom(7);
    ctx.strokeStyle = 'rgba(10,10,18,0.5)';
    ctx.lineWidth = 1.5;
    for (let i = 0; i < 4; i++) {
      const x = 8 + rnd() * 48;
      const y = 16 + rnd() * 40;
      ctx.beginPath();
      ctx.moveTo(x, y);
      ctx.lineTo(x + 6 - rnd() * 12, y + 8 + rnd() * 10);
      ctx.stroke();
    }
    // Side shading so tiles read as blocks
    ctx.fillStyle = 'rgba(8,8,14,0.35)';
    ctx.fillRect(w - 3, 0, 3, h);
  });
}

export function paintBench(scene: Phaser.Scene): void {
  paintTexture(scene, 'bench', 72, 64, (ctx) => {
    // Lantern post with warm glow — checkpoints should read from afar
    ctx.strokeStyle = '#3a3144';
    ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.moveTo(60, 60);
    ctx.lineTo(60, 14);
    ctx.stroke();
    radialGlow(ctx, 60, 12, 16, '#ffb45e', 0.9);
    ctx.fillStyle = '#fff1cf';
    ctx.beginPath();
    ctx.arc(60, 12, 3, 0, Math.PI * 2);
    ctx.fill();
    // Seat
    ctx.fillStyle = verticalGradient(ctx, 0, 38, 48, [
      [0, '#8a6d4a'],
      [0.35, '#5a4632'],
      [1, '#41311f'],
    ]);
    ctx.fillRect(4, 38, 48, 9);
    // Legs
    ctx.fillStyle = '#41311f';
    ctx.fillRect(9, 47, 6, 15);
    ctx.fillRect(40, 47, 6, 15);
    // Warm light kissing the seat
    ctx.fillStyle = withAlpha('#ffb45e', 0.25);
    ctx.fillRect(4, 38, 48, 3);
  });
}

export function paintOrb(scene: Phaser.Scene): void {
  paintTexture(scene, 'soul-orb', 36, 36, (ctx) => {
    radialGlow(ctx, 18, 18, 17, '#7fd4ff', 0.85);
    radialGlow(ctx, 18, 18, 8, '#e8fbff', 1);
  });
  paintTexture(scene, 'glow-dot', 18, 18, (ctx) => {
    radialGlow(ctx, 9, 9, 8, '#bdf3ff', 0.9);
  });
  paintTexture(scene, 'feather', 22, 22, (ctx) => {
    radialGlow(ctx, 11, 11, 10, '#ffd75e', 0.9);
    ctx.fillStyle = '#fff3cd';
    ctx.beginPath();
    ctx.arc(11, 11, 3.2, 0, Math.PI * 2);
    ctx.fill();
  });
}

export function paintSlash(scene: Phaser.Scene): void {
  paintTexture(scene, 'slash', 60, 44, (ctx) => {
    // Crescent swoosh
    ctx.save();
    ctx.shadowBlur = 10;
    ctx.shadowColor = '#cfe9ff';
    const g = ctx.createLinearGradient(0, 0, 60, 0);
    g.addColorStop(0, 'rgba(207,233,255,0)');
    g.addColorStop(0.55, 'rgba(238,248,255,0.95)');
    g.addColorStop(1, 'rgba(207,233,255,0)');
    ctx.fillStyle = g;
    ctx.beginPath();
    ctx.moveTo(4, 6);
    ctx.quadraticCurveTo(58, 12, 56, 22);
    ctx.quadraticCurveTo(58, 32, 4, 38);
    ctx.quadraticCurveTo(30, 22, 4, 6);
    ctx.closePath();
    ctx.fill();
    ctx.restore();
  });
}

// ------------------------------------------------------------ atmosphere --

export function paintSky(scene: Phaser.Scene, w: number, h: number): void {
  paintTexture(scene, 'sky', w, h, (ctx) => {
    ctx.fillStyle = verticalGradient(ctx, 0, 0, h, [
      [0, '#080b1c'],
      [0.45, '#101a33'],
      [0.8, '#1a2c47'],
      [1, '#234055'],
    ]);
    ctx.fillRect(0, 0, w, h);
    // Pale moon with wide halo
    radialGlow(ctx, w * 0.72, h * 0.2, 150, '#9fd8e8', 0.22);
    radialGlow(ctx, w * 0.72, h * 0.2, 42, '#d8f3f8', 0.8);
    ctx.fillStyle = '#eefaff';
    ctx.beginPath();
    ctx.arc(w * 0.72, h * 0.2, 20, 0, Math.PI * 2);
    ctx.fill();
    // Stars
    const rnd = seededRandom(99);
    for (let i = 0; i < 70; i++) {
      const x = rnd() * w;
      const y = rnd() * h * 0.6;
      const a = 0.2 + rnd() * 0.6;
      ctx.fillStyle = `rgba(220,240,255,${a})`;
      ctx.fillRect(x, y, 1.5, 1.5);
    }
  });
}

// Tileable forest silhouette layer (trees + hills). Shapes drawn near the
// edges are duplicated at ±width so the TileSprite wraps seamlessly.
export function paintForestLayer(
  scene: Phaser.Scene,
  key: string,
  seed: number,
  color: string,
  baseY: number,
  treeCount: number,
  treeScale: number,
  h = 540,
): void {
  const w = 1024;
  paintTexture(scene, key, w, h, (ctx) => {
    const rnd = seededRandom(seed);
    ctx.fillStyle = color;

    const wrap = (fn: (ox: number) => void) => {
      fn(0);
      fn(-w);
      fn(w);
    };

    // Rolling ground
    for (let i = 0; i < 7; i++) {
      const cx = rnd() * w;
      const r = 90 + rnd() * 170;
      wrap((ox) => {
        ctx.beginPath();
        ctx.ellipse(cx + ox, baseY + r * 0.45, r, r * 0.5, 0, 0, Math.PI * 2);
        ctx.fill();
      });
    }
    ctx.fillRect(0, baseY, w, h - baseY);

    // Slender curved trees with canopy blobs
    for (let i = 0; i < treeCount; i++) {
      const x = rnd() * w;
      const tH = (150 + rnd() * 210) * treeScale;
      const sway = (rnd() - 0.5) * 60;
      const topX = x + sway;
      const topY = baseY - tH;
      wrap((ox) => {
        ctx.beginPath();
        ctx.moveTo(x - 7 * treeScale + ox, baseY + 10);
        ctx.quadraticCurveTo(x + sway * 0.3 + ox, baseY - tH * 0.55, topX - 1.5 + ox, topY);
        ctx.lineTo(topX + 1.5 + ox, topY);
        ctx.quadraticCurveTo(x + sway * 0.45 + ox, baseY - tH * 0.5, x + 7 * treeScale + ox, baseY + 10);
        ctx.closePath();
        ctx.fill();
        // Canopy
        for (let c = 0; c < 3; c++) {
          const cr = (18 + rnd() * 26) * treeScale;
          ctx.beginPath();
          ctx.arc(topX + (rnd() - 0.5) * 50 * treeScale + ox, topY + (rnd() - 0.4) * 30, cr, 0, Math.PI * 2);
          ctx.fill();
        }
      });
    }
  });
}

export function paintFog(scene: Phaser.Scene): void {
  paintTexture(scene, 'fog', 512, 160, (ctx, w, h) => {
    const rnd = seededRandom(41);
    for (let i = 0; i < 14; i++) {
      const x = rnd() * w;
      const y = h * 0.3 + rnd() * h * 0.5;
      const r = 50 + rnd() * 90;
      for (const ox of [0, -w, w]) {
        const g = ctx.createRadialGradient(x + ox, y, 0, x + ox, y, r);
        g.addColorStop(0, 'rgba(140,170,200,0.10)');
        g.addColorStop(1, 'rgba(140,170,200,0)');
        ctx.fillStyle = g;
        ctx.beginPath();
        ctx.arc(x + ox, y, r, 0, Math.PI * 2);
        ctx.fill();
      }
    }
  });
}

export function paintGodray(scene: Phaser.Scene): void {
  paintTexture(scene, 'godray', 220, 540, (ctx, w, h) => {
    ctx.fillStyle = verticalGradient(ctx, 0, 0, h, [
      [0, 'rgba(190,230,240,0.20)'],
      [0.7, 'rgba(190,230,240,0.05)'],
      [1, 'rgba(190,230,240,0)'],
    ]);
    ctx.fillRect(0, 0, w, h);
    // Fade the beam's sides
    const side = ctx.createLinearGradient(0, 0, w, 0);
    side.addColorStop(0, 'rgba(0,0,0,0)');
    side.addColorStop(0.5, 'rgba(0,0,0,1)');
    side.addColorStop(1, 'rgba(0,0,0,0)');
    ctx.globalCompositeOperation = 'destination-in';
    ctx.fillStyle = side;
    ctx.fillRect(0, 0, w, h);
    ctx.globalCompositeOperation = 'source-over';
  });
}

export function paintVignette(scene: Phaser.Scene, w: number, h: number): void {
  paintTexture(scene, 'vignette', w, h, (ctx) => {
    const g = ctx.createRadialGradient(w / 2, h / 2, h * 0.38, w / 2, h / 2, h * 0.95);
    g.addColorStop(0, 'rgba(4,6,14,0)');
    g.addColorStop(1, 'rgba(4,6,14,0.6)');
    ctx.fillStyle = g;
    ctx.fillRect(0, 0, w, h);
  });
}
