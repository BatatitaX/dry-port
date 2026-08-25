import assert from "node:assert/strict";
import { existsSync, readFileSync, readdirSync } from "node:fs";
import test from "node:test";

const root = new URL("../", import.meta.url);
const read = (path) => readFileSync(new URL(path, root), "utf8");
const page = read("app/page.tsx");
const extras = read("app/game-extras.tsx");
const styles = read("app/globals.css");
const movement = read("app/movement.ts");
const iconSource = read("app/ui-icon.tsx");

const pngSize = (path) => {
  const data = readFileSync(new URL(path, root));
  assert.equal(data.subarray(1, 4).toString(), "PNG", `${path} should be a valid PNG`);
  return [data.readUInt32BE(16), data.readUInt32BE(20)];
};

test("keeps every building in the same native 96 × 96 pixel-art style", () => {
  const ids = Array.from(page.matchAll(/\{ id: "([a-z-]+)", memoryId:/g), (match) => match[1]);
  assert.equal(ids.length, 10);
  for (const id of ids) assert.deepEqual(pngSize(`public/world/structures/${id}.png`), [96, 96], id);
  assert.deepEqual(pngSize("public/world/scenery/lamp.png"), [16, 48]);
  assert.match(styles, /background: url\('\/world\/terrain\/path-dirt\.png'\)/);
  assert.match(page, /src="\/world\/scenery\/bridge\.png"/);
  assert.doesNotMatch(page, /className="building-door-path"/);
});

test("progresses from baby to teenager and adult through two explicit saved quests", () => {
  assert.match(extras, /export type AgeStage = "baby" \| "teen" \| "adult"/);
  assert.match(page, /memories: \["origins", "joaquim"\], guide: "nilo"/);
  assert.match(page, /memories: \["art", "design", "etec"\], guide: "luna"/);
  assert.match(page, /setAgeStage\(nextStage\)/);
  assert.match(page, /setEvolutionNotice\(nextStage\)/);
  assert.match(page, /collectedPoems, ageStage/);
  assert.match(extras, /MISSÃO CONCLUÍDA/);
  for (const age of ["baby", "teen", "adult"]) assert.deepEqual(pngSize(`public/characters/dry-${age}.png`), [96, 192]);
  assert.match(page, /backgroundSize: "192px 384px"/);
  assert.match(styles, /\.player\.age-baby \.player-sprite \{ transform: scale\(\.78\); \}/);
  assert.match(styles, /\.player\.age-teen \.player-sprite \{ transform: scale\(\.9\); \}/);
});

test("uses stable diagonal movement and the custom consistent icon family", () => {
  assert.match(page, /movementVector\(keys\)/);
  assert.match(page, /stableFacing\(keys, orderForEffect, current\)/);
  assert.match(page, /walkFrameAt\(now, sprinting\)/);
  assert.match(movement, /WALK_CYCLE = \[0, 1, 0, 2\]/);
  assert.match(movement, /Math\.hypot\(x, y\)/);
  assert.match(iconSource, /strokeLinecap="round"/);
  assert.match(extras, /return <UiIcon name=\{icons\[name\]\}/);
});

test("offers a real desktop with files, working terminal and Jão's discography", () => {
  assert.match(extras, /type ComputerApp = "desktop" \| "files" \| "terminal" \| "jao" \| "about"/);
  assert.match(extras, /onSubmit=\{submitTerminal\}/);
  assert.match(extras, /command === "whoami"/);
  assert.match(extras, /command === "python"/);
  assert.match(extras, /jaoUnlocked && shortcut\("jao"/);
  for (const album of ["LOBOS", "ANTI-HERÓI", "PIRATA", "SUPER", "SUPERNOVA", "MEMÓRIAS PÓSTUMAS"]) assert.ok(extras.includes(album), album);
  assert.match(extras, /open\.spotify\.com\/intl-pt\/artist\/59FrDXDVJz0EKqYg39dnT2/);
  assert.deepEqual(pngSize("public/characters/jao.png"), [96, 192]);
  assert.deepEqual(pngSize("public/characters/jao-portrait.png"), [64, 64]);
  assert.deepEqual(pngSize("public/world/interiors/dialogue-jao.png"), [760, 288]);
  assert.doesNotMatch(`${page}\n${extras}\n${styles}`, /coffin|caixão/i);
});

test("uses version-free production artwork and restores optional scenery", () => {
  const files = readdirSync(new URL("public/", root), { recursive: true, withFileTypes: true }).filter((entry) => entry.isFile());
  for (const entry of files) assert.doesNotMatch(entry.name, /(?:^|[-_])v\d+(?:[-_.]|$)/i, `Versioned artwork: ${entry.name}`);
  for (const item of ["bench", "chicken", "clover", "cow", "crates", "crops", "fallen-leaves", "grass-tuft", "pond", "stump", "wildflowers"]) {
    assert.ok(existsSync(new URL(`public/world/scenery/${item}.png`, root)), item);
    assert.match(page, new RegExp(`kind: "${item}"`));
  }
  assert.deepEqual(pngSize("public/memory-icons.png"), [96, 72]);
  assert.deepEqual(pngSize("public/paper-poems-atlas.png"), [144, 24]);
  assert.doesNotMatch(`${page}\n${extras}\n${styles}\n${read("README.md")}`, /dry-spritesheet-v2|memory-icons-v\d|paper-poems-atlas-v\d/);
});
