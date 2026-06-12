import Phaser from 'phaser';
import { GAME_WIDTH, GAME_HEIGHT } from '../main';

export class GameOverScene extends Phaser.Scene {
  private souls = 0;

  constructor() {
    super('GameOver');
  }

  init(data: { souls?: number }): void {
    this.souls = data.souls ?? 0;
  }

  create(): void {
    const cx = GAME_WIDTH / 2;

    this.add
      .text(cx, GAME_HEIGHT * 0.35, 'SEI SPIUMATO', {
        fontFamily: 'Georgia, serif',
        fontSize: '60px',
        color: '#9c2b3f',
        stroke: '#1a1a24',
        strokeThickness: 8,
      })
      .setOrigin(0.5);

    this.add
      .text(cx, GAME_HEIGHT * 0.5, `Anime raccolte: ${this.souls}`, {
        fontFamily: 'Georgia, serif',
        fontSize: '26px',
        color: '#9fe8ff',
      })
      .setOrigin(0.5);

    this.add
      .text(cx, GAME_HEIGHT * 0.68, 'TOCCA PER RIPROVARE', {
        fontFamily: 'Georgia, serif',
        fontSize: '28px',
        color: '#ffd75e',
      })
      .setOrigin(0.5);

    this.input.once('pointerdown', () => {
      this.scene.start('Game');
      this.scene.launch('HUD');
    });
    this.input.keyboard?.once('keydown', () => {
      this.scene.start('Game');
      this.scene.launch('HUD');
    });
  }
}
