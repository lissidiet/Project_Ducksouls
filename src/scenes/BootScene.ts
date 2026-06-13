import Phaser from 'phaser';
import { GAME_WIDTH, GAME_HEIGHT } from '../main';
import {
  paintDuckFrames,
  paintShade,
  paintFrog,
  paintPlatform,
  paintBench,
  paintOrb,
  paintSlash,
  paintSky,
  paintForestLayer,
  paintFog,
  paintGodray,
  paintVignette,
} from '../gfx/paintedAssets';

// Paints every texture at runtime onto HTML5 canvases (gradients, glow,
// soft shapes — Ori / Dust look). No binary assets: art lives in
// src/gfx/paintedAssets.ts.
export class BootScene extends Phaser.Scene {
  constructor() {
    super('Boot');
  }

  create(): void {
    // Characters
    paintDuckFrames(this);
    paintShade(this);
    paintFrog(this);

    // World & objects
    paintPlatform(this);
    paintBench(this);
    paintOrb(this);
    paintSlash(this);

    // Atmosphere (parallax + post)
    paintSky(this, GAME_WIDTH, GAME_HEIGHT);
    paintForestLayer(this, 'forest-far', 11, '#0c1320', 430, 14, 1.3);
    paintForestLayer(this, 'forest-mid', 23, '#0d1626', 470, 12, 1.0);
    paintForestLayer(this, 'forest-near', 37, '#070b13', 510, 9, 0.8);
    paintFog(this);
    paintGodray(this);
    paintVignette(this, GAME_WIDTH, GAME_HEIGHT);

    // FX and UI helpers
    this.makeRect('white', 2, 2, 0xffffff);
    this.makeCircle('touch-btn', 42, 0xffffff);
    this.makeParticleTexture();

    this.createAnimations();
    this.scene.start('MainMenu');
  }

  private createAnimations(): void {
    this.anims.create({ key: 'duck-idle', frames: [{ key: 'duck-idle-0' }], frameRate: 1 });
    this.anims.create({
      key: 'duck-walk',
      frames: [
        { key: 'duck-walk-0' },
        { key: 'duck-idle-0' },
        { key: 'duck-walk-1' },
        { key: 'duck-idle-0' },
      ],
      frameRate: 9,
      repeat: -1,
    });
    this.anims.create({ key: 'duck-jump', frames: [{ key: 'duck-jump-0' }], frameRate: 1 });
    this.anims.create({ key: 'shade-float', frames: [{ key: 'shade-0' }], frameRate: 1 });
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
