import Phaser from 'phaser';
import { GAME_WIDTH, GAME_HEIGHT } from '../main';
import {
  paintOrb,
  paintSlash,
  paintVignette,
} from '../gfx/paintedAssets';
import { paintTopdownTiles } from '../gfx/topdown';

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
    // Top-down world tiles + props
    paintTopdownTiles(this);

    // Objects & FX
    paintOrb(this);
    paintSlash(this);
    paintVignette(this, GAME_WIDTH, GAME_HEIGHT);

    // UI helpers
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
