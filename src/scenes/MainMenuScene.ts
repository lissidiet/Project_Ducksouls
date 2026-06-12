import Phaser from 'phaser';
import { GAME_WIDTH, GAME_HEIGHT } from '../main';

export class MainMenuScene extends Phaser.Scene {
  constructor() {
    super('MainMenu');
  }

  create(): void {
    const cx = GAME_WIDTH / 2;

    this.add
      .text(cx, GAME_HEIGHT * 0.32, 'DUCK SOULS', {
        fontFamily: 'Georgia, serif',
        fontSize: '72px',
        color: '#f2e6c9',
        stroke: '#23233a',
        strokeThickness: 8,
      })
      .setOrigin(0.5);

    this.add
      .text(cx, GAME_HEIGHT * 0.47, 'Un metroidvania piumato', {
        fontFamily: 'Georgia, serif',
        fontSize: '22px',
        color: '#9fe8ff',
      })
      .setOrigin(0.5);

    const start = this.add
      .text(cx, GAME_HEIGHT * 0.68, 'TOCCA PER INIZIARE', {
        fontFamily: 'Georgia, serif',
        fontSize: '30px',
        color: '#ffd75e',
      })
      .setOrigin(0.5);

    this.tweens.add({
      targets: start,
      alpha: 0.3,
      duration: 700,
      yoyo: true,
      repeat: -1,
    });

    this.input.once('pointerdown', () => this.startGame());
    this.input.keyboard?.once('keydown', () => this.startGame());
  }

  private startGame(): void {
    this.scene.start('Game');
    this.scene.launch('HUD');
  }
}
