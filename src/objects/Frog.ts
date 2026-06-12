import Phaser from 'phaser';
import { BaseEnemy } from './BaseEnemy';

const HOP_INTERVAL = 1300; // ms between hops
const AGGRO_RANGE = 280;

// "Rana Spinata" — sits still, hops toward the player when in range.
export class Frog extends BaseEnemy {
  private nextHopAt = 0;
  private target: Phaser.GameObjects.Sprite;

  constructor(scene: Phaser.Scene, x: number, y: number, target: Phaser.GameObjects.Sprite) {
    super(scene, x, y, 'frog-sit', 2, 4);
    this.setSize(34, 22).setOffset(4, 8);
    this.target = target;
  }

  update(): void {
    if (!this.active || this.despawnIfFallen() || this.stunned) return;
    const body = this.body as Phaser.Physics.Arcade.Body;
    const now = this.scene.time.now;

    if (!body.blocked.down) {
      this.setTexture('frog-jump');
      return; // committed to the current hop arc
    }
    this.setTexture('frog-sit');

    this.setVelocityX(0);
    const dx = this.target.x - this.x;
    if (Math.abs(dx) < AGGRO_RANGE && now >= this.nextHopAt && this.target.active) {
      const dir = Math.sign(dx) || 1;
      this.setVelocity(170 * dir, -430);
      this.setFlipX(dir < 0);
      this.nextHopAt = now + HOP_INTERVAL;
    }
  }
}
