export type BattleMove = "inspect" | "fix" | "run";
export type BattleState = { bossHp: number; playerHp: number; round: number };
export function takeBattleTurn(state: BattleState, move: BattleMove): BattleState & { won: boolean; retry: boolean } {
  const expected: BattleMove = state.round % 3 === 0 ? "inspect" : state.round % 3 === 1 ? "fix" : "run";
  const correct = move === expected;
  const bossHp = Math.max(0, state.bossHp - (correct ? (move === "run" ? 44 : 32) : 15));
  if (bossHp === 0) return { bossHp: 0, playerHp: state.playerHp, round: state.round, won: true, retry: false };
  const playerHp = Math.max(0, state.playerHp - (correct ? 11 : 23));
  if (playerHp === 0) return { bossHp: 100, playerHp: 100, round: 0, won: false, retry: true };
  return { bossHp, playerHp, round: state.round + 1, won: false, retry: false };
}
