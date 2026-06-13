import Phaser from 'phaser';
import { GAME_WIDTH, GAME_HEIGHT } from '../main';
import { Player } from '../objects/Player';
import { BaseEnemy } from '../objects/BaseEnemy';
import { Enemy } from '../objects/Enemy';
import { Frog } from '../objects/Frog';
import { resetControls } from '../input/controls';
import { loadSave, writeSave, SaveData } from '../systems/save';

const LEVEL_WIDTH = 2400;
const LEVEL_HEIGHT = 540;

// Each parallax layer scrolls at a fraction of the camera speed: far layers
// barely move, near layers almost keep up — this is what sells depth.
interface ParallaxLayer {
  sprite: Phaser.GameObjects.TileSprite;
  factor: number;
}

export class GameScene extends Phaser.Scene {
  private player!: Player;
  private enemies!: Phaser.GameObjects.Group;
  private save!: SaveData;
  private souls = 0;
  private dead = false;
  private benchList: Phaser.GameObjects.Image[] = [];
  private onBench = false;
  private parallax: ParallaxLayer[] = [];
  private dustEmitter?: Phaser.GameObjects.Particles.ParticleEmitter;

  constructor() {
    super('Game');
  }

  create(): void {
    resetControls();
    this.dead = false;
    this.save = loadSave();
    this.souls = this.save.souls;

    // No collision on the bottom edge — falling into a pit means falling out
    // of the world, which is how pit damage is detected.
    this.physics.world.setBounds(0, 0, LEVEL_WIDTH, LEVEL_HEIGHT, true, true, true, false);
    this.cameras.main.setBounds(0, 0, LEVEL_WIDTH, LEVEL_HEIGHT);

    this.buildBackground();
    const platforms = this.buildLevel();

    this.player = new Player(this, this.save.benchX, this.save.benchY);
    this.player.applyStats(this.save);
    this.player.heal();
    this.enemies = this.add.group({ runChildUpdate: true });
    this.spawnEnemies();
    const souls = this.spawnSouls();
    this.spawnBenches();
    this.spawnCorpse();

    this.physics.add.collider(this.player, platforms);
    this.physics.add.collider(this.enemies, platforms);

    this.physics.add.overlap(this.player, this.enemies, (_p, e) => {
      this.hurtPlayer((e as BaseEnemy).x);
    });

    this.physics.add.overlap(this.player.attackHitbox, this.enemies, (_hb, e) => {
      (e as BaseEnemy).takeHit(this.player.x, this.player.damage);
    });

    // Killed enemies drop souls (scene event emitted by BaseEnemy.die)
    this.events.off('enemy-killed');
    this.events.on('enemy-killed', (value: number, x: number, y: number) => {
      this.addSouls(value);
      this.showFloatingText(x, y - 30, `+${value}`, 0x9fe8ff);
    });

    // Returning from the level-up menu: re-read stats, refresh the HUD
    this.events.off(Phaser.Scenes.Events.RESUME);
    this.events.on(
      Phaser.Scenes.Events.RESUME,
      (_sys: Phaser.Scenes.Systems, data?: { souls?: number }) => {
        resetControls(); // drop any touch state held while the menu was open
        this.scene.resume('HUD');
        if (data?.souls !== undefined) {
          this.souls = data.souls;
          this.registry.set('souls', this.souls);
        }
        this.save = loadSave();
        this.player.applyStats(this.save);
        this.player.heal();
        this.registry.set('maxHealth', this.player.maxHealth);
        this.registry.set('health', this.player.health);
      },
    );

    this.physics.add.overlap(this.player, souls, (_p, s) => {
      (s as Phaser.Physics.Arcade.Image).destroy();
      this.addSouls(1);
    });


    this.cameras.main.startFollow(this.player, true, 0.1, 0.1);
    this.registry.set('maxHealth', this.player.maxHealth);
    this.registry.set('health', this.player.health);
    this.registry.set('souls', this.souls);
  }

  update(): void {
    this.updateParallax();
    if (this.dead) return;
    this.player.update();
    this.checkBenches();

    // Fell into a pit: damage, then respawn at the last safe standing spot
    // (not the bench — the bench would instantly heal the damage away)
    if (this.player.y > LEVEL_HEIGHT - 10 && this.player.health > 0) {
      if (this.player.takeDamage(this.player.x)) {
        this.registry.set('health', this.player.health);
        if (this.player.health <= 0) {
          this.gameOver();
          return;
        }
      }
      this.player.setPosition(this.player.lastGroundX, this.player.lastGroundY - 20);
      this.player.setVelocity(0, 0);
    }
  }

