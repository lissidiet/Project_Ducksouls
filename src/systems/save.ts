// Persistent progress for Ashen Hollow.
const KEY = 'ashen-hollow-save';

export interface SaveData {
  realm: number; // furthest realm reached
  essence: number; // currency
  vigor: number; // +max health
  might: number; // +damage
  swift: number; // +speed
}

export const DEFAULT_SAVE: SaveData = { realm: 0, essence: 0, vigor: 0, might: 0, swift: 0 };

export function loadSave(): SaveData {
  try {
    const raw = localStorage.getItem(KEY);
    return raw ? { ...DEFAULT_SAVE, ...(JSON.parse(raw) as Partial<SaveData>) } : { ...DEFAULT_SAVE };
  } catch {
    return { ...DEFAULT_SAVE };
  }
}

export function writeSave(data: SaveData): void {
  try {
    localStorage.setItem(KEY, JSON.stringify(data));
  } catch {
    /* storage unavailable */
  }
}
