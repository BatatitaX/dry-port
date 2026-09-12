export type Point = { x: number; y: number };
export type Phase = 0 | 1 | 2 | 3;
export type Event = { id: number; kind: "step" | "clock" | "dodge" | "hurt" | "finish"; at: Point };
export type State = { phase: Phase; pos: Point; velocity: Point; facing: Point; directions: number; walked: number;
  clocks: [number, number]; time: number; dodge: number; cooldown: number; observing: boolean;
  transition: number; invulnerable: number; hits: number; eventId: number; events: Event[] };
export type Settings = { reduced: boolean; assist: boolean; speed: number };
export const DEFAULTS: Settings = { reduced: false, assist: false, speed: 220 };
export const KEY = "dry-guided-tutorial-v2", LAB_KEY = "dry-guided-lab-v2";
export const CLOCKS = [{ x: 415, y: 380 }, { x: 735, y: 380 }];
export const GOALS = [1, 3];
export const GATES = [440, 640, 840];
export const GOAL = { x: 970, y: 410 };
export const distance = (a: Point, b: Point) => Math.hypot(a.x - b.x, a.y - b.y);
export function fresh(phase: Phase = 0): State {
  return { phase, pos: phase === 2 ? { x: 240, y: 410 } : { x: 575, y: 540 }, velocity: { x: 0, y: 0 }, facing: { x: 0, y: 1 },
    directions: phase ? 15 : 0, walked: 0, clocks: phase > 1 ? [1, 3] : [0, 0], time: 0, dodge: 0, cooldown: 0,
    observing: false, transition: 0, invulnerable: 0, hits: 0, eventId: 0, events: [] };
}
function emit(s: State, kind: Event["kind"], at = s.pos) {
  s.events.push({ id: ++s.eventId, kind, at: { ...at } }); if (s.events.length > 16) s.events.shift();
}
function next(s: State, phase: Phase) {
  s.phase = phase; s.transition = .65; s.velocity = { x: 0, y: 0 }; s.dodge = 0; s.observing = false;
  if (phase === 1) s.pos = { x: 575, y: 540 };
  if (phase === 2) s.pos = { x: 240, y: 410 };
  emit(s, phase === 3 ? "finish" : "step");
}
export function nearestClock(s: State) {
  if (s.phase !== 1) return -1;
  return CLOCKS.findIndex(p => distance(s.pos, p) < 126);
}
export function act(s: State, action: "interact" | "observe" | "dodge") {
  if (s.transition > 0) return;
  if (action === "interact") {
    const i = nearestClock(s);
    if (i < 0 || s.clocks[i] === GOALS[i]) return;
    s.clocks[i] = (s.clocks[i] + 1) % 4; emit(s, "clock", CLOCKS[i]);
    if (s.clocks.every((v, j) => v === GOALS[j])) next(s, 2);
  }
  if (action === "observe" && s.phase === 1) s.observing = !s.observing;
  if (action === "dodge" && s.phase === 2 && s.cooldown <= 0) { s.dodge = .23; s.cooldown = .9; emit(s, "dodge"); }
}
export function gateLive(time: number, index: number) { return (time + index * .55) % 3.2 >= 1.7; }
export function walkable(p: Point, phase: Phase) {
  if (p.x < 105 || p.x > 1035 || p.y < 190 || p.y > 650) return false;
  return phase !== 1 || CLOCKS.every(c => distance(c, p) > 52);
}
export function tick(s: State, seconds: number, input: Point, settings: Settings) {
  const dt = Math.max(0, Math.min(.05, seconds));
  if (s.transition > 0) { s.transition = Math.max(0, s.transition - dt); return; }
  s.time += dt; s.cooldown = Math.max(0, s.cooldown - dt); s.invulnerable = Math.max(0, s.invulnerable - dt);
  const length = Math.hypot(input.x, input.y), dir = { x: input.x / Math.max(1, length), y: input.y / Math.max(1, length) };
  const moving = length > .1;
  if (moving && s.dodge <= 0) s.facing = { x: input.x / length, y: input.y / length };
  const ease = 1 - Math.exp(-dt * (moving ? 24 : 30));
  s.velocity.x += (dir.x * settings.speed - s.velocity.x) * ease;
  s.velocity.y += (dir.y * settings.speed - s.velocity.y) * ease;
  if (!moving && Math.hypot(s.velocity.x, s.velocity.y) < 1) s.velocity = { x: 0, y: 0 };
  const velocity = s.dodge > 0 ? { x: s.facing.x * 720, y: s.facing.y * 720 } : s.velocity;
  const before = { ...s.pos }, steps = Math.max(1, Math.ceil(Math.hypot(velocity.x, velocity.y) * dt / 7));
  for (let i = 0; i < steps; i++) {
    const x = { x: s.pos.x + velocity.x * dt / steps, y: s.pos.y }; if (walkable(x, s.phase)) s.pos.x = x.x;
    const y = { x: s.pos.x, y: s.pos.y + velocity.y * dt / steps }; if (walkable(y, s.phase)) s.pos.y = y.y;
  }
  const traveled = distance(before, s.pos);
  if (s.phase === 0 && traveled > .01) {
    if (dir.y < -.4) s.directions |= 1; if (dir.x < -.4) s.directions |= 2;
    if (dir.y > .4) s.directions |= 4; if (dir.x > .4) s.directions |= 8;
    s.walked += traveled;
    if (s.directions === 15 && s.walked > 160) next(s, 1);
  }
  if (s.phase === 2) {
    if (!settings.assist && s.invulnerable <= 0 && s.dodge <= 0 && s.pos.y > 285 && s.pos.y < 525 && GATES.some((x, i) => Math.abs(s.pos.x - x) < 24 && gateLive(s.time, i))) {
      s.hits++; emit(s, "hurt"); s.invulnerable = 1.3; s.pos = { x: 240, y: 410 }; s.velocity = { x: 0, y: 0 };
    }
    if (distance(s.pos, GOAL) < 55) next(s, 3);
  }
  s.dodge = Math.max(0, s.dodge - dt);
}
export function serialize(s: State) { return JSON.stringify({ version: 2, phase: s.phase, clocks: s.clocks }); }
export function restore(raw: string | null) {
  try {
    const p = JSON.parse(raw || "null");
    if (p?.version !== 2 || !Number.isInteger(p.phase) || p.phase < 0 || p.phase > 3) return fresh();
    const s = fresh(p.phase);
    if (p.phase === 1 && Array.isArray(p.clocks) && p.clocks.length === 2 && p.clocks.every((v: unknown) => Number.isInteger(v) && Number(v) >= 0 && Number(v) <= 3)) {
      s.clocks = [...p.clocks] as [number, number];
      if (s.clocks.every((v, i) => v === GOALS[i])) return fresh(2);
    }
    return s;
  } catch { return fresh(); }
}
