import type { MutableRefObject } from "react";
import type { AgeStage, GameLang, Point } from "./data";
import type { MovementKey } from "../movement";

/** React owns story/UI state; Phaser owns each simulation frame. */
export type GameBridge = {
  position: MutableRefObject<Point>;
  keys: Set<string>;
  keyOrder: MovementKey[];
  paused: boolean;
  ageStage: AgeStage;
  lang: GameLang;
  bossDefeated: boolean;
  collectedPoems: string[];
  unlocked: string[];
  reducedMotion: boolean;
  onPosition: (position: Point) => void;
  onInteract: () => void;
  onMap: () => void;
};
