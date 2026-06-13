import Phaser from 'phaser';
import { GAME_WIDTH, GAME_HEIGHT } from '../main';
import { controls } from '../input/controls';
import { BASE_HEALTH } from '../objects/TopDownPlayer';

type DirKey = 'up' | 'down' | 'left' | 'right' | 'attack';

export class TopDownHUDScene extends Phaser.Scene {
  private feathers: Phaser.GameObjects.Image[] = [];
  private soulsText!: Phaser.GameObjects.Text;
  private objectiveText!: Phaser.GameObjects.Text;

  constructor() {
    super('TopHUD');
  }

  create(): void {
    const maxHealth = (this.registry.get('maxHealth') as number | undefined) ?? BASE_HEALTH;
    const health = (this.registry.get('health') as number | undefined) ?? maxHealth;
    const souls = (this.registry.get('souls') as number | undefined) ?? 0;

    this.buildFeathers(maxHealth, health);
    this.soulsText = this.add.text(24, 50, `Anime: ${souls}`, {
      fontFamily: 'Georgia, serif',
      fontSize: '20px',
      color: '#9fe8ff',
    });

    // Objective banner (top center)
    this.objectiveText = this.add
      .text(GAME_WIDTH / 2, 28, '', {
        fontFamily: 'Georgia, serif',
        fontSize: '22px',
        color: '#ffd75e',
        stroke: '#0a0f1e',
        strokeThickness: 5,
        align: 'center',
      })
      .setOrigin(0.5);

    const climate = this.registry.get('climate') as string | undefined;
    if (climate) {
      this.add
        .text(GAME_WIDTH / 2, 54, climate, {
          fontFamily: 'Georgia, serif',
          fontSize: '15px',
          color: '#9fb4c4',
        })
        .setOrigin(0.5);
    }

    this.registry.events.on('changedata-health', (_: unknown, v: number) =>
      this.feathers.forEach((f, i) => f.setAlpha(i < v ? 1 : 0.15)),
    );
    this.registry.events.on('changedata-maxHealth', (_: unknown, v: number) =>
      this.buildFeathers(v, (this.registry.get('health') as number) ?? v),
    );
    this.registry.events.on('changedata-souls', (_: unknown, v: number) =>
      this.soulsText.setText(`Anime: ${v}`),
    );
    this.registry.events.on('changedata-objective', (_: unknown, v: string) =>
      this.objectiveText.setText(v),
    );
    this.objectiveText.setText((this.registry.get('objective') as string) ?? '');

    this.events.on(Phaser.Scenes.Events.SHUTDOWN, () => {
      this.registry.events.off('changedata-health');
      this.registry.events.off('changedata-maxHealth');
      this.registry.events.off('changedata-souls');
      this.registry.events.off('changedata-objective');
    });

    this.buildControls();
  }

  private buildFeathers(maxHealth: number, health: number): void {
    this.feathers.forEach((f) => f.destroy());
    this.feathers = [];
    for (let i = 0; i < maxHealth; i++) {
      this.feathers.push(this.add.image(30 + i * 28, 30, 'feather').setAlpha(i < health ? 1 : 0.15));
    }
  }

  private buildControls(): void {
    // D-pad bottom-left
    const cx = 110;
    const cy = GAME_HEIGHT - 100;
    this.dirButton(cx, cy - 52, '▲', 'up');
    this.dirButton(cx, cy + 52, '▼', 'down');
    this.dirButton(cx - 60, cy, '◀', 'left');
    this.dirButton(cx + 60, cy, '▶', 'right');
    // Attack bottom-right
    this.dirButton(GAME_WIDTH - 90, GAME_HEIGHT - 90, '⚔', 'attack', 1.2);
  }

  private dirButton(x: number, y: number, label: string, key: DirKey, scale = 0.95): void {
    const btn = this.add.image(x, y, 'touch-btn').setScale(scale).setAlpha(0.25).setInteractive();
    this.add
      .text(x, y, label, { fontSize: '28px', color: '#ffffff' })
      .setOrigin(0.5)
      .setAlpha(0.7);
    btn.on('pointerdown', () => {
      controls[key] = true;
      btn.setAlpha(0.5);
    });
    const release = () => {
      controls[key] = false;
      btn.setAlpha(0.25);
    };
    btn.on('pointerup', release);
    btn.on('pointerout', release);
  }
}
