/** Deterministic tutorial simulation. Coordinates are world pixels; time is seconds. */
export type Point = { x: number; y: number };
export type Action = "interact" | "observe" | "pulse" | "dodge";
export type Target = "lens" | "mirror0" | "mirror1" | "switch" | "drone" | "cell" | "telescope" | "journal";
export type Notice = "welcome" | "lens" | "observe" | "rotate" | "aligned" | "switch" | "drone" | "shield" | "hit" | "cell" | "complete" | "checkpoint" | "range" | "bell" | "secret" | "journal" | "needCell";
export const WORLD = { width: 1600, height: 1000 };
export const PLACES = {
  lens: { x: 415, y: 660 }, mirror0: { x: 700, y: 610 }, mirror1: { x: 930, y: 450 },
  switch: { x: 1030, y: 830 }, drone: { x: 1320, y: 590 }, cell: { x: 1320, y: 660 },
  telescope: { x: 1025, y: 375 }, journal: { x: 370, y: 440 },
} satisfies Record<Target, Point>;
export const BELLS = [{ x: 540, y: 510 }, { x: 585, y: 485 }, { x: 630, y: 510 }];
export const GOAL = [1, 2] as const;
export const SAVE_KEY = "dry-observatory-v1";
export const TEST_SAVE_KEY = "dry-observatory-test-v1";
export type Progress = { lens: boolean; mirrors: [number, number]; gateOff: boolean; droneDone: boolean; cell: boolean; complete: boolean; bells: number[]; secret: boolean };
export type State = Progress & {
  pos: Point; facing: Point; hp: number; energy: number; time: number; observing: boolean;
  dodge: number; dodgeCooldown: number; pulseCooldown: number; invulnerable: number;
  droneActive: boolean; droneHp: number; droneClock: number; danger: Point | null;
  notice: Notice; noticeUntil: number; pulses: { from: Point; to: Point; life: number }[];
};
export type Settings = { speed: number; dodgeDuration: number; invincible: boolean; assist: boolean; reduced: boolean; autoAim: boolean; overview: boolean; debug: boolean; sound: boolean };
export const DEFAULT_SETTINGS: Settings = { speed: 210, dodgeDuration: .24, invincible: false, assist: false, reduced: false, autoAim: true, overview: false, debug: false, sound: false };
export const distance = (a: Point, b: Point) => Math.hypot(a.x - b.x, a.y - b.y);
export const aligned = (s: Progress) => s.mirrors[0] === GOAL[0] && s.mirrors[1] === GOAL[1];
export function fresh(): State {
  return { pos: { x: 740, y: 840 }, facing: { x: 0, y: -1 }, hp: 3, energy: 100, time: 0, lens: false,
    mirrors: [0, 0], gateOff: false, droneDone: false, cell: false, complete: false, bells: [], secret: false,
    observing: false, dodge: 0, dodgeCooldown: 0, pulseCooldown: 0, invulnerable: 0,
    droneActive: false, droneHp: 3, droneClock: 0, danger: null, notice: "welcome", noticeUntil: 8, pulses: [] };
}
export function progress(s: State): Progress {
  return { lens: s.lens, mirrors: [...s.mirrors], gateOff: s.gateOff, droneDone: s.droneDone,
    cell: s.cell, complete: s.complete, bells: [...s.bells], secret: s.secret };
}
export function restore(raw: string | null): State {
  const s = fresh();
  try {
    const p = JSON.parse(raw || "null");
    if (!p || p.version !== 1 || typeof p.progress !== "object" || !p.progress) return s;
    const v = p.progress;
    s.lens = v.lens === true;
    if (s.lens && Array.isArray(v.mirrors) && v.mirrors.length === 2 && v.mirrors.every((n: unknown) => Number.isInteger(n) && Number(n) >= 0 && Number(n) <= 3)) s.mirrors = [...v.mirrors] as [number, number];
    s.gateOff = aligned(s) && v.gateOff === true;
    s.droneDone = aligned(s) && v.droneDone === true;
    s.cell = s.droneDone && v.cell === true;
    s.complete = s.cell && v.complete === true;
    s.bells = Array.isArray(v.bells) ? [...new Set<number>(v.bells.filter((n: unknown) => Number.isInteger(n) && Number(n) >= 0 && Number(n) < 3))] : [];
    s.secret = s.lens && v.secret === true;
    // Reload at a safe checkpoint, never inside a live attack or collision.
    if (s.lens) s.pos = { x: 510, y: 710 };
    if (s.droneDone) s.pos = { x: 1220, y: 750 };
    if (s.complete) s.pos = { x: 1025, y: 470 };
  } catch { /* Malformed or unavailable save starts safely. */ }
  return s;
}
export function serialize(s: State) { return JSON.stringify({ version: 1, progress: progress(s) }); }
export function notify(s: State, notice: Notice) { s.notice = notice; s.noticeUntil = s.time + 5; }
export function nearby(s: State): Target | null {
  const targets: Target[] = ["journal", "telescope"];
  if (!s.lens) targets.push("lens");
  else targets.push("mirror0", "mirror1");
  if (aligned(s)) targets.push("switch");
  if (aligned(s) && !s.droneDone) targets.push("drone");
  if (s.droneDone && !s.cell) targets.push("cell");
  return targets.sort((a, b) => distance(s.pos, PLACES[a]) - distance(s.pos, PLACES[b])).find(t => distance(s.pos, PLACES[t]) < (t === "drone" ? 170 : 105)) ?? null;
}
export function walkable(p: Point, s: State): boolean {
  if (!insideGround(p)) return false;
  for (const t of ["mirror0", "mirror1", "lens", "journal"] as const) if (distance(p, PLACES[t]) < 32) return false;
  // Gate closes the middle passage. The lower maintenance route is always available.
  if (p.x > 1080 && p.x < 1125 && p.y < 775 && !aligned(s)) return false;
  return true;
}
export const GROUND = [{ x: 260, y: 390 }, { x: 600, y: 355 }, { x: 1150, y: 355 }, { x: 1430, y: 425 }, { x: 1450, y: 770 }, { x: 1230, y: 870 }, { x: 900, y: 930 }, { x: 570, y: 830 }, { x: 280, y: 670 }, { x: 225, y: 500 }];
export function insideGround(p: Point) {
  let inside = false;
  for (let i = 0, j = GROUND.length - 1; i < GROUND.length; j = i++) {
    const a = GROUND[i], b = GROUND[j];
    if ((a.y > p.y) !== (b.y > p.y) && p.x < (b.x - a.x) * (p.y - a.y) / (b.y - a.y) + a.x) inside = !inside;
  }
  return inside;
}
export function act(s: State, action: Action, settings: Settings, aim?: Point) {
  if (action === "interact") {
    const t = nearby(s);
    if (!t) { notify(s, "range"); return; }
    if (t === "lens") { s.lens = true; notify(s, "lens"); }
    if (t === "mirror0" || t === "mirror1") {
      if (aligned(s)) { notify(s, "aligned"); return; }
      const i = t === "mirror0" ? 0 : 1; s.mirrors[i] = (s.mirrors[i] + 1) % 4;
      notify(s, aligned(s) ? "aligned" : "rotate");
    }
    if (t === "switch") { s.gateOff = !s.gateOff; notify(s, "switch"); }
    if (t === "drone" && !s.droneActive) { s.droneActive = true; s.droneClock = 0; s.droneHp = 3; notify(s, "drone"); }
    if (t === "cell") { s.cell = true; notify(s, "cell"); }
    if (t === "telescope") { if (s.cell) { s.complete = true; notify(s, "complete"); } else notify(s, "needCell"); }
    if (t === "journal") notify(s, "journal");
  }
  if (action === "observe" && s.lens) { s.observing = !s.observing; notify(s, "observe"); }
  if (action === "dodge" && s.dodgeCooldown <= 0 && s.energy >= 24) { s.dodge = settings.dodgeDuration; s.dodgeCooldown = .8; s.energy -= 24; }
  if (action === "pulse" && s.lens && s.pulseCooldown <= 0 && s.energy >= 12) {
    s.energy -= 12; s.pulseCooldown = .32;
    const targets = [...BELLS, ...(s.droneActive ? [PLACES.drone] : [])];
    const autoTarget = targets.filter(t => distance(s.pos, t) < 330).sort((a, b) => distance(a, s.pos) - distance(b, s.pos))[0];
    const dest = aim ?? (settings.autoAim && autoTarget ? autoTarget : { x: s.pos.x + s.facing.x * 330, y: s.pos.y + s.facing.y * 330 });
    const len = Math.max(1, distance(s.pos, dest));
    const direction = { x: (dest.x - s.pos.x) / len, y: (dest.y - s.pos.y) / len };
    s.facing = direction;
    const end = { x: s.pos.x + direction.x * Math.min(330, len), y: s.pos.y + direction.y * Math.min(330, len) };
    s.pulses.push({ from: { ...s.pos }, to: end, life: .2 });
    const hits = (p: Point) => { const d = distance(s.pos, p); return d < 330 && ((p.x - s.pos.x) * direction.x + (p.y - s.pos.y) * direction.y) / Math.max(d, 1) > .94; };
    BELLS.forEach((p, i) => { if (hits(p)) { if (!s.bells.includes(i)) s.bells.push(i); notify(s, "bell"); } });
    if (s.bells.length === 3 && !s.secret) { s.secret = true; notify(s, "secret"); }
    if (s.droneActive && hits(PLACES.drone)) {
      if (s.droneClock % 3.8 > 1.75) {
        s.droneHp--; notify(s, "hit");
        if (s.droneHp <= 0) { s.droneActive = false; s.droneDone = true; s.danger = null; notify(s, "cell"); }
      } else notify(s, "shield");
    }
  }
}
function hurt(s: State, settings: Settings) {
  if (s.invulnerable > 0 || s.dodge > 0 || settings.invincible || settings.assist) return;
  s.hp--; s.invulnerable = 1.3;
  if (s.hp <= 0) {
    s.pos = { x: 1015, y: 830 }; s.hp = 3; s.energy = 100; s.droneActive = false; s.droneHp = 3; s.droneClock = 0; s.danger = null;
    notify(s, "checkpoint");
  }
}
export function tick(s: State, seconds: number, input: Point, settings: Settings) {
  const dt = Math.max(0, Math.min(seconds, .05)); s.time += dt;
  s.energy = Math.min(100, s.energy + dt * 19);
  for (const key of ["dodgeCooldown", "pulseCooldown", "invulnerable"] as const) s[key] = Math.max(0, s[key] - dt);
  const length = Math.hypot(input.x, input.y);
  const dir = s.dodge > 0 ? s.facing : length > 0 ? { x: input.x / Math.max(1, length), y: input.y / Math.max(1, length) } : { x: 0, y: 0 };
  if (length > 0 && s.dodge <= 0) s.facing = { x: input.x / length, y: input.y / length };
  const speed = settings.speed * (s.dodge > 0 ? 3.3 : 1);
  const steps = Math.max(1, Math.ceil(speed * dt / 8));
  for (let i = 0; i < steps; i++) {
    const x = { x: s.pos.x + dir.x * speed * dt / steps, y: s.pos.y };
    if (walkable(x, s)) s.pos.x = x.x;
    const y = { x: s.pos.x, y: s.pos.y + dir.y * speed * dt / steps };
    if (walkable(y, s)) s.pos.y = y.y;
  }
  if (aligned(s) && !s.gateOff && s.pos.x > 1070 && s.pos.x < 1135 && s.pos.y < 775 && s.time % 3 > 1.9) hurt(s, settings);
  if (s.droneActive) {
    const before = s.droneClock % 3.8; s.droneClock += dt; const phase = s.droneClock % 3.8;
    if (s.danger === null && phase < 1.5) s.danger = { ...s.pos };
    if (before < 1.5 && phase >= 1.5 && s.danger && distance(s.pos, s.danger) < 90) hurt(s, settings);
    if (phase > 1.75) s.danger = null;
  }
  s.dodge = Math.max(0, s.dodge - dt);
  s.pulses = s.pulses.filter(p => (p.life -= dt) > 0);
}
export function stage(s: Progress): number { return !s.lens ? 0 : !aligned(s) ? 1 : !s.droneDone ? 2 : !s.cell ? 3 : !s.complete ? 4 : 5; }
export function resetChallenge(s: State, target: "puzzle" | "drone" | "all"): State {
  if (target === "all") return fresh();
  const next = restore(serialize(s));
  next.complete = false; next.cell = false; next.droneDone = false; next.lens = true;
  if (target === "puzzle") { next.mirrors = [0, 0]; next.gateOff = false; next.pos = { x: 585, y: 680 }; }
  else { next.mirrors = [1, 2]; next.gateOff = true; next.pos = { x: 1220, y: 740 }; }
  return next;
}
