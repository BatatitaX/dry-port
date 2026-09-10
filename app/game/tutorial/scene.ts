import * as Phaser from "phaser";
import type { Bridge } from "./bridge";
import { aligned, BELLS, GROUND, GOAL, nearby, PLACES, stage, tick, WORLD, type Point, type Target } from "./model";
import { copy } from "./copy";

export function createTutorial(parent: HTMLElement, bridge: Bridge, ready: () => void, failed: () => void) {
  let loadFailed = false;
  class Courtyard extends Phaser.Scene {
    player!: Phaser.GameObjects.Image;
    objects = new Map<string, Phaser.GameObjects.Image>();
    ink!: Phaser.GameObjects.Graphics;
    prompt!: Phaser.GameObjects.Text;
    pointer!: Phaser.GameObjects.Text;
    lastPublish = 0;
    lastCamera = "";
    preload() {
      this.load.on("loaderror", () => { loadFailed = true; failed(); });
      this.load.image("courtyard", "/observatory/courtyard.webp");
      this.load.image("dry-atlas", "/observatory/dry.webp");
      this.load.image("props", "/observatory/props.webp");
    }
    create() {
      if (loadFailed) return;
      for (const [key, columns] of [["dry-atlas", 4], ["props", 3]] as const) {
        const texture = this.textures.get(key), source = texture.getSourceImage();
        const frameWidth = Math.floor(source.width / columns);
        for (let i = 0; i < columns; i++) texture.add(i, 0, i * frameWidth, 0, frameWidth, source.height);
      }
      this.add.image(0, 0, "courtyard").setOrigin(0).setDisplaySize(WORLD.width, WORLD.height);
      this.ink = this.add.graphics().setDepth(2000);
      const prop = (name: string, position: Point, frame: number, height: number) => {
        const object = this.add.image(position.x, position.y, "props", frame).setOrigin(.5, .88);
        object.setScale(height / object.height).setDepth(position.y);
        this.objects.set(name, object);
      };
      prop("mirror0", PLACES.mirror0, 0, 145); prop("mirror1", PLACES.mirror1, 0, 145);
      prop("lens", PLACES.lens, 2, 82); prop("cell", PLACES.cell, 2, 80);
      prop("drone", PLACES.drone, 1, 135);
      this.player = this.add.image(bridge.state.pos.x, bridge.state.pos.y, "dry-atlas", 0).setOrigin(.5, .97);
      this.player.setScale(140 / this.player.height);
      this.prompt = this.add.text(0, 0, "", { fontFamily: "Arial, sans-serif", fontSize: "17px", color: "#fff6e8", backgroundColor: "#101c30", padding: { x: 13, y: 9 } }).setOrigin(.5, 1).setDepth(2200);
      this.pointer = this.add.text(0, 0, "◇", { fontFamily: "Arial", fontSize: "38px", color: "#ffe0a5", stroke: "#192237", strokeThickness: 3 }).setOrigin(.5).setDepth(1800);
      this.cameras.main.setBounds(0, 0, WORLD.width, WORLD.height);
      this.input.on("pointerdown", (p: Phaser.Input.Pointer) => {
        if (bridge.paused || !p.leftButtonDown()) return;
        const world = this.cameras.main.getWorldPoint(p.x, p.y);
        bridge.act("pulse", world);
      });
      this.game.canvas.setAttribute("data-ready", "true");
      ready();
    }
    update(_time: number, delta: number) {
      if (!this.player) return;
      const s = bridge.state, prefs = bridge.settings, keys = bridge.keys;
      const input = { x: Number(keys.has("d") || keys.has("arrowright")) - Number(keys.has("a") || keys.has("arrowleft")) + bridge.joystick.x,
        y: Number(keys.has("s") || keys.has("arrowdown")) - Number(keys.has("w") || keys.has("arrowup")) + bridge.joystick.y };
      if (!bridge.paused) tick(s, delta / 1000, input, prefs);
      const moving = Math.hypot(input.x, input.y) > .1 && !bridge.paused;
      const frame = Math.abs(s.facing.x) > Math.abs(s.facing.y) ? (s.facing.x < 0 ? 1 : 2) : (s.facing.y < 0 ? 3 : 0);
      this.player.setFrame(frame).setPosition(s.pos.x, s.pos.y - (moving && !prefs.reduced ? Math.abs(Math.sin(s.time * 15)) * 4 : 0)).setDepth(s.pos.y);
      this.player.setAngle(moving && !prefs.reduced ? Math.sin(s.time * 15) * 1.3 : 0);
      this.player.setAlpha(s.invulnerable > 0 ? .65 : 1);
      const camera = this.cameras.main;
      const zoom = prefs.overview ? Math.min(this.scale.width / 1600, this.scale.height / 1000) : Math.max(this.scale.width / 1600, this.scale.height / 1000, this.scale.width < 700 ? .8 : .7);
      const cameraKey = `${this.scale.width}:${this.scale.height}:${prefs.overview}:${prefs.reduced}`;
      if (cameraKey !== this.lastCamera) {
        this.lastCamera = cameraKey; camera.setZoom(zoom);
        if (prefs.overview) { camera.stopFollow(); camera.centerOn(800, 500); }
        else camera.startFollow(this.player, false, prefs.reduced ? 1 : .12, prefs.reduced ? 1 : .12, 0, 70 / zoom);
      }
      this.objects.get("lens")!.setVisible(!s.lens);
      this.objects.get("cell")!.setVisible(s.droneDone && !s.cell);
      this.objects.get("drone")!.setAlpha(s.droneDone ? .45 : 1).setY(PLACES.drone.y - (prefs.reduced ? 0 : Math.sin(s.time * 2) * 5));
      this.drawWorld();
      const near = nearby(s);
      this.prompt.setVisible(!!near && !bridge.paused);
      if (near) this.prompt.setPosition(PLACES[near].x, PLACES[near].y - 135).setText(`E · ${copy[bridge.lang].targets[near]}`);
      const objective: Target = (["lens", s.mirrors[0] === GOAL[0] ? "mirror1" : "mirror0", "drone", "cell", "telescope", "journal"] as Target[])[stage(s)];
      this.pointer.setPosition(PLACES[objective].x, PLACES[objective].y - 160 - (prefs.reduced ? 0 : Math.sin(s.time * 2) * 5)).setVisible(!s.complete);
      if (_time - this.lastPublish > 100) { this.lastPublish = _time; bridge.publish(this.game.loop.actualFps); }
    }
    drawWorld() {
      const s = bridge.state, g = this.ink, prefs = bridge.settings;
      g.clear();
      const line = (a: Point, b: Point, color: number, width = 3, alpha = 1) => { g.lineStyle(width, color, alpha).lineBetween(a.x, a.y, b.x, b.y); };
      // Ground cues and light are functional geometry; illustrated entities are loaded assets.
      if (s.observing || aligned(s)) {
        const origin = { x: PLACES.lens.x, y: PLACES.lens.y - 60 };
        const m0 = { x: PLACES.mirror0.x, y: PLACES.mirror0.y - 65 }, m1 = { x: PLACES.mirror1.x, y: PLACES.mirror1.y - 65 };
        line(origin, m0, 0x8ceaf2, 8, .13); line(origin, m0, 0x8ceaf2, 2, .8);
        if (s.mirrors[0] === GOAL[0]) { line(m0, m1, 0x8ceaf2, 10, .15); line(m0, m1, 0xadf5ff, 3); }
        if (aligned(s)) { line(m1, PLACES.telescope, 0xadf5ff, 3); }
      }
      [PLACES.mirror0, PLACES.mirror1].forEach((p, i) => {
        const y = p.y - 62, angle = s.mirrors[i] * Math.PI / 2 - Math.PI / 2;
        g.lineStyle(2, 0xbecddb, .65).strokeCircle(p.x, y, 39);
        line({ x: p.x, y }, { x: p.x + Math.cos(angle) * 34, y: y + Math.sin(angle) * 34 }, 0x9df5ff, 4);
        if (s.observing) {
          const target = GOAL[i] * Math.PI / 2 - Math.PI / 2;
          g.lineStyle(6, 0xffd091, 1).beginPath().arc(p.x, y, 44, target - .2, target + .2).strokePath();
        }
      });
      if (!s.gateOff) {
        const live = aligned(s) && s.time % 3 > 1.9;
        g.fillStyle(live ? 0xff756d : 0xffd091, aligned(s) ? (live ? .5 : .12) : .3).fillRect(1080, 355, 45, 420);
        for (let y = 385; y < 765; y += 45) line({ x: 1085, y }, { x: 1120, y: y - 16 }, live ? 0xffb59d : 0xe8b788, 2, .8);
      }
      g.lineStyle(3, s.gateOff ? 0x8debc8 : 0xecc592).strokeCircle(PLACES.switch.x, PLACES.switch.y, 22);
      line({ x: PLACES.switch.x, y: PLACES.switch.y - 11 }, { x: PLACES.switch.x, y: PLACES.switch.y + 7 }, 0xffe6bd, 3);
      // Notebook is a labeled interaction marker, not an invented visual illustration.
      g.lineStyle(2, 0xffd091).strokeRoundedRect(PLACES.journal.x - 16, PLACES.journal.y - 22, 32, 28, 3);
      line({ x: PLACES.journal.x, y: PLACES.journal.y - 20 }, { x: PLACES.journal.x, y: PLACES.journal.y + 4 }, 0xffd091, 2);
      BELLS.forEach((p, i) => {
        const lit = s.bells.includes(i);
        g.fillStyle(lit ? 0x91f1e6 : 0xdca669, .25).fillCircle(p.x, p.y, lit ? 17 : 12);
        g.lineStyle(2, lit ? 0xabfff6 : 0xebc188).strokeCircle(p.x, p.y, 11);
        line({ x: p.x, y: p.y - 16 }, { x: p.x, y: p.y + 16 }, 0xebc188, 2);
      });
      if (s.secret) { line(BELLS[0], BELLS[1], 0xa8eafb, 1); line(BELLS[1], BELLS[2], 0xa8eafb, 1); }
      if (s.droneActive) {
        const vulnerable = s.droneClock % 3.8 > 1.75;
        g.lineStyle(3, vulnerable ? 0xa0ffe3 : 0xf0c899).strokeCircle(PLACES.drone.x, PLACES.drone.y - 60, 60);
        for (let i = 0; i < 3; i++) g.fillStyle(i < s.droneHp ? 0x8befea : 0x28394a).fillRoundedRect(PLACES.drone.x - 36 + i * 26, PLACES.drone.y - 141, 20, 5, 2);
      }
      if (s.danger) {
        const phase = s.droneClock % 3.8;
        g.fillStyle(0xff726f, phase < 1.5 ? .16 : .7).fillCircle(s.danger.x, s.danger.y, 90);
        g.lineStyle(3, 0xffb69a).strokeCircle(s.danger.x, s.danger.y, 90);
        g.lineStyle(3, 0xffe2be).beginPath().arc(s.danger.x, s.danger.y, 86, -Math.PI / 2, -Math.PI / 2 + Math.PI * 2 * Math.min(1, phase / 1.5)).strokePath();
      }
      for (const p of s.pulses) { line(p.from, p.to, 0xbfffff, 12, .12); line(p.from, p.to, 0xcaffff, 3, p.life / .2); }
      if (s.lens) { g.lineStyle(2, s.observing ? 0xf9d2a1 : 0xa7f8ff).strokeCircle(s.pos.x + s.facing.x * 27, s.pos.y - 65 + s.facing.y * 12, 9); }
      if (s.complete) {
        line({ x: PLACES.telescope.x, y: 140 }, { x: 1160, y: 0 }, 0xffe1a3, 36, .1);
        line({ x: PLACES.telescope.x, y: 140 }, { x: 1160, y: 0 }, 0xffeac0, 4, .9);
        g.fillStyle(0xffd185, .14).fillCircle(PLACES.telescope.x, PLACES.telescope.y - 30, 120);
      }
      if (prefs.debug) {
        g.lineStyle(2, 0x7dff9d).strokePoints(GROUND, true);
        for (const p of Object.values(PLACES)) { g.lineStyle(1, 0x7dff9d, .6).strokeCircle(p.x, p.y, 105); g.lineStyle(1, 0xff7676, .8).strokeCircle(p.x, p.y, 32); }
        g.lineStyle(2, 0xffffff).strokeCircle(s.pos.x, s.pos.y, 10);
      }
    }
  }
  const game = new Phaser.Game({ type: Phaser.AUTO, parent, width: parent.clientWidth, height: parent.clientHeight, backgroundColor: "#0a1121",
    antialias: true, pixelArt: false, render: { roundPixels: false }, scene: Courtyard,
    scale: { mode: Phaser.Scale.RESIZE, autoCenter: Phaser.Scale.CENTER_BOTH }, audio: { noAudio: true },
    input: { keyboard: false, activePointers: 3 }, fps: { target: 60, forceSetTimeOut: false } });
  return () => game.destroy(true);
}
