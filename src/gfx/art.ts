import {
  paintTexture,
  radialGlow,
  softEllipse,
  verticalGradient,
  withAlpha,
  seededRandom,
} from './painterly';
import { Realm, TILE } from '../core';

// ---------------------------------------------------------------- shared --

export function paintShared(scene: Phaser.Scene): void {
  // Soft ground shadow
  paintTexture(scene, 'shadow', 48, 20, (ctx, w, h) => {
    const g = ctx.createRadialGradient(w / 2, h / 2, 0, w / 2, h / 2, w / 2);
    g.addColorStop(0, 'rgba(0,0,0,0.5)');
    g.addColorStop(1, 'rgba(0,0,0,0)');
    ctx.fillStyle = g;
    ctx.beginPath();
    ctx.ellipse(w / 2, h / 2, w / 2, h / 2, 0, 0, Math.PI * 2);
    ctx.fill();
  });

  // Radial light mask (white core -> transparent) used by the lighting layer
  paintTexture(scene, 'light', 256, 256, (ctx, w, h) => {
    const g = ctx.createRadialGradient(w / 2, h / 2, 0, w / 2, h / 2, w / 2);
    g.addColorStop(0, 'rgba(255,255,255,1)');
    g.addColorStop(0.45, 'rgba(255,255,255,0.7)');
    g.addColorStop(1, 'rgba(255,255,255,0)');
    ctx.fillStyle = g;
    ctx.fillRect(0, 0, w, h);
  });

  // Particle dot
  paintTexture(scene, 'particle', 8, 8, (ctx, w, h) => {
    radialGlow(ctx, w / 2, h / 2, w / 2, '#ffffff', 1);
  });

  // Essence orb pickup
  paintTexture(scene, 'essence', 24, 24, (ctx, w, h) => {
    radialGlow(ctx, w / 2, h / 2, 11, '#7fe8ff', 0.85);
    radialGlow(ctx, w / 2, h / 2, 5, '#eafdff', 1);
  });

  // Sword slash crescent
  paintTexture(scene, 'slash', 70, 56, (ctx, w, h) => {
    ctx.save();
    ctx.shadowBlur = 12;
    ctx.shadowColor = '#ffd27f';
    const g = ctx.createLinearGradient(0, 0, w, 0);
    g.addColorStop(0, 'rgba(255,210,120,0)');
    g.addColorStop(0.5, 'rgba(255,236,190,0.95)');
    g.addColorStop(1, 'rgba(255,160,80,0)');
    ctx.fillStyle = g;
    ctx.beginPath();
    ctx.moveTo(6, 8);
    ctx.quadraticCurveTo(w - 4, 16, w - 8, h / 2);
    ctx.quadraticCurveTo(w - 4, h - 16, 6, h - 8);
    ctx.quadraticCurveTo(w * 0.5, h / 2, 6, 8);
    ctx.closePath();
    ctx.fill();
    ctx.restore();
  });

  // Magic bolt
  paintTexture(scene, 'bolt', 28, 28, (ctx, w, h) => {
    radialGlow(ctx, w / 2, h / 2, 13, '#8a6bff', 0.85);
    radialGlow(ctx, w / 2, h / 2, 6, '#e8dcff', 1);
  });

  // Portal to the next realm
  paintTexture(scene, 'portal', 96, 96, (ctx, w, h) => {
    radialGlow(ctx, w / 2, h / 2, 46, '#6fd8ff', 0.55);
    radialGlow(ctx, w / 2, h / 2, 24, '#e6fbff', 0.95);
    ctx.strokeStyle = withAlpha('#bdf3ff', 0.85);
    ctx.lineWidth = 3;
    for (let i = 0; i < 3; i++) {
      ctx.beginPath();
      ctx.ellipse(w / 2, h / 2, 30 - i * 6, 38 - i * 8, 0, 0, Math.PI * 2);
      ctx.stroke();
    }
  });

  // Rune gate (sealed boss door)
  paintTexture(scene, 'gate', TILE, TILE, (ctx, w, h) => {
    ctx.fillStyle = verticalGradient(ctx, 0, 0, h, [
      [0, '#2a2233'],
      [1, '#160f1e'],
    ]);
    ctx.fillRect(0, 0, w, h);
    ctx.strokeStyle = '#b44dff';
    ctx.lineWidth = 2;
    ctx.strokeRect(5, 5, w - 10, h - 10);
    radialGlow(ctx, w / 2, h / 2, 16, '#b44dff', 0.55);
    ctx.fillStyle = '#e9c7ff';
    ctx.font = 'bold 22px serif';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText('ᚱ', w / 2, h / 2 + 1);
  });

  paintHero(scene);
  paintWisp(scene);
  paintBonelord(scene);
  paintWarden(scene);
}

