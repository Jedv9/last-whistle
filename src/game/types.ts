export type Screen = "title" | "hub" | "train" | "card" | "fight" | "result" | "night";

export interface Fighter {
  name: string;
  strength: number;
  grit: number;
  stamina: number;
  fatigue: number;
  condition: number;
}

export interface Opponent {
  id: string;
  name: string;
  title: string;
  strength: number;
  grit: number;
  stamina: number;
  purse: number;
  blurb: string;
}

export interface FightExchange {
  text: string;
  playerHp: number;
  oppHp: number;
}

export interface FightOutcome {
  won: boolean;
  exchanges: FightExchange[];
  purse: number;
  conditionLoss: number;
  fatigueGain: number;
  opponentId: string;
  opponentName: string;
}

export interface GameState {
  version: 1;
  screen: Screen;
  day: number;
  cash: number;
  actionsLeft: number;
  fighter: Fighter;
  nextOpponent: number;
  beaten: string[];
  cardCleared: boolean;
  lastOutcome: FightOutcome | null;
  fightStep: number;
  nightNote: string;
  shortShift: boolean;
}

export const SAVE_KEY = "last-whistle-save-v0";
export const STAT_CAP = 20;
export const ACTIONS_PER_DAY = 2;
export const FIGHT_CONDITION_MIN = 35;
export const FIGHT_FATIGUE_MAX = 84;
export const CLINIC_COST = 22;

export const TRAIN_GAIN = 2;
export const TRAIN_FATIGUE = 14;
export const REST_FATIGUE = 22;
export const REST_CONDITION = 16;