  private hurtPlayer(fromX: number): void {
    if (this.dead) return;
    if (this.player.takeDamage(fromX)) {
      this.cameras.main.shake(130, 0.012);
      this.registry.set('health', this.player.health);
      if (this.player.health <= 0) this.gameOver();
    }
  }

  private addSouls(amount: number): void {
    this.souls += amount;
    this.registry.set('souls', this.souls);
  }

  // ---- Benches (checkpoints) ----

  private spawnBenches(): void {
    const spots: Array<[number, number]> = [
      [140, 459],
      [1850, 459],
    ];
    this.benchList = spots.map(([x, y]) => this.add.image(x, y, 'bench'));
  }

  // Edge-triggered bench detection: the menu opens once when the player
  // ARRIVES at a bench and can't re-open until they leave and come back.
  // (Timestamps don't work here — the scene clock freezes while paused.)
  private checkBenches(): void {
    const bench = this.benchList.find(
      (b) => Math.abs(this.player.x - b.x) < 46 && Math.abs(this.player.y - b.y) < 64,
    );
    if (!bench) {
      this.onBench = false;
      return;
    }
    if (this.onBench || this.dead) return;
    this.onBench = true;
    this.restAtBench(bench);
  }

  private restAtBench(bench: Phaser.GameObjects.Image): void {
    this.player.heal();
    this.registry.set('health', this.player.health);
    this.save.benchX = bench.x;
    this.save.benchY = bench.y - 60;
    this.save.souls = this.souls;
    writeSave(this.save);

    this.showFloatingText(bench.x, bench.y - 70, 'RIPOSO', 0xffd75e);
    this.scene.pause('HUD');
    this.scene.pause();
    this.scene.launch('LevelUp', { souls: this.souls });
  }

  // ---- Death & corpse run ----

  private gameOver(): void {
    this.dead = true;
    const lostSouls = this.souls;
    if (lostSouls > 0) {
      this.save.corpse = {
        x: Phaser.Math.Clamp(this.player.lastGroundX, 60, LEVEL_WIDTH - 60),
        y: Math.min(this.player.lastGroundY, LEVEL_HEIGHT - 120),
        souls: lostSouls,
      };
    }
    this.save.souls = 0;
    writeSave(this.save);
    this.scene.stop('HUD');
    this.scene.start('GameOver', { souls: lostSouls });
  }

  private spawnCorpse(): void {
    const corpse = this.save.corpse;
    if (!corpse) return;

    const ghost = this.add.image(corpse.x, corpse.y, 'duck-idle-0').setTint(0x4a3f6b).setAlpha(0.8);
    this.tweens.add({
      targets: ghost,
      alpha: 0.35,
      duration: 800,
      yoyo: true,
      repeat: -1,
      ease: 'Sine.easeInOut',
    });
    this.physics.add.existing(ghost);
    const body = ghost.body as Phaser.Physics.Arcade.Body;
    body.setAllowGravity(false);

    this.physics.add.overlap(this.player, ghost, () => {
      const recovered = this.save.corpse?.souls ?? 0;
      this.save.corpse = null;
      writeSave(this.save);
      this.addSouls(recovered);
      this.showFloatingText(ghost.x, ghost.y - 50, `+${recovered} anime`, 0x9fe8ff);

      const particles = this.add.particles(ghost.x, ghost.y, 'particle', {
        speed: { min: 60, max: 200 },
        lifespan: 600,
        quantity: 16,
        scale: { start: 1, end: 0 },
        tint: 0x9fe8ff,
        emitting: false,
      });
      particles.explode(16);
      this.time.delayedCall(700, () => particles.destroy());
      ghost.destroy();
    });
  }

  private showFloatingText(x: number, y: number, message: string, color: number): void {
    const text = this.add
      .text(x, y, message, {
        fontFamily: 'Georgia, serif',
        fontSize: '20px',
        color: `#${color.toString(16).padStart(6, '0')}`,
      })
      .setOrigin(0.5);
    this.tweens.add({
      targets: text,
      y: y - 40,
      alpha: 0,
      duration: 1200,
      ease: 'Cubic.easeOut',
      onComplete: () => text.destroy(),
    });
  }

  // ---- World building ----

