import Phaser from 'phaser';
import { controls } from '../input/controls';
import { SaveData } from '../systems/save';

const BASE_RUN_SPEED = 260;
const JUMP_VELOCITY = -560;
const DASH_SPEED = 620;
const DASH_DURATION = 180; // ms
const BASE_DASH_COOLDOWN = 600; // ms
const COYOTE_TIME = 100; // ms
const ATTACK_DURATION = 160; // ms
const ATTACK_COOLDOWN = 320; // ms
const INVULN_TIME = 900; // ms
export const BASE_HEALTH = 5;

export class Player extends Phaser.Physics.Arcade.Sprite {
  health = BASE_HEALTH;
  maxHealth = BASE_HEALTH;
  damage = 1;
  facing: 1 | -1 = 1;
  attackHitbox: Phaser.GameObjects.Image;
  // Last safe standing spot — where the soul corpse drops if we die in a pit
  lastGroundX = 0;
  lastGroundY = 0;

  private runSpeed = BASE_RUN_SPEED;
  private dashCooldown = BASE_DASH_COOLDOWN;
  private jumpsLeft = 2;
  private lastGroundedAt = 0;
  private dashingUntil = 0;
  private dashReadyAt = 0;
  private attackingUntil = 0;
  private attackReadyAt = 0;
  private invulnUntil = 0;
  private prevJump = false;
  private prevAttack = false;
  private prevDash = false;
  private prevOnGround = false;
  private lastFallSpeed = 0;
  private nextGhostAt = 0;
  private keys!: {
    left: Phaser.Input.Keyboard.Key;
    right: Phaser.Input.Keyboard.Key;
    a: Phaser.Input.Keyboard.Key;
    d: Phaser.Input.Keyboard.Key;
    jump: Phaser.Input.Keyboard.Key;
    up: Phaser.Input.Keyboard.Key;
    attack: Phaser.Input.Keyboard.Key;
    dash: Phaser.Input.Keyboard.Key;
  };

  constructor(scene: Phaser.Scene, x: number, y: number) {
    super(scene, x, y, 'duck-idle-0');
    scene.add.existing(this);
    scene.physics.add.existing(this);

    this.setSize(32, 36).setOffset(8, 5);
    this.setCollideWorldBounds(true);
    this.play('duck-idle');

    this.attackHitbox = scene.add.image(x, y, 'slash').setVisible(false);
    scene.physics.add.existing(this.attackHitbox);
    const hbBody = this.attackHitbox.body as Phaser.Physics.Arcade.Body;
    hbBody.setAllowGravity(false);
    hbBody.enable = false;

    const kb = scene.input.keyboard;
    if (kb) {
      this.keys = {
        left: kb.addKey(Phaser.Input.Keyboard.KeyCodes.LEFT),
        right: kb.addKey(Phaser.Input.Keyboard.KeyCodes.RIGHT),
        a: kb.addKey(Phaser.Input.Keyboard.KeyCodes.A),
        d: kb.addKey(Phaser.Input.Keyboard.KeyCodes.D),
        jump: kb.addKey(Phaser.Input.Keyboard.KeyCodes.SPACE),
        up: kb.addKey(Phaser.Input.Keyboard.KeyCodes.UP),
        attack: kb.addKey(Phaser.Input.Keyboard.KeyCodes.J),
        dash: kb.addKey(Phaser.Input.Keyboard.KeyCodes.K),
      };
    }
  }

  applyStats(save: SaveData): void {
    this.maxHealth = BASE_HEALTH + save.vigor;
    this.damage = 1 + save.strength;
    this.runSpeed = BASE_RUN_SPEED + save.agility * 12;
    this.dashCooldown = Math.max(240, BASE_DASH_COOLDOWN - save.agility * 80);
    this.health = Math.min(this.health, this.maxHealth);
  }

  get isAttacking(): boolean {
    return this.scene.time.now < this.attackingUntil;
  }

  get isInvulnerable(): boolean {
    return this.scene.time.now < this.invulnUntil;
  }

