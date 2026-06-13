// Shared virtual input state, written by the HUD touch buttons (and keyboard
// in the player) and read each frame. Keeping it as a plain module singleton
// avoids cross-scene event plumbing. up/down added for top-down movement.
export interface VirtualControls {
  left: boolean;
  right: boolean;
  up: boolean;
  down: boolean;
  jump: boolean;
  attack: boolean;
  dash: boolean;
}

export const controls: VirtualControls = {
  left: false,
  right: false,
  up: false,
  down: false,
  jump: false,
  attack: false,
  dash: false,
};

export function resetControls(): void {
  controls.left = false;
  controls.right = false;
  controls.up = false;
  controls.down = false;
  controls.jump = false;
  controls.attack = false;
  controls.dash = false;
}
