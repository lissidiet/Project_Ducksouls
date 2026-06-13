import Phaser from 'phaser';
import { controls } from '../input/controls';
import { HERO } from '../core';
import { SaveData } from '../systems/save';
import { Bolt } from './Bolt';

// The Emberblade. Top-down 8-directional movement, a directional sword arc,
// a soul-bolt cast, a dodge dash, and squash & stretch juice.
export class Hero extends Phaser.Physics.Arcade.Sprite {
  health = HERO.baseHealth;
  maxHealth = HERO.baseHealth;
  mana = HERO.baseMana;
  maxMana = HERO.baseMana;
  damage = 3;
  facing: 1 | -1 = 1;
  aimX = 1;
  aimY = 0;

  attackHitbox: Phaser.GameObjects.Image;
  shadow: Phaser.GameObjects.Image;
  bolts: Phaser.GameObjects.Group;

  private speed = HERO.speed;
  private dashUntil = 0;
  private dashReadyAt = 0;
  private attackUntil = 0;
  private attackReadyAt = 0;
  private castReadyAt = 0;
  private invulnUntil = 0;
  private manaTimer = 0;
  private prevAttack = false;
  private prevCast = false;
  private prevDash = false;
  private nextGhostAt = 0;
  private keys!: Record<string, Phaser.Input.Keyboard.Key>;

  constructor(scene: Phaser.Scene, x: number, y: number) {
    super(scene, x, y, 'hero');
    scene.add.existing(this);
    scene.physics.add.existing(this);
    this.setSize(20, 22).setOffset(14, 40);
    this.setCollideWorldBounds(true);

    this.shadow = scene.add.image(x, y + 26, 'shadow').setDepth(1);
    this.attackHitbox = scene.add.image(x, y, 'slash').setVisible(false);
    scene.physics.add.existing(this.attackHitbox);
    const hb = this.attackHitbox.body as Phaser.Physics.Arcade.Body;
    hb.setAllowGravity(false);
    hb.enable = false;

    this.bolts = scene.add.group();
    for (let i = 0; i < 8; i++) this.bolts.add(new Bolt(scene));

    const kb = scene.input.keyboard;
    if (kb) {
      const K = Phaser.Input.Keyboard.KeyCodes;
      this.keys = {
        left: kb.addKey(K.LEFT), right: kb.addKey(K.RIGHT), up: kb.addKey(K.UP), down: kb.addKey(K.DOWN),
        a: kb.addKey(K.A), d: kb.addKey(K.D), w: kb.addKey(K.W), s: kb.addKey(K.S),
        attack: kb.addKey(K.J), cast: kb.addKey(K.K), dash: kb.addKey(K.SPACE),
      };
    }
  }

  applyStats(s: SaveData): void {
    this.maxHealth = HERO.baseHealth + s.vigor;
    this.damage = 3 + s.might;
    this.speed = HERO.speed + s.swift * 12;
    this.health = Math.min(this.health, this.maxHealth);
  }

  get isAttacking(): boolean { return this.scene.time.now < this.attackUntil; }
  get isInvulnerable(): boolean { return this.scene.time.now < this.invulnUntil; }
  heal(): void { this.health = this.maxHealth; this.mana = this.maxMana; }

