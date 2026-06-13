import Phaser from 'phaser';

export type FoeKind = 'wisp' | 'bonelord' | 'warden';

interface FoeConfig {
  texture: string;
  health: number;
  speed: number;
  essence: number;
  body: [number, number, number, number]; // w,h,offX,offY
  aggro: number;
}

const CONFIG: Record<FoeKind, FoeConfig> = {
  wisp: { texture: 'wisp', health: 3, speed: 95, essence: 4, body: [26, 26, 9, 14], aggro: 280 },
  bonelord: { texture: 'bonelord', health: 7, speed: 55, essence: 9, body: [26, 30, 11, 30], aggro: 320 },
  warden: { texture: 'warden', health: 30, speed: 70, essence: 60, body: [44, 60, 26, 52], aggro: 9999 },
};

// Top-down foe with wander/chase AI. The Warden boss is the same brain with
// bigger stats and an aura.
export class Foe extends Phaser.Physics.Arcade.Sprite {
  kind: FoeKind;
  health: number;
  essence: number;
  shadow: Phaser.GameObjects.Image;

  private cfg: FoeConfig;
  private target: Phaser.GameObjects.Sprite;
  private hitStunUntil = 0;
  private wanderA = Math.random() * Math.PI * 2;
  private nextWander = 0;

  constructor(scene: Phaser.Scene, x: number, y: number, kind: FoeKind, target: Phaser.GameObjects.Sprite) {
    super(scene, x, y, CONFIG[kind].texture);
    scene.add.existing(this);
    scene.physics.add.existing(this);
    this.kind = kind;
    this.cfg = CONFIG[kind];
    this.health = this.cfg.health;
    this.essence = this.cfg.essence;
    this.target = target;
    const [bw, bh, ox, oy] = this.cfg.body;
    this.setSize(bw, bh).setOffset(ox, oy);
    const sScale = kind === 'warden' ? 1 : 1;
    this.shadow = scene.add.image(x, y + (kind === 'warden' ? 52 : 26), 'shadow')
      .setScale(kind === 'warden' ? 1.8 : 1).setDepth(1);
    void sScale;
  }

  get stunned(): boolean { return this.scene.time.now < this.hitStunUntil; }
  get isBoss(): boolean { return this.kind === 'warden'; }

  update(): void {
    if (!this.active) return;
    const now = this.scene.time.now;
    this.setDepth(this.y);
    this.shadow.setPosition(this.x, this.y + (this.isBoss ? 52 : 26)).setDepth(this.y - 1);
    if (this.kind === 'wisp') this.setAngle(4 * Math.sin(now / 1000 * 2.4));

    if (this.stunned) return;
    const d = Phaser.Math.Distance.Between(this.x, this.y, this.target.x, this.target.y);
    if (this.target.active && d < this.cfg.aggro) {
      const a = Math.atan2(this.target.y - this.y, this.target.x - this.x);
      this.setVelocity(Math.cos(a) * this.cfg.speed, Math.sin(a) * this.cfg.speed);
      this.setFlipX(this.target.x < this.x);
    } else {
      if (now >= this.nextWander) { this.wanderA = Math.random() * Math.PI * 2; this.nextWander = now + 1200 + Math.random() * 1400; }
      this.setVelocity(Math.cos(this.wanderA) * this.cfg.speed * 0.5, Math.sin(this.wanderA) * this.cfg.speed * 0.5);
    }
  }

  takeHit(fromX: number, fromY: number, dmg: number): void {
    if (!this.active) return;
    this.health -= dmg;
    this.hitStunUntil = this.scene.time.now + 150;
    const a = Math.atan2(this.y - fromY, this.x - fromX);
    const kb = this.isBoss ? 120 : 300;
    this.setVelocity(Math.cos(a) * kb, Math.sin(a) * kb);
    if (this.health <= 0) { this.die(); return; }
    this.setTint(0xffffff).setTintMode(Phaser.TintModes.FILL);
    this.scene.time.delayedCall(60, () => { if (this.active) this.clearTint(); });
  }

  private die(): void {
    this.scene.events.emit(this.isBoss ? 'boss-dead' : 'foe-dead', { essence: this.essence, x: this.x, y: this.y });
    const n = this.isBoss ? 50 : 16;
    const burst = this.scene.add.particles(this.x, this.y, 'particle', {
      speed: { min: 80, max: this.isBoss ? 380 : 220 }, lifespan: this.isBoss ? 1000 : 520,
      quantity: n, scale: { start: this.isBoss ? 2 : 1, end: 0 }, tint: 0xb46bff, emitting: false,
    });
    burst.explode(n);
    this.scene.time.delayedCall(1100, () => burst.destroy());
    this.shadow.destroy();
    this.destroy();
  }

  destroy(fromScene?: boolean): void {
    this.shadow?.destroy();
    super.destroy(fromScene);
  }
}
