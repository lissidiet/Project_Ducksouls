import Phaser from 'phaser';
import { GAME_WIDTH, GAME_HEIGHT, TILE, REALMS, Realm } from '../core';
import { Hero } from '../objects/Hero';
import { Foe, FoeKind } from '../objects/Foe';
import { Bolt } from '../objects/Bolt';
import { resetControls } from '../input/controls';
import { loadSave, writeSave, SaveData } from '../systems/save';

const COLS = 36;
const ROWS = 24;
const MAP_W = COLS * TILE;
const MAP_H = ROWS * TILE;
const ROOM = { c0: 27, c1: 34, r0: 8, r1: 16, gateR: 12 };

interface Light {
  img: Phaser.GameObjects.Image;
  follow?: Hero;
  x?: number;
  y?: number;
}

export class World extends Phaser.Scene {
  private hero!: Hero;
  private foes!: Phaser.GameObjects.Group;
  private colliders!: Phaser.Physics.Arcade.StaticGroup;
  private save!: SaveData;
  private essence = 0;
  private realmIdx = 0;
  private realm!: Realm;

  private dark!: Phaser.GameObjects.Rectangle;
  private glows: Light[] = [];
  private gate?: Phaser.GameObjects.Image;
  private gateBody?: Phaser.Physics.Arcade.Image;
  private bossSpawned = false;
  private portal?: Phaser.Physics.Arcade.Image;
  private remaining = 0;

  constructor() {
    super('World');
  }

  init(data: { realm?: number }): void {
    this.realmIdx = data.realm ?? 0;
  }

  create(): void {
    resetControls();
    this.save = loadSave();
    this.essence = this.save.essence;
    this.realm = REALMS[this.realmIdx % REALMS.length];
    this.bossSpawned = false;
    this.gate = undefined;
    this.portal = undefined;
    this.glows = [];

    this.physics.world.setBounds(TILE, TILE, MAP_W - 2 * TILE, MAP_H - 2 * TILE);
    this.cameras.main.setBounds(0, 0, MAP_W, MAP_H);
    this.cameras.main.setBackgroundColor(this.realm.floorB);

    this.colliders = this.physics.add.staticGroup();
    this.buildMap();

    this.hero = new Hero(this, 4 * TILE, ROOM.gateR * TILE);
    this.hero.applyStats(this.save);
    this.hero.heal();

    this.foes = this.add.group({ runChildUpdate: true });
    this.spawnFoes();

    this.physics.add.collider(this.hero, this.colliders);
    this.physics.add.collider(this.foes, this.colliders);

    this.physics.add.overlap(this.hero, this.foes, (_h, f) => {
      const foe = f as Foe;
      if (this.hero.takeDamage(foe.x, foe.y)) {
        this.cameras.main.shake(140, 0.012);
        this.registry.set('health', this.hero.health);
        if (this.hero.health <= 0) this.die();
      }
    });
    this.physics.add.overlap(this.hero.attackHitbox, this.foes, (_a, f) => {
      (f as Foe).takeHit(this.hero.x, this.hero.y, this.hero.damage);
    });
    this.physics.add.overlap(this.hero.bolts, this.foes, (b, f) => {
      const bolt = b as Bolt;
      if (!bolt.active) return;
      (f as Foe).takeHit(bolt.x, bolt.y, bolt.damage);
      bolt.kill();
    });

    this.events.off('foe-dead');
    this.events.on('foe-dead', (d: { essence: number; x: number; y: number }) => {
      this.gainEssence(d.essence);
      this.remaining -= 1;
      if (this.remaining <= 0 && !this.bossSpawned) this.openSanctum();
      else this.setObjective(`Dai la caccia alle creature  (${this.remaining})`);
    });
    this.events.off('boss-dead');
    this.events.on('boss-dead', (d: { essence: number; x: number; y: number }) => {
      this.gainEssence(d.essence);
      this.setObjective('Reame purificato! Varca il portale');
      this.spawnPortal(d.x, d.y);
      this.cameras.main.flash(400, 200, 230, 255);
    });

    this.buildLighting();

    this.cameras.main.startFollow(this.hero, true, 0.12, 0.12);
    this.cameras.main.fadeIn(400, 0, 0, 0);
    this.registry.set('maxHealth', this.hero.maxHealth);
    this.registry.set('health', this.hero.health);
    this.registry.set('maxMana', this.hero.maxMana);
    this.registry.set('mana', this.hero.mana);
    this.registry.set('essence', this.essence);
    this.registry.set('realm', `Reame ${this.realmIdx + 1} — ${this.realm.name}`);
    this.setObjective(`Dai la caccia alle creature  (${this.remaining})`);
  }

