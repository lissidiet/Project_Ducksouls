import Phaser from 'phaser';
import { REALMS } from '../core';
import { paintShared, paintRealmTiles } from '../gfx/art';

export class Boot extends Phaser.Scene {
  constructor() {
    super('Boot');
  }

  create(): void {
    paintShared(this);
    REALMS.forEach((realm, i) => paintRealmTiles(this, i, realm));

    // UI circles for the touch joystick / buttons
    this.circle('ui-base', 64, 'rgba(255,255,255,0.10)', 'rgba(255,255,255,0.25)');
    this.circle('ui-thumb', 30, 'rgba(255,255,255,0.30)', 'rgba(255,255,255,0.5)');
    this.circle('ui-btn', 40, 'rgba(255,255,255,0.10)', 'rgba(255,255,255,0.30)');

    this.scene.start('Title');
  }

  private circle(key: string, r: number, fill: string, stroke: string): void {
    const t = this.textures.createCanvas(key, r * 2, r * 2);
    if (!t) return;
    const ctx = t.getContext();
    ctx.clearRect(0, 0, r * 2, r * 2);
    ctx.fillStyle = fill;
    ctx.beginPath();
    ctx.arc(r, r, r - 2, 0, Math.PI * 2);
    ctx.fill();
    ctx.strokeStyle = stroke;
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.arc(r, r, r - 2, 0, Math.PI * 2);
    ctx.stroke();
    t.refresh();
  }
}
