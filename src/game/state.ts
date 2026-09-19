import { LADDER } from "./opponents";
import {
  ACTIONS_PER_DAY,
  FIGHT_CONDITION_MIN,
  FIGHT_FATIGUE_MAX,
  REST_CONDITION,
  REST_FATIGUE,
  STAT_CAP,
  TRAIN_FATIGUE,
  TRAIN_GAIN,
  type Fighter,
  type GameState,
  type Screen,
} from "./types";

export function clamp(n: number, min: number, max: number): number {
  return Math.max(min, Math.min(max, n));
}

export function newGame(name: string): GameState {
  const cleaned = name.replace(/\s+/g, " ").trim().slice(0, 16) || "Rook";
  return {
    version: 1,
    screen: "hub",
    day: 1,
    cash: 36,
    actionsLeft: ACTIONS_PER_DAY,
    fighter: {
      name: cleaned,
      strength: 6,
      grit: 6,
      stamina: 6,
      fatigue: 8,
      condition: 100,
    },
    nextOpponent: 0,
    beaten: [],
    cardCleared: false,
    lastOutcome: null,
    fightStep: 0,
    nightNote: "",
    shortShift: false,
  };
}

export function canFight(state: GameState): boolean {
  const f = state.fighter;
  return (
    state.actionsLeft > 0 &&
    f.condition >= FIGHT_CONDITION_MIN &&
    f.fatigue <= FIGHT_FATIGUE_MAX
  );
}

export function fightBlockReason(state: GameState): string | null {
  if (state.actionsLeft <= 0) return "No actions left today. End the day.";
  if (state.fighter.condition < FIGHT_CONDITION_MIN) {
    return "Too beaten up to take a fight. Rest, or pay the clinic.";
  }
  if (state.fighter.fatigue > FIGHT_FATIGUE_MAX) {
    return "Dead on your feet. Rest before you walk into the ring.";
  }
  return null;
}

export function bumpStat(fighter: Fighter, key: "strength" | "grit" | "stamina"): Fighter {
  return {
    ...fighter,
    [key]: clamp(fighter[key] + TRAIN_GAIN, 1, STAT_CAP),
    fatigue: clamp(fighter.fatigue + TRAIN_FATIGUE, 0, 100),
  };
}

export function applyRest(fighter: Fighter): Fighter {
  return {
    ...fighter,
    fatigue: clamp(fighter.fatigue - REST_FATIGUE, 0, 100),
    condition: clamp(fighter.condition + REST_CONDITION, 0, 100),
  };
}

export function applyClinic(fighter: Fighter): Fighter {
  return {
    ...fighter,
    fatigue: clamp(fighter.fatigue - 40, 0, 100),
    condition: clamp(fighter.condition + 45, 0, 100),
  };
}

export function spendAction(state: GameState): GameState {
  return { ...state, actionsLeft: Math.max(0, state.actionsLeft - 1) };
}

export function go(state: GameState, screen: Screen): GameState {
  return { ...state, screen };
}

export function endDay(state: GameState): GameState {
  const f = state.fighter;
  let condition = clamp(f.condition + 8, 1, 100);
  let fatigue = clamp(f.fatigue - 10, 0, 100);
  let note = "Fatigue eased a little. You sleep in the locker.";

  if (f.condition < 25) {
    condition = clamp(condition + 14, 1, 100);
    fatigue = clamp(fatigue - 8, 0, 100);
    note = "You were too busted to do much. The body takes the night anyway.";
  } else if (f.fatigue > 70) {
    note = "Legs heavy. You still hear the last whistle when you close your eyes.";
  } else if (state.cardCleared) {
    note = "Card's done. Yard still wants a body in the ring tomorrow.";
  }

  const shortShift = condition < 30;
  if (shortShift) {
    note += " Tomorrow will be a short shift.";
  }

  return {
    ...state,
    screen: "night",
    nightNote: note,
    shortShift,
    fighter: { ...f, condition, fatigue },
  };
}

export function startNextDay(state: GameState): GameState {
  return {
    ...state,
    screen: "hub",
    day: state.day + 1,
    actionsLeft: state.shortShift ? 1 : ACTIONS_PER_DAY,
    shortShift: false,
    nightNote: "",
  };
}

export function applyFightResult(state: GameState): GameState {
  const outcome = state.lastOutcome;
  if (!outcome) return go(state, "hub");

  const f = state.fighter;
  const condition = clamp(f.condition - outcome.conditionLoss, 8, 100);
  const fatigue = clamp(f.fatigue + outcome.fatigueGain, 0, 100);
  const cash = state.cash + outcome.purse;

  let nextOpponent = state.nextOpponent;
  let beaten = state.beaten;
  let cardCleared = state.cardCleared;

  if (outcome.won && !beaten.includes(outcome.opponentId)) {
    beaten = [...beaten, outcome.opponentId];
    if (nextOpponent < LADDER.length - 1) {
      nextOpponent += 1;
    } else {
      cardCleared = true;
    }
  }

  return {
    ...state,
    screen: "result",
    cash,
    fighter: { ...f, condition, fatigue },
    nextOpponent,
    beaten,
    cardCleared,
    actionsLeft: Math.max(0, state.actionsLeft - 1),
  };
}
