import { BaseEnemy } from './BaseEnemy';

const PATROL_SPEED = 70;

// "Ombra" — a patrolling shade blob. Turns around at walls and edges.
export class Enemy extends BaseEnemy {
  private dir: 1 | -1 = 1;

  constructor(scene: Phaser.Scene, x: number, y: number) {
    super(scene, x, y, 'shade-0', 2, 3);
    this.setSize(40, 34).setOffset(12, 9);
    this.play('shade-float');
  }

  update(): void {
    if (!this.active || this.despawnIfFallen() || this.stunned) return;
    const body = this.body as Phaser.Physics.Arcade.Body;

    if (body.blocked.left) this.dir = 1;
    if (body.blocked.right) this.dir = -1;

    // Just stepped off a platform edge: step back and turn around
    if (!body.blocked.down && body.velocity.y > 0 && body.velocity.y < 100) {
      this.dir = this.dir === 1 ? -1 : 1;
      this.x += this.dir * 12;
      body.velocity.y = 0;
    }

    this.setVelocityX(PATROL_SPEED * this.dir);
    this.setFlipX(this.dir < 0);
  }
}
