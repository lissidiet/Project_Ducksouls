// Shared palette for ALL pixel art sprites (skill rule: differentiate
// entities by which palette colors they use, never by adding new colors).
// '.' is always transparent.
export const PALETTE: Record<string, number> = {
  o: 0x11111c, // outline
  c: 0xf2e6c9, // duck cream
  d: 0xd0c0a0, // duck cream shadow
  h: 0x23233a, // knight hood dark
  H: 0x35355a, // hood highlight
  b: 0xe8923a, // beak / feet
  e: 0x141420, // eye dark
  g: 0xffd75e, // gold trim
  p: 0x2c1f3d, // shade body
  P: 0x44305e, // shade highlight
  v: 0xb44dff, // shade eyes (violet glow)
  f: 0x3f6b35, // frog body
  F: 0x5d8f4c, // frog highlight
  l: 0x9cc24a, // frog spikes (lime)
  r: 0xd14b3a, // hostile red eyes
  s: 0x2e2e44, // stone fill
  S: 0x3a3a55, // stone speckle
  T: 0x4a4a6a, // stone top edge
};

// Renders a pixel matrix (array of equal-length strings) into a texture.
export function renderPixelTexture(
  scene: Phaser.Scene,
  key: string,
  rows: string[],
  pixelSize = 3,
): void {
  if (scene.textures.exists(key)) return;
  const width = rows[0].length;
  const g = scene.add.graphics();
  rows.forEach((row, y) => {
    for (let x = 0; x < width; x++) {
      const color = PALETTE[row[x]];
      if (color === undefined) continue; // '.' or unknown = transparent
      g.fillStyle(color, 1);
      g.fillRect(x * pixelSize, y * pixelSize, pixelSize, pixelSize);
    }
  });
  g.generateTexture(key, width * pixelSize, rows.length * pixelSize);
  g.destroy();
}