  update(): void {
    this.hero.update();
    this.updateLighting();
    if (this.portal) {
      const d = Phaser.Math.Distance.Between(this.hero.x, this.hero.y, this.portal.x, this.portal.y);
      if (d < 42) this.nextRealm();
    }
  }

  private gainEssence(n: number): void {
    this.essence += n;
    this.registry.set('essence', this.essence);
  }
  private setObjective(t: string): void {
    this.registry.set('objective', t);
  }

  // ---- map ----
  private inRoom(c: number, r: number): boolean {
    return c >= ROOM.c0 && c <= ROOM.c1 && r >= ROOM.r0 && r <= ROOM.r1;
  }
  private roomWall(c: number, r: number): boolean {
    return this.inRoom(c, r) && (c === ROOM.c0 || c === ROOM.c1 || r === ROOM.r0 || r === ROOM.r1);
  }

  private buildMap(): void {
    const k = (s: string) => `r${this.realmIdx}-${s}`;
    for (let r = 0; r < ROWS; r++) {
      for (let c = 0; c < COLS; c++) {
        const edge = c === 0 || r === 0 || c === COLS - 1 || r === ROWS - 1;
        if (this.inRoom(c, r) && !this.roomWall(c, r)) {
          this.add.image(c * TILE, r * TILE, k('floorRoom')).setOrigin(0, 0).setDepth(-1000);
          continue;
        }
        const floor = (c + r) % 2 === 0 ? k('floorA') : k('floorB');
        this.add.image(c * TILE, r * TILE, floor).setOrigin(0, 0).setDepth(-1000);

        if (edge || this.roomWall(c, r)) {
          this.add.image(c * TILE, r * TILE, k('wall')).setOrigin(0, 0).setDepth(-900);
          if (this.roomWall(c, r) && c === ROOM.c0 && r === ROOM.gateR) {
            this.gate = this.add.image(c * TILE, r * TILE, 'gate').setOrigin(0, 0).setDepth(-880);
            this.gateBody = this.colliders.create(c * TILE + TILE / 2, r * TILE + TILE / 2, 'gate') as Phaser.Physics.Arcade.Image;
            this.gateBody.setVisible(false);
          } else {
            this.colliders.create(c * TILE + TILE / 2, r * TILE + TILE / 2, k('wall')).setVisible(false);
          }
        }
      }
    }

    // Pillars (tall colliders) in a few spots
    const pillarSpots: Array<[number, number]> = [
      [9, 6], [9, 17], [16, 11], [20, 5], [20, 18],
    ];
    for (const [c, r] of pillarSpots) {
      const x = c * TILE + TILE / 2;
      const y = r * TILE + TILE / 2;
      const pil = this.colliders.create(x, y, k('pillar')) as Phaser.Physics.Arcade.Image;
      pil.setOrigin(0.5, 0.75).setDepth(y).refreshBody();
      (pil.body as Phaser.Physics.Arcade.StaticBody).setSize(34, 26).setOffset(7, 64);
    }

    // Torches (light sources) along the walls + in the room
    this.torchSpots = [
      [3, 3], [3, ROWS - 4], [12, 2], [22, 2], [12, ROWS - 3], [22, ROWS - 3],
      [ROOM.c0 + 2, ROOM.r0 + 1], [ROOM.c1 - 1, ROOM.r0 + 1], [(ROOM.c0 + ROOM.c1) / 2 | 0, ROOM.r1 - 1],
    ];
    for (const [c, r] of this.torchSpots) {
      this.add.image(c * TILE + TILE / 2, r * TILE + TILE / 2, k('torch')).setDepth(r * TILE);
    }
  }
  private torchSpots: Array<[number, number]> = [];

