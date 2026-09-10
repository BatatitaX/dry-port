import test from "node:test";
import assert from "node:assert/strict";
import { act, aligned, BELLS, DEFAULT_SETTINGS as prefs, fresh, nearby, PLACES, progress, resetChallenge, restore, serialize, stage, tick, walkable } from "../app/game/tutorial/model.ts";

function advance(s, seconds, input = { x: 0, y: 0 }, options = prefs) {
  for (let i = 0; i < Math.round(seconds * 60); i++) tick(s, 1 / 60, input, options);
}
function approach(s, target) { s.pos = { x: PLACES[target].x, y: PLACES[target].y + 65 }; }
function solve(s) {
  approach(s, "lens"); act(s, "interact", prefs);
  approach(s, "mirror0"); act(s, "interact", prefs);
  approach(s, "mirror1"); act(s, "interact", prefs); act(s, "interact", prefs);
}

test("complete tutorial: proximity, lens, independent reflectors, shield, pulse, cell and telescope", () => {
  const s = fresh();
  assert.equal(nearby(s), null);
  act(s, "interact", prefs); assert.equal(s.lens, false);
  solve(s); assert.equal(aligned(s), true); assert.equal(stage(s), 2);
  // Solved reflectors remain locked so later exploration cannot invalidate progress.
  act(s, "interact", prefs); assert.equal(aligned(s), true);
  approach(s, "drone"); act(s, "interact", prefs);
  assert.equal(s.droneActive, true);
  act(s, "pulse", prefs, PLACES.drone); assert.equal(s.droneHp, 3);
  advance(s, .6, { x: -1, y: 0 }); // Move out of the telegraph and keep within pulse range.
  advance(s, 1.4);
  assert.equal(s.hp, 3);
  for (let i = 0; i < 3; i++) { act(s, "pulse", prefs, PLACES.drone); advance(s, .4); }
  assert.equal(s.droneDone, true); assert.equal(s.droneActive, false);
  approach(s, "telescope"); act(s, "interact", prefs); assert.equal(s.complete, false);
  approach(s, "cell"); act(s, "interact", prefs); assert.equal(s.cell, true);
  approach(s, "telescope"); act(s, "interact", prefs); assert.equal(s.complete, true);
  assert.equal(stage(restore(serialize(s))), 5);
});

test("diagonal movement is normalized, large frame delays are capped, movement respects geometry", () => {
  const a = fresh(), b = fresh(); a.pos = { x: 700, y: 720 }; b.pos = { ...a.pos };
  const start = { ...a.pos }; advance(a, .3, { x: 1, y: 0 }); advance(b, .3, { x: 1, y: 1 });
  assert.ok(Math.abs(Math.hypot(a.pos.x-start.x,a.pos.y-start.y)-Math.hypot(b.pos.x-start.x,b.pos.y-start.y)) < .01);
  const before = { ...a.pos }; tick(a, 100, { x: 1, y: 0 }, prefs);
  assert.ok(Math.hypot(a.pos.x-before.x,a.pos.y-before.y) <= prefs.speed*.05+.01);
  a.pos = { x: 1060, y: 600 }; advance(a, 1, { x: 1, y: 0 });
  assert.ok(a.pos.x <= 1080); assert.equal(walkable(a.pos, a), true);
  const stopped = { ...a.pos }; advance(a, .5); assert.deepEqual(a.pos, stopped);
});

test("every required interaction has a reachable approach, including the safe lower passage", () => {
  const s = fresh();
  // Flood fill validates actual collision rules rather than teleporting through scenery.
  const visited = new Set(), queue = [{ x: 740, y: 840 }];
  while (queue.length) {
    const p = queue.shift(), key = `${p.x},${p.y}`;
    if (visited.has(key) || !walkable(p, s)) continue;
    visited.add(key);
    queue.push({ x:p.x+10,y:p.y },{ x:p.x-10,y:p.y },{ x:p.x,y:p.y+10 },{ x:p.x,y:p.y-10 });
  }
  for (const [name, point] of Object.entries(PLACES)) {
    assert.ok([...visited].some(key => { const [x,y] = key.split(",").map(Number); return Math.hypot(x-point.x,y-point.y) < 90; }), `${name} must be reachable`);
  }
});