// ----------------------------------------------------------------- hero --

function paintHero(scene: Phaser.Scene): void {
  // 48x64, 3/4 top-down, facing right. The Emberblade: hooded ranger with a
  // glowing ember short-sword.
  paintTexture(scene, 'hero', 48, 64, (ctx) => {
    // faint warm aura
    radialGlow(ctx, 24, 34, 26, '#ffb46a', 0.12);

    // legs
    ctx.fillStyle = '#1c1a24';
    ctx.fillRect(18, 48, 6, 12);
    ctx.fillRect(26, 48, 6, 12);
    ctx.fillStyle = '#3a3142';
    ctx.fillRect(17, 58, 8, 4);
    ctx.fillRect(25, 58, 8, 4);

    // cloak body
    softEllipse(
      ctx,
      24,
      38,
      16,
      18,
      verticalGradient(ctx, 24, 20, 56, [
        [0, '#3a3550'],
        [0.5, '#272338'],
        [1, '#161320'],
      ]),
      5,
      'rgba(6,6,14,0.6)',
    );
    // chest strap + emblem
    ctx.fillStyle = '#5a4a2e';
    ctx.fillRect(16, 36, 16, 4);
    ctx.fillStyle = '#ffd75e';
    ctx.beginPath();
    ctx.arc(24, 38, 2.6, 0, Math.PI * 2);
    ctx.fill();

    // hood + head
    softEllipse(ctx, 24, 20, 12, 12, verticalGradient(ctx, 24, 8, 32, [
      [0, '#3a3550'],
      [1, '#1c1830'],
    ]));
    // pale face
    softEllipse(ctx, 27, 22, 7, 8, verticalGradient(ctx, 27, 14, 30, [
      [0, '#e9e3d6'],
      [1, '#c4bdac'],
    ]));
    // glowing eyes
    for (const ex of [25, 30]) {
      radialGlow(ctx, ex, 22, 4, '#9fe8ff', 0.9);
      ctx.fillStyle = '#eafbff';
      ctx.beginPath();
      ctx.arc(ex, 22, 1.5, 0, Math.PI * 2);
      ctx.fill();
    }
    // hood brim shadow
    ctx.fillStyle = withAlpha('#120f1c', 0.6);
    ctx.beginPath();
    ctx.moveTo(14, 18);
    ctx.quadraticCurveTo(24, 8, 35, 16);
    ctx.quadraticCurveTo(28, 14, 22, 16);
    ctx.quadraticCurveTo(17, 16, 14, 18);
    ctx.closePath();
    ctx.fill();

    // ember short-sword (held to the right)
    ctx.save();
    ctx.translate(40, 40);
    ctx.rotate(-0.5);
    // blade glow
    ctx.shadowBlur = 10;
    ctx.shadowColor = '#ff9a3a';
    const blade = ctx.createLinearGradient(0, 0, 0, -26);
    blade.addColorStop(0, '#ffcf8a');
    blade.addColorStop(1, '#ff7a2a');
    ctx.fillStyle = blade;
    ctx.beginPath();
    ctx.moveTo(-2, 2);
    ctx.lineTo(2, 2);
    ctx.lineTo(1.5, -26);
    ctx.lineTo(-1.5, -26);
    ctx.closePath();
    ctx.fill();
    ctx.shadowBlur = 0;
    // guard + hilt
    ctx.fillStyle = '#6a5638';
    ctx.fillRect(-5, 1, 10, 3);
    ctx.fillStyle = '#3a2e1c';
    ctx.fillRect(-1.5, 4, 3, 7);
    ctx.restore();
  });
}

// ---------------------------------------------------------------- foes ---

