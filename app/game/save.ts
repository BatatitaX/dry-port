import { memories } from "../content/portfolio";
import { NPCS, POEMS, type AgeStage, type GameLang, type NpcId, type Point } from "./data";
import { START_POS, FOG_COLS, FOG_ROWS, fogKey, isWalkable } from "./world";

export const SAVE_KEY = "dry-portfolio-save-v4";
export type Save = {
  version: 4; lang: GameLang; sound: boolean; reducedMotion: boolean; pos: Point;
  unlocked: string[]; favorites: string[]; hidden: string[]; order: string[]; explored: string[];
  jaoUnlocked: boolean; spokenNpcs: NpcId[]; bossDefeated: boolean; collectedPoems: string[]; ageStage: AgeStage;
};
const memoryIds = memories.map(memory => memory.id);
function validIds(value: unknown, allowed: readonly string[]): string[] {
  return Array.isArray(value) ? [...new Set(value.filter((id): id is string => typeof id === "string" && allowed.includes(id)))] : [];
}
export function parseSave(raw: string | null, reducedMotion = false): Save | null {
  if (!raw) return null;
  try {
    const saved: unknown = JSON.parse(raw);
    if (!saved || typeof saved !== "object" || Array.isArray(saved)) return null;
    const s = saved as Record<string, unknown>;
    if (s.version !== undefined && ![2, 3, 4].includes(s.version as number)) return null;
    const bossDefeated = s.bossDefeated === true;
    const point = s.pos as Point | undefined;
    const pos = point && Number.isFinite(point.x) && Number.isFinite(point.y) && isWalkable(point, bossDefeated) ? { x: point.x, y: point.y } : START_POS;
    const unlocked = validIds(s.unlocked, memoryIds);
    const spokenNpcs = validIds(s.spokenNpcs, NPCS.map(npc => npc.id)) as NpcId[];
    // Derive stage from quest completion, so malformed or old saves cannot skip progression.
    const ageStage = ["art", "design", "etec"].every(id => unlocked.includes(id)) && spokenNpcs.includes("luna") && ["origins", "joaquim"].every(id => unlocked.includes(id)) ? "adult" : ["origins", "joaquim"].every(id => unlocked.includes(id)) ? "teen" : "baby";
    const explored = Array.isArray(s.explored) ? [...new Set(s.explored.filter((cell): cell is string => {
      if (typeof cell !== "string" || !/^\d+:\d+$/.test(cell)) return false;
      const [col, row] = cell.split(":").map(Number);
      return col < FOG_COLS && row < FOG_ROWS;
    }))] : [];
    return { version: 4, lang: s.lang === "en" || s.lang === "es" ? s.lang : "pt", sound: s.sound === true, reducedMotion: typeof s.reducedMotion === "boolean" ? s.reducedMotion : reducedMotion, pos, unlocked, favorites: validIds(s.favorites, memoryIds), hidden: validIds(s.hidden, memoryIds), order: [...new Set([...validIds(s.order, memoryIds), ...memoryIds])], explored: [...new Set([...explored, fogKey(pos.x, pos.y)])], jaoUnlocked: s.jaoUnlocked === true, spokenNpcs, bossDefeated, collectedPoems: bossDefeated ? validIds(s.collectedPoems, POEMS.map(poem => poem.id)) : [], ageStage };
  } catch { return null; }
}

/** Never throws when storage is unavailable, full, or blocked. */
export function writeSave(storage: Pick<Storage, "setItem">, save: Save): boolean {
  try { storage.setItem(SAVE_KEY, JSON.stringify(save)); return true; } catch { return false; }
}
