import * as Phaser from "phaser";
import { Avatar } from "../tutorial/avatar";
import { act, CLOCKS, GATES, GOAL, GOALS, gateLive, nearestClock, tick, type Settings, type State, type Point } from "./model";
export type Bridge = { state: State; settings: Settings; input: Point; paused: boolean; lang: "pt" | "en" | "es"; publish: (fps: number) => void };
const BOUNDS = [[100, 34, 448, 759], [118, 34, 433, 765], [56, 34, 372, 765], [45, 34, 398, 751]];
export function start(parent: HTMLElement, bridge: Bridge, ready: () => void, failed: () => void) {
  let broken = false;
  class Guided extends Phaser.Scene {
    player!: Avatar; ground!: Phaser.GameObjects.Graphics; ink!: Phaser.GameObjects.Graphics;
    shadow!: Phaser.GameObjects.Ellipse; clocks: Phaser.GameObjects.Container[] = [];
    clockHands: Phaser.GameObjects.Graphics[] = []; goalLabels: Phaser.GameObjects.Text[] = [];
    prompt!: Phaser.GameObjects.Text; marker!: Phaser.GameObjects.Text;
    angles = [-Math.PI / 2, -Math.PI / 2]; lastPhase = -1; lastEvent = 0; lastState?: State;
    phaseAge = 0; effectTime = 0; effectAt: Point = { x: 0, y: 0 }; effectKind = "";
    lastPublish = 0; lastSize = ""; trail: Point[] = [];
    preload() { this.load.on("loaderror", () => { broken = true; failed(); }); this.load.image("dry-atlas", "/observatory/simple-avatar.webp"); }
    create() {
      if (broken) return;
      this.cameras.main.setBackgroundColor("#233a49");
      this.ground = this.add.graphics();
      this.ground.fillStyle(0x182f3e).fillRoundedRect(76, 176, 988, 500, 64);
      this.ground.fillStyle(0x496775).fillRoundedRect(80, 160, 980, 500, 64);
      this.ground.lineStyle(2, 0x94b4bc, .25).strokeRoundedRect(94, 174, 952, 472, 52);
      // Sparse floor marks give movement a reference without adding objects to step one.
      for (let x = 200; x < 1040; x += 160) for (let y = 250; y < 650; y += 120) this.ground.fillStyle(0xc8e1df, .1).fillCircle(x, y, 2);
      CLOCKS.forEach((p, i) => {
        const face = this.add.graphics();
        face.fillStyle(0x132c3b, .25).fillEllipse(0, 25, 130, 100);
        face.fillStyle(0xd9b780).fillCircle(0, -20, 59);
        face.fillStyle(0xf5eedc).fillCircle(0, -23, 51);
        for (let n = 0; n < 12; n++) {
          const a = n * Math.PI / 6; face.lineStyle(n % 3 === 0 ? 3 : 1.5, 0x657280).lineBetween(Math.cos(a) * 40, -23 + Math.sin(a) * 40, Math.cos(a) * 45, -23 + Math.sin(a) * 45);
        }
        const hand = this.add.graphics(); this.clockHands.push(hand);
        const text = this.add.text(0, -105, i ? "09:00" : "03:00", { fontFamily: "Arial", fontSize: "19px", color: "#f5eedc", backgroundColor: "#233a49", padding: { x: 12, y: 7 } }).setOrigin(.5);
        this.goalLabels.push(text);
        this.clocks.push(this.add.container(p.x, p.y, [face, hand, text]).setDepth(p.y).setVisible(false));
      });
      this.ink = this.add.graphics().setDepth(1000);
      this.shadow = this.add.ellipse(0, 0, 48, 13, 0x172f3d, .25);
      this.player = new Avatar(this, bridge.state.pos.x, bridge.state.pos.y, BOUNDS);
      this.prompt = this.add.text(0, 0, "", { fontFamily: "Arial", fontSize: "17px", color: "#253846", backgroundColor: "#f5eedc", padding: { x: 12, y: 8 } }).setOrigin(.5).setDepth(2000);
      this.marker = this.add.text(GOAL.x, GOAL.y - 50, "◇", { fontFamily: "Arial", fontSize: "54px", color: "#c2f0d8" }).setOrigin(.5).setDepth(1000);
      this.cameras.main.setBounds(0, 0, 1140, 760);
      this.input.on("pointerdown", (pointer: Phaser.Input.Pointer) => {
        if (bridge.paused) return;
        const world = this.cameras.main.getWorldPoint(pointer.x, pointer.y);
        const clicked = CLOCKS.findIndex(c => Math.hypot(world.x - c.x, world.y - (c.y - 23)) < 62);
        if (clicked >= 0 && nearestClock(bridge.state) === clicked) act(bridge.state, "interact");
      });
      this.game.canvas.dataset.ready = "true"; ready();
    }
    update(now: number, delta: number) {
      if (!this.player) return;
      const s = bridge.state, reduced = bridge.settings.reduced, dt = bridge.paused ? 0 : Math.min(.05, delta / 1000);
      if (this.lastState !== s) { this.lastState = s; this.lastPhase = -1; this.lastEvent = s.eventId; this.trail = []; }
      const before = { ...s.pos };
      if (!bridge.paused) tick(s, dt, bridge.input, bridge.settings);
      if (s.phase !== this.lastPhase) {
        this.lastPhase = s.phase; this.phaseAge = 0; this.trail = [];
        this.angles = s.clocks.map(v => v * Math.PI / 2 - Math.PI / 2);
        this.lastSize = "";
      }
      this.phaseAge += dt;
      const reveal = reduced ? 1 : Math.min(1, this.phaseAge / .55);
      const eased = 1 - (1 - reveal) ** 3;
      this.clocks.forEach((clock, i) => {
        clock.setVisible(s.phase === 1).setAlpha(eased).setScale(reduced ? 1 : .88 + .12 * eased);
        const target = s.clocks[i] * Math.PI / 2 - Math.PI / 2;
        this.angles[i] += Math.atan2(Math.sin(target - this.angles[i]), Math.cos(target - this.angles[i])) * (reduced ? 1 : 1 - Math.exp(-dt * 15));
        const g = this.clockHands[i]; g.clear(); const correct = s.clocks[i] === GOALS[i];
        g.lineStyle(2, 0x9ea8a3).lineBetween(0, -23, 0, -56);
        g.lineStyle(5, correct ? 0x398477 : 0x314b60).lineBetween(0, -23, Math.cos(this.angles[i]) * 31, -23 + Math.sin(this.angles[i]) * 31);
        g.fillStyle(0x314b60).fillCircle(0, -23, 5);
        if (correct) g.lineStyle(4, 0xa3e0bc).strokeCircle(0, -23, 61);
        if (s.observing && !correct) { const a = GOALS[i] * Math.PI / 2 - Math.PI / 2; g.lineStyle(5, 0xe7b475).beginPath().arc(0, -23, 62, a - .2, a + .2).strokePath(); }
      });
      const traveled = Math.hypot(s.pos.x - before.x, s.pos.y - before.y);
      const facing = Math.abs(s.facing.x) > Math.abs(s.facing.y) ? s.facing.x < 0 ? 1 : 2 : s.facing.y < 0 ? 3 : 0;
      this.player.setPosition(s.pos.x, s.pos.y).setDepth(s.pos.y);
      this.player.animate(facing, traveled > 80 ? 0 : traveled, s.pos.x - before.x, dt, s.time, s.dodge > 0, reduced, s.invulnerable > 0);
      this.shadow.setPosition(s.pos.x, s.pos.y).setDepth(s.pos.y - 1);
      const size = `${this.scale.width}:${this.scale.height}:${reduced}`;
      if (this.lastSize !== size) {
        this.lastSize = size;
        const zoom = Math.max(.65, Math.min(this.scale.width / 1140, this.scale.height / 760));
        this.cameras.main.setZoom(zoom).startFollow(this.player, false, reduced ? 1 : .16, reduced ? 1 : .16, 0, 30);
      }
      if (traveled > 80) this.cameras.main.centerOn(s.pos.x, s.pos.y - 30);
      this.cameras.main.setLerp(reduced ? 1 : 1 - Math.exp(-dt * 12));
      for (const event of s.events) if (event.id > this.lastEvent) {
        this.lastEvent = event.id; this.effectAt = event.at; this.effectKind = event.kind; this.effectTime = .45;
        if (event.kind === "hurt") this.player.react("damage");
      }
      this.effectTime = Math.max(0, this.effectTime - dt);
      this.marker.setVisible(s.phase === 2).setAlpha(eased).setY(GOAL.y - 50 - (reduced ? 0 : Math.sin(s.time * 2) * 3));
      const near = nearestClock(s);
      this.prompt.setVisible(near >= 0 && s.clocks[near] !== GOALS[near] && !bridge.paused);
      if (near >= 0) this.prompt.setPosition(CLOCKS[near].x, CLOCKS[near].y + 83).setText(bridge.lang === "pt" ? "E · Ajustar" : bridge.lang === "es" ? "E · Ajustar" : "E · Adjust");
      this.draw(s, reduced, eased, dt);
      if (now - this.lastPublish > 100) { this.lastPublish = now; bridge.publish(this.game.loop.actualFps); }
    }
    draw(s: State, reduced: boolean, reveal: number, dt: number) {
      const g = this.ink; g.clear();
      if (s.phase === 2) {
        GATES.forEach((x, i) => {
          const live = gateLive(s.time, i), phase = (s.time + i * .55) % 3.2;
          g.fillStyle(live ? 0xe79786 : 0xbad5d8, (live ? .65 : .12) * reveal).fillRoundedRect(x - 18, 285, 36, 240, 16);
          g.lineStyle(2, live ? 0xf2b49f : 0xa5c5cc, reveal).strokeRoundedRect(x - 22, 281, 44, 248, 18);
          g.lineStyle(4, 0xf2c995, reveal).beginPath().arc(x, 256, 12, -Math.PI / 2, -Math.PI / 2 + Math.PI * 2 * Math.min(1, phase / 1.7)).strokePath();
        });
        g.lineStyle(2, 0xbae5cc, reveal).strokeEllipse(GOAL.x, GOAL.y + 10, 70, 25);
      }
      if (!reduced && s.dodge > 0 && dt > 0) { this.trail.push({ ...s.pos }); if (this.trail.length > 8) this.trail.shift(); }
      else if (dt > 0 || reduced) this.trail.shift();
      if (!reduced) this.trail.forEach((p, i) => g.fillStyle(0xcce8e2, i / 8 * .15).fillEllipse(p.x, p.y - 13, 30, 12));
      if (!reduced && this.effectTime > 0) {
        const f = this.effectTime / .45;
        g.lineStyle(2, this.effectKind === "hurt" ? 0xf5bcab : 0xcbe9c7, f * .7).strokeCircle(this.effectAt.x, this.effectAt.y, 18 + (1 - f) * 43);
      }
      if (s.phase === 3) g.lineStyle(3, 0xd5e9bf, .5).strokeEllipse(s.pos.x, s.pos.y + 2, 100, 35);
    }
  }
  const game = new Phaser.Game({ type: Phaser.AUTO, parent, width: parent.clientWidth, height: parent.clientHeight, antialias: true, pixelArt: false,
    scene: Guided, audio: { noAudio: true }, input: { keyboard: false, activePointers: 3 }, scale: { mode: Phaser.Scale.RESIZE }, fps: { target: 60 } });
  return () => game.destroy(true);
}
