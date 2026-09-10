import { memories, type Memory, type Lang } from "../content/portfolio";
import { NPCS, RIVER, BRIDGE, type AgeStage, type NpcId } from "./data";

export const clamp = (value: number, min: number, max: number) => Math.max(min, Math.min(max, value));
export const WORLD = { width: 5920, height: 1024 };
export const PATH_Y = 548;
export const PATH_TOP = 420;
export const PATH_BOTTOM = 656;
export const START_POS = { x: 150, y: PATH_Y };
export const FOG_COLS = 20;
export const FOG_ROWS = 4;
export const WALK_SPEED = 128;
export const PLAYER_RADIUS = 12;

export type Landmark = { id: string; memoryId: string; x: number; kind: string; glyph: string; width: number };

export const LANDMARKS: Landmark[] = [
  { id: "observatory", memoryId: "origins", x: 360, kind: "observatory", glyph: "✦", width: 202 },
  { id: "village-school", memoryId: "joaquim", x: 920, kind: "school", glyph: "⌁", width: 210 },
  { id: "art-pavilion", memoryId: "art", x: 1480, kind: "art", glyph: "✧", width: 204 },
  { id: "design-studio", memoryId: "design", x: 2040, kind: "design", glyph: "◫", width: 198 },
  { id: "etec-academy", memoryId: "etec", x: 2600, kind: "academy", glyph: "⌘", width: 210 },
  { id: "mente-conservatory", memoryId: "mente", x: 3160, kind: "mente", glyph: "▤", width: 202 },
  { id: "prever-station", memoryId: "prever", x: 3720, kind: "prever", glyph: "◈", width: 210 },
  { id: "runiverse-guild", memoryId: "runiverse", x: 4280, kind: "runiverse", glyph: "◆", width: 204 },
  { id: "fatec-citadel", memoryId: "fatec", x: 4840, kind: "fatec", glyph: "△", width: 210 },
  { id: "future-portal", memoryId: "future", x: 5520, kind: "future", glyph: "⬡", width: 202 },
];

export const WORLD_MEMORIES: Memory[] = LANDMARKS.map((landmark) => {
  const memory = memories.find((item) => item.id === landmark.memoryId)!;
  return { ...memory, x: landmark.x, y: PATH_TOP + 18 };
});

export type SceneryKind = "tree" | "purple-tree" | "bush" | "flowers" | "rocks" | "fence" | "sign" | "lamp"
  | "bench" | "chicken" | "clover" | "cow" | "crates" | "crops" | "fallen-leaves"
  | "grass-tuft" | "pond" | "stump" | "wildflowers";
export type SceneryItem = { x: number; y: number; kind: SceneryKind; width: number; label?: string };

export const SCENERY: SceneryItem[] = [
  { x: 90, y: 602, kind: "tree", width: 112 }, { x: 610, y: 625, kind: "bush", width: 86 },
  { x: 665, y: 642, kind: "flowers", width: 94 }, { x: 740, y: 632, kind: "fence", width: 132 },
  { x: 1160, y: 612, kind: "tree", width: 104 }, { x: 1260, y: 638, kind: "sign", width: 68, label: "ARTE" },
  { x: 1338, y: 632, kind: "purple-tree", width: 112 }, { x: 1650, y: 638, kind: "flowers", width: 92 },
  { x: 1780, y: 625, kind: "purple-tree", width: 118 }, { x: 1870, y: 642, kind: "bush", width: 82 },
  { x: 2200, y: 638, kind: "sign", width: 68, label: "DESIGN" }, { x: 2310, y: 642, kind: "rocks", width: 82 },
  { x: 2380, y: 632, kind: "bush", width: 88 }, { x: 2815, y: 620, kind: "tree", width: 112 },
  { x: 2910, y: 642, kind: "fence", width: 136 }, { x: 3000, y: 640, kind: "flowers", width: 92 },
  { x: 3385, y: 635, kind: "flowers", width: 94 }, { x: 3460, y: 626, kind: "bush", width: 86 },
  { x: 3518, y: 631, kind: "lamp", width: 38 }, { x: 3935, y: 630, kind: "lamp", width: 38 },
  { x: 4000, y: 640, kind: "rocks", width: 84 }, { x: 4068, y: 620, kind: "purple-tree", width: 116 },
  { x: 4490, y: 635, kind: "purple-tree", width: 112 }, { x: 4585, y: 640, kind: "flowers", width: 90 },
  { x: 4650, y: 640, kind: "fence", width: 132 }, { x: 5160, y: 622, kind: "tree", width: 112 },
  { x: 5260, y: 640, kind: "rocks", width: 82 }, { x: 5325, y: 630, kind: "lamp", width: 38 },
  { x: 5740, y: 630, kind: "purple-tree", width: 116 }, { x: 5830, y: 640, kind: "flowers", width: 92 },
  { x: 420, y: 1020, kind: "flowers", width: 88 }, { x: 980, y: 1018, kind: "rocks", width: 78 },
  { x: 1540, y: 1024, kind: "flowers", width: 92 }, { x: 2100, y: 1018, kind: "bush", width: 82 },
  { x: 2660, y: 1023, kind: "rocks", width: 82 }, { x: 3220, y: 1018, kind: "flowers", width: 90 },
  { x: 3780, y: 1018, kind: "bush", width: 82 }, { x: 4340, y: 1022, kind: "rocks", width: 82 },
  { x: 4900, y: 1018, kind: "flowers", width: 90 }, { x: 5460, y: 1020, kind: "bush", width: 84 },
  { x: 230, y: 990, kind: "clover", width: 30 }, { x: 530, y: 1040, kind: "bench", width: 76 },
  { x: 700, y: 1000, kind: "wildflowers", width: 40 }, { x: 1085, y: 1060, kind: "crops", width: 100 },
  { x: 1190, y: 1010, kind: "chicken", width: 34 }, { x: 1380, y: 1055, kind: "grass-tuft", width: 32 },
  { x: 1585, y: 1020, kind: "stump", width: 77 }, { x: 1705, y: 1070, kind: "wildflowers", width: 42 },
  { x: 1900, y: 1110, kind: "pond", width: 140 }, { x: 2075, y: 1020, kind: "fallen-leaves", width: 39 },
  { x: 2230, y: 1025, kind: "clover", width: 32 }, { x: 2420, y: 1080, kind: "bench", width: 74 },
  { x: 2520, y: 1020, kind: "crates", width: 63 }, { x: 2750, y: 1080, kind: "cow", width: 69 },
  { x: 2850, y: 1035, kind: "wildflowers", width: 43 }, { x: 3060, y: 1070, kind: "grass-tuft", width: 33 },
  { x: 3295, y: 1030, kind: "stump", width: 75 }, { x: 3405, y: 1060, kind: "chicken", width: 33 },
  { x: 3630, y: 1020, kind: "crops", width: 103 }, { x: 3880, y: 1035, kind: "clover", width: 31 },
  { x: 4140, y: 1085, kind: "pond", width: 130 }, { x: 4395, y: 1050, kind: "bench", width: 74 },
  { x: 4510, y: 1020, kind: "fallen-leaves", width: 42 }, { x: 4760, y: 1050, kind: "cow", width: 70 },
  { x: 5000, y: 1070, kind: "crates", width: 61 }, { x: 5200, y: 1020, kind: "wildflowers", width: 42 },
  { x: 5390, y: 1050, kind: "grass-tuft", width: 32 }, { x: 5650, y: 1010, kind: "chicken", width: 33 },
  { x: 5750, y: 1100, kind: "crops", width: 98 }, { x: 5880, y: 1020, kind: "clover", width: 30 },
  { x: 210, y: 600, kind: "wildflowers", width: 37 }, { x: 535, y: 610, kind: "grass-tuft", width: 28 },
  { x: 1060, y: 605, kind: "clover", width: 28 }, { x: 1590, y: 615, kind: "fallen-leaves", width: 37 },
  { x: 2120, y: 608, kind: "wildflowers", width: 38 }, { x: 2700, y: 605, kind: "grass-tuft", width: 28 },
  { x: 3240, y: 605, kind: "clover", width: 28 }, { x: 3800, y: 610, kind: "wildflowers", width: 39 },
  { x: 4360, y: 608, kind: "fallen-leaves", width: 37 }, { x: 4930, y: 610, kind: "grass-tuft", width: 28 },
  { x: 5580, y: 610, kind: "wildflowers", width: 37 },
];

