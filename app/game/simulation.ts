import { movementVector } from "../movement";
import type { Point } from "./data";
import { isWalkable, WALK_SPEED } from "./world";

/** Substeps prevent tunnelling. Y is tested against the already accepted X. */
export function advancePosition(position: Point, keys: ReadonlySet<string>, deltaMs: number, bossDefeated: boolean): Point {
  const vector = movementVector(keys);
  if (!vector.active) return position;
  const distance = WALK_SPEED * (keys.has("shift") ? 2 : 1) * Math.min(Math.max(deltaMs, 0), 50) / 1000;
  const count = Math.max(1, Math.ceil(distance / 3));
  let next = position;
  for (let i = 0; i < count; i++) {
    const x = { x: next.x + vector.x * distance / count, y: next.y };
    if (isWalkable(x, bossDefeated)) next = x;
    const y = { x: next.x, y: next.y + vector.y * distance / count };
    if (isWalkable(y, bossDefeated)) next = y;
  }
  return next;
}
