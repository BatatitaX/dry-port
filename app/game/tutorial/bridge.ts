import type { Lang } from "./copy";
import type { Action, Point, Settings, State } from "./model";
export type Bridge = {
  state: State; settings: Settings; keys: Set<string>; joystick: Point; paused: boolean; lang: Lang;
  act: (action: Action, aim?: Point) => void;
  publish: (fps: number) => void;
};
