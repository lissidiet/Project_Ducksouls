import Phaser from 'phaser';
import { GAME_WIDTH, GAME_HEIGHT } from '../core';

export class Title extends Phaser.Scene {
  constructor() {
    super('Title');
  }

  create(): void {
    const cx = GAME_WIDTH / 2;
    this.add.tileSprite(0, 0, GAME_WIDTH, GAME_HEIGHT, 'r0-floorB').setOrigin(0, 0);
    this.add.rectangle(0, 0, GAME_WIDTH, GAME_HEIGHT, 0x05080a, 0.6).setOrigin(0, 0);

    // torch-lit pools
    for (const [x, y, tint] of [
      [cx, GAME_HEIGHT * 0.34, 0xffcaa0],
      [cx - 240, GAME_HEIGHT * 0.6, 0x8a6bff],
      [cx + 240, GAME_HEIGHT * 0.6, 0x7fe8ff],
    ] as Array<[number, number, number]>) {
      this.add.image(x, y, 'light').setBlendMode(Phaser.BlendModes.ADD).setTint(tint).setScale(2.2).setAlpha(0.5);
    }

    this.add.particles(0, 0, 'particle', {
      x: { min: 0, max: GAME_WIDTH }, y: { min: 0, max: GAME_HEIGHT },
      lifespan: 6000, speedY: { min: -14, max: -3 }, scale: { start: 0, end: 0.5, ease: 'Sine.easeInOut' },
      alpha: { start: 0.4, end: 0 }, frequency: 280, tint: 0xffcaa0, blendMode: Phaser.BlendModes.ADD,
    });

    const hero = this.add.image(cx, GAME_HEIGHT * 0.32, 'hero').setScale(2.4);
    this.tweens.add({ targets: hero, y: GAME_HEIGHT * 0.32 - 10, duration: 1800, yoyo: true, repeat: -1, ease: 'Sine.easeInOut' });

    this.add
      .text(cx, GAME_HEIGHT * 0.58, 'ASHEN HOLLOW', {
        fontFamily: 'Georgia, serif', fontSize: '70px', color: '#f4ead0',
        stroke: '#0a0f1e', strokeThickness: 9,
        shadow: { offsetX: 0, offsetY: 0, color: '#ff9a4a', blur: 22, fill: true },
      })
      .setOrigin(0.5);
    this.add
      .text(cx, GAME_HEIGHT * 0.7, "L'ultimo Emberblade discende nei reami maledetti", {
        fontFamily: 'Georgia, serif', fontSize: '19px', color: '#cdb8a0',
      })
      .setOrigin(0.5);

    const start = this.add
      .text(cx, GAME_HEIGHT * 0.86, 'TOCCA PER INIZIARE', {
        fontFamily: 'Georgia, serif', fontSize: '26px', color: '#ffd75e',
      })
      .setOrigin(0.5);
    this.tweens.add({ targets: start, alpha: 0.3, duration: 700, yoyo: true, repeat: -1 });

    const go = () => {
      this.scene.start('World', { realm: 0 });
      this.scene.launch('Hud');
    };
    this.input.once('pointerdown', go);
    this.input.keyboard?.once('keydown', go);
  }
}
