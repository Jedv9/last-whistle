import { SAVE_KEY, type GameState } from "./types";

function isFighter(value: unknown): boolean {
  if (!value || typeof value !== "object") return false;
  const f = value as Record<string, unknown>;
  return (
    typeof f.name === "string" &&
    typeof f.strength === "number" &&
    typeof f.grit === "number" &&
    typeof f.stamina === "number" &&
    typeof f.fatigue === "number" &&
    typeof f.condition === "number"
  );
}

function isState(value: unknown): value is GameState {
  if (!value || typeof value !== "object") return false;
  const s = value as Record<string, unknown>;
  return (
    s.version === 1 &&
    typeof s.screen === "string" &&
    typeof s.day === "number" &&
    typeof s.cash === "number" &&
    typeof s.actionsLeft === "number" &&
    isFighter(s.fighter) &&
    typeof s.nextOpponent === "number" &&
    Array.isArray(s.beaten)
  );
}

export function loadSave(): GameState | null {
  try {
    const raw = localStorage.getItem(SAVE_KEY);
    if (!raw) return null;
    const parsed: unknown = JSON.parse(raw);
    if (!isState(parsed)) return null;
    return {
      ...parsed,
      beaten: parsed.beaten ?? [],
      cardCleared: !!parsed.cardCleared,
      lastOutcome: parsed.lastOutcome ?? null,
      fightStep: 0,
      nightNote: parsed.nightNote ?? "",
      shortShift: !!parsed.shortShift,
      screen: parsed.screen === "fight" || parsed.screen === "result" || parsed.screen === "night"
        ? "hub"
        : parsed.screen,
    };
  } catch {
    return null;
  }
}

export function writeSave(state: GameState): void {
  const persist: GameState = {
    ...state,
    screen: state.screen === "fight" || state.screen === "result" || state.screen === "night"
      ? "hub"
      : state.screen === "title"
        ? "hub"
        : state.screen,
    lastOutcome: state.screen === "fight" ? null : state.lastOutcome,
    fightStep: 0,
  };
  localStorage.setItem(SAVE_KEY, JSON.stringify(persist));
}

export function clearSave(): void {
  localStorage.removeItem(SAVE_KEY);
}

export function hasSave(): boolean {
  return loadSave() !== null;
}
