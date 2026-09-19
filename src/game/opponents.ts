import type { Opponent } from "./types";

export const LADDER: Opponent[] = [
  {
    id: "scrap-kid",
    name: "Scrap Kid",
    title: "Yard rat",
    strength: 4,
    grit: 4,
    stamina: 5,
    purse: 18,
    blurb: "Fast hands. No chin. First name on the card for a reason.",
  },
  {
    id: "hookhand-len",
    name: "Hookhand Len",
    title: "Hold man",
    strength: 6,
    grit: 5,
    stamina: 5,
    purse: 32,
    blurb: "Lost two fingers to a cargo hook. The rest still land.",
  },
  {
    id: "crane-wife",
    name: "Crane Wife",
    title: "Boom hand",
    strength: 7,
    grit: 7,
    stamina: 6,
    purse: 48,
    blurb: "Doesn't talk. Hits like a boom coming down.",
  },
  {
    id: "shift-boss",
    name: "Shift Boss",
    title: "Whistle man",
    strength: 8,
    grit: 7,
    stamina: 8,
    purse: 64,
    blurb: "Makes you work tired. Fights the same way.",
  },
  {
    id: "drydock-ron",
    name: "Drydock Ron",
    title: "Old plate",
    strength: 8,
    grit: 10,
    stamina: 7,
    purse: 82,
    blurb: "Been here longer than the cranes. Doesn't like falling.",
  },
  {
    id: "the-welder",
    name: "The Welder",
    title: "Spark",
    strength: 11,
    grit: 8,
    stamina: 9,
    purse: 110,
    blurb: "Elbows and heat. You smell the mask after.",
  },
  {
    id: "night-foreman",
    name: "Night Foreman",
    title: "Last name",
    strength: 12,
    grit: 11,
    stamina: 11,
    purse: 150,
    blurb: "Last name on the card. Last whistle of the night.",
  },
];

export function opponentAt(index: number): Opponent {
  return LADDER[Math.min(index, LADDER.length - 1)];
}
