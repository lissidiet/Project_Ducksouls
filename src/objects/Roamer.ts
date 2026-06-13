import Phaser from 'phaser';

const WANDER_SPEED = 55;
const CHASE_SPEED = 95;
const AGGRO_RANGE = 240;

// Top-down roaming enemy (the shade wraith). Wanders until the player is
// close, then chases. The boss is the same brain, bigger and tankier.
export class Roamer extends Phaser.Physics.Arcade.Sprite {
  health: number;
  soulValue: number;
  isBoss: boolean;
  shadow: Phaser.GameObjects.Image;

  private target: Phaser.GameObjects.Sprite;
  private hitStunUntil = 0;
  private wanderAngle = Math.random() * Math.PI * 2;
  private nextWanderAt = 0;

  constructor(
    scene: Phaser.Scene,
    x: number,
    y: number,
    target: Phaser.GameObjects.Sprite,
    boss = false,
  ) {
    super(scene, x, y, 'shade');
    scene.add.existing(this);
    scene.physics.add.existing(this);
    this.target = target;
    this.isBoss = boss;
    this.health = boss ? 18 : 3;
    this.soulValue = boss ? 50 : 4;

    const scale = boss ? 2.2 : 1;
    this.setScale(scale);
    this.setSize(34, 40).setOffset(7, 20);
    if (boss) this.setTint(0x9a6bd0);

    this.shadow = scene.add
      .image(x, y + 30 * scale, 'shadow')
      .setScale(scale)
      .setDepth(y - 1);
  }

  get stunned(): boolean {
    return this.scene.time.now < this.hitStunUntil;
  }

  update(): void {
    if (!this.active) return;
    const now = this.scene.time.now;
    this.setDepth(this.y);
    this.shadow.setPosition(this.x, this.y + 30 * this.scaleY).setDepth(this.y - 1);

    // Hovering sway
    this.setAngle(4 * Math.sin(now / 1000 * 2.2));

    if (this.stunned) return;

    const dist = Phaser.Math.Distance.Between(this.x, this.y, this.target.x, this.target.y);
    const speed = this.isBoss ? CHASE_SPEED * 0.85 : CHASE_SPEED;
    if (this.target.active && dist < (this.isBoss ? 9999 : AGGRO_RANGE)) {
      const ang = Math.atan2(this.target.y - this.y, this.target.x - this.x);
      this.setVelocity(Math.cos(ang) * speed, Math.sin(ang) * speed);
      this.setFlipX(this.target.x < this.x);
    } else {
      if (now >= this.nextWanderAt) {
        this.wanderAngle = Math.random() * Math.PI * 2;
        this.nextWanderAt = now + 1200 + Math.random() * 1400;
      }
      this.setVelocity(Math.cos(this.wanderAngle) * WANDER_SPEED, Math.sin(this.wanderAngle) * WANDER_SPEED);
    }
  }

  takeHit(fromX: number, fromY: number, damage: number): void {
    if (!this.active) return;
    this.health -= damage;
    this.hitStunUntil = this.scene.time.now + 160;
    const ang = Math.atan2(this.y - fromY, this.x - fromX);
    this.setVelocity(Math.cos(ang) * 280, Math.sin(ang) * 280);

    if (this.health <= 0) {
      this.die();
    } else {
      this.setTint(0xffffff);
      this.scene.time.delayedCall(70, () => {
        if (this.active) this.setTint(this.isBoss ? 0x9a6bd0 : 0xffffff).clearTint();
      });
    }
  }

  private die(): void {
    this.scene.events.emit(this.isBoss ? 'boss-defeated' : 'roamer-killed', {
      souls: this.soulValue,
      x: this.x,
      y: this.y,
    });
    const burst = this.scene.add.particles(this.x, this.y, 'particle', {
      speed: { min: 80, max: this.isBoss ? 320 : 200 },
      lifespan: this.isBoss ? 900 : 500,
      quantity: this.isBoss ? 40 : 14,
      scale: { start: this.isBoss ? 1.6 : 1, end: 0 },
      tint: 0xb44dff,
      emitting: false,
    });
    burst.explode(this.isBoss ? 40 : 14);
    this.scene.time.delayedCall(1000, () => burst.destroy());
    this.shadow.destroy();
    this.destroy();
  }

  destroy(fromScene?: boolean): void {
    this.shadow?.destroy();
    super.destroy(fromScene);
  }
}
