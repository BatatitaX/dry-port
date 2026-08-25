import assert from "node:assert/strict";
import { existsSync, readFileSync } from "node:fs";
import test from "node:test";

const projectRoot = new URL("../", import.meta.url);
const readProjectFile = (path) => readFileSync(new URL(path, projectRoot), "utf8");
const game = readProjectFile("app/page.tsx");
const extras = readProjectFile("app/game-extras.tsx");

test("every world structure, scenery image, portrait and résumé exists", () => {
  const structureIds = Array.from(game.matchAll(/\{ id: "([a-z-]+)", memoryId:/g), (match) => match[1]);
  const scenerySection = game.split("const SCENERY:")[1]?.split("\n];")[0] ?? "";
  const sceneryKinds = new Set(Array.from(scenerySection.matchAll(/kind: "([a-z-]+)"/g), (match) => match[1]));

  assert.equal(structureIds.length, 10);
  assert.ok(sceneryKinds.size >= 19, `Expected an expanded coherent scenery set, found ${sceneryKinds.size}`);

  const requiredAssets = [
    "public/Curriculo_Adryel_Luis_Rodrigues.pdf",
    "public/characters/dry-baby.png",
    "public/characters/dry-teen.png",
    "public/characters/dry-adult.png",
    "public/characters/jao.png",
    "public/characters/nilo.png",
    "public/characters/dry-portrait.png",
    "public/characters/jao-portrait.png",
    "public/characters/nilo-portrait.png",
    "public/favicon.svg",
    "public/favicon.ico",
    "public/memory-icons.png",
    "public/paper-poems-atlas.png",
    "public/portraits/cast-atlas.png",
    "public/world/terrain/world-base.png",
    "public/world/terrain/path-dirt.png",
    "public/world/terrain/water-tile.png",
    "public/world/interiors/dialogue-jao.png",
    "public/world/interiors/dialogue-nilo.png",
    "public/world/scenery/bridge.png",
    ...structureIds.map((id) => `public/world/structures/${id}.png`),
    ...Array.from(sceneryKinds, (kind) => `public/world/scenery/${kind}.png`),
  ];

  for (const asset of requiredAssets) {
    assert.ok(existsSync(new URL(asset, projectRoot)), `Missing public asset: ${asset}`);
  }
});

test("Portuguese, English and Spanish contain the same interface labels", () => {
  const keysFor = (language) => {
    const section = game.match(new RegExp(`^  ${language}: \\{\\n([\\s\\S]*?)^  \\},?\\n`, "m"));
    assert.ok(section, `Missing interface translations for ${language}`);
    return Array.from(section[1].matchAll(/^    ([a-zA-Z]+):/gm), (match) => match[1]).sort();
  };

  assert.deepEqual(keysFor("en"), keysFor("pt"));
  assert.deepEqual(keysFor("es"), keysFor("pt"));
});

test("every collectible poem is positioned on a reachable path", () => {
  const zones = Array.from(
    extras.matchAll(/\{ id: "[a-z-]+", x: (\d+), y: (\d+), width: (\d+), height: (\d+) \}/g),
    ([, x, y, width, height]) => ({ x: Number(x), y: Number(y), width: Number(width), height: Number(height) }),
  );
  const poemSection = extras.split("export const POEMS:")[1]?.split("\ntype DialogueLine")[0] ?? "";
  const poems = Array.from(
    poemSection.matchAll(/id: "([a-z-]+)", x: (\d+), y: (\d+)/g),
    ([, id, x, y]) => ({ id, x: Number(x), y: Number(y) }),
  );

  assert.equal(zones.length, 5);
  assert.equal(poems.length, 9);
  for (const poem of poems) {
    assert.ok(zones.some((zone) => poem.x >= zone.x && poem.x <= zone.x + zone.width && poem.y >= zone.y && poem.y <= zone.y + zone.height), `Poem outside every path: ${poem.id}`);
  }
});

test("Vercel uses Next.js without type-checking Cloudflare-only files", () => {
  const hosting = JSON.parse(readProjectFile("vercel.json"));
  const typescript = JSON.parse(readProjectFile("tsconfig.json"));

  assert.equal(hosting.framework, "nextjs");
  assert.equal(hosting.buildCommand, "npx next build");
  for (const excludedPath of ["build", "db", "examples", "worker", "drizzle.config.ts", "vite.config.ts"]) {
    assert.ok(typescript.exclude.includes(excludedPath), `${excludedPath} must not enter the Vercel type check`);
  }
});

test("public metadata is production-ready", () => {
  const layout = readProjectFile("app/layout.tsx");

  assert.doesNotMatch(layout, /codex-preview/);
  assert.match(layout, /openGraph:/);
  assert.match(layout, /twitter:/);
  assert.match(layout, /Adryel Luís Rodrigues/);
});

test("keyboard, touch and external-link protections remain available", () => {
  assert.match(game, /arrowup: "w"/);
  assert.match(game, /event\.key === "Escape"/);
  assert.match(game, /onPointerDown=\{\(event\) => startTouchMovement/);
  assert.match(game, /https:\/\/github\.com\/BatatitaX/);

  const externalLinks = Array.from(game.matchAll(/target="_blank"\s+rel="([^"]+)"/g), (match) => match[1]);
  assert.ok(externalLinks.length >= 4);
  for (const relationship of externalLinks) {
    assert.ok(relationship.split(/\s+/).includes("noopener"), "External links need noopener");
    assert.ok(relationship.split(/\s+/).includes("noreferrer"), "External links need noreferrer");
  }
});
