import Phaser from 'phaser';
import { GAME_WIDTH, GAME_HEIGHT } from '../main';

export class MainMenuScene extends Phaser.Scene {
  constructor() {
    super('MainMenu');
  }

  create(): void {
    const cx = GAME_WIDTH / 2;

    // Tiled top-down ground as the menu backdrop
    this.add.tileSprite(0, 0, GAME_WIDTH, GAME_HEIGHT, 'tile-grass').setOrigin(0, 0);
    this.add
      .rectangle(0, 0, GAME_WIDTH, GAME_HEIGHT, 0x0a1020, 0.45)
      .setOrigin(0, 0);

    // Floating spores
    this.add.particles(0, 0, 'glow-dot', {
      x: { min: 0, max: GAME_WIDTH },
      y: { min: 0, max: GAME_HEIGHT },
      lifespan: 6000,
      speedY: { min: -16, max: -4 },
      speedX: { min: -8, max: 8 },
      scale: { start: 0, end: 0.5, ease: 'Sine.easeInOut' },
      alpha: { start: 0.5, end: 0 },
      frequency: 300,
      blendMode: Phaser.BlendModes.ADD,
    });

    this.add.image(0, 0, 'vignette').setOrigin(0, 0);

    // Hero
    const duck = this.add.image(cx, GAME_HEIGHT * 0.27, 'duck-hero').setScale(1.3);
    this.tweens.add({
      targets: duck,
      y: GAME_HEIGHT * 0.27 - 10,
      duration: 1800,
      yoyo: true,
      repeat: -1,
      ease: 'Sine.easeInOut',
    });

    this.add
      .text(cx, GAME_HEIGHT * 0.52, 'DUCK SOULS', {
        fontFamily: 'Georgia, serif',
        fontSize: '76px',
        color: '#f4ead0',
        stroke: '#0a0f1e',
        strokeThickness: 8,
        shadow: { offsetX: 0, offsetY: 0, color: '#7fd4e8', blur: 18, fill: true },
      })
      .setOrigin(0.5);

    this.add
      .text(cx, GAME_HEIGHT * 0.66, "Esplora le isole · scova la stanza del Boss", {
        fontFamily: 'Georgia, serif',
        fontSize: '20px',
        color: '#9fe8ff',
      })
      .setOrigin(0.5);

    const start = this.add
      .text(cx, GAME_HEIGHT * 0.83, 'TOCCA PER INIZIARE', {
        fontFamily: 'Georgia, serif',
        fontSize: '28px',
        color: '#ffd75e',
      })
      .setOrigin(0.5);
    this.tweens.add({ targets: start, alpha: 0.3, duration: 700, yoyo: true, repeat: -1 });

    this.input.once('pointerdown', () => this.startGame());
    this.input.keyboard?.once('keydown', () => this.startGame());
  }

  private startGame(): void {
    this.scene.start('Island', { island: 0 });
    this.scene.launch('TopHUD');
  }
}