function paintWisp(scene: Phaser.Scene): void {
  // Cursed wisp — fast floating ghost
  paintTexture(scene, 'wisp', 44, 48, (ctx, w) => {
    radialGlow(ctx, w / 2, 22, 22, '#5a3a8c', 0.4);
    softEllipse(ctx, w / 2, 20, 15, 14, verticalGradient(ctx, w / 2, 6, 34, [
      [0, '#3c2c54'],
      [0.6, '#241836'],
      [1, 'rgba(20,12,30,0)'],
    ]), 6, 'rgba(30,18,46,0.7)');
    for (let i = 0; i < 3; i++) {
      const x = 12 + i * 10;
      const g = ctx.createRadialGradient(x, 38, 0, x, 38, 10);
      g.addColorStop(0, 'rgba(40,28,60,0.8)');
      g.addColorStop(1, 'rgba(40,28,60,0)');
      ctx.fillStyle = g;
      ctx.beginPath();
      ctx.arc(x, 38, 10, 0, Math.PI * 2);
      ctx.fill();
    }
    for (const ex of [17, 27]) {
      radialGlow(ctx, ex, 18, 6, '#c46bff', 0.9);
      ctx.fillStyle = '#f0d8ff';
      ctx.beginPath();
      ctx.arc(ex, 18, 2, 0, Math.PI * 2);
      ctx.fill();
    }
  });
}

function paintBonelord(scene: Phaser.Scene): void {
  // Bone-knight — slow, tanky, red eyes
  paintTexture(scene, 'bonelord', 48, 64, (ctx) => {
    // legs
    ctx.fillStyle = '#cfc6ad';
    ctx.fillRect(18, 48, 5, 12);
    ctx.fillRect(26, 48, 5, 12);
    // dark armoured torso
    softEllipse(ctx, 24, 38, 15, 16, verticalGradient(ctx, 24, 22, 54, [
      [0, '#4a4a58'],
      [1, '#23232e'],
    ]), 4, 'rgba(8,8,12,0.6)');
    // ribcage hint
    ctx.strokeStyle = withAlpha('#cfc6ad', 0.5);
    ctx.lineWidth = 1.5;
    for (let i = 0; i < 3; i++) {
      ctx.beginPath();
      ctx.moveTo(17, 34 + i * 5);
      ctx.lineTo(31, 34 + i * 5);
      ctx.stroke();
    }
    // skull
    softEllipse(ctx, 24, 18, 10, 11, '#e6ddc6');
    ctx.fillStyle = '#1a1620';
    ctx.beginPath();
    ctx.arc(20, 18, 2.4, 0, Math.PI * 2);
    ctx.arc(28, 18, 2.4, 0, Math.PI * 2);
    ctx.fill();
    for (const ex of [20, 28]) radialGlow(ctx, ex, 18, 4, '#ff4a3a', 0.8);
    // jaw
    ctx.strokeStyle = '#9a917a';
    ctx.beginPath();
    ctx.moveTo(20, 24);
    ctx.lineTo(28, 24);
    ctx.stroke();
    // shoulder spikes
    ctx.fillStyle = '#3a3a48';
    ctx.beginPath();
    ctx.moveTo(8, 32);
    ctx.lineTo(16, 28);
    ctx.lineTo(15, 36);
    ctx.closePath();
    ctx.fill();
    ctx.beginPath();
    ctx.moveTo(40, 32);
    ctx.lineTo(32, 28);
    ctx.lineTo(33, 36);
    ctx.closePath();
    ctx.fill();
  });
}

function paintWarden(scene: Phaser.Scene): void {
  // Boss — the Warden: tall hooded king with a crown of cold light
  paintTexture(scene, 'warden', 96, 120, (ctx) => {
    radialGlow(ctx, 48, 60, 54, '#7a3aff', 0.3);
    // robe
    ctx.fillStyle = (() => {
      const g = ctx.createLinearGradient(48, 30, 48, 116);
      g.addColorStop(0, '#2c2742');
      g.addColorStop(0.6, '#1c1830');
      g.addColorStop(1, '#0e0b18');
      return g;
    })();
    ctx.beginPath();
    ctx.moveTo(48, 26);
    ctx.quadraticCurveTo(86, 40, 80, 116);
    ctx.lineTo(16, 116);
    ctx.quadraticCurveTo(10, 40, 48, 26);
    ctx.closePath();
    ctx.fill();
    // hood
    softEllipse(ctx, 48, 34, 22, 22, verticalGradient(ctx, 48, 14, 56, [
      [0, '#3a3358'],
      [1, '#191428'],
    ]));
    // void face
    softEllipse(ctx, 48, 38, 13, 15, '#0a0710');
    for (const ex of [42, 54]) {
      radialGlow(ctx, ex, 36, 7, '#c46bff', 1);
      ctx.fillStyle = '#f0d8ff';
      ctx.beginPath();
      ctx.arc(ex, 36, 2.4, 0, Math.PI * 2);
      ctx.fill();
    }
    // crown of light
    ctx.save();
    ctx.shadowBlur = 10;
    ctx.shadowColor = '#bfe8ff';
    ctx.strokeStyle = '#dff2ff';
    ctx.lineWidth = 2;
    for (let i = -2; i <= 2; i++) {
      const x = 48 + i * 9;
      ctx.beginPath();
      ctx.moveTo(x, 20);
      ctx.lineTo(x, 8 - Math.abs(i) * 1.5);
      ctx.stroke();
    }
    ctx.restore();
  });
}

