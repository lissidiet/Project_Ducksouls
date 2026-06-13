import Phaser from 'phaser';

// Hero's ember/soul bolt — a simple straight projectile with a glow trail.
export class Bolt extends Phaser.Physics.Arcade.Sprite {
  damage = 2;

  constructor(scene: Phaser.Scene) {
    super(scene, 0, 0, 'bolt');
    scene.add.existing(this);
    scene.physics.add.existing(this);
    (this.body as Phaser.Physics.Arcade.Body).setAllowGravity(false);
    this.setActive(false).setVisible(false);
    (this.body as Phaser.Physics.Arcade.Body).enable = false;
    this.setDepth(9000);
  }

  fire(x: number, y: number, dx: number, dy: number, damage: number): void {
    this.damage = damage;
    this.enableBody(true, x, y, true, true);
    (this.body as Phaser.Physics.Arcade.Body).enable = true;
    this.setVelocity(dx * 520, dy * 520);
    this.setRotation(Math.atan2(dy, dx));
    this.scene.time.delayedCall(1400, () => this.kill());
  }

  kill(): void {
    if (!this.active) return;
    this.disableBody(true, true);
  }

  preUpdate(t: number, dt: number): void {
    super.preUpdate(t, dt);
    if (!this.active) return;
    // fade trail
    const ghost = this.scene.add
      .image(this.x, this.y, 'bolt')
      .setScale(0.7)
      .setAlpha(0.4)
      .setDepth(8999);
    this.scene.tweens.add({ targets: ghost, alpha: 0, duration: 160, onComplete: () => ghost.destroy() });
  }
}
