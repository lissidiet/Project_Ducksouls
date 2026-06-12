import Phaser from 'phaser';
import { GAME_WIDTH, GAME_HEIGHT } from '../main';
import { loadSave, writeSave, nextLevelCost, SaveData } from '../systems/save';

type StatKey = 'vigor' | 'strength' | 'agility';

interface StatDef {
  key: StatKey;
  name: string;
  description: string;
}

const STATS: StatDef[] = [
  { key: 'vigor', name: 'VIGORE', description: '+1 piuma di vita' },
  { key: 'strength', name: 'FORZA', description: '+1 danno del becco' },
  { key: 'agility', name: 'AGILITÀ', description: 'corsa e scatto migliori' },
];

const GOLD = '#ffd75e';
const DIM = '#8a8aa8';
const SOUL = '#9fe8ff';

// Elden Ring-style level-up menu, opened when resting at a bench.
// Spends the current run's souls; everything is persisted immediately.
export class LevelUpScene extends Phaser.Scene {
  private souls = 0;
  private save!: SaveData;
  private soulsText!: Phaser.GameObjects.Text;
  private rows: Array<{
    level: Phaser.GameObjects.Text;
    cost: Phaser.GameObjects.Text;
    buyBg: Phaser.GameObjects.Image;
    buyLabel: Phaser.GameObjects.Text;
    def: StatDef;
  }> = [];

  constructor() {
    super('LevelUp');
  }

  init(data: { souls?: number }): void {
    this.souls = data.souls ?? 0;
    this.save = loadSave();
  }

  create(): void {
    this.rows = [];
    const cx = GAME_WIDTH / 2;

    // Full-screen dim layer (purely visual — Game and HUD are both paused,
    // so there is nothing underneath that could react to touches)
    this.add
      .image(cx, GAME_HEIGHT / 2, 'white')
      .setDisplaySize(GAME_WIDTH, GAME_HEIGHT)
      .setTint(0x05050a)
      .setAlpha(0.78);

    const panelW = 680;
    const panelH = 420;
    const panel = this.add.graphics();
    panel.fillStyle(0x12121e, 0.97);
    panel.fillRoundedRect(cx - panelW / 2, 60, panelW, panelH, 14);
    panel.lineStyle(2, 0xffd75e, 0.9);
    panel.strokeRoundedRect(cx - panelW / 2, 60, panelW, panelH, 14);

    this.add
      .text(cx, 96, 'RIPOSO ALLA PANCHINA', {
        fontFamily: 'Georgia, serif',
        fontSize: '30px',
        color: GOLD,
      })
      .setOrigin(0.5);

    this.soulsText = this.add
      .text(cx, 132, '', {
        fontFamily: 'Georgia, serif',
        fontSize: '20px',
        color: SOUL,
      })
      .setOrigin(0.5);

    STATS.forEach((def, i) => this.buildStatRow(def, cx, 188 + i * 78));

    // Close button. NOTE: interactive Rectangles and heavily-scaled images
    // don't receive pointer events reliably in Phaser 4 rc — use a real-size
    // generated texture like the (working) touch buttons do.
    if (!this.textures.exists('menu-close-btn')) {
      const g = this.add.graphics();
      g.fillStyle(0x23233a, 1);
      g.fillRoundedRect(0, 0, 260, 56, 8);
      g.lineStyle(2, 0xffd75e, 0.9);
      g.strokeRoundedRect(1, 1, 258, 54, 8);
      g.generateTexture('menu-close-btn', 260, 56);
      g.destroy();
    }
    const closeBg = this.add.image(cx, 448, 'menu-close-btn').setInteractive();
    this.add
      .text(cx, 448, 'RIPRENDI IL VIAGGIO', {
        fontFamily: 'Georgia, serif',
        fontSize: '19px',
        color: '#f2e6c9',
      })
      .setOrigin(0.5);
    closeBg.on('pointerdown', () => this.close());

    this.refresh();
  }

  private buildStatRow(def: StatDef, cx: number, y: number): void {
    const left = cx - 300;

    this.add.text(left, y - 14, def.name, {
      fontFamily: 'Georgia, serif',
      fontSize: '24px',
      color: '#f2e6c9',
    });
    this.add.text(left, y + 14, def.description, {
      fontFamily: 'Georgia, serif',
      fontSize: '15px',
      color: DIM,
    });

    const level = this.add
      .text(cx + 60, y, '', {
        fontFamily: 'Georgia, serif',
        fontSize: '26px',
        color: GOLD,
      })
      .setOrigin(0.5);

    const cost = this.add
      .text(cx + 150, y, '', {
        fontFamily: 'Georgia, serif',
        fontSize: '17px',
        color: SOUL,
      })
      .setOrigin(0.5);

    const buyBg = this.add.image(cx + 252, y, 'touch-btn').setScale(0.78).setInteractive();
    const buyLabel = this.add
      .text(cx + 252, y, '+', { fontSize: '38px', color: '#12121e' })
      .setOrigin(0.5, 0.56);

    buyBg.on('pointerdown', () => this.buy(def.key));

    this.rows.push({ level, cost, buyBg, buyLabel, def });
  }

  private buy(stat: StatKey): void {
    const cost = nextLevelCost(this.save);
    if (this.souls < cost) return;
    this.souls -= cost;
    this.save[stat] += 1;
    this.save.souls = this.souls; // resting at the bench banks the souls
    writeSave(this.save);
    this.registry.set('souls', this.souls);
    this.cameras.main.flash(120, 255, 215, 94);
    this.refresh();
  }

  private refresh(): void {
    const cost = nextLevelCost(this.save);
    const affordable = this.souls >= cost;
    this.soulsText.setText(`Anime: ${this.souls}   ·   Prossimo livello: ${cost}`);

    for (const row of this.rows) {
      row.level.setText(`${this.save[row.def.key]}`);
      row.cost.setText(`${cost} anime`);
      row.buyBg.setAlpha(affordable ? 0.9 : 0.18);
      row.buyLabel.setAlpha(affordable ? 1 : 0.3);
      row.buyBg.setTint(affordable ? 0xffd75e : 0xffffff);
    }
  }

  private close(): void {
    this.scene.stop();
    this.scene.resume('Game', { souls: this.souls });
  }
}