test("hazard warns before damage, dodge avoids it, death restores checkpoint without losing puzzle", () => {
  const s = fresh(); solve(s); approach(s, "drone"); act(s, "interact", prefs);
  advance(s, 1.4); assert.equal(s.hp, 3); assert.ok(s.danger);
  act(s, "dodge", prefs); advance(s, .2); assert.equal(s.hp, 3);
  s.hp = 1; s.invulnerable = 0; s.dodge = 0; s.droneClock = 0; s.danger = null;
  advance(s, 1.6);
  assert.equal(s.hp, 3); assert.equal(s.droneActive, false); assert.equal(s.notice, "checkpoint"); assert.equal(aligned(s), true);
});

test("assisted mode prevents damage but preserves shield timing", () => {
  const s = fresh(); solve(s); approach(s, "drone"); act(s, "interact", prefs);
  const assist = { ...prefs, assist: true }; act(s, "pulse", assist, PLACES.drone);
  assert.equal(s.droneHp, 3); advance(s, 1.6, { x: 0, y: 0 }, assist); assert.equal(s.hp, 3);
});

test("corrupt saves are safe, impossible progress is rejected and lab resets are independent", () => {
  for (const raw of [null, "{broken", "null", "[]", '{"version":9}', '{"version":1,"progress":null}']) assert.equal(stage(restore(raw)), 0);
  assert.equal(stage(restore(JSON.stringify({ version:1, progress:{ complete:true, cell:true, droneDone:true, mirrors:[1,2] } }))),0);
  const normal = fresh(); solve(normal); const original = progress(normal);
  const lab = resetChallenge(normal, "drone"); lab.pos.x += 50;
  assert.deepEqual(progress(normal), original);
  assert.equal(resetChallenge(lab,"all").lens,false);
  assert.equal(restore(serialize(normal)).lens,true);
});

test("bells require a pulse in range and the three discoveries survive a reload", () => {
  const s = fresh(); s.lens = true;
  act(s,"pulse",prefs,BELLS[0]); assert.equal(s.bells.length,0);
  for (const p of BELLS) { s.pos={ x:p.x,y:p.y+120 }; advance(s,.8); act(s,"pulse",prefs,p); }
  assert.equal(s.secret,true); assert.deepEqual(restore(serialize(s)).bells.sort(),[0,1,2]);
});

test("feedback reflects accepted actions and distinguishes shield, hit and blast", () => {
  const s = fresh();
  act(s, "pulse", prefs); assert.equal(s.effects.length, 0);
  solve(s); approach(s, "drone"); act(s, "interact", prefs);
  act(s, "pulse", prefs, PLACES.drone);
  assert.ok(s.effects.some(e => e.kind === "shield"));
  const count = s.effectId; act(s, "pulse", prefs, PLACES.drone);
  assert.equal(s.effectId, count, "cooldown cannot generate another muzzle flash or sound");
  advance(s, 2, { x: 0, y: 0 }, { ...prefs, assist: true });
  assert.ok(s.effects.some(e => e.kind === "blast"), "a missed/assisted blast still has visual feedback");
  act(s, "pulse", prefs, PLACES.drone);
  assert.ok(s.effects.some(e => e.kind === "hit"));
  assert.ok(s.pulses.at(-1).from.y < s.pos.y - 45, "beam originates at the held Lens, not the feet");
  for (let i = 0; i < 50; i++) act(s, "observe", prefs);
  assert.ok(s.effects.length <= 32); assert.equal(restore(serialize(s)).effects.length, 0);
});
