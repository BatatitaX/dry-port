import assert from "node:assert/strict";
import { readFileSync, readdirSync, existsSync } from "node:fs";
import test from "node:test";
import { movementVector, stableFacing, walkFrameAt } from "../app/movement.ts";
import { advancePosition } from "../app/game/simulation.ts";
import { takeBattleTurn } from "../app/game/battle.ts";
import { parseSave, writeSave, SAVE_KEY } from "../app/game/save.ts";
import { LANDMARKS, SCENERY, START_POS, WORLD_MEMORIES, isWalkable } from "../app/game/world.ts";
import { NPCS, POEMS, COMPUTER } from "../app/game/data.ts";
const root = new URL("../", import.meta.url);
const pngSize = path => { const b=readFileSync(new URL(path,root)); assert.equal(b.subarray(1,4).toString(),"PNG"); return [b.readUInt32BE(16), b.readUInt32BE(20)]; };

test("art contracts preserve sprite cells, portraits, buildings and all scenery", () => {
  assert.equal(LANDMARKS.length,10);
  for(const landmark of LANDMARKS) assert.deepEqual(pngSize(`public/world/structures/${landmark.id}.png`),[96,96]);
  for(const name of ['dry-baby','dry-teen','dry-adult','nilo','jao']) assert.deepEqual(pngSize(`public/characters/${name}.png`),[96,192]);
  assert.deepEqual(pngSize('public/memory-icons.png'),[96,72]);
  assert.deepEqual(pngSize('public/paper-poems-atlas.png'),[144,24]);
  for(const kind of new Set(SCENERY.map(item=>item.kind))) assert.ok(existsSync(new URL(`public/world/scenery/${kind}.png`,root)));
  for(const entry of readdirSync(new URL('public/',root),{recursive:true,withFileTypes:true}).filter(e=>e.isFile())) assert.doesNotMatch(entry.name,/(?:^|[-_])v\d+(?:[-_.]|$)/i);
});

test("WASD and arrows move equally; diagonal movement is normalized",()=>{
  const a=movementVector(new Set(['d','w'])); const b=movementVector(new Set(['arrowright','arrowup']));
  assert.deepEqual(a,b); assert.ok(Math.abs(Math.hypot(a.x,a.y)-1)<1e-10);
  assert.equal(movementVector(new Set(['a','d'])).active,false);
  assert.equal(stableFacing(new Set(['w','d']),['w','d'],'down'),'right');
  assert.equal(stableFacing(new Set(['w']),['w','d'],'right'),'up');
  assert.deepEqual([0,155,310,465].map(t=>walkFrameAt(t,false)),[0,1,0,2]);
});

test("movement respects speed, wall sliding and delta caps",()=>{
  const p={x:500,y:548};const right=advancePosition(p,new Set(['d']),50,false);
  assert.ok(Math.abs(right.x-p.x-6.4)<1e-6);
  assert.equal(advancePosition(p,new Set(),50,false),p);
  assert.deepEqual(advancePosition(p,new Set(['d']),50000,false),right);
  let wall={x:3468,y:548};for(let i=0;i<30;i++)wall=advancePosition(wall,new Set(['d','s','shift']),50,false);
  assert.ok(wall.x<=3475);assert.ok(wall.y>548);assert.ok(isWalkable(wall,false));
});

test("river blocks crossing outside the bridge; bridge allows traversal",()=>{
  assert.equal(isWalkable({x:1830,y:740},true),false);
  assert.equal(isWalkable({x:1830,y:830},true),true);
  let p={x:1770,y:830};for(let i=0;i<24;i++)p=advancePosition(p,new Set(['d']),50,true);
  assert.ok(p.x>1888);assert.equal(p.y,830);
});

