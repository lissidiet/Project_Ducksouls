import Phaser from 'phaser';
import { GAME_WIDTH, GAME_HEIGHT } from '../main';
import { controls } from '../input/controls';
import { MAX_HEALTH } from '../objects/Player';

type ControlKey = 'left' | 'right' | 'jump' | 'attack' | 'dash';

export class HUDScene extends Phaser.Scene {
  private feathers: Phaser.GameObjects.Image[] = [];
  private soulsText!: Phaser.GameObjects.Text;

  constructor() {
    super('HUD');
  }

  create(): void {
    // GameScene's create() runs before ours, so read the initial values
    // from the registry instead of relying only on change events.
    const health = (this.registry.get('health') as number | undefined) ?? MAX_HEALTH;
    const souls = (this.registry.get('souls') as number | undefined) ?? 0;

    this.feathers = [];
    for (let i = 0; i < MAX_HEALTH; i++) {
      this.feathers.push(this.add.image(30 + i * 28, 30, 'feather').setAlpha(i < health ? 1 : 0.15));
    }

    this.soulsText = this.add.text(24, 50, `Anime: ${souls}`, {
      fontFamily: 'Georgia, serif',
      fontSize: '20px',
      color: '#9fe8ff',
    });

    this.registry.events.on('changedata-health', (_: unknown, value: number) => {
      this.feathers.forEach((f, i) => f.setAlpha(i < value ? 1 : 0.15));
    });
    this.registry.events.on('changedata-souls', (_: unknown, value: number) => {
      this.soulsText.setText(`Anime: ${value}`);
    });
    this.events.on(Phaser.Scenes.Events.SHUTDOWN, () => {
      this.registry.events.off('changedata-health');
      this.registry.events.off('changedata-souls');
    });

    this.createTouchControls();
  }

  private createTouchControls(): void {
    // Movement on the left, actions on the right (thumb-friendly zones)
    this.makeButton(80, GAME_HEIGHT - 70, '◀', 'left');
    this.makeButton(190, GAME_HEIGHT - 70, '▶', 'right');
    this.makeButton(GAME_WIDTH - 80, GAME_HEIGHT - 70, '⬆', 'jump');
    this.makeButton(GAME_WIDTH - 185, GAME_HEIGHT - 55, '⚔', 'attack');
    this.makeButton(GAME_WIDTH - 270, GAME_HEIGHT - 110, '➤', 'dash');
  }

  private makeButton(x: number, y: number, label: string, key: ControlKey): void {
    const btn = this.add
      .image(x, y, 'touch-btn')
      .setAlpha(0.25)
      .setInteractive();
    this.add
      .text(x, y, label, {
        fontSize: '30px',
        color: '#ffffff',
      })
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