  update(): void {
    const now = this.scene.time.now;
    const body = this.body as Phaser.Physics.Arcade.Body;
    const onGround = body.blocked.down;

    const left = controls.left || this.keys?.left.isDown || this.keys?.a.isDown;
    const right = controls.right || this.keys?.right.isDown || this.keys?.d.isDown;
    const jump = controls.jump || this.keys?.jump.isDown || this.keys?.up.isDown;
    const attack = controls.attack || this.keys?.attack.isDown;
    const dash = controls.dash || this.keys?.dash.isDown;

    const jumpJustPressed = jump && !this.prevJump;
    const attackJustPressed = attack && !this.prevAttack;
    const dashJustPressed = dash && !this.prevDash;
    this.prevJump = jump;
    this.prevAttack = attack;
    this.prevDash = dash;

    if (!onGround) {
      this.lastFallSpeed = body.velocity.y;
    } else {
      if (!this.prevOnGround && this.lastFallSpeed > 380) this.landSquash();
      this.lastGroundedAt = now;
      this.jumpsLeft = 2;
      this.lastGroundX = this.x;
      this.lastGroundY = this.y - 10;
    }
    this.prevOnGround = onGround;

    const dashing = now < this.dashingUntil;
    const moving = (left && !right) || (right && !left);

    if (!dashing) {
      if (left && !right) {
        this.setVelocityX(-this.runSpeed);
        this.facing = -1;
        this.setFlipX(true);
      } else if (right && !left) {
        this.setVelocityX(this.runSpeed);
        this.facing = 1;
        this.setFlipX(false);
      } else {
        this.setVelocityX(0);
      }

      const canCoyoteJump = now - this.lastGroundedAt < COYOTE_TIME;
      if (jumpJustPressed && (onGround || canCoyoteJump || this.jumpsLeft > 0)) {
        if (!onGround && !canCoyoteJump) this.jumpsLeft -= 1;
        else this.jumpsLeft = 1;
        this.setVelocityY(JUMP_VELOCITY);
        this.jumpStretch();
      }

      if (dashJustPressed && now >= this.dashReadyAt) {
        this.dashingUntil = now + DASH_DURATION;
        this.dashReadyAt = now + this.dashCooldown;
        this.setVelocity(DASH_SPEED * this.facing, 0);
        body.setAllowGravity(false);
        this.setAlpha(0.6);
      }

      if (attackJustPressed && now >= this.attackReadyAt) {
        this.attackingUntil = now + ATTACK_DURATION;
        this.attackReadyAt = now + ATTACK_COOLDOWN;
        this.attackLunge();
      }
    } else {
      // Keep dash velocity flat through the whole dash + leave afterimages
      this.setVelocity(DASH_SPEED * this.facing, 0);
      if (now >= this.nextGhostAt) {
        this.nextGhostAt = now + 40;
        this.spawnDashGhost();
      }
    }

    if (!dashing && !body.allowGravity) {
      body.setAllowGravity(true);
      this.setAlpha(this.isInvulnerable ? this.alpha : 1);
    }

    // Animation state
    if (!onGround) this.play('duck-jump', true);
    else if (moving) this.play('duck-walk', true);
    else this.play('duck-idle', true);

    this.updateAttackHitbox();

    if (this.isInvulnerable) {
      this.setAlpha(Math.sin(now / 40) > 0 ? 0.4 : 0.9);
    } else if (!dashing) {
      this.setAlpha(1);
    }
  }

  private landSquash(): void {
    this.scene.tweens.add({
      targets: this,
      scaleY: 0.78,
      scaleX: 1.18,
      duration: 70,
      yoyo: true,
      ease: 'Quad.easeOut',
      onComplete: () => this.setScale(1),
    });
    const dust = this.scene.add.particles(this.x, this.y + 18, 'particle', {
      speed: { min: 30, max: 90 },
      angle: { min: 200, max: 340 },
      lifespan: 350,
      quantity: 6,
      scale: { start: 0.7, end: 0 },
      tint: 0x6a6a8a,
      emitting: false,
    });
    dust.explode(6);
    this.scene.time.delayedCall(400, () => dust.destroy());
  }

  private jumpStretch(): void {
    this.scene.tweens.add({
      targets: this,
      scaleY: 1.18,
      scaleX: 0.85,
      duration: 90,
      yoyo: true,
      ease: 'Quad.easeOut',
      onComplete: () => this.setScale(1),
    });
  }

  private attackLunge(): void {
    this.scene.tweens.add({
      targets: this,
      x: this.x + 10 * this.facing,
      duration: 80,
      ease: 'Quad.easeOut',
    });
  }

  private spawnDashGhost(): void {
    const ghost = this.scene.add
      .image(this.x, this.y, this.texture.key)
      .setFlipX(this.flipX)
      .setAlpha(0.35)
      .setTint(0x9fe8ff)
      .setDepth(this.depth - 1);
    this.scene.tweens.add({
      targets: ghost,
      alpha: 0,
      duration: 220,
      onComplete: () => ghost.destroy(),
    });
  }

  private updateAttackHitbox(): void {
    const hbBody = this.attackHitbox.body as Phaser.Physics.Arcade.Body;
    if (this.isAttacking) {
      this.attackHitbox.setPosition(this.x + 44 * this.facing, this.y);
      this.attackHitbox.setVisible(true).setAlpha(0.8);
      hbBody.enable = true;
    } else {
      this.attackHitbox.setVisible(false);
      hbBody.enable = false;
    }
  }

  heal(): void {
    this.health = this.maxHealth;
  }

  takeDamage(fromX: number): boolean {
    if (this.isInvulnerable) return false;
    this.health -= 1;
    this.invulnUntil = this.scene.time.now + INVULN_TIME;
    const knockDir = this.x < fromX ? -1 : 1;
    this.setVelocity(220 * knockDir, -320);
    return true;
  }
}