test("buildings, solid scenery and NPC feet cannot be entered",()=>{
  assert.equal(isWalkable({x:360,y:250}),false);
  assert.equal(isWalkable({x:90,y:382}),false);
  assert.equal(isWalkable({x:3360,y:550},false),false);
  assert.equal(isWalkable({x:3360,y:550},true),true);
  assert.equal(isWalkable({x:-10,y:550},true),false);
});

test("all memories, characters, PC and poems can be reached by walking",()=>{
  // Flood fill on a conservative 12 px grid using actual collision rules.
  const step=12, cols=493, rows=85; const visited=new Set(); const queue=[];
  const seed=[Math.round(START_POS.x/step),Math.round(START_POS.y/step)];queue.push(seed);visited.add(seed.join(':'));
  for(let head=0;head<queue.length;head++){
    const [x,y]=queue[head];
    for(const [dx,dy] of [[1,0],[-1,0],[0,1],[0,-1]]){
      const nx=x+dx,ny=y+dy,key=`${nx}:${ny}`;
      if(nx<1||ny<1||nx>=cols||ny>=rows||visited.has(key)||!isWalkable({x:nx*step,y:ny*step},true))continue;
      visited.add(key);queue.push([nx,ny]);
    }
  }
  for(const target of [...WORLD_MEMORIES,...NPCS,...POEMS,{...COMPUTER,id:'computer'}]){
    const radius=POEMS.includes(target)?68:90;
    assert.ok(queue.some(([x,y])=>Math.hypot(x*step-target.x,y*step-target.y)<radius),target.id);
  }
});

test("save parsing handles corruption, invalid values and legacy migration",()=>{
  for(const raw of ['bad','null','[]','1','{"version":99}']) assert.equal(parseSave(raw),null);
  const save=parseSave(JSON.stringify({lang:'invalid',sound:'false',bossDefeated:'true',pos:{x:Infinity,y:-1},unlocked:['etec','etec','bad'],favorites:[2,'etec'],explored:['1:2','1:2:3','NaN:2','100:0'],ageStage:'adult'}),true);
  assert.equal(save.version,4);assert.equal(save.lang,'pt');assert.equal(save.sound,false);assert.equal(save.bossDefeated,false);
  assert.deepEqual(save.pos,START_POS);assert.deepEqual(save.unlocked,['etec']);assert.equal(save.ageStage,'baby');assert.equal(save.reducedMotion,true);
  assert.ok(!save.explored.includes('1:2:3'));
  const adult=parseSave(JSON.stringify({unlocked:['origins','joaquim','art','design','etec'],spokenNpcs:['luna'],bossDefeated:true,collectedPoems:[POEMS[0].id,'invalid']}));
  assert.equal(adult.ageStage,'adult');assert.deepEqual(adult.collectedPoems,[POEMS[0].id]);
  let stored; assert.equal(writeSave({setItem:(k,v)=>{assert.equal(k,SAVE_KEY);stored=v;}},adult),true);
  assert.deepEqual(parseSave(stored),adult);
  assert.equal(writeSave({setItem(){throw Error('QuotaExceeded');}},adult),false);
});

test("battle rewards the debugging sequence and resets after defeat",()=>{
  let state={bossHp:100,playerHp:100,round:0};
  for(const move of ['inspect','fix','run'])state=takeBattleTurn(state,move);
  assert.equal(state.won,true);assert.equal(state.bossHp,0);assert.ok(state.playerHp>0);
  const retry=takeBattleTurn({bossHp:100,playerHp:10,round:0},'run');
  assert.equal(retry.retry,true);assert.equal(retry.playerHp,100);assert.equal(retry.bossHp,100);
});

test("terminal uses the selected language and unlock state", async()=>{
  const {terminalResponse}=await import('../app/game/terminal.ts');
  assert.match(terminalResponse('music','en',false,false),/locked/);
  assert.match(terminalResponse('python','es',false,true),/correctamente/);
  assert.match(terminalResponse('unknown','pt',false,false),/comando não encontrado/);
  assert.match(terminalResponse('music','en',true,false),/Supernova/);
});
