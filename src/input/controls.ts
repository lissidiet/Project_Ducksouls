// Shared virtual input state, written by the HUD touch buttons (and keyboard
// in GameScene) and read by the player each frame. Keeping it as a plain
// module singleton avoids cross-scene event plumbing.
export interface VirtualControls {
  left: boolean;
  right: boolean;
  jump: boolean;
  attack: boolean;
  dash: boolean;
}

export const controls: VirtualControls = {
  left: false,
  right: false,
  jump: false,
  attack: false,
  dash: false,
};

export function resetControls(): void {
  controls.left = false;
  controls.right = false;
  controls.jump = false;
  controls.attack = false;
  controls.dash = false;
}
