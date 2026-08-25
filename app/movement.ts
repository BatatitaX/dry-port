export type Direction = "down" | "left" | "right" | "up";
export type MovementKey = "w" | "a" | "s" | "d" | "arrowup" | "arrowleft" | "arrowdown" | "arrowright";

export const WALK_CYCLE = [0, 1, 0, 2] as const;

const KEY_DIRECTIONS: Record<MovementKey, Direction> = {
  w: "up",
  arrowup: "up",
  a: "left",
  arrowleft: "left",
  s: "down",
  arrowdown: "down",
  d: "right",
  arrowright: "right",
};

export function isMovementKey(key: string): key is MovementKey {
  return key in KEY_DIRECTIONS;
}

export function movementVector(keys: ReadonlySet<string>) {
  let x = (keys.has("d") || keys.has("arrowright") ? 1 : 0) - (keys.has("a") || keys.has("arrowleft") ? 1 : 0);
  let y = (keys.has("s") || keys.has("arrowdown") ? 1 : 0) - (keys.has("w") || keys.has("arrowup") ? 1 : 0);
  const active = x !== 0 || y !== 0;
  if (active) {
    const length = Math.hypot(x, y);
    x /= length;
    y /= length;
  }
  return { x, y, active };
}

export function stableFacing(keys: ReadonlySet<string>, order: readonly MovementKey[], fallback: Direction): Direction {
  for (let index = order.length - 1; index >= 0; index -= 1) {
    const key = order[index];
    if (keys.has(key)) return KEY_DIRECTIONS[key];
  }
  return fallback;
}

export function walkFrameAt(now: number, sprinting: boolean) {
  const frameDuration = sprinting ? 92 : 155;
  return WALK_CYCLE[Math.floor(now / frameDuration) % WALK_CYCLE.length];
}
