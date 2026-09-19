# Last Whistle — v0 design

Playable slice. Tunable numbers live in `src/game/types.ts` and `src/game/opponents.ts`.

## Loop

Title → yard → (train / rest / fight) × 2 → end day → next day.

Fight is optional each day. If condition is too low or fatigue is too high, the card is locked until you rest or pay the clinic.

A run does not hard-brick. Clinic is always there if you have $22. Sleep still heals a little. If you wake up wrecked, you get a short shift instead of a dead save.

## Screens

- **Title** — new game / continue
- **Yard** — fighter, cash, day, actions
- **Train** — three drills
- **Card** — 7 opponents, next name marked
- **Fight** — tap-through auto-resolve
- **Result** — purse, damage
- **Night** — last whistle, then dawn

## Stats

Kept small on purpose.

| Stat | Role |
| --- | --- |
| Strength | How hard you hit |
| Grit | How well you take it / stay up |
| Stamina | How long you last |
| Fatigue | 0–100. Hurts fight power. Training raises it. |
| Condition | 0–100. Hurt from fights. Rest / clinic / sleep raise it. |
| Cash | Purse money. Clinic spend. |

Strength / grit / stamina cap at 20. Start at 6 / 6 / 6, $36, day 1.

Training: +2 to one stat, +14 fatigue, 1 action.  
Rest: −22 fatigue, +16 condition, 1 action.  
Clinic: $22, −40 fatigue, +45 condition, 0 actions.  
Night: −10 fatigue, +8 condition (more if you were wrecked).

Fight lock: condition < 35 or fatigue > 84.

## Combat

Auto-resolve with 5 exchanges. Power is strength, grit, stamina, minus fatigue, plus a bit of condition. Random swing on each exchange. First to crumple, or whoever has more left after 5, wins.

Win: full purse, ladder moves.  
Loss: ~15% of the purse, same opponent stays next.

Clearing Night Foreman flags the card as done. You can still take exhibition rematches for about half purse.

## Card

1. Scrap Kid — $18  
2. Hookhand Len — $32  
3. Crane Wife — $48  
4. Shift Boss — $64  
5. Drydock Ron — $82  
6. The Welder — $110  
7. Night Foreman — $150  

## Out of scope for later

Not in v0. Do not treat missing pieces as bugs.

- Roster bigger than one fighter
- Hiring, firing, or gym upgrades
- Real-time or combo combat
- Story / dialogue trees
- Map, weather, police, unions
- Shop beyond the clinic
- Multiple save slots
- Accounts, backend, ads, multiplayer
- Finished art (UI is flat ink / bone / ember on purpose)
- Balance pass against a live audience

## Feel

Docks / shipyard. Dark ink, bone type, one ember accent. Game title is Last Whistle — not a storefront for the hardware brand. No founder name or face in the product.
