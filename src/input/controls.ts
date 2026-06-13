// Shared virtual input state, written by the HUD touch controls (joystick +
// buttons) and merged with the keyboard by the Hero each frame.
export interface VirtualControls {
  // analog movement vector from the touch joystick (-1..1)
  moveX: number;
  moveY: number;
  // digital fallbacks / keyboard
  left: boolean;
  right: boolean;
  up: boolean;
  down: boolean;
  attack: boolean;
  cast: boolean;
  dash: boolean;
}

export const controls: VirtualControls = {
  moveX: 0,
  moveY: 0,
  left: false,
  right: false,
  up: false,
  down: false,
  attack: false,
  cast: false,
  dash: false,
};

export function resetControls(): void {
  controls.moveX = 0;
  controls.moveY = 0;
  controls.left = false;
  controls.right = false;
  controls.up = false;
  controls.down = false;
  controls.attack = false;
  controls.cast = false;
  controls.dash = false;
}
