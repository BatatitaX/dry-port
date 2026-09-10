import * as Phaser from "phaser";
import type { MutableRefObject } from "react";
import type { GameBridge } from "./bridge";
import { NPCS, POEMS, COMPUTER, RIVER, BRIDGE, PATH_ZONES } from "./data";
import { WORLD, LANDMARKS, SCENERY, WORLD_MEMORIES, clamp } from "./world";
import { advancePosition } from "./simulation";
import { isMovementKey, movementVector, stableFacing, walkFrameAt, type Direction } from "../movement";

export function createWorldGame(parent: HTMLElement, bridge: MutableRefObject<GameBridge | null>, onError: () => void, onReady: () => void) {
  class WorldScene extends Phaser.Scene {
    private player!: Phaser.GameObjects.Sprite;
    private facing: Direction = "down";
    private publishedAt = 0;
    private previousPosition = { x: -1, y: -1 };
    private labels: Array<{ text: Phaser.GameObjects.Text; memoryId: string }> = [];
    private papers = new Map<string, Phaser.GameObjects.Image>();
    private tokens = new Map<string, Phaser.GameObjects.Image>();
    private python!: Phaser.GameObjects.Sprite;
    private barrier!: Phaser.GameObjects.TileSprite;
    private language = "";
    private wasPaused = false;
    constructor() { super("World"); }
    preload() {
      this.load.on("loaderror", onError);
      this.load.image("terrain", "/world/terrain/world-base.png");
      this.load.image("path", "/world/terrain/path-dirt.png");
      this.load.image("water", "/world/terrain/water-tile.png");
      this.load.image("bridge", "/world/scenery/bridge.png");
      this.load.spritesheet("memory", "/memory-icons.png", { frameWidth: 24, frameHeight: 24 });
      this.load.spritesheet("paper", "/paper-poems-atlas.png", { frameWidth: 24, frameHeight: 24 });
      for (const name of ["dry-baby", "dry-teen", "dry-adult", "nilo", "jao"]) {
        this.load.spritesheet(name, `/characters/${name}.png`, { frameWidth: 32, frameHeight: 48 });
      }
      for (const landmark of LANDMARKS) this.load.image(landmark.id, `/world/structures/${landmark.id}.png`);
      for (const kind of new Set(SCENERY.map(item => item.kind))) this.load.image(kind, `/world/scenery/${kind}.png`);
    }
    create() {
      const state = bridge.current!;
      this.add.image(0, 0, "terrain").setOrigin(0).setDisplaySize(WORLD.width, WORLD.height);
      this.add.tileSprite(RIVER.x, RIVER.y, RIVER.width, RIVER.height, "water").setOrigin(0);
      for (const zone of PATH_ZONES.filter(zone => zone.id !== "main")) {
        this.add.tileSprite(zone.x, zone.y, zone.width, zone.height, "path").setOrigin(0).setDepth(1);
      }
      this.add.image(BRIDGE.x, BRIDGE.y, "bridge").setOrigin(0).setDisplaySize(BRIDGE.width, BRIDGE.height).setDepth(2);
      for (const item of SCENERY) {
        const sprite = this.add.image(item.x, item.y - 220, item.kind).setOrigin(.5, 1).setDepth(item.y - 220);
        sprite.setScale(item.width / sprite.width);
      }
      for (const landmark of LANDMARKS) {
        this.add.image(landmark.x, 343, landmark.id).setOrigin(.5, 1).setDisplaySize(landmark.width, landmark.width).setDepth(343);
        const text = this.add.text(landmark.x, 355, "", { fontFamily: "monospace", fontSize: "14px", color: "#fff7df", backgroundColor: "#273229", padding: { x: 8, y: 6 }, align: "center" }).setOrigin(.5, 0).setDepth(400);
        this.labels.push({ text, memoryId: landmark.memoryId });
      }
      for (const memory of WORLD_MEMORIES) {
        this.tokens.set(memory.id, this.add.image(memory.x, memory.y, "memory", memory.assetIndex).setScale(1.6).setDepth(memory.y));
      }
      this.barrier = this.add.tileSprite(3478, 428, 8, 220, "water").setOrigin(0).setTint(0xff5566).setDepth(430);
      for (const npc of NPCS) {
        const texture = npc.id === "luna" ? "dry-teen" : npc.id === "python" ? "nilo" : npc.id;
        const sprite = this.add.sprite(npc.x, npc.y, texture, 0).setOrigin(.5, 1).setScale(2).setDepth(npc.y);
        if (npc.id === "python") { this.python = sprite; sprite.setTint(0xae88ed); }
        if (npc.id === "luna") sprite.setTint(0xe4c0ec);
        if (!npc.secret) this.add.text(npc.x, npc.y - 105, npc.name, { fontFamily: "monospace", fontSize: "14px", color: "#fff7df", backgroundColor: "#273229", padding: { x: 5, y: 3 } }).setOrigin(.5).setDepth(npc.y);
      }
      for (const [index, poem] of POEMS.entries()) this.papers.set(poem.id, this.add.image(poem.x, poem.y, "paper", index % 6).setOrigin(.5, .75).setScale(2).setDepth(poem.y).setVisible(false));
      this.add.text(COMPUTER.x, COMPUTER.y, "[ PC ]", { fontFamily: "monospace", fontSize: "22px", color: "#b8ffb3", backgroundColor: "#17251c", padding: { x: 9, y: 12 } }).setOrigin(.5, 1).setDepth(COMPUTER.y);
      this.player = this.add.sprite(state.position.current.x, state.position.current.y, `dry-${state.ageStage}`, 0).setOrigin(.5, 1).setScale(2);
      this.cameras.main.setBounds(0, 0, WORLD.width, WORLD.height).setRoundPixels(true);
      const clear = () => { const current = bridge.current; current?.keys.clear(); if (current) current.keyOrder.length = 0; };
      const down = (event: KeyboardEvent) => {
        const current = bridge.current;
        if (!current || current.paused || event.ctrlKey || event.metaKey || event.altKey) return;
        if (event.target instanceof HTMLElement && event.target.closest("input, select, textarea, [contenteditable=true]")) return;
        const key = event.key.toLowerCase();
        if (isMovementKey(key)) {
          event.preventDefault();
          if (!current.keys.has(key)) current.keyOrder.push(key);
          current.keys.add(key);
        } else if (key === "shift") current.keys.add(key);
        else if ((key === "e" || key === "enter") && !event.repeat) {
          if (key === "enter" && event.target instanceof HTMLElement && event.target.closest("button, a")) return;
          event.preventDefault(); current.onInteract();
        }
        else if (key === "m" && !event.repeat) { event.preventDefault(); current.onMap(); }
      };
      const up = (event: KeyboardEvent) => {
        const current = bridge.current; if (!current) return;
        const key = event.key.toLowerCase(); current.keys.delete(key);
        if (isMovementKey(key)) { const index = current.keyOrder.indexOf(key); if (index >= 0) current.keyOrder.splice(index, 1); }
      };
      const visibility = () => { if (document.hidden) clear(); };
      window.addEventListener("keydown", down); window.addEventListener("keyup", up); window.addEventListener("blur", clear); document.addEventListener("visibilitychange", visibility);
      this.events.once(Phaser.Scenes.Events.SHUTDOWN, () => {
        clear(); window.removeEventListener("keydown", down); window.removeEventListener("keyup", up); window.removeEventListener("blur", clear); document.removeEventListener("visibilitychange", visibility);
      });
      this.game.canvas.setAttribute("aria-hidden", "true");
      this.game.canvas.dataset.ready = "true";
      onReady();
    }
    update(now: number, delta: number) {
      const state = bridge.current;
      if (!state || !this.player) return;
      if (state.paused && !this.wasPaused) { state.keys.clear(); state.keyOrder.length = 0; }
      this.wasPaused = state.paused;
      const keys = state.paused ? new Set<string>() : state.keys;
      const position = advancePosition(state.position.current, keys, delta, state.bossDefeated);
      state.position.current = position;
      const vector = movementVector(keys);
      this.facing = stableFacing(keys, state.keyOrder, this.facing);
      const row = { down: 0, left: 1, right: 2, up: 3 }[this.facing];
      const frame = row * 3 + (vector.active ? walkFrameAt(now, keys.has("shift")) : 0);
      this.player.setTexture(`dry-${state.ageStage}`, frame).setPosition(position.x, position.y).setDepth(position.y).setScale(state.ageStage === "baby" ? 1.56 : state.ageStage === "teen" ? 1.8 : 2);
      const camera = this.cameras.main;
      if (state.reducedMotion) {
        // Stationary screen-sized rooms instead of continuously tracking the player.
        camera.setScroll(clamp(Math.floor(position.x / camera.width) * camera.width, 0, Math.max(0, WORLD.width-camera.width)), clamp(Math.floor(position.y / camera.height) * camera.height, 0, Math.max(0, WORLD.height-camera.height)));
      } else camera.setScroll(clamp(position.x - camera.width * .38, 0, Math.max(0, WORLD.width-camera.width)), clamp(position.y - camera.height * .57, 0, Math.max(0, WORLD.height-camera.height)));
      this.python.setVisible(!state.bossDefeated); this.barrier.setVisible(!state.bossDefeated);
      for (const [id, paper] of this.papers) paper.setVisible(state.bossDefeated && !state.collectedPoems.includes(id));
      for (const [id, token] of this.tokens) token.setAlpha(state.unlocked.includes(id) ? .45 : 1);
      if (this.language !== state.lang) {
        this.language = state.lang;
        for (const label of this.labels) {
          const memory = WORLD_MEMORIES.find(item => item.id === label.memoryId)!;
          const year = memory.year === "SEMPRE" ? ({pt:"SEMPRE",en:"ALWAYS",es:"SIEMPRE"})[state.lang] : memory.year === "AGORA" ? ({pt:"AGORA",en:"NOW",es:"AHORA"})[state.lang] : memory.year;
          label.text.setText(`${year}\n${memory.title[state.lang]}`);
        }
      }
      // Publish HUD/proximity updates at most ten times per second, never at frame rate.
      if (now-this.publishedAt >= 100 && (position.x !== this.previousPosition.x || position.y !== this.previousPosition.y)) {
        this.publishedAt = now; this.previousPosition = position; state.onPosition(position);
      }
    }
  }
  const game = new Phaser.Game({ type: Phaser.AUTO, parent, backgroundColor: "#244537", pixelArt: true, roundPixels: true, scene: WorldScene, scale: { mode: Phaser.Scale.RESIZE, width: parent.clientWidth, height: parent.clientHeight }, audio: { noAudio: true }, input: { keyboard: false }, banner: false });
  const resize = new ResizeObserver(() => { if (parent.clientWidth && parent.clientHeight) game.scale.resize(parent.clientWidth, parent.clientHeight); });
  resize.observe(parent);
  return () => { resize.disconnect(); game.destroy(true); };
}
