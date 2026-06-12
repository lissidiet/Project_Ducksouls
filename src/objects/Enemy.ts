import Phaser from 'phaser';

const PATROL_SPEED = 70;

// "Ombra" — a patrolling shade blob. Turns around at platform edges/walls.
export class Enemy extends Phaser.Physics.Arcade.Sprite {
  health = 2;
  private dir: 1 | -1 = 1;
  private hitStunUntil = 0;

  constructor(scene: Phaser.Scene, x: number, y: number) {
    super(scene, x, y, 'shade');
    scene.add.existing(this);
    scene.physics.add.existing(this);
    this.setSize(40, 30).setOffset(4, 10);
  }

  update(): void {
    if (!this.active) return;
    const now = this.scene.time.now;
    const body = this.body as Phaser.Physics.Arcade.Body;

    if (now < this.hitStunUntil) return;

    if (body.blocked.left) this.dir = 1;
    if (body.blocked.right) this.dir = -1;
    this.setVelocityX(PATROL_SPEED * this.dir);
    this.setFlipX(this.dir < 0);
  }

  takeHit(fromX: number): void {
    this.health -= 1;
    this.hitStunUntil = this.scene.time.now + 200;
    const knockDir = this.x < fromX ? -1 : 1;
    this.setVelocityX(260 * knockDir);

    if (this.health <= 0) {
      this.die();
    } else {
      this.setTint(0xffffff).setTintMode(Phaser.TintModes.FILL);
      this.scene.time.delayedCall(80, () => this.clearTint());
    }
  }

  private die(): void {
    const particles = this.scene.add.particles(this.x, this.y, 'particle', {
      speed: { min: 60, max: 180 },
      lifespan: 500,
      quantity: 12,
      scale: { start: 1, end: 0 },
      tint: 0xb44dff,
      emitting: false,
    });
    particles.explode(12);
    this.scene.time.delayedCall(600, () => particles.destroy());
    this.destroy();
  }
}
