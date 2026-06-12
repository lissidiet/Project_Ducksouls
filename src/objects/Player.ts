import Phaser from 'phaser';
import { controls } from '../input/controls';

const RUN_SPEED = 260;
const JUMP_VELOCITY = -560;
const DASH_SPEED = 620;
const DASH_DURATION = 180; // ms
const DASH_COOLDOWN = 600; // ms
const COYOTE_TIME = 100; // ms
const ATTACK_DURATION = 160; // ms
const ATTACK_COOLDOWN = 320; // ms
const INVULN_TIME = 900; // ms
export const MAX_HEALTH = 5;

export class Player extends Phaser.Physics.Arcade.Sprite {
  health = MAX_HEALTH;
  facing: 1 | -1 = 1;
  attackHitbox: Phaser.GameObjects.Image;
  // Last safe standing spot — where the soul corpse drops if we die in a pit
  lastGroundX = 0;
  lastGroundY = 0;

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
    super(scene, x, y, 'duck');
    scene.add.existing(this);
    scene.physics.add.existing(this);

    this.setSize(34, 40).setOffset(8, 6);
    this.setCollideWorldBounds(true);

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

    if (onGround) {
      this.lastGroundedAt = now;
      this.jumpsLeft = 2;
      this.lastGroundX = this.x;
      this.lastGroundY = this.y - 10;
    }

    const dashing = now < this.dashingUntil;

    if (!dashing) {
      if (left && !right) {
        this.setVelocityX(-RUN_SPEED);
        this.facing = -1;
        this.setFlipX(true);
      } else if (right && !left) {
        this.setVelocityX(RUN_SPEED);
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
      }

      if (dashJustPressed && now >= this.dashReadyAt) {
        this.dashingUntil = now + DASH_DURATION;
        this.dashReadyAt = now + DASH_COOLDOWN;
        this.setVelocity(DASH_SPEED * this.facing, 0);
        body.setAllowGravity(false);
        this.setAlpha(0.6);
      }

      if (attackJustPressed && now >= this.attackReadyAt) {
        this.attackingUntil = now + ATTACK_DURATION;
        this.attackReadyAt = now + ATTACK_COOLDOWN;
      }
    } else {
      // Keep dash velocity flat through the whole dash
      this.setVelocity(DASH_SPEED * this.facing, 0);
    }

    if (!dashing && !body.allowGravity) {
      body.setAllowGravity(true);
      this.setAlpha(this.isInvulnerable ? this.alpha : 1);
    }

    this.updateAttackHitbox();

    if (this.isInvulnerable) {
      this.setAlpha(Math.sin(now / 40) > 0 ? 0.4 : 0.9);
    } else if (!dashing) {
      this.setAlpha(1);
    }
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
    this.health = MAX_HEALTH;
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
