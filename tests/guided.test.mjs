import test from "node:test";
import assert from "node:assert/strict";
import { act, CLOCKS, DEFAULTS, fresh, gateLive, KEY, LAB_KEY, restore, serialize, tick, walkable } from "../app/game/guided/model.ts";
const advance = (s, seconds, input = { x: 0, y: 0 }, settings = DEFAULTS) => { for (let i = 0; i < Math.round(seconds * 120); i++) tick(s, 1 / 120, input, settings); };
test("empty beginning requires actual movement in four directions before clocks exist", () => {
  const s = fresh(); act(s, "interact"); act(s, "dodge"); assert.equal(s.phase, 0); assert.equal(s.dodge, 0);
  for (const input of [{x:0,y:-1},{x:-1,y:0},{x:0,y:1}]) advance(s,.4,input);
  assert.equal(s.phase,0); advance(s,.4,{x:1,y:0}); assert.equal(s.phase,1);
  assert.equal(s.clocks[0],0); assert.equal(s.transition > 0,true);
});
test("clock puzzle alone unlocks dodge; far interaction and early dodge do nothing", () => {
  const s = fresh(1); act(s,"interact"); assert.deepEqual(s.clocks,[0,0]); act(s,"dodge"); assert.equal(s.dodge,0);
  s.pos={x:CLOCKS[0].x,y:CLOCKS[0].y+80}; act(s,"interact"); assert.equal(s.phase,1);
  s.pos={x:CLOCKS[1].x,y:CLOCKS[1].y+80}; for(let i=0;i<3;i++)act(s,"interact");
  assert.equal(s.phase,2); assert.deepEqual(s.pos,{x:240,y:410});
  act(s,"dodge");assert.equal(s.dodge,0);advance(s,.7);act(s,"dodge");assert.ok(s.dodge>0);
});
test("acceleration and braking are frame-rate independent and stop cleanly", () => {
  const a=fresh(),b=fresh();for(let i=0;i<60;i++)tick(a,1/60,{x:1,y:0},DEFAULTS);advance(b,1,{x:1,y:0});
  assert.ok(Math.abs(a.pos.x-b.pos.x)<2);advance(a,.5);assert.equal(a.velocity.x,0);
  const before=a.pos.x;advance(a,.3);assert.equal(a.pos.x,before);
});
test("clocks collide only during their own stage; dodge bypasses live gates", () => {
  assert.equal(walkable(CLOCKS[0],0),true);assert.equal(walkable(CLOCKS[0],1),false);assert.equal(walkable(CLOCKS[0],2),true);
  const s=fresh(2);s.time=2;assert.ok(gateLive(s.time,0));s.pos={x:400,y:410};s.facing={x:1,y:0};act(s,"dodge");advance(s,.2,{x:1,y:0});assert.equal(s.hits,0);assert.ok(s.pos.x>464);
  const hit=fresh(2);hit.time=2;hit.pos={x:440,y:410};advance(hit,.02);assert.equal(hit.hits,1);assert.equal(hit.pos.x,240);
});
test("the untimed lower route is reachable and completes the tutorial", () => {
  const s=fresh(2);advance(s,.8,{x:0,y:1});advance(s,.3);assert.ok(s.pos.y>525);
  advance(s,3.3,{x:1,y:0});advance(s,.3);advance(s,.7,{x:0,y:-1});
  assert.equal(s.hits,0);assert.equal(s.phase,3);
});
test("guided progress uses new independent keys and reloads a safe stage", () => {
  assert.notEqual(KEY,LAB_KEY);assert.notEqual(KEY,"dry-observatory-v1");
  for(const raw of [null,"broken","null",'{"version":2,"phase":99}'])assert.equal(restore(raw).phase,0);
  const s=fresh(1);s.clocks=[1,2];const loaded=restore(serialize(s));assert.deepEqual(loaded.clocks,[1,2]);assert.equal(loaded.phase,1);
  assert.equal(restore(serialize(fresh(2))).phase,2);assert.equal(restore(serialize(fresh(3))).phase,3);
});
