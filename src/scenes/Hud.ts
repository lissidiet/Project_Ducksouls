import Phaser from 'phaser';
import { GAME_WIDTH, GAME_HEIGHT } from '../core';
import { controls } from '../input/controls';

const JOY_R = 56;

export class Hud extends Phaser.Scene {
  private healthBar!: Phaser.GameObjects.Graphics;
  private manaBar!: Phaser.GameObjects.Graphics;
  private essenceText!: Phaser.GameObjects.Text;
  private objectiveText!: Phaser.GameObjects.Text;

  private joyBase!: Phaser.GameObjects.Image;
  private joyThumb!: Phaser.GameObjects.Image;
  private joyHome = new Phaser.Math.Vector2(110, GAME_HEIGHT - 110);
  private joyPointer: number | null = null;

  constructor() {
    super('Hud');
  }

  create(): void {
    this.healthBar = this.add.graphics();
    this.manaBar = this.add.graphics();
    this.add.text(24, 18, 'VITA', { fontFamily: 'Georgia, serif', fontSize: '12px', color: '#e8a0a0' });
    this.add.text(24, 44, 'MANA', { fontFamily: 'Georgia, serif', fontSize: '12px', color: '#a0c8e8' });
    this.essenceText = this.add.text(24, 70, '', { fontFamily: 'Georgia, serif', fontSize: '18px', color: '#bdf3ff' });

    this.add
      .text(GAME_WIDTH / 2, 22, '', { fontFamily: 'Georgia, serif', fontSize: '15px', color: '#9fb4c4' })
      .setOrigin(0.5)
      .setName('realm');
    this.objectiveText = this.add
      .text(GAME_WIDTH / 2, 46, '', {
        fontFamily: 'Georgia, serif', fontSize: '22px', color: '#ffd75e',
        stroke: '#0a0f1e', strokeThickness: 5, align: 'center',
      })
      .setOrigin(0.5);

    this.drawBars();
    this.essenceText.setText(`Essenza: ${this.reg('essence', 0)}`);
    (this.children.getByName('realm') as Phaser.GameObjects.Text)?.setText(this.reg('realm', '') as string);
    this.objectiveText.setText(this.reg('objective', '') as string);

    const on = (k: string, fn: (v: unknown) => void) => this.registry.events.on('changedata-' + k, (_: unknown, v: unknown) => fn(v));
    on('health', () => this.drawBars());
    on('maxHealth', () => this.drawBars());
    on('mana', () => this.drawBars());
    on('maxMana', () => this.drawBars());
    on('essence', (v) => this.essenceText.setText(`Essenza: ${v}`));
    on('realm', (v) => (this.children.getByName('realm') as Phaser.GameObjects.Text)?.setText(v as string));
    on('objective', (v) => this.objectiveText.setText(v as string));
    this.events.on(Phaser.Scenes.Events.SHUTDOWN, () => this.registry.events.off('changedata-health'));

    this.buildJoystick();
    this.button(GAME_WIDTH - 80, GAME_HEIGHT - 80, '⚔', 'attack', 1.25);
    this.button(GAME_WIDTH - 168, GAME_HEIGHT - 58, '✦', 'cast');
    this.button(GAME_WIDTH - 120, GAME_HEIGHT - 150, '»', 'dash');
  }

  private reg(k: string, d: unknown): unknown {
    const v = this.registry.get(k);
    return v === undefined ? d : v;
  }

  private drawBars(): void {
    const hp = this.reg('health', 6) as number;
    const mhp = this.reg('maxHealth', 6) as number;
    const mp = this.reg('mana', 4) as number;
    const mmp = this.reg('maxMana', 4) as number;
    const W = 180;
    this.healthBar.clear();
    this.healthBar.fillStyle(0x2a1418, 1).fillRoundedRect(70, 16, W, 14, 4);
    this.healthBar.fillStyle(0xd64a5a, 1).fillRoundedRect(70, 16, (W * Math.max(0, hp)) / mhp, 14, 4);
    this.healthBar.lineStyle(1, 0x000000, 0.4).strokeRoundedRect(70, 16, W, 14, 4);
    this.manaBar.clear();
    this.manaBar.fillStyle(0x14202a, 1).fillRoundedRect(70, 42, W, 12, 4);
    this.manaBar.fillStyle(0x4aa0e8, 1).fillRoundedRect(70, 42, (W * Math.max(0, mp)) / mmp, 12, 4);
    this.manaBar.lineStyle(1, 0x000000, 0.4).strokeRoundedRect(70, 42, W, 12, 4);
  }

  // ---- touch joystick ----
  private buildJoystick(): void {
    this.joyBase = this.add.image(this.joyHome.x, this.joyHome.y, 'ui-base').setAlpha(0.4);
    this.joyThumb = this.add.image(this.joyHome.x, this.joyHome.y, 'ui-thumb').setAlpha(0.6);

    this.input.on('pointerdown', (p: Phaser.Input.Pointer) => {
      if (this.joyPointer === null && p.x < GAME_WIDTH * 0.5) {
        this.joyPointer = p.id;
        this.joyHome.set(p.x, p.y);
        this.joyBase.setPosition(p.x, p.y).setAlpha(0.55);
        this.joyThumb.setPosition(p.x, p.y).setAlpha(0.85);
      }
    });
    this.input.on('pointermove', (p: Phaser.Input.Pointer) => {
      if (p.id !== this.joyPointer) return;
      const dx = p.x - this.joyHome.x;
      const dy = p.y - this.joyHome.y;
      const len = Math.hypot(dx, dy);
      const cl = Math.min(len, JOY_R);
      const nx = len > 0 ? dx / len : 0;
      const ny = len > 0 ? dy / len : 0;
      this.joyThumb.setPosition(this.joyHome.x + nx * cl, this.joyHome.y + ny * cl);
      const mag = cl / JOY_R;
      controls.moveX = nx * mag;
      controls.moveY = ny * mag;
    });
    const end = (p: Phaser.Input.Pointer) => {
      if (p.id !== this.joyPointer) return;
      this.joyPointer = null;
      controls.moveX = 0;
      controls.moveY = 0;
      this.joyBase.setPosition(this.joyHome.x, this.joyHome.y).setAlpha(0.4);
      this.joyThumb.setPosition(this.joyHome.x, this.joyHome.y).setAlpha(0.6);
    };
    this.input.on('pointerup', end);
    this.input.on('pointerupoutside', end);
  }

  private button(x: number, y: number, label: string, key: 'attack' | 'cast' | 'dash', scale = 1): void {
    const b = this.add.image(x, y, 'ui-btn').setScale(scale).setAlpha(0.4).setInteractive();
    this.add.text(x, y, label, { fontSize: `${26 * scale}px`, color: '#ffffff' }).setOrigin(0.5).setAlpha(0.85);
    b.on('pointerdown', () => {
      controls[key] = true;
      b.setAlpha(0.7);
    });
    const rel = () => {
      controls[key] = false;
      b.setAlpha(0.4);
    };
    b.on('pointerup', rel);
    b.on('pointerout', rel);
  }
}
