import * as Phaser from "phaser";
import type { GameEffect, Point } from "./model";

type Particle = Point & { vx: number; vy: number; age: number; life: number; size: number; color: number };
type Ring = Point & { age: number; life: number; radius: number; color: number; grow: number };
type Ghost = { sprite: Phaser.GameObjects.Image; age: number; life: number };
const CYAN = 0xa6f4ed, GOLD = 0xf4cc95, CORAL = 0xff9b88;

/** Fixed capacities avoid allocating GameObjects or unbounded tweens during gameplay. */
export class Effects {
  private particles: Particle[] = [];
  private rings: Ring[] = [];
  private graphics: Phaser.GameObjects.Graphics;
  private ghosts: Ghost[];
  private ghostIndex = 0;
  private ghostClock = 0;
  private stepDistance = 0;
  constructor(scene: Phaser.Scene) {
    this.graphics = scene.add.graphics().setDepth(2100);
    this.ghosts = Array.from({ length: 6 }, () => ({ sprite: scene.add.image(0, 0, "dry-atlas", "avatar-0").setOrigin(.5, 1).setVisible(false).setTint(0x9adce8), age: 1, life: .22 }));
  }
  clear() { this.particles = []; this.rings = []; this.stepDistance = 0; this.ghostClock = 0; this.ghosts.forEach(g => g.sprite.setVisible(false)); this.graphics.clear(); }
  private ring(at: Point, radius: number, color: number, life = .5, grow = 45) {
    if (this.rings.length >= 18) this.rings.shift();
    this.rings.push({ ...at, age: 0, life, radius, color, grow });
  }
  private burst(at: Point, color: number, count: number, speed = 75) {
    for (let i = 0; i < count && this.particles.length < 120; i++) {
      const angle = i / count * Math.PI * 2 + Math.random() * .4;
      this.particles.push({ ...at, vx: Math.cos(angle) * speed * (.5 + Math.random() * .5), vy: Math.sin(angle) * speed - 15, age: 0, life: .35 + Math.random() * .4, size: 1.4 + Math.random() * 1.8, color });
    }
  }
  emit(effect: GameEffect, reduced: boolean) {
    if (reduced) return;
    const { kind, at } = effect;
    switch (kind) {
      case "pulse": this.ring(at, 5, CYAN, .22, 18); this.burst(at, CYAN, 4, 35); break;
      case "dodge": this.burst(at, GOLD, 7, 40); break;
      case "observe": this.ring(at, 25, GOLD, .8, 220); break;
      case "mirror": this.burst(at, GOLD, 6, 32); break;
      case "aligned": this.ring(at, 20, CYAN, 1, 80); this.burst(at, CYAN, 18); break;
      case "bell": this.ring(at, 10, GOLD, .7, 32); this.ring(at, 15, CYAN, .9, 40); break;
      case "shield": this.ring(at, 47, GOLD, .25, 9); this.burst(at, GOLD, 9, 60); break;
      case "hit": this.ring(at, 12, CYAN, .3, 33); this.burst(at, CYAN, 16, 95); break;
      case "droneDown": this.ring(at, 30, GOLD, .8, 85); this.burst(at, GOLD, 24, 100); break;
      case "damage": this.burst(at, CORAL, 7, 40); break;
      case "collect": this.ring(at, 14, GOLD, .6, 38); this.burst(at, GOLD, 14, 60); break;
      case "complete": this.ring(at, 30, GOLD, 1.6, 180); this.burst({ x: at.x, y: at.y - 130 }, GOLD, 32, 115); break;
      case "blast": this.ring(at, 86, CORAL, .28, 4); this.burst(at, CORAL, 14, 130); break;
      case "checkpoint": this.ring(at, 15, CYAN, .6, 45); break;
    }
  }
  update(seconds: number, pos: Point, distance: number, dash: boolean, frame: string, reduced: boolean) {
    if (reduced) { this.clear(); return; }
    const dt = seconds;
    this.ghostClock += dt; this.stepDistance += dash ? 0 : distance;
    if (this.stepDistance > 28) { this.stepDistance %= 28; this.burst({ x: pos.x, y: pos.y - 1 }, 0xcab29a, 2, 12); }
    if (dash && this.ghostClock > .035) {
      this.ghostClock = 0;
      const ghost = this.ghosts[this.ghostIndex++ % this.ghosts.length]; ghost.age = 0;
      ghost.sprite.setFrame(frame).setPosition(pos.x, pos.y).setDepth(pos.y - 1).setScale(140 / ghost.sprite.height).setVisible(true);
    }
    for (const ghost of this.ghosts) { ghost.age += dt; ghost.sprite.setAlpha(Math.max(0, 1 - ghost.age / ghost.life) * .24); if (ghost.age >= ghost.life) ghost.sprite.setVisible(false); }
    const g = this.graphics; g.clear();
    this.particles = this.particles.filter(p => p.age < p.life);
    for (const p of this.particles) {
      p.age += dt; p.x += p.vx * dt; p.y += p.vy * dt; p.vy += 18 * dt;
      g.fillStyle(p.color, Math.max(0, 1 - p.age / p.life) * .8).fillCircle(p.x, p.y, p.size);
    }
    this.rings = this.rings.filter(r => r.age < r.life);
    for (const r of this.rings) {
      r.age += dt; const progress = Math.min(1, r.age / r.life), ease = 1 - (1 - progress) ** 3;
      g.lineStyle(2 * (1 - progress) + .4, r.color, (1 - progress) * .65).strokeCircle(r.x, r.y, r.radius + ease * r.grow);
    }
  }
}
