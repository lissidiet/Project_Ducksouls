import Phaser from 'phaser';
import { renderPixelTexture } from '../gfx/pixelArt';
import {
  DUCK_IDLE,
  DUCK_BLINK,
  DUCK_WALK_0,
  DUCK_WALK_1,
  DUCK_JUMP,
  SHADE_0,
  SHADE_1,
  FROG_SIT,
  FROG_JUMP,
  makeStoneTile,
} from '../gfx/sprites';

// Generates all textures at runtime: pixel-art matrices for characters,
// simple shapes for FX. No binary assets — art lives in src/gfx/sprites.ts.
export class BootScene extends Phaser.Scene {
  constructor() {
    super('Boot');
  }

  create(): void {
    // Characters (pixel art)
    renderPixelTexture(this, 'duck-idle-0', DUCK_IDLE);
    renderPixelTexture(this, 'duck-idle-1', DUCK_BLINK);
    renderPixelTexture(this, 'duck-walk-0', DUCK_WALK_0);
    renderPixelTexture(this, 'duck-walk-1', DUCK_WALK_1);
    renderPixelTexture(this, 'duck-jump-0', DUCK_JUMP);
    renderPixelTexture(this, 'shade-0', SHADE_0);
    renderPixelTexture(this, 'shade-1', SHADE_1);
    renderPixelTexture(this, 'frog-sit', FROG_SIT);
    renderPixelTexture(this, 'frog-jump', FROG_JUMP);
    renderPixelTexture(this, 'platform', makeStoneTile(), 4);

    // FX and UI shapes
    this.makeRect('white', 2, 2, 0xffffff);
    this.makeBenchTexture();
    this.makeRect('slash', 56, 40, 0xfff4c2);
    this.makeCircle('feather', 10, 0xffd75e);
    this.makeCircle('soul-orb', 8, 0x9fe8ff);
    this.makeCircle('touch-btn', 42, 0xffffff);
    this.makeParticleTexture();

    this.createAnimations();
    this.scene.start('MainMenu');
  }

  private createAnimations(): void {
    this.anims.create({
      key: 'duck-idle',
      frames: [
        { key: 'duck-idle-0' },
        { key: 'duck-idle-0' },
        { key: 'duck-idle-0' },
        { key: 'duck-idle-1' },
      ],
      frameRate: 3,
      repeat: -1,
    });
    this.anims.create({
      key: 'duck-walk',
      frames: [{ key: 'duck-walk-0' }, { key: 'duck-idle-0' }, { key: 'duck-walk-1' }],
      frameRate: 10,
      repeat: -1,
    });
    this.anims.create({
      key: 'duck-jump',
      frames: [{ key: 'duck-jump-0' }],
      frameRate: 1,
    });
    this.anims.create({
      key: 'shade-float',
      frames: [{ key: 'shade-0' }, { key: 'shade-1' }],
      frameRate: 3,
      repeat: -1,
    });
  }

  private makeBenchTexture(): void {
    const g = this.add.graphics();
    // Wooden bench (the resting checkpoint, Hollow Knight style)
    g.fillStyle(0x5a4632, 1);
    g.fillRect(4, 12, 48, 8);
    g.fillRect(8, 20, 6, 14);
    g.fillRect(42, 20, 6, 14);
    g.fillStyle(0x8a6d4a, 1);
    g.fillRect(4, 12, 48, 3);
    g.generateTexture('bench', 56, 34);
    g.destroy();
  }

  private makeRect(key: string, w: number, h: number, fill: number): void {
    const g = this.add.graphics();
    g.fillStyle(fill, 1);
    g.fillRect(0, 0, w, h);
    g.generateTexture(key, w, h);
    g.destroy();
  }

  private makeCircle(key: string, radius: number, fill: number): void {
    const g = this.add.graphics();
    g.fillStyle(fill, 1);
    g.fillCircle(radius, radius, radius);
    g.generateTexture(key, radius * 2, radius * 2);
    g.destroy();
  }

  private makeParticleTexture(): void {
    const g = this.add.graphics();
    g.fillStyle(0xffffff, 1);
    g.fillCircle(4, 4, 4);
    g.generateTexture('particle', 8, 8);
    g.destroy();
  }
}