export const EVOLUTION_QUESTS: Record<Exclude<AgeStage, "adult">, { memories: string[]; guide?: NpcId; title: Record<Lang, string>; hint: Record<Lang, string> }> = {
  baby: {
    memories: ["origins", "joaquim"],
    title: { pt: "Crescer: primeiros passos", en: "Grow up: first steps", es: "Crecer: primeros pasos" },
    hint: { pt: "Descubra suas origens e visite a escola para completar a missão.", en: "Discover your origins and visit the school to complete the quest.", es: "Descubre tus orígenes y visita la escuela para completar la misión." },
  },
  teen: {
    memories: ["art", "design", "etec"], guide: "luna",
    title: { pt: "Crescer: encontre seu caminho", en: "Grow up: find your path", es: "Crecer: encuentra tu camino" },
    hint: { pt: "Explore arte, design e ETEC; converse com Luna.", en: "Explore art, design and ETEC; talk to Luna.", es: "Explora arte, diseño y ETEC; habla con Luna." },
  },
};

export const inRect = (p: { x: number; y: number }, rect: { x: number; y: number; width: number; height: number }, padding = 0) =>
  p.x >= rect.x + padding && p.x <= rect.x + rect.width - padding &&
  p.y >= rect.y + padding && p.y <= rect.y + rect.height - padding;

export const isWalkable = (p: { x: number; y: number }, bossDefeated = false) => {
  if (p.x < PLAYER_RADIUS || p.x > WORLD.width - PLAYER_RADIUS || p.y < PLAYER_RADIUS || p.y > WORLD.height - PLAYER_RADIUS) return false;
  const hitsBuilding = LANDMARKS.some((landmark) => Math.abs(p.x - landmark.x) < landmark.width * .41 && p.y > 132 && p.y < 342);
  if (hitsBuilding) return false;
  const hitsScenery = SCENERY.some((item) => {
    if (!["tree", "purple-tree", "bush", "rocks", "fence", "pond", "stump", "crates"].includes(item.kind)) return false;
    const anchorY = item.y - 220;
    const radius = item.kind === "pond" ? item.width * .31 : Math.min(34, item.width * .18);
    return Math.hypot(p.x - item.x, p.y - anchorY) < radius;
  });
  if (hitsScenery) return false;
  if (inRect(p, RIVER) && !inRect(p, BRIDGE, 2)) return false;
  if (!bossDefeated && p.x > 3475) return false;
  return !NPCS.some((npc) => !(npc.id === "python" && bossDefeated) && Math.hypot(p.x - npc.x, p.y - npc.y) < 17);
};

export const fogKey = (x: number, y: number) => {
  const col = clamp(Math.floor(x / (WORLD.width / FOG_COLS)), 0, FOG_COLS - 1);
  const row = clamp(Math.floor(y / (WORLD.height / FOG_ROWS)), 0, FOG_ROWS - 1);
  return `${col}:${row}`;
};
