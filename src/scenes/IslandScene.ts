import Phaser from 'phaser';
import { TopDownPlayer } from '../objects/TopDownPlayer';
import { Roamer } from '../objects/Roamer';
import { resetControls } from '../input/controls';
import { loadSave, writeSave, SaveData } from '../systems/save';
import { CLIMATES } from '../gfx/topdown';

const TILE = 48;
const COLS = 40;
const ROWS = 26;
const MAP_W = COLS * TILE;
const MAP_H = ROWS * TILE;

// Boss-room rectangle (in tile coords)
const ROOM = { c0: 30, c1: 37, r0: 9, r1: 17, gateR: 13 };

// Top-down island: clear the wandering shades to break the seal, enter the
// boss room, defeat the guardian, then step through the portal to the next
// island (a new climate). This is the SAO-style floor-clear loop.
export class IslandScene extends Phaser.Scene {
  private player!: TopDownPlayer;
  private enemies!: Phaser.GameObjects.Group;
  private colliders!: Phaser.Physics.Arcade.StaticGroup;
  private save!: SaveData;
  private souls = 0;
  private islandIndex = 0;

  private gate?: Phaser.GameObjects.Image;
  private gateBody?: Phaser.Physics.Arcade.Image;
  private bossSpawned = false;
  private cleared = false;
  private portal?: Phaser.Physics.Arcade.Image;
  private remaining = 0;

  constructor() {
    super('Island');
  }

  init(data: { island?: number }): void {
    this.islandIndex = data.island ?? 0;
  }

  create(): void {
    resetControls();
    this.save = loadSave();
    this.souls = this.save.souls;
    this.bossSpawned = false;
    this.cleared = false;
    this.gate = undefined;
    this.portal = undefined;

    this.physics.world.setBounds(2 * TILE, 2 * TILE, MAP_W - 4 * TILE, MAP_H - 4 * TILE);
    this.cameras.main.setBounds(0, 0, MAP_W, MAP_H);

    this.colliders = this.physics.add.staticGroup();
    this.buildMap();

    const climate = CLIMATES[this.islandIndex % CLIMATES.length];

    this.player = new TopDownPlayer(this, 5 * TILE, ROOM.gateR * TILE);
    this.player.applyStats(this.save);
    this.player.heal();

    this.enemies = this.add.group({ runChildUpdate: true });
    this.spawnRoamers();

    this.physics.add.collider(this.player, this.colliders);
    this.physics.add.collider(this.enemies, this.colliders);

    this.physics.add.overlap(this.player, this.enemies, (_p, e) => {
      const r = e as Roamer;
      if (this.player.takeDamage(r.x, r.y)) {
        this.cameras.main.shake(120, 0.01);
        this.registry.set('health', this.player.health);
        if (this.player.health <= 0) this.die();
      }
    });

    this.physics.add.overlap(this.player.attackHitbox, this.enemies, (_hb, e) => {
      (e as Roamer).takeHit(this.player.x, this.player.y, this.player.damage);
    });

    this.events.off('roamer-killed');
    this.events.on('roamer-killed', (d: { souls: number }) => {
      this.addSouls(d.souls);
      this.remaining -= 1;
      if (this.remaining <= 0 && !this.bossSpawned) this.openBossRoom();
      else this.setObjective(`Scova ed elimina le Ombre  (${this.remaining})`);
    });

    this.events.off('boss-defeated');
    this.events.on('boss-defeated', (d: { souls: number; x: number; y: number }) => {
      this.addSouls(d.souls);
      this.cleared = true;
      this.spawnPortal(d.x, d.y);
      this.setObjective('Mappa completata! Entra nel portale');
      this.cameras.main.flash(300, 180, 230, 255);
    });

    // Climate colour grade over the whole map
    if (climate.overlayAlpha > 0) {
      this.add
        .rectangle(0, 0, MAP_W, MAP_H, climate.overlay, climate.overlayAlpha)
        .setOrigin(0, 0)
        .setDepth(9000)
        .setScrollFactor(1);
    }
    this.add.image(0, 0, 'vignette').setOrigin(0, 0).setScrollFactor(0).setDepth(9500);

    this.cameras.main.startFollow(this.player, true, 0.12, 0.12);
    this.registry.set('maxHealth', this.player.maxHealth);
    this.registry.set('health', this.player.health);
    this.registry.set('souls', this.souls);
    this.registry.set('climate', climate.name);
    this.setObjective(`Scova ed elimina le Ombre  (${this.remaining})`);
  }

  update(): void {
    this.player.update();
    if (this.portal && !this.player.active) return;
    if (this.portal) {
      const d = Phaser.Math.Distance.Between(this.player.x, this.player.y, this.portal.x, this.portal.y);
      if (d < 40) this.nextIsland();
    }
  }

  private addSouls(n: number): void {
    this.souls += n;
    this.registry.set('souls', this.souls);
  }

  private setObjective(text: string): void {
    this.registry.set('objective', text);
  }

  // ---- World ----

