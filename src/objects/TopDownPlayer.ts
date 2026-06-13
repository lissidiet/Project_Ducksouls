import Phaser from 'phaser';
import { controls } from '../input/controls';
import { SaveData } from '../systems/save';

const BASE_SPEED = 210;
const ATTACK_DURATION = 180; // ms
const ATTACK_COOLDOWN = 300; // ms
const INVULN_TIME = 800; // ms
export const BASE_HEALTH = 5;

// Top-down hero: 8-directional movement, a directional melee swipe, and the
// same squash & stretch juice as the platformer build. Reuses the Higgsfield
// 'duck-hero' sprite (animated via transforms, no gravity).
export class TopDownPlayer extends Phaser.Physics.Arcade.Sprite {
  health = BASE_HEALTH;
  maxHealth = BASE_HEALTH;
  damage = 1;
  facing: 1 | -1 = 1;
  attackHitbox: Phaser.GameObjects.Image;
  shadow: Phaser.GameObjects.Image;

  private speed = BASE_SPEED;
  private aimX = 1;
  private aimY = 0;
  private attackingUntil = 0;
  private attackReadyAt = 0;
  private invulnUntil = 0;
  private prevAttack = false;
  private keys!: Record<string, Phaser.Input.Keyboard.Key>;

  constructor(scene: Phaser.Scene, x: number, y: number) {
    super(scene, x, y, 'duck-hero');
    scene.add.existing(this);
    scene.physics.add.existing(this);

    this.setSize(34, 40).setOffset(16, 50); // feet area, top-down footprint
    this.setCollideWorldBounds(true);
    this.setDepth(y);

    this.shadow = scene.add.image(x, y + 30, 'shadow').setDepth(y - 1);

    this.attackHitbox = scene.add.image(x, y, 'slash').setVisible(false);
    scene.physics.add.existing(this.attackHitbox);
    const hb = this.attackHitbox.body as Phaser.Physics.Arcade.Body;
    hb.setAllowGravity(false);
    hb.enable = false;

    const kb = scene.input.keyboard;
    if (kb) {
      this.keys = {
        left: kb.addKey(Phaser.Input.Keyboard.KeyCodes.LEFT),
        right: kb.addKey(Phaser.Input.Keyboard.KeyCodes.RIGHT),
        up: kb.addKey(Phaser.Input.Keyboard.KeyCodes.UP),
        down: kb.addKey(Phaser.Input.Keyboard.KeyCodes.DOWN),
        a: kb.addKey(Phaser.Input.Keyboard.KeyCodes.A),
        d: kb.addKey(Phaser.Input.Keyboard.KeyCodes.D),
        w: kb.addKey(Phaser.Input.Keyboard.KeyCodes.W),
        s: kb.addKey(Phaser.Input.Keyboard.KeyCodes.S),
        attack: kb.addKey(Phaser.Input.Keyboard.KeyCodes.J),
        space: kb.addKey(Phaser.Input.Keyboard.KeyCodes.SPACE),
      };
    }
  }

  applyStats(save: SaveData): void {
    this.maxHealth = BASE_HEALTH + save.vigor;
    this.damage = 1 + save.strength;
    this.speed = BASE_SPEED + save.agility * 14;
    this.health = Math.min(this.health, this.maxHealth);
  }

  get isAttacking(): boolean {
    return this.scene.time.now < this.attackingUntil;
  }

  get isInvulnerable(): boolean {
    return this.scene.time.now < this.invulnUntil;
  }

  heal(): void {
    this.health = this.maxHealth;
  }

  update(): void {
    const now = this.scene.time.now;
    const k = this.keys;
    let dx = 0;
    let dy = 0;
    if (controls.left || k?.left.isDown || k?.a.isDown) dx -= 1;
    if (controls.right || k?.right.isDown || k?.d.isDown) dx += 1;
    if (controls.up || k?.up.isDown || k?.w.isDown) dy -= 1;
    if (controls.down || k?.down.isDown || k?.s.isDown) dy += 1;

    const attack = controls.attack || k?.attack.isDown || k?.space.isDown;
    const attackJust = attack && !this.prevAttack;
    this.prevAttack = attack;

    const moving = dx !== 0 || dy !== 0;
    if (moving && !this.isAttacking) {
      const len = Math.hypot(dx, dy);
      this.setVelocity((dx / len) * this.speed, (dy / len) * this.speed);
      this.aimX = dx / len;
      this.aimY = dy / len;
      if (dx !== 0) {
        this.facing = dx > 0 ? 1 : -1;
        this.setFlipX(dx < 0);
      }
    } else {
      this.setVelocity(0, 0);
    }

    if (attackJust && now >= this.attackReadyAt && !this.isAttacking) {
      this.attackingUntil = now + ATTACK_DURATION;
      this.attackReadyAt = now + ATTACK_COOLDOWN;
    }

    // Depth-sort by Y so things lower on screen draw in front
    this.setDepth(this.y);
    this.shadow.setPosition(this.x, this.y + 30).setDepth(this.y - 1);

    this.updateAttackHitbox();
    this.applyVisual(now, moving);
  }

  private updateAttackHitbox(): void {
    const hb = this.attackHitbox.body as Phaser.Physics.Arcade.Body;
    if (this.isAttacking) {
      this.attackHitbox
        .setPosition(this.x + this.aimX * 40, this.y + this.aimY * 40)
        .setRotation(Math.atan2(this.aimY, this.aimX))
        .setVisible(true)
        .setAlpha(0.85)
        .setDepth(this.y + 1);
      hb.enable = true;
    } else {
      this.attackHitbox.setVisible(false);
      hb.enable = false;
    }
  }

  private applyVisual(now: number, moving: boolean): void {
    const t = now / 1000;
    let sx = 1;
    let sy = 1;
    let ang = 0;

    if (this.isAttacking) {
      const k = Math.sin((1 - (this.attackingUntil - now) / ATTACK_DURATION) * Math.PI);
      sx = 1 + 0.14 * k;
      sy = 1 - 0.1 * k;
      ang = 12 * k * this.facing;
    } else if (moving) {
      const b = Math.abs(Math.sin(t * 15));
      sy = 1 + 0.05 * b;
      sx = 1 - 0.03 * b;
      ang = 3.5 * Math.sin(t * 15);
    } else {
      const b = Math.sin(t * 2.4);
      sy = 1 + 0.025 * b;
      sx = 1 - 0.018 * b;
      ang = 1.2 * Math.sin(t * 1.5);
    }

    this.setScale(sx, sy);
    this.setAngle(ang);

    if (this.isInvulnerable) this.setAlpha(Math.sin(now / 40) > 0 ? 0.4 : 0.9);
    else this.setAlpha(1);
  }

  takeDamage(fromX: number, fromY: number): boolean {
    if (this.isInvulnerable) return false;
    this.health -= 1;
    this.invulnUntil = this.scene.time.now + INVULN_TIME;
    const ang = Math.atan2(this.y - fromY, this.x - fromX);
    this.setVelocity(Math.cos(ang) * 260, Math.sin(ang) * 260);
    return true;
  }

  destroy(fromScene?: boolean): void {
    this.shadow?.destroy();
    this.attackHitbox?.destroy();
    super.destroy(fromScene);
  }
}