  private buildBackground(): void {
    // All background layers are pinned to the camera (scrollFactor 0) and
    // scrolled manually via tilePositionX in update() — this gives seamless,
    // infinitely-tiling parallax with no seams at the level edges.
    const addLayer = (key: string, depth: number, factor: number): void => {
      const sprite = this.add
        .tileSprite(0, 0, GAME_WIDTH, GAME_HEIGHT, key)
        .setOrigin(0, 0)
        .setScrollFactor(0)
        .setDepth(depth);
      this.parallax.push({ sprite, factor });
    };

    // Static sky gradient with moon + stars
    this.add.image(0, 0, 'sky').setOrigin(0, 0).setScrollFactor(0).setDepth(-30);

    addLayer('forest-far', -25, 0.15);
    addLayer('forest-mid', -22, 0.35);
    addLayer('forest-near', -19, 0.6);

    // Drifting god-rays from the moon side
    for (const [x, alpha] of [
      [GAME_WIDTH * 0.62, 0.5],
      [GAME_WIDTH * 0.78, 0.35],
    ] as Array<[number, number]>) {
      const ray = this.add
        .image(x, -40, 'godray')
        .setOrigin(0.5, 0)
        .setScrollFactor(0.1)
        .setDepth(-16)
        .setAlpha(alpha)
        .setBlendMode(Phaser.BlendModes.ADD)
        .setAngle(8);
      this.tweens.add({
        targets: ray,
        alpha: alpha * 0.4,
        duration: 4000 + x,
        yoyo: true,
        repeat: -1,
        ease: 'Sine.easeInOut',
      });
    }

    // Low-lying fog band drifting near the ground
    const fog = this.add
      .tileSprite(0, GAME_HEIGHT - 150, GAME_WIDTH, 160, 'fog')
      .setOrigin(0, 0)
      .setScrollFactor(0)
      .setDepth(-12);
    this.parallax.push({ sprite: fog, factor: 0.45 });

    // Vignette over the whole gameplay (HUD scene still draws on top)
    this.add
      .image(0, 0, 'vignette')
      .setOrigin(0, 0)
      .setScrollFactor(0)
      .setDepth(50);

    // Floating ambient motes / spores drifting through the world (Ori dust).
    // Scale ramps from 0 so they fade in softly; alpha eases out on death.
    this.dustEmitter = this.add.particles(0, 0, 'glow-dot', {
      x: { min: 0, max: GAME_WIDTH },
      y: { min: 0, max: GAME_HEIGHT },
      lifespan: 6000,
      speedX: { min: -8, max: 8 },
      speedY: { min: -16, max: -4 },
      scale: { start: 0, end: 0.5, ease: 'Sine.easeInOut' },
      alpha: { start: 0.55, end: 0 },
      frequency: 320,
      quantity: 1,
      blendMode: Phaser.BlendModes.ADD,
    });
    this.dustEmitter.setScrollFactor(0.4).setDepth(-10);
  }

  private updateParallax(): void {
    const scrollX = this.cameras.main.scrollX;
    for (const layer of this.parallax) {
      layer.sprite.tilePositionX = scrollX * layer.factor;
    }
  }

  private buildLevel(): Phaser.Physics.Arcade.StaticGroup {
    const platforms = this.physics.add.staticGroup();

    const place = (x: number, y: number, tiles: number) => {
      for (let i = 0; i < tiles; i++) {
        platforms.create(x + i * 64 + 32, y + 32, 'platform');
      }
    };

    // Ground segments with pits between them
    place(0, 476, 8);
    place(640, 476, 6);
    place(1180, 476, 7);
    place(1760, 476, 10);

    // Floating platforms
    place(380, 340, 2);
    place(700, 300, 2);
    place(980, 360, 2);
    place(1320, 320, 3);
    place(1650, 260, 2);
    place(2000, 340, 2);

    return platforms;
  }

  private spawnEnemies(): void {
    const shadeSpots: Array<[number, number]> = [
      [760, 420],
      [1300, 420],
      [1420, 260],
      [2150, 420],
    ];
    for (const [x, y] of shadeSpots) {
      this.enemies.add(new Enemy(this, x, y));
    }

    const frogSpots: Array<[number, number]> = [
      [900, 420],
      [1980, 420],
    ];
    for (const [x, y] of frogSpots) {
      this.enemies.add(new Frog(this, x, y, this.player));
    }
  }

  private spawnSouls(): Phaser.Physics.Arcade.Group {
    const souls = this.physics.add.group({ allowGravity: false });
    const spots: Array<[number, number]> = [
      [440, 290],
      [760, 250],
      [1040, 310],
      [1450, 270],
      [1710, 210],
      [2060, 290],
      [2330, 420],
    ];
    for (const [x, y] of spots) {
      const orb = souls.create(x, y, 'soul-orb') as Phaser.Physics.Arcade.Image;
      this.tweens.add({
        targets: orb,
        y: y - 12,
        duration: 900,
        yoyo: true,
        repeat: -1,
        ease: 'Sine.easeInOut',
      });
    }
    return souls;
  }
}
