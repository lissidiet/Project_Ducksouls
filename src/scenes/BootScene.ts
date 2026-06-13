import Phaser from 'phaser';
import { GAME_WIDTH, GAME_HEIGHT } from '../main';
import {
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

// Loads binary art assets (the Higgsfield-made hero + shade sprites) and
// paints the remaining textures at runtime onto HTML5 canvases (atmosphere,
// frog, world). Characters are real AI art; the world is still procedural.
export class BootScene extends Phaser.Scene {
  constructor() {
    super('Boot');
  }

  preload(): void {
    this.load.image('duck-hero', 'assets/duck-hero.png');
    this.load.image('shade', 'assets/shade.png');
  }

  create(): void {
    // Characters
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

    this.scene.start('MainMenu');
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