// ---------------------------------------------------------------- tiles --

export function paintRealmTiles(scene: Phaser.Scene, idx: number, realm: Realm): void {
  const p = (suffix: string) => `r${idx}-${suffix}`;

  for (const [suffix, base] of [
    ['floorA', realm.floorA],
    ['floorB', realm.floorB],
  ] as Array<[string, string]>) {
    paintTexture(scene, p(suffix), TILE, TILE, (ctx, w, h) => {
      ctx.fillStyle = base;
      ctx.fillRect(0, 0, w, h);
      const rnd = seededRandom(suffix === 'floorA' ? 3 : 7);
      for (let i = 0; i < 10; i++) {
        ctx.fillStyle = withAlpha(rnd() > 0.5 ? '#ffffff' : '#000000', 0.06);
        ctx.fillRect(rnd() * w, rnd() * h, 3, 3);
      }
      ctx.strokeStyle = 'rgba(0,0,0,0.25)';
      ctx.strokeRect(0.5, 0.5, w - 1, h - 1);
    });
  }

  paintTexture(scene, p('wall'), TILE, TILE, (ctx, w, h) => {
    ctx.fillStyle = verticalGradient(ctx, 0, 0, h, [
      [0, realm.wallTop],
      [0.3, realm.wallBody],
      [1, '#0c0c12'],
    ]);
    ctx.fillRect(0, 0, w, h);
    ctx.fillStyle = withAlpha('#ffffff', 0.12);
    ctx.fillRect(0, 0, w, 3);
    ctx.strokeStyle = 'rgba(0,0,0,0.5)';
    ctx.strokeRect(0.5, 0.5, w - 1, h - 1);
  });

  paintTexture(scene, p('floorRoom'), TILE, TILE, (ctx, w, h) => {
    ctx.fillStyle = verticalGradient(ctx, 0, 0, h, [
      [0, '#241f30'],
      [1, '#15111d'],
    ]);
    ctx.fillRect(0, 0, w, h);
    ctx.strokeStyle = withAlpha(`#${realm.accent.toString(16).padStart(6, '0')}`, 0.14);
    ctx.strokeRect(2.5, 2.5, w - 5, h - 5);
  });

  // Torch post with flame
  paintTexture(scene, p('torch'), 24, 56, (ctx, w) => {
    ctx.fillStyle = '#2a2620';
    ctx.fillRect(w / 2 - 3, 22, 6, 30);
    ctx.fillStyle = '#15110c';
    ctx.fillRect(w / 2 - 6, 50, 12, 5);
    // flame
    radialGlow(ctx, w / 2, 16, 14, realm.torch, 0.9);
    ctx.fillStyle = realm.torch;
    ctx.beginPath();
    ctx.moveTo(w / 2, 4);
    ctx.quadraticCurveTo(w / 2 + 7, 16, w / 2, 24);
    ctx.quadraticCurveTo(w / 2 - 7, 16, w / 2, 4);
    ctx.closePath();
    ctx.fill();
    ctx.fillStyle = '#fff4d6';
    ctx.beginPath();
    ctx.ellipse(w / 2, 16, 2.5, 5, 0, 0, Math.PI * 2);
    ctx.fill();
  });

  // Pillar (collider prop, taller)
  paintTexture(scene, p('pillar'), TILE, TILE * 2, (ctx, w, h) => {
    ctx.clearRect(0, 0, w, h);
    ctx.fillStyle = verticalGradient(ctx, 0, 0, h, [
      [0, realm.wallTop],
      [1, '#0e0e16'],
    ]);
    ctx.fillRect(w / 2 - 16, 8, 32, h - 12);
    ctx.fillStyle = withAlpha('#ffffff', 0.1);
    ctx.fillRect(w / 2 - 16, 8, 32, 4);
    ctx.fillStyle = '#0c0c14';
    ctx.fillRect(w / 2 - 20, h - 14, 40, 12);
  });
}
