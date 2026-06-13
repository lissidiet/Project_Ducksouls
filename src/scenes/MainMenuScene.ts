import Phaser from 'phaser';
import { GAME_WIDTH, GAME_HEIGHT } from '../main';

export class MainMenuScene extends Phaser.Scene {
  constructor() {
    super('MainMenu');
  }

  create(): void {
    const cx = GAME_WIDTH / 2;

    // Same painted atmosphere as the game, layered for a strong first frame.
    this.add.image(0, 0, 'sky').setOrigin(0, 0);
    const far = this.add.tileSprite(0, 0, GAME_WIDTH, GAME_HEIGHT, 'forest-far').setOrigin(0, 0).setAlpha(0.9);
    const mid = this.add.tileSprite(0, 0, GAME_WIDTH, GAME_HEIGHT, 'forest-mid').setOrigin(0, 0);
    const near = this.add.tileSprite(0, 0, GAME_WIDTH, GAME_HEIGHT, 'forest-near').setOrigin(0, 0);
    this.add.tileSprite(0, GAME_HEIGHT - 150, GAME_WIDTH, 160, 'fog').setOrigin(0, 0);

    // Slow drifting parallax to make the title screen feel alive
    this.tweens.add({ targets: far, tilePositionX: 60, duration: 40000, repeat: -1, ease: 'Linear' });
    this.tweens.add({ targets: mid, tilePositionX: 120, duration: 30000, repeat: -1, ease: 'Linear' });
    this.tweens.add({ targets: near, tilePositionX: 200, duration: 22000, repeat: -1, ease: 'Linear' });

    // Floating spores
    this.add
      .particles(0, 0, 'glow-dot', {
        x: { min: 0, max: GAME_WIDTH },
        y: { min: 0, max: GAME_HEIGHT },
        lifespan: 6000,
        speedY: { min: -16, max: -4 },
        speedX: { min: -8, max: 8 },
        scale: { start: 0, end: 0.5, ease: 'Sine.easeInOut' },
        alpha: { start: 0.55, end: 0 },
        frequency: 280,
        blendMode: Phaser.BlendModes.ADD,
      })
      .setDepth(5);

    this.add.image(0, 0, 'vignette').setOrigin(0, 0).setDepth(8);

    // Hero duck above the title
    const duck = this.add.image(cx, GAME_HEIGHT * 0.24, 'duck-hero').setScale(1.15).setDepth(10);
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
      .setOrigin(0.5)
      .setDepth(10);

    this.add
      .text(cx, GAME_HEIGHT * 0.66, 'Un metroidvania piumato', {
        fontFamily: 'Georgia, serif',
        fontSize: '22px',
        color: '#9fe8ff',
      })
      .setOrigin(0.5)
      .setDepth(10);

    const start = this.add
      .text(cx, GAME_HEIGHT * 0.83, 'TOCCA PER INIZIARE', {
        fontFamily: 'Georgia, serif',
        fontSize: '28px',
        color: '#ffd75e',
      })
      .setOrigin(0.5)
      .setDepth(10);

    this.tweens.add({ targets: start, alpha: 0.3, duration: 700, yoyo: true, repeat: -1 });

    this.input.once('pointerdown', () => this.startGame());
    this.input.keyboard?.once('keydown', () => this.startGame());
  }

  private startGame(): void {
    this.scene.start('Game');
    this.scene.launch('HUD');
  }
}
