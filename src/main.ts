import Phaser from 'phaser';
import { BootScene } from './scenes/BootScene';
import { MainMenuScene } from './scenes/MainMenuScene';
import { IslandScene } from './scenes/IslandScene';
import { TopDownHUDScene } from './scenes/TopDownHUDScene';
import { GameOverScene } from './scenes/GameOverScene';

export const GAME_WIDTH = 960;
export const GAME_HEIGHT = 540;

const config: Phaser.Types.Core.GameConfig = {
  type: Phaser.AUTO,
  width: GAME_WIDTH,
  height: GAME_HEIGHT,
  parent: 'game-container',
  backgroundColor: '#080b1c',
  // Painterly art — keep texture smoothing ON (no pixelArt/roundPixels)
  scale: {
    mode: Phaser.Scale.FIT,
    autoCenter: Phaser.Scale.CENTER_BOTH,
  },
  input: {
    activePointers: 4,
  },
  physics: {
    default: 'arcade',
    arcade: {
      gravity: { x: 0, y: 0 }, // top-down: no gravity
      debug: false,
    },
  },
  scene: [BootScene, MainMenuScene, IslandScene, TopDownHUDScene, GameOverScene],
};

export default new Phaser.Game(config);
