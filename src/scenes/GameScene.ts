import Phaser from 'phaser';
import { Player } from '../objects/Player';
import { Enemy } from '../objects/Enemy';
import { resetControls } from '../input/controls';

const LEVEL_WIDTH = 2400;
const LEVEL_HEIGHT = 540;

export class GameScene extends Phaser.Scene {
  private player!: Player;
  private enemies!: Phaser.GameObjects.Group;
  private soulsCollected = 0;

  constructor() {
    super('Game');
  }

  create(): void {
    resetControls();
    this.soulsCollected = 0;

    this.physics.world.setBounds(0, 0, LEVEL_WIDTH, LEVEL_HEIGHT);
    this.cameras.main.setBounds(0, 0, LEVEL_WIDTH, LEVEL_HEIGHT);

    this.buildBackground();
    const platforms = this.buildLevel();

    this.player = new Player(this, 120, 380);
    this.enemies = this.add.group({ runChildUpdate: true });
    this.spawnEnemies();
    const souls = this.spawnSouls();

    this.physics.add.collider(this.player, platforms);
    this.physics.add.collider(this.enemies, platforms);

    this.physics.add.overlap(this.player, this.enemies, (_p, e) => {
      const enemy = e as Enemy;
      if (this.player.takeDamage(enemy.x)) {
        this.registry.set('health', this.player.health);
        if (this.player.health <= 0) this.gameOver();
      }
    });

    this.physics.add.overlap(this.player.attackHitbox, this.enemies, (_hb, e) => {
      (e as Enemy).takeHit(this.player.x);
    });

    this.physics.add.overlap(this.player, souls, (_p, s) => {
      const orb = s as Phaser.Physics.Arcade.Image;
      orb.destroy();
      this.soulsCollected += 1;
      this.registry.set('souls', this.soulsCollected);
    });

    this.cameras.main.startFollow(this.player, true, 0.1, 0.1);
    this.registry.set('health', this.player.health);
    this.registry.set('souls', 0);
  }

  update(): void {
    this.player.update();

    // Fell into a pit
    if (this.player.y > LEVEL_HEIGHT - 10 && this.player.health > 0) {
      if (this.player.takeDamage(this.player.x)) {
        this.registry.set('health', this.player.health);
        if (this.player.health <= 0) {
          this.gameOver();
          return;
        }
      }
      this.player.setPosition(120, 380);
      this.player.setVelocity(0, 0);
    }
  }

  private buildBackground(): void {
    // Distant parallax silhouettes, Hollow Knight style
    for (let layer = 0; layer < 3; layer++) {
      const g = this.add.graphics();
      const shade = [0x12121f, 0x181828, 0x1f1f33][layer];
      g.fillStyle(shade, 1);
      const seed = layer * 7 + 3;
      for (let x = 0; x < LEVEL_WIDTH; x += 180 + (seed * 13) % 90) {
        const h = 120 + ((x * (seed + 2)) % 200);
        g.fillRect(x, LEVEL_HEIGHT - h, 90 + (x % 60), h);
      }
      g.setScrollFactor(0.2 + layer * 0.2);
      g.setDepth(-10 + layer);
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
    const spots: Array<[number, number]> = [
      [760, 420],
      [1300, 420],
      [1420, 260],
      [1900, 420],
      [2150, 420],
    ];
    for (const [x, y] of spots) {
      this.enemies.add(new Enemy(this, x, y));
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

  private gameOver(): void {
    this.scene.stop('HUD');
    this.scene.start('GameOver', { souls: this.soulsCollected });
  }
}