  private spawnFoes(): void {
    const rnd = Phaser.Math.RND;
    const count = 6 + this.realmIdx * 2;
    this.remaining = count;
    let placed = 0;
    let guard = 0;
    while (placed < count && guard++ < 500) {
      const c = rnd.between(7, ROOM.c0 - 2);
      const r = rnd.between(3, ROWS - 4);
      if (c < 7 && Math.abs(r - ROOM.gateR) < 3) continue;
      const kind: FoeKind = rnd.frac() < 0.3 + this.realmIdx * 0.1 ? 'bonelord' : 'wisp';
      const foe = new Foe(this, c * TILE, r * TILE, kind, this.hero);
      foe.setCollideWorldBounds(true);
      this.foes.add(foe);
      placed++;
    }
  }

  private openSanctum(): void {
    this.bossSpawned = true;
    this.gate?.destroy();
    this.gateBody?.destroy();
    const gx = ROOM.c0 * TILE + TILE / 2;
    const gy = ROOM.gateR * TILE + TILE / 2;
    const fx = this.add.particles(gx, gy, 'particle', {
      speed: { min: 60, max: 220 }, lifespan: 800, quantity: 24,
      scale: { start: 1.6, end: 0 }, tint: 0xb46bff, emitting: false,
    });
    fx.explode(24);
    this.time.delayedCall(900, () => fx.destroy());
    const bx = ((ROOM.c0 + ROOM.c1) / 2) * TILE;
    const by = ((ROOM.r0 + ROOM.r1) / 2) * TILE;
    const boss = new Foe(this, bx, by, 'warden', this.hero);
    boss.setCollideWorldBounds(true);
    this.foes.add(boss);
    this.glows.push({ img: this.addLight(0x9a6bff, 2.2, 0.7), x: bx, y: by });
    this.setObjective('Il sigillo è rotto — abbatti il Guardiano');
    this.cameras.main.shake(300, 0.014);
  }

  private spawnPortal(x: number, y: number): void {
    this.portal = this.physics.add.staticImage(x, y, 'portal').setDepth(y);
    this.glows.push({ img: this.addLight(0x7fe8ff, 2.4, 0.8), x, y });
    this.tweens.add({ targets: this.portal, scale: { from: 0, to: 1 }, duration: 500, ease: 'Back.easeOut' });
    this.tweens.add({ targets: this.portal, angle: 360, duration: 6000, repeat: -1 });
  }

  // ---- lighting (dark overlay + additive light pools) ----
  private buildLighting(): void {
    this.dark = this.add
      .rectangle(0, 0, GAME_WIDTH, GAME_HEIGHT, this.realm.ambient, this.realm.ambientAlpha)
      .setOrigin(0, 0)
      .setScrollFactor(0)
      .setDepth(8000);

    // hero torch — focused pool, not a floodlight
    this.glows.push({ img: this.addLight(0xffcaa0, 1.45, 0.7), follow: this.hero });
    // wall torches flicker
    const torchTint = Phaser.Display.Color.HexStringToColor(this.realm.torch).color;
    for (const [c, r] of this.torchSpots) {
      const light = this.addLight(torchTint, 1.0, 0.6);
      this.glows.push({ img: light, x: c * TILE + TILE / 2, y: r * TILE + TILE / 2 - 30 });
      this.tweens.add({ targets: light, alpha: 0.45, duration: 600 + Math.random() * 500, yoyo: true, repeat: -1, ease: 'Sine.easeInOut' });
    }
  }

  private addLight(tint: number, scale: number, alpha: number): Phaser.GameObjects.Image {
    return this.add
      .image(0, 0, 'light')
      .setBlendMode(Phaser.BlendModes.ADD)
      .setTint(tint)
      .setScale(scale)
      .setAlpha(alpha)
      .setDepth(8001);
  }

  private updateLighting(): void {
    for (const l of this.glows) {
      if (l.follow) l.img.setPosition(l.follow.x, l.follow.y);
      else if (l.x !== undefined) l.img.setPosition(l.x, l.y!);
    }
  }

  private nextRealm(): void {
    this.save.essence = this.essence;
    this.save.realm = Math.max(this.save.realm, this.realmIdx + 1);
    writeSave(this.save);
    this.cameras.main.fadeOut(450, 0, 0, 0);
    this.cameras.main.once('camerafadeoutcomplete', () => this.scene.restart({ realm: this.realmIdx + 1 }));
  }

  private die(): void {
    this.hero.setActive(false);
    this.save.essence = this.essence;
    writeSave(this.save);
    this.scene.stop('Hud');
    this.scene.start('GameOver', { essence: this.essence, realm: this.realmIdx + 1 });
  }
}
