import type { FightExchange, FightOutcome, Fighter, Opponent } from "./types";

function clamp(n: number, min: number, max: number): number {
  return Math.max(min, Math.min(max, n));
}

function roll(min: number, max: number): number {
  return min + Math.floor(Math.random() * (max - min + 1));
}

function power(str: number, grit: number, stam: number, fatigue = 0, condition = 100): number {
  return str * 2.1 + grit * 1.15 + stam * 0.85 - fatigue * 0.16 + condition * 0.05;
}

function maxHp(grit: number, stam: number, condition = 100): number {
  return Math.round(72 + grit * 3.2 + stam * 2.4 + condition * 0.12);
}

const PLAYER_LINES = [
  "You drive a straight into the ribs.",
  "You step in off the crane shadow and land a hook.",
  "You catch them coming forward. Short punch. Clean.",
  "You shove them into a pallet and follow.",
  "You keep the left hand busy. They eat a few.",
  "You drop your weight and dig the body.",
];

const OPP_LINES = [
  "They come over the top. You feel it in the teeth.",
  "A forearm finds your neck. The yard tilts.",
  "They walk through your guard like it's rope.",
  "You cover up. The shots still get in.",
  "They clinch, then dump you toward the wet concrete.",
  "A low shot steals the breath out of you.",
];

const CLINCH_LINES = [
  "You trade in the clinch. Ugly. Close.",
  "Boots scrape. Nobody gives ground.",
  "The crowd of shift workers don't cheer. They just watch.",
  "Salt air. Blood. Someone laughs once and stops.",
];

function pick<T>(list: T[]): T {
  return list[Math.floor(Math.random() * list.length)];
}

export function resolveFight(fighter: Fighter, opponent: Opponent): FightOutcome {
  const pPow = power(
    fighter.strength,
    fighter.grit,
    fighter.stamina,
    fighter.fatigue,
    fighter.condition,
  );
  const oPow = power(opponent.strength, opponent.grit, opponent.stamina);

  let playerHp = maxHp(fighter.grit, fighter.stamina, fighter.condition);
  let oppHp = maxHp(opponent.grit, opponent.stamina);
  const playerMax = playerHp;
  const oppMax = oppHp;

  const rounds = 5;
  const exchanges: FightExchange[] = [];

  for (let i = 0; i < rounds && playerHp > 0 && oppHp > 0; i += 1) {
    const swing = roll(-7, 7);
    const edge = pPow - oPow + swing;
    let text: string;
    let pHit = 0;
    let oHit = 0;

    if (edge > 10) {
      oHit = roll(10, 18);
      text = pick(PLAYER_LINES);
    } else if (edge < -10) {
      pHit = roll(10, 18);
      text = pick(OPP_LINES);
    } else if (edge >= 0) {
      oHit = roll(6, 12);
      pHit = roll(3, 8);
      text = pick(PLAYER_LINES);
    } else {
      pHit = roll(6, 12);
      oHit = roll(3, 8);
      text = pick(OPP_LINES);
    }

    if (Math.abs(edge) < 4 && Math.random() < 0.35) {
      text = pick(CLINCH_LINES);
    }

    playerHp = clamp(playerHp - pHit, 0, playerMax);
    oppHp = clamp(oppHp - oHit, 0, oppMax);

    exchanges.push({
      text,
      playerHp: Math.round((playerHp / playerMax) * 100),
      oppHp: Math.round((oppHp / oppMax) * 100),
    });
  }

  const won = oppHp <= 0 || (playerHp > 0 && playerHp >= oppHp);
  const hardness = 1 - Math.min(exchanges[exchanges.length - 1]?.playerHp ?? 50, 100) / 100;

  const conditionLoss = clamp(Math.round(10 + hardness * 22 + (won ? 0 : 6)), 8, 32);
  const fatigueGain = clamp(Math.round(16 + hardness * 14), 14, 32);

  return {
    won,
    exchanges,
    purse: won ? opponent.purse : Math.round(opponent.purse * 0.15),
    conditionLoss,
    fatigueGain,
    opponentId: opponent.id,
    opponentName: opponent.name,
  };
}

