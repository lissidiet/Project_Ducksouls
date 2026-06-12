import Phaser from 'phaser';

// Generates all placeholder textures at runtime so the game is playable
// with zero binary assets. Each texture will later be replaced by real art
// (Higgsfield / hand-drawn) without touching gameplay code.
export class BootScene extends Phaser.Scene {
  constructor() {
    super('Boot');
  }

  create(): void {
    this.makeDuckTexture();
    this.makeEnemyTexture();
    this.makeRect('platform', 64, 64, 0x2e2e44, 0x4a4a6a);
    this.makeRect('spike', 32, 32, 0x6b1d2a, 0x9c2b3f);
    this.makeRect('slash', 56, 40, 0xfff4c2);
    this.makeCircle('feather', 10, 0xffd75e);
    this.makeCircle('soul-orb', 8, 0x9fe8ff);
    this.makeCircle('touch-btn', 42, 0xffffff);
    this.makeParticleTexture();

    this.scene.start('MainMenu');
  }

  private makeDuckTexture(): void {
    const g = this.add.graphics();
    // Body
    g.fillStyle(0xf2e6c9, 1);
    g.fillEllipse(22, 30, 36, 28);
    // Head
    g.fillEllipse(34, 14, 20, 18);
    // Beak
    g.fillStyle(0xe8923a, 1);
    g.fillTriangle(42, 12, 54, 16, 42, 20);
    // Eye
    g.fillStyle(0x1a1a24, 1);
    g.fillCircle(36, 12, 2.5);
    // Little knight hood (dark cloak, Hollow Knight vibes)
    g.fillStyle(0x23233a, 1);
    g.fillEllipse(18, 34, 28, 18);
    g.generateTexture('duck', 56, 48);
    g.destroy();
  }

  private makeEnemyTexture(): void {
    const g = this.add.graphics();
    // Shade blob enemy
    g.fillStyle(0x2c1f3d, 1);
    g.fillEllipse(24, 26, 44, 32);
    g.fillStyle(0xb44dff, 1);
    g.fillCircle(16, 22, 4);
    g.fillCircle(32, 22, 4);
    g.generateTexture('shade', 48, 44);
    g.destroy();
  }

  private makeRect(key: string, w: number, h: number, fill: number, border?: number): void {
    const g = this.add.graphics();
    g.fillStyle(fill, 1);
    g.fillRect(0, 0, w, h);
    if (border !== undefined) {
      g.lineStyle(3, border, 1);
      g.strokeRect(1, 1, w - 2, h - 2);
    }
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
