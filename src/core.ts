// Ashen Hollow — shared constants, balance, and realm (biome) definitions.
export const GAME_WIDTH = 960;
export const GAME_HEIGHT = 540;

export const TILE = 48;

export interface Realm {
  name: string;
  // tile palette
  floorA: string;
  floorB: string;
  wallTop: string;
  wallBody: string;
  // atmosphere
  ambient: number; // darkness overlay colour
  ambientAlpha: number; // how dark the realm is (lighting reveals it)
  torch: string; // torch flame colour
  accent: number; // UI / rune accent
  hazard: 'water' | 'ice' | 'lava';
}

export const REALMS: Realm[] = [
  {
    name: 'Boschi Cavi',
    floorA: '#243024',
    floorB: '#1c281e',
    wallTop: '#3a4d39',
    wallBody: '#1a241a',
    ambient: 0x05080a,
    ambientAlpha: 0.82,
    torch: '#ffd75e',
    accent: 0x8fe39f,
    hazard: 'water',
  },
  {
    name: 'Gelo Eterno',
    floorA: '#26313f',
    floorB: '#1d2733',
    wallTop: '#4a6075',
    wallBody: '#1b2430',
    ambient: 0x060a12,
    ambientAlpha: 0.78,
    torch: '#bfe8ff',
    accent: 0x9fd8ff,
    hazard: 'ice',
  },
  {
    name: 'Fornace di Brace',
    floorA: '#341f1c',
    floorB: '#261513',
    wallTop: '#6b3a2a',
    wallBody: '#28140f',
    ambient: 0x0a0503,
    ambientAlpha: 0.74,
    torch: '#ffb04a',
    accent: 0xff8a4a,
    hazard: 'lava',
  },
];

export const HERO = {
  speed: 220,
  dashSpeed: 560,
  dashDuration: 160,
  dashCooldown: 520,
  attackDuration: 170,
  attackCooldown: 300,
  castCooldown: 420,
  invuln: 800,
  baseHealth: 6,
  baseMana: 4,
};
