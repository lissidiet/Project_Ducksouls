import Phaser from 'phaser';
import { GAME_WIDTH, GAME_HEIGHT } from './core';
import { Boot } from './scenes/Boot';
import { Title } from './scenes/Title';
import { World } from './scenes/World';
import { Hud } from './scenes/Hud';
import { GameOver } from './scenes/GameOver';

export { GAME_WIDTH, GAME_HEIGHT } from './core';

const config: Phaser.Types.Core.GameConfig = {
  type: Phaser.AUTO,
  width: GAME_WIDTH,
  height: GAME_HEIGHT,
  parent: 'game-container',
  backgroundColor: '#05080a',
  scale: {
    mode: Phaser.Scale.FIT,
    autoCenter: Phaser.Scale.CENTER_BOTH,
  },
  input: { activePointers: 4 },
  physics: {
    default: 'arcade',
    arcade: { gravity: { x: 0, y: 0 }, debug: false },
  },
  scene: [Boot, Title, World, Hud, GameOver],
};

export default new Phaser.Game(config);