  private buildMap(): void {
    const inRoom = (c: number, r: number) =>
      c >= ROOM.c0 && c <= ROOM.c1 && r >= ROOM.r0 && r <= ROOM.r1;
    const roomWall = (c: number, r: number) =>
      inRoom(c, r) && (c === ROOM.c0 || c === ROOM.c1 || r === ROOM.r0 || r === ROOM.r1);

    for (let r = 0; r < ROWS; r++) {
      for (let c = 0; c < COLS; c++) {
        const border = Math.min(c, r, COLS - 1 - c, ROWS - 1 - r);
        let key = 'tile-grass';
        if (border < 2) key = 'tile-water';
        else if (border < 3) key = 'tile-sand';
        if (inRoom(c, r)) key = roomWall(c, r) ? 'tile-wall' : 'tile-floor';

        this.add.image(c * TILE, r * TILE, key).setOrigin(0, 0).setDepth(-1000);

        // Gate opening in the room's left wall
        if (roomWall(c, r)) {
          if (c === ROOM.c0 && r === ROOM.gateR) {
            this.gate = this.add.image(c * TILE, r * TILE, 'gate').setOrigin(0, 0).setDepth(-900);
            this.gateBody = this.colliders.create(
              c * TILE + TILE / 2,
              r * TILE + TILE / 2,
              'gate',
            ) as Phaser.Physics.Arcade.Image;
            this.gateBody.setVisible(false);
          } else {
            this.colliders.create(c * TILE + TILE / 2, r * TILE + TILE / 2, 'tile-wall').setVisible(
              false,
            );
          }
        }
      }
    }

    // Scatter rocks and trees on the grass (colliders, depth-sorted)
    const rnd = Phaser.Math.RND;
    let placed = 0;
    let guard = 0;
    while (placed < 16 && guard++ < 400) {
      const c = rnd.between(4, COLS - 5);
      const r = rnd.between(4, ROWS - 5);
      if (c >= ROOM.c0 - 1 && c <= ROOM.c1 && r >= ROOM.r0 - 1 && r <= ROOM.r1) continue;
      if (c < 8 && Math.abs(r - ROOM.gateR) < 3) continue; // keep spawn clear
      const x = c * TILE + TILE / 2;
      const y = r * TILE + TILE / 2;
      if (rnd.frac() < 0.45) {
        const tree = this.colliders.create(x, y, 'prop-tree') as Phaser.Physics.Arcade.Image;
        tree.setOrigin(0.5, 0.85).setDepth(y).refreshBody();
        (tree.body as Phaser.Physics.Arcade.StaticBody).setSize(26, 22).setOffset(11, 62);
      } else {
        const rock = this.colliders.create(x, y, 'tile-rock') as Phaser.Physics.Arcade.Image;
        rock.setDepth(y);
        (rock.body as Phaser.Physics.Arcade.StaticBody).setSize(34, 24).setOffset(7, 18);
      }
      placed++;
    }
  }

  private spawnRoamers(): void {
    const rnd = Phaser.Math.RND;
    const count = 5 + this.islandIndex; // tougher each island
    this.remaining = count;
    let placed = 0;
    let guard = 0;
    while (placed < count && guard++ < 400) {
      const c = rnd.between(8, COLS - 6);
      const r = rnd.between(4, ROWS - 5);
      if (c >= ROOM.c0 - 1) continue; // keep them out of the boss room
      this.enemies.add(new Roamer(this, c * TILE, r * TILE, this.player));
      placed++;
    }
  }

  private openBossRoom(): void {
    this.bossSpawned = true;
    this.gate?.destroy();
    this.gateBody?.destroy();
    const gx = ROOM.c0 * TILE + TILE / 2;
    const gy = ROOM.gateR * TILE + TILE / 2;
    const fx = this.add.particles(gx, gy, 'particle', {
      speed: { min: 60, max: 200 },
      lifespan: 700,
      quantity: 20,
      scale: { start: 1.4, end: 0 },
      tint: 0xb44dff,
      emitting: false,
    });
    fx.explode(20);
    this.time.delayedCall(800, () => fx.destroy());

    const bx = ((ROOM.c0 + ROOM.c1) / 2) * TILE;
    const by = ((ROOM.r0 + ROOM.r1) / 2) * TILE;
    this.enemies.add(new Roamer(this, bx, by, this.player, true));
    this.setObjective('Il sigillo è rotto! Sconfiggi il Guardiano');
    this.cameras.main.shake(250, 0.012);
  }

  private spawnPortal(x: number, y: number): void {
    this.portal = this.physics.add.staticImage(x, y, 'portal').setDepth(y);
    this.tweens.add({
      targets: this.portal,
      scale: { from: 0, to: 1 },
      duration: 500,
      ease: 'Back.easeOut',
    });
    this.tweens.add({
      targets: this.portal,
      angle: 360,
      duration: 6000,
      repeat: -1,
      ease: 'Linear',
    });
  }

  private nextIsland(): void {
    this.save.souls = this.souls;
    writeSave(this.save);
    const next = this.islandIndex + 1;
    this.cameras.main.fadeOut(400, 0, 0, 0);
    this.cameras.main.once('camerafadeoutcomplete', () => {
      this.scene.restart({ island: next });
    });
  }

  private die(): void {
    this.player.setActive(false).setVisible(false);
    this.save.souls = 0;
    writeSave(this.save);
    this.scene.stop('TopHUD');
    this.scene.start('GameOver', { souls: this.souls });
  }
}
