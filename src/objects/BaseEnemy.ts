import Phaser from 'phaser';

// Shared combat behavior for all enemies: hit flash, knockback, hit-stun,
// particle burst on death. Subclasses implement movement in update().
export abstract class BaseEnemy extends Phaser.Physics.Arcade.Sprite {
  health: number;
  protected hitStunUntil = 0;

  constructor(scene: Phaser.Scene, x: number, y: number, texture: string, health: number) {
    super(scene, x, y, texture);
    scene.add.existing(this);
    scene.physics.add.existing(this);
    this.health = health;
  }

  protected get stunned(): boolean {
    return this.scene.time.now < this.hitStunUntil;
  }

  // The world has no bottom collision; clean up anything that hops/gets
  // knocked into a pit. Returns true if the enemy was removed.
  protected despawnIfFallen(): boolean {
    if (this.y > this.scene.physics.world.bounds.height + 100) {
      this.destroy();
      return true;
    }
    return false;
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
      this.scene.time.delayedCall(80, () => {
        if (this.active) this.clearTint();
      });
    }
  }

  protected die(): void {
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
