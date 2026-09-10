import * as Phaser from "phaser";
import type { Bridge } from "./bridge";
import { aligned, BELLS, GROUND, GOAL, nearby, PLACES, stage, tick, WORLD, type Point, type Target, type State } from "./model";
import { copy } from "./copy";
import { Avatar } from "./avatar";
import { Effects } from "./effects";

export function createTutorial(parent: HTMLElement, bridge: Bridge, ready: () => void, failed: () => void) {
  let loadFailed = false;
  class Courtyard extends Phaser.Scene {
    player!: Avatar;
    shadow!: Phaser.GameObjects.Ellipse;
    effects!: Effects;
    objects = new Map<string, Phaser.GameObjects.Image>();
    ink!: Phaser.GameObjects.Graphics;
    prompt!: Phaser.GameObjects.Text;
    pointer!: Phaser.GameObjects.Text;
    lastPublish = 0;
    lastCamera = "";
    stateRef?: State;
    lastEffect = 0;
    mirrorAngles = [-Math.PI / 2, -Math.PI / 2];
    reveal = 0;
    finishGlow = 0;
    droneImpact = 0;
    droneSettle = 0;
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
      this.shadow = this.add.ellipse(0, 0, 42, 13, 0x080e1a, .24);
      this.player = new Avatar(this, bridge.state.pos.x, bridge.state.pos.y);
      this.effects = new Effects(this);
      this.stateRef = bridge.state;
      this.mirrorAngles = bridge.state.mirrors.map(v => v * Math.PI / 2 - Math.PI / 2);
      this.finishGlow = bridge.state.complete ? 1 : 0;
      this.prompt = this.add.text(0, 0, "", { fontFamily: "Arial, sans-serif", fontSize: "17px", color: "#fff6e8", backgroundColor: "#101c30", padding: { x: 13, y: 9 } }).setOrigin(.5, 1).setDepth(2200);
      this.pointer = this.add.text(0, 0, "◇", { fontFamily: "Arial", fontSize: "38px", color: "#ffe0a5", stroke: "#192237", strokeThickness: 3 }).setOrigin(.5).setDepth(1800);
      this.cameras.main.setBounds(0, 0, WORLD.width, WORLD.height);
      this.input.on("pointerdown", (p: Phaser.Input.Pointer) => {
        if (bridge.paused || !p.leftButtonDown()) return;
        const world = this.cameras.main.getWorldPoint(p.x, p.y);
        // Aim at the visible core, not the feet of a sprite. Bells sit on the ground.
        const bell = BELLS.find(b => Math.hypot(world.x - b.x, world.y - b.y) < 26);
        const drone = Math.hypot(world.x - PLACES.drone.x, world.y - (PLACES.drone.y - 60)) < 65;
        bridge.act("pulse", bell ?? (drone ? PLACES.drone : { x: world.x, y: world.y + 60 }));
      });
      this.game.canvas.setAttribute("data-ready", "true");
      ready();
    }
    update(_time: number, delta: number) {
      if (!this.player) return;
      const s = bridge.state, prefs = bridge.settings, keys = bridge.keys;
      const dt = bridge.paused ? 0 : Math.min(delta / 1000, .05);
      if (s !== this.stateRef) {
        this.stateRef = s; this.lastEffect = s.effectId; this.effects.clear();
        this.mirrorAngles = s.mirrors.map(v => v * Math.PI / 2 - Math.PI / 2);
        this.reveal = s.observing || aligned(s) ? 1 : 0; this.finishGlow = s.complete ? 1 : 0;
        this.droneImpact = 0; this.droneSettle = s.droneDone ? 1 : 0;
      }
      const input = { x: Number(keys.has("d") || keys.has("arrowright")) - Number(keys.has("a") || keys.has("arrowleft")) + bridge.joystick.x,
        y: Number(keys.has("s") || keys.has("arrowdown")) - Number(keys.has("w") || keys.has("arrowup")) + bridge.joystick.y };
      const before = { ...s.pos };
      if (!bridge.paused) tick(s, dt, input, prefs);
      const traveled = Math.hypot(s.pos.x - before.x, s.pos.y - before.y);
      const stride = traveled > 100 ? 0 : traveled;
      const frame = Math.abs(s.facing.x) > Math.abs(s.facing.y) ? (s.facing.x < 0 ? 1 : 2) : (s.facing.y < 0 ? 3 : 0);
      for (const effect of s.effects) {
        if (effect.id <= this.lastEffect) continue;
        this.lastEffect = effect.id; this.effects.emit(effect, prefs.reduced); bridge.feedback(effect);
        if (effect.kind === "pulse" || effect.kind === "damage") this.player.react(effect.kind);
        if (effect.kind === "hit" || effect.kind === "shield") this.droneImpact = .32;
      }
      this.player.setPosition(s.pos.x, s.pos.y).setDepth(s.pos.y);
      this.player.animate(frame, stride, s.pos.x - before.x, dt, s.time, s.dodge > 0, prefs.reduced, s.invulnerable > 0);
      this.shadow.setPosition(s.pos.x, s.pos.y - 2).setDepth(s.pos.y - 2).setAlpha(s.dodge > 0 && !prefs.reduced ? .16 : .24);
      // The success reveal can finish behind its dialog; gameplay stays paused.
      const visualDt = bridge.paused && s.complete && this.finishGlow < .99 ? Math.min(delta / 1000, .05) : dt;
      this.effects.update(visualDt, s.pos, stride, s.dodge > 0, this.player.frame, prefs.reduced);
      const ease = prefs.reduced ? 1 : 1 - Math.exp(-dt * 12);
      this.reveal += ((s.observing || aligned(s) ? 1 : 0) - this.reveal) * ease;
      this.finishGlow += ((s.complete ? 1 : 0) - this.finishGlow) * (prefs.reduced ? 1 : 1 - Math.exp(-visualDt * 2));
      this.droneImpact = Math.max(0, this.droneImpact - dt);
      this.droneSettle += ((s.droneDone ? 1 : 0) - this.droneSettle) * (prefs.reduced ? 1 : 1 - Math.exp(-dt * 4));
      s.mirrors.forEach((v, i) => {
        const target = v * Math.PI / 2 - Math.PI / 2;
        const diff = Math.atan2(Math.sin(target - this.mirrorAngles[i]), Math.cos(target - this.mirrorAngles[i]));
        this.mirrorAngles[i] += diff * ease;
      });
      const camera = this.cameras.main;
      const zoom = prefs.overview ? Math.min(this.scale.width / 1600, this.scale.height / 1000) : Math.max(this.scale.width / 1600, this.scale.height / 1000, this.scale.width < 700 ? .8 : .7);
      const cameraKey = `${this.scale.width}:${this.scale.height}:${prefs.overview}:${prefs.reduced}`;
      if (cameraKey !== this.lastCamera) {
        this.lastCamera = cameraKey; camera.setZoom(zoom);
        if (prefs.overview) { camera.stopFollow(); camera.centerOn(800, 500); }
        else camera.startFollow(this.player, false, prefs.reduced ? 1 : .12, prefs.reduced ? 1 : .12, 0, 70 / zoom);
      }
      if (traveled > 100 && !prefs.overview) camera.centerOn(s.pos.x, s.pos.y - 70 / zoom);
      this.objects.get("lens")!.setVisible(!s.lens);
      this.objects.get("cell")!.setVisible(s.droneDone && !s.cell);
      this.objects.get("drone")!.setAlpha(1 - this.droneSettle * .4)
        .setY(PLACES.drone.y + this.droneSettle * 30 - (prefs.reduced || s.droneDone ? 0 : Math.sin(s.time * 2) * 5))
        .setAngle(prefs.reduced ? 0 : Math.sin(this.droneImpact * 30) * this.droneImpact * 12 + this.droneSettle * 12)
        .setTint(this.droneImpact > 0 ? 0xbdf7f4 : 0xffffff);
      for (const name of ["lens", "cell"] as const) this.objects.get(name)!.setY(PLACES[name].y - (prefs.reduced ? 0 : Math.sin(s.time * 2.2) * 3));
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
      if (this.reveal > .01) {
        const origin = { x: PLACES.lens.x, y: PLACES.lens.y - 60 };
        const m0 = { x: PLACES.mirror0.x, y: PLACES.mirror0.y - 65 }, m1 = { x: PLACES.mirror1.x, y: PLACES.mirror1.y - 65 };
        line(origin, m0, 0x8ceaf2, 8, .13 * this.reveal); line(origin, m0, 0x8ceaf2, 2, .8 * this.reveal);
        if (s.mirrors[0] === GOAL[0]) { line(m0, m1, 0x8ceaf2, 10, .15); line(m0, m1, 0xadf5ff, 3); }
        if (aligned(s)) { line(m1, PLACES.telescope, 0xadf5ff, 3); }
        if (!prefs.reduced) {
          const segments = [[origin, m0], ...(s.mirrors[0] === GOAL[0] ? [[m0, m1]] : []), ...(aligned(s) ? [[m1, PLACES.telescope]] : [])];
          segments.forEach(([a, b], i) => { const phase = (s.time * .45 + i * .3) % 1;
            g.fillStyle(0xd9ffff, .8 * this.reveal).fillCircle(a.x + (b.x - a.x) * phase, a.y + (b.y - a.y) * phase, 3);
          });
        }
      }
      [PLACES.mirror0, PLACES.mirror1].forEach((p, i) => {
        const y = p.y - 62, angle = this.mirrorAngles[i];
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
        if (!prefs.reduced) {
          const turn = s.droneClock * (vulnerable ? .5 : 1.4);
          for (let i = 0; i < 3; i++) g.lineStyle(3, vulnerable ? 0xa0ffe3 : 0xf0c899, .7).beginPath().arc(PLACES.drone.x, PLACES.drone.y - 60, 65, turn + i * Math.PI * 2 / 3, turn + i * Math.PI * 2 / 3 + .7).strokePath();
        }
        for (let i = 0; i < 3; i++) g.fillStyle(i < s.droneHp ? 0x8befea : 0x28394a).fillRoundedRect(PLACES.drone.x - 36 + i * 26, PLACES.drone.y - 141, 20, 5, 2);
      }
      if (s.danger) {
        const phase = s.droneClock % 3.8;
        g.fillStyle(0xff726f, phase < 1.5 ? .12 + Math.min(phase / 1.5, 1) * .15 : .42).fillCircle(s.danger.x, s.danger.y, 90);
        g.lineStyle(3, 0xffb69a).strokeCircle(s.danger.x, s.danger.y, 90);
        g.lineStyle(3, 0xffe2be).beginPath().arc(s.danger.x, s.danger.y, 86, -Math.PI / 2, -Math.PI / 2 + Math.PI * 2 * Math.min(1, phase / 1.5)).strokePath();
      }
      for (const p of s.pulses) {
        const fade = p.life / .2;
        line(p.from, p.to, 0xbfffff, prefs.reduced ? 3 : 12, prefs.reduced ? .7 : .12 * fade);
        line(p.from, p.to, 0xcaffff, 2, fade);
        if (!prefs.reduced) { g.fillStyle(0xb9ffff, fade * .17).fillCircle(p.to.x, p.to.y, 12); g.fillStyle(0xeeffff, fade).fillCircle(p.to.x, p.to.y, 3); }
      }
      if (s.lens) { g.lineStyle(2, s.observing ? 0xf9d2a1 : 0xa7f8ff).strokeCircle(s.pos.x + s.facing.x * 27, s.pos.y - 65 + s.facing.y * 12, 9); }
      if (this.finishGlow > .01) {
        line({ x: PLACES.telescope.x, y: 140 }, { x: 1160, y: 0 }, 0xffe1a3, 36, .1 * this.finishGlow);
        line({ x: PLACES.telescope.x, y: 140 }, { x: 1160, y: 0 }, 0xffeac0, 4, .9 * this.finishGlow);
        g.fillStyle(0xffd185, .14 * this.finishGlow).fillCircle(PLACES.telescope.x, PLACES.telescope.y - 30, 120);
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
