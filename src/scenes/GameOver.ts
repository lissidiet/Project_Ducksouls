import Phaser from 'phaser';
import { GAME_WIDTH, GAME_HEIGHT } from '../core';

export class GameOver extends Phaser.Scene {
  private essence = 0;
  private realm = 1;

  constructor() {
    super('GameOver');
  }

  init(data: { essence?: number; realm?: number }): void {
    this.essence = data.essence ?? 0;
    this.realm = data.realm ?? 1;
  }

  create(): void {
    const cx = GAME_WIDTH / 2;
    this.add.rectangle(0, 0, GAME_WIDTH, GAME_HEIGHT, 0x07060a, 1).setOrigin(0, 0);
    this.add.image(cx, GAME_HEIGHT * 0.34, 'light').setBlendMode(Phaser.BlendModes.ADD).setTint(0x8a3a3a).setScale(2.4).setAlpha(0.4);

    this.add
      .text(cx, GAME_HEIGHT * 0.34, 'LA BRACE SI SPEGNE', {
        fontFamily: 'Georgia, serif', fontSize: '54px', color: '#c2455a',
        stroke: '#120a0c', strokeThickness: 8,
      })
      .setOrigin(0.5);
    this.add
      .text(cx, GAME_HEIGHT * 0.5, `Sei caduto nel Reame ${this.realm} · Essenza raccolta: ${this.essence}`, {
        fontFamily: 'Georgia, serif', fontSize: '22px', color: '#9fb4c4',
      })
      .setOrigin(0.5);
    const again = this.add
      .text(cx, GAME_HEIGHT * 0.68, 'TOCCA PER RINASCERE', {
        fontFamily: 'Georgia, serif', fontSize: '26px', color: '#ffd75e',
      })
      .setOrigin(0.5);
    this.tweens.add({ targets: again, alpha: 0.3, duration: 700, yoyo: true, repeat: -1 });

    const restart = () => {
      this.scene.start('World', { realm: 0 });
      this.scene.launch('Hud');
    };
    this.input.once('pointerdown', restart);
    this.input.keyboard?.once('keydown', restart);
  }
}
