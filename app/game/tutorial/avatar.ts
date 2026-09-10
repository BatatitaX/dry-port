import * as Phaser from "phaser";

// Bounds of the four approved illustrations, excluding transparent margins.
const BOUNDS = [[109, 14, 432, 806], [126, 15, 408, 808], [71, 17, 359, 808], [42, 14, 367, 792]];

/** Small cutout rig: upper body overlaps the leg joints, feet share a world anchor. */
export class Avatar extends Phaser.GameObjects.Container {
  private torso: Phaser.GameObjects.Image;
  private legs: Phaser.GameObjects.Image[];
  private idle: Phaser.GameObjects.Image;
  private stride = 0;
  private blend = 0;
  private lean = 0;
  private widths: number[] = [];
  private recoil = 0;
  private hurt = 0;
  frame = "avatar-0";

  constructor(scene: Phaser.Scene, x: number, y: number) {
    super(scene, x, y);
    const texture = scene.textures.get("dry-atlas");
    const cell = Math.floor(texture.getSourceImage().width / 4);
    BOUNDS.forEach(([left, top, right, bottom], i) => {
      const w = right - left, h = bottom - top, split = Math.floor(w / 2);
      const hip = Math.floor(h * .62), overlap = Math.floor(h * .66);
      texture.add(`avatar-${i}`, 0, i * cell + left, top, w, h);
      texture.add(`body-${i}`, 0, i * cell + left, top, w, overlap);
      texture.add(`leg-${i}-0`, 0, i * cell + left, top + hip, split, h - hip);
      texture.add(`leg-${i}-1`, 0, i * cell + left + split, top + hip, w - split, h - hip);
      this.widths.push(w * 140 / h);
    });
    this.legs = [0, 1].map(() => scene.add.image(0, -53.2, "dry-atlas", "leg-0-0").setOrigin(.5, 0));
    this.torso = scene.add.image(0, -47.6, "dry-atlas", "body-0").setOrigin(.5, 1);
    this.idle = scene.add.image(0, 0, "dry-atlas", "avatar-0").setOrigin(.5, 1);
    this.add([...this.legs, this.torso, this.idle]);
    scene.add.existing(this);
  }

  react(kind: "pulse" | "damage") { if (kind === "pulse") this.recoil = .18; else this.hurt = .35; }

  animate(direction: number, distance: number, dx: number, seconds: number, time: number, dash: boolean, reduced: boolean, invulnerable: boolean) {
    this.frame = `avatar-${direction}`;
    const moving = distance > .015;
    this.stride += dash ? 0 : distance / 15;
    const smoothing = 1 - Math.exp(-seconds * 18);
    this.blend += ((moving ? 1 : 0) - this.blend) * smoothing;
    this.lean += ((moving ? Math.sign(dx) * (dash ? 7 : 1.5) : 0) - this.lean) * smoothing;
    this.recoil = Math.max(0, this.recoil - seconds); this.hurt = Math.max(0, this.hurt - seconds);
    const rig = !reduced && !dash && this.blend > .03;
    const width = this.widths[direction];
    this.idle.setFrame(this.frame).setDisplaySize(width, 140).setVisible(!rig);
    this.torso.setFrame(`body-${direction}`).setDisplaySize(width, 92.4).setVisible(rig);
    this.legs.forEach((leg, i) => {
      const step = Math.sin(this.stride + i * Math.PI) * this.blend;
      leg.setFrame(`leg-${direction}-${i}`).setDisplaySize(width / 2, 53.2).setVisible(rig);
      leg.setPosition((i === 0 ? -1 : 1) * width / 4, -53.2 - Math.max(0, step) * 1.7);
      leg.setAngle(step * (direction === 0 || direction === 3 ? 5 : 8));
    });
    this.torso.setAngle(rig ? Math.sin(this.stride) * .8 * this.blend : 0);
    const breathe = !reduced && !moving ? Math.sin(time * 1.7) * .003 : 0;
    const cast = !reduced ? Math.sin(this.recoil / .18 * Math.PI) * .015 : 0;
    this.setScale(1 + cast, 1 + breathe - cast);
    this.setAngle(reduced ? 0 : this.lean);
    this.setAlpha(invulnerable ? .72 : 1);
    const tint = this.hurt > 0 ? 0xffb6a2 : 0xffffff;
    this.idle.setTint(tint); this.torso.setTint(tint); this.legs.forEach(leg => leg.setTint(tint));
  }
}