  update(): void {
    const now = this.scene.time.now;
    const k = this.keys;
    let dx = controls.moveX;
    let dy = controls.moveY;
    if (k?.left.isDown || k?.a.isDown) dx -= 1;
    if (k?.right.isDown || k?.d.isDown) dx += 1;
    if (k?.up.isDown || k?.w.isDown) dy -= 1;
    if (k?.down.isDown || k?.s.isDown) dy += 1;
    dx = Phaser.Math.Clamp(dx, -1, 1);
    dy = Phaser.Math.Clamp(dy, -1, 1);

    const attack = controls.attack || k?.attack.isDown || false;
    const cast = controls.cast || k?.cast.isDown || false;
    const dash = controls.dash || k?.dash.isDown || false;
    const attackJust = attack && !this.prevAttack;
    const castJust = cast && !this.prevCast;
    const dashJust = dash && !this.prevDash;
    this.prevAttack = attack; this.prevCast = cast; this.prevDash = dash;

    const dashing = now < this.dashUntil;
    const moving = dx !== 0 || dy !== 0;
    const len = Math.hypot(dx, dy) || 1;

    if (moving) {
      this.aimX = dx / len;
      this.aimY = dy / len;
      if (dx !== 0) { this.facing = dx > 0 ? 1 : -1; this.setFlipX(dx < 0); }
    }

    if (dashing) {
      this.setVelocity(this.aimX * HERO.dashSpeed, this.aimY * HERO.dashSpeed);
      if (now >= this.nextGhostAt) { this.nextGhostAt = now + 35; this.spawnGhost(); }
    } else if (!this.isAttacking) {
      if (moving) this.setVelocity((dx / len) * this.speed, (dy / len) * this.speed);
      else this.setVelocity(0, 0);
    } else {
      this.setVelocity(this.body!.velocity.x * 0.6, this.body!.velocity.y * 0.6);
    }

    if (dashJust && now >= this.dashReadyAt && moving) {
      this.dashUntil = now + HERO.dashDuration;
      this.dashReadyAt = now + HERO.dashCooldown;
      this.invulnUntil = Math.max(this.invulnUntil, now + HERO.dashDuration);
    }
    if (attackJust && now >= this.attackReadyAt && !dashing) {
      this.attackUntil = now + HERO.attackDuration;
      this.attackReadyAt = now + HERO.attackCooldown;
    }
    if (castJust && now >= this.castReadyAt && this.mana >= 1 && !dashing) {
      this.castReadyAt = now + HERO.castCooldown;
      this.mana -= 1;
      this.scene.registry.set('mana', this.mana);
      const bolt = this.bolts.getFirstDead(false) as Bolt | null;
      bolt?.fire(this.x + this.aimX * 18, this.y + this.aimY * 6, this.aimX, this.aimY, this.damage - 1);
    }

    // slow mana regen
    if (this.mana < this.maxMana && now > this.manaTimer) {
      this.manaTimer = now + 2600;
      this.mana += 1;
      this.scene.registry.set('mana', this.mana);
    }

    this.setDepth(this.y);
    this.shadow.setPosition(this.x, this.y + 26).setDepth(this.y - 1);
    this.updateHitbox();
    this.applyVisual(now, moving, dashing);
  }

  private updateHitbox(): void {
    const hb = this.attackHitbox.body as Phaser.Physics.Arcade.Body;
    if (this.isAttacking) {
      this.attackHitbox
        .setPosition(this.x + this.aimX * 34, this.y + this.aimY * 34)
        .setRotation(Math.atan2(this.aimY, this.aimX))
        .setVisible(true).setAlpha(0.9).setDepth(this.y + 1);
      hb.enable = true;
    } else {
      this.attackHitbox.setVisible(false);
      hb.enable = false;
    }
  }

  private applyVisual(now: number, moving: boolean, dashing: boolean): void {
    const t = now / 1000;
    let sx = 1, sy = 1, ang = 0;
    if (this.isAttacking) {
      const kk = Math.sin((1 - (this.attackUntil - now) / HERO.attackDuration) * Math.PI);
      sx = 1 + 0.13 * kk; sy = 1 - 0.09 * kk; ang = 10 * kk * this.facing;
    } else if (dashing) { sx = 1.16; sy = 0.86; }
    else if (moving) { const b = Math.abs(Math.sin(t * 15)); sy = 1 + 0.05 * b; sx = 1 - 0.03 * b; ang = 3 * Math.sin(t * 15); }
    else { const b = Math.sin(t * 2.4); sy = 1 + 0.025 * b; sx = 1 - 0.018 * b; ang = 1.1 * Math.sin(t * 1.5); }
    this.setScale(sx, sy);
    this.setAngle(ang);
    this.setAlpha(this.isInvulnerable && !dashing ? (Math.sin(now / 40) > 0 ? 0.45 : 0.9) : dashing ? 0.7 : 1);
  }

  private spawnGhost(): void {
    const g = this.scene.add.image(this.x, this.y, 'hero').setFlipX(this.flipX)
      .setAlpha(0.32).setTint(0xff9a4a).setDepth(this.y - 2);
    this.scene.tweens.add({ targets: g, alpha: 0, duration: 200, onComplete: () => g.destroy() });
  }

  takeDamage(fromX: number, fromY: number): boolean {
    if (this.isInvulnerable) return false;
    this.health -= 1;
    this.invulnUntil = this.scene.time.now + HERO.invuln;
    const a = Math.atan2(this.y - fromY, this.x - fromX);
    this.setVelocity(Math.cos(a) * 300, Math.sin(a) * 300);
    return true;
  }

  destroy(fromScene?: boolean): void {
    this.shadow?.destroy();
    this.attackHitbox?.destroy();
    super.destroy(fromScene);
  }
}
