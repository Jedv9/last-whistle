# Last Whistle — full spec for a Python remake

This file is the whole game in one place. Use it to rebuild **Last Whistle** in Python (Pygame, Arcade, or similar). Do not invent a new mystery. Do not write noir fragment dialogue. Every player-facing line must be a complete sentence a player can follow.

The current playable build is a vanilla JS PWA in this folder (`index.html` + `js/` + `css/` + `art/`). There is no React, no TypeScript, no build step.

---

## 1. What the game is

A Punch Club–shaped dockyard boxing management game.

- Painted 3/4 rooms, not first-person, not menus-only.
- You walk a small avatar to hotspots (fridge, bag, door, people).
- Clock hours, eat, work, train, sleep, fight, follow a missing-person story.
- Days can run forever. The **story** unlocks the next chapter, not the calendar.
- About 12 story chapters of content. Playtime target is long management, not a day-locked campaign.

**Setting:** Blackwater Docks. Bunkhouse 4C. Harbor Commission. A boat named the Quiet Ledger.

**You:** Ren Vale (player-named, default Ren).  
**Missing sibling:** Juno Vale. Gone six days when the game starts.

**Tone:** Punch Club at the docks. Plain speech. Distinct NPC voices. No “the grocery list gave up and became a clue list.” If a note is a grocery list, print the grocery list.

---

## 2. Writing rules (do not skip)

- Complete sentences.
- Always say what happened and what the player can do next.
- Required clues never hide behind a missable option. If the player skips a question, give the fact later.
- Unique replies to choices. NPCs remember flags (`kadeNo` → Kade still says “babysitter”).
- Juno’s scratch pad is literal:

```
Juno wrote this on the scratch pad by the cot:

noodles
listen for the horn
don't take the night fight

That is the whole note. They never came back to add the rest.
```

If the player replayed the tape (`hornEar`), add: `listen for the horn — the same interval as the tape, not the main channel`.

---

## 3. The story (plot you must implement)

Juno left a cassette: *“Ren— don't take the night bout. If I don't come back, the ledger is in the—”* Then static, a horn, someone swearing.

### Beats, in order (gated by flags, not day number)

1. **Wake.** Alone in 4C. Tape. Choice: clock in (`grit`) or play the tape again and memorize the horn (`hornEar` — Pier 9’s old fog note, not the main channel).
2. **Eat Juno’s leftover noodles.** Then go to work. Fridge bangs until `ateStart`.
3. **Brant.** Cover Juno’s shift. If Commission walks through, you saw crates. Stay out of Bay C. If `grit`, Brant says you showed up **on time**.
4. **Flyer.** Bin Alley Circuit card under the door. Purse in a hat. Pocket it or leave it on the **table**. Unlocks `alley` + `rustgym`.
5. **Kade Ruiz.** Rust Bucket, $15/week. Timing, not hope. Choices: pay, alley first, or “I don’t need a **babysitter**” (`kadeNo`).
6. **Mae Okonkwo.** Union canteen. Juno filed a safety complaint the morning they vanished. File is gone. Ally / ask for file / solo.
7. **Oz Pell.** Diner “The Last Whistle.” Juno sat last stool, left half a waffle, paid with a Commission chip. Juno said the **Quiet Ledger is a boat**, not a book. Oz has a shortwave; needs a $6 coil from the market.
8. **Rui.** After you haul or win a fight: Bay C still has Juno’s locker. Third from the horn. Vargas uses Bay C after dark (if pressed).
9. **Locker** (`heardLocker` then inspect). Wraps; photo on Crane 4; half ledger: `PIER 9 — Q.L. — FIGHTERS AS COVER — NIGHT BELL`.
10. **Night horn.** If `hornEar` and docks after 18:00: same interval from the water.
11. **Lila.** After you beat her: Juno won, Crowe whispered, Vargas walked them toward the water / Pier 9.
12. **Radio.** After locker + (Oz radio help or coil or 2+ clues): Juno is alive on the Quiet Ledger. They move prisoners when the arena fills. Crowe’s title is a **net**. Mae has a launch. Choice: `planMae` or `planSolo`.
13. **Vargas exhibition.** Fame ≥ 16, wins ≥ 3, locker or radio. He calls Juno inventory/cargo.
14. **Mae raid.** If `planMae` and `beat_vargas`: Mae hits Pier 9 during the title bell. You keep Crowe busy.
15. **Crowe.** After Vargas or Sophie, fame ≥ 22.

### Endings

| id | title | When |
|----|--------|------|
| `glory` | A WHISTLE OF YOUR OWN | Beat Crowe, no Mae raid. Famous. Juno still gone. |
| `rescue` | QUIET LEDGER, LOUD DOCKS | Lose or skip beating Crowe, Mae raid succeeds. Juno alive. |
| `both` | DOUBLE BELL | Beat Crowe **and** Mae raid / `planMae`. |
| `net` | THE NIGHT BOUT | Lose to Crowe without Mae plan. You are captured. |
| `evicted` | NO FIXED WHISTLE | Miss rent twice. |
| `broken` | THE BELL STOPS | HP hits 0 (doctor can’t save). |
| `fade` | SHIFT CHANGE | 6 losses and 0 wins, or 8 losses and < 3 wins. |

Crowe win + `planMae` → `both`. Crowe win else → `glory`. Crowe loss + `planMae` → `rescue`. Crowe loss else → `net`.

---

## 4. Characters

| Who | Role | Voice |
|-----|------|--------|
| Ren Vale | Player | Short complete sentences. Says what they know and will do. |
| Juno Vale | Missing sibling | Tape is urgent and unfinished. Radio later: scared, clear, tactical. |
| Foreman Brant | Dock boss | Orders. “Saw crates.” Hates Bay C questions. |
| Kade Ruiz | Ex dock champ, Rust Bucket | Money, timing, tea. Remembers “babysitter.” |
| Mae Okonkwo | Union steward | Stew first. Files and facts. 3 free meals if broke+hungry. |
| Oz Pell | Diner cook | Food, gossip. Quiet Ledger is a boat. Shortwave in the storeroom. |
| Dockhand Rui | Coworker | Points at locker, then walks away. |
| Neon Lila | Blue Crane fighter | Fought Juno. Points at Pier 9. Don’t sign hungry. |
| Crane Vargas | Crowe’s enforcer | Calls people cargo. Walked Juno to the water. |
| Silas Crowe | Champ / trap | Sells the missing-person story. Title fight is a net. |
| Bin Rat Tommy | First alley fight | Card, hat, rent, seagull cutman. |
| 4B | Neighbor | Wants the tape turned down. |

---

## 5. Current JS file map (source of truth in this repo)

```
last-whistle/
  index.html              PWA shell, loads JS in order
  css/game.css            16:9 frame, HUD, dialog
  js/content.js           catalogs: locations, activities, items, opponents
  js/story.js             events, talk, cine, endings, bout dialogue
  js/campaign.js          12 chapters, extra opponents, extra events
  js/combat.js            stance-plan rounds
  js/engine.js            state, time, workouts, save, activities
  js/rooms.js             hotspot %, spawn points, poses
  js/sprites.js           canvas doll + rooms
  js/audio.js             tiny Web Audio
  js/ui.js                DOM HUD / dialog / clicks
  js/main.js              rAF loop, SW
  sw.js                   cache (bump on copy change)
  art/                    painted PNG rooms + cine stills/videos
  tests/run.js            27 unit tests
```

Load order: `content → story → campaign → combat → engine → rooms → sprites → audio → ui → main`.

Save key: `lastWhistleSaveV1` in localStorage. Python: `save.json`.

---

## 6. Player state (create this object)

```python
START = {
    "screen": "hub",          # title | cine | create | hub | story | fridge | map | bag | journal | shop | board | fight | end
    "seed": 1,                # LCG: seed = (seed * 16807) % 2147483647
    "day": 1,
    "hour": 8,                # 0–23; slot 0 if <12, 1 if <18, else 2
    "slot": 0,
    "name": "Ren",            # max 14 chars
    "background": "dock",     # dock | courier | night | galley  (flavor only; stats still start at 0)
    "style": "brawler",
    "loc": "bunk",
    "str": 0, "agi": 0, "stm": 0, "tec": 0,
    "xp": {"str": 0.0, "agi": 0.0, "stm": 0.0, "tec": 0.0},  # +1 stat when xp >= 1
    "trained": {"str": 0, "agi": 0, "stm": 0, "tec": 0},     # reset each new day
    "hp": 100, "maxHp": 100,
    "energy": 100, "maxEnergy": 100,
    "hunger": 62,             # 0 empty, 100 full
    "mood": 58,               # 0–100; <50 halves training XP
    "money": 38,
    "maeMeals": 0,            # max 3 free
    "padsDay": 0,             # last day you paid for pads
    "dumpsterDay": 0,
    "fame": 0,
    "injured": 0,             # days left; -12% str/agi in fights
    "rentDueOn": 7,
    "rentMissed": 0,
    "home": "bunk",           # bunk | flat
    "gym": None,              # None | rust | temple
    "gymPaidUntil": 0,        # day number
    "items": {"salve": 1},
    "fridge": {"noodles": 1, "stew": 0, "coffee": 0, "plate": 0, "protein": 0},
    "gear": [],
    "equipped": {"hands": None, "feet": None},
    "flags": {},
    "rel": {"kade": 0, "mae": 0, "oz": 0, "lila": 0},  # clamp -20..100
    "wins": 0, "losses": 0, "koWins": 0,
    "clues": 0,
    "journal": [
        "Day 1. Juno has been missing for six days. Their tape cuts off on the word ledger. Rent is due in seven days."
    ],
    "unlocked": ["bunk", "docks", "canteen", "diner", "market"],
    "boutDone": {},
    "watchCount": 0,
    "proteinBuff": 0,         # days of +25% str/stm XP
    "workout": None,
    "ending": None,
}
```

**Backgrounds are flavor.** Stats start at **0**. The listed background stats in `content.js` are unused at new-game (kept for portrait copy only).

### Seeded RNG

```python
def rng(state):
    state["seed"] = (state["seed"] * 16807) % 2147483647
    return (state["seed"] - 1) / 2147483646
```

---

## 7. Time, rent, daily rust

- Hours are integers. Night watch only if `hour >= 18`.
- `spend_hours(n)`: `hour += n`; if `hour >= 24`: `hour -= 24`; `end_day()`.
- Clock display: `{hour}:00` and `ch {chapter}/12 · d{day}`.

### end_day

1. Mild rust: for each stat > 2 that was **not** trained today, 35% chance `xp -= 0.2`; if xp < 0, lose 1 stat point and `xp += 1`.
2. `day += 1`; reset `trained` to zeros.
3. `proteinBuff -= 1` if > 0; `injured -= 1` if > 0.
4. Hunger `-= 8`; mood `-= 3`.
5. If hunger < 15: HP `-= 8`, mood `-= 6`.
6. HP `+= 4` toward max.
7. If `day == rentDueOn`: collect rent.

### Rent

- Bunk $35 / week. Flat $70 / week.
- First due day 7, then +7.
- Pay if money ≥ cost. Else `rentMissed += 1`, `maxEnergy -= 10` (min 60). Two misses → `evicted`.

### Sleep

- Early if `hour <= 20`.
- Energy gain: `48 + (22 if flat) + (12 if early) + floor(stm * 1.2)`
- HP gain: `10 + (10 if flat)`
- Hunger `-= 12`; mood `+= 8`
- Then `end_day()` and set hour to 8.

### Sofa nap

+18 energy, −6 hunger, +10 mood, 2 hours. Not a full night.

### TV

+10 energy, +16 mood, 1 hour.

### Kettle

+8 energy, +2 hunger, +3 mood, 1 hour.

### Sink

+2 HP, +2 energy, +2 mood. No time.

---

## 8. Stats and training XP

```python
def xp_gain(state, key, amt):
    dim = 1 / (1 + state["trained"][key] * 0.45)
    gain = amt * dim
    if state["mood"] < 50:
        gain *= 0.5
    if state["proteinBuff"] > 0 and key in ("str", "stm"):
        gain *= 1.25
    if state["gym"] == "temple":
        gain *= 1.2
    elif state["gym"] == "rust":
        gain *= 1.08
    return gain

def add_xp(state, key, amt):
    g = xp_gain(state, key, amt)
    state["xp"][key] += g
    ups = 0
    while state["xp"][key] >= 1:
        state["xp"][key] -= 1
        state[key] += 1
        ups += 1
    return ups
```

`trained[key]` increments **once per finished workout session** per stat that gained XP (not per rep). Two sessions on the same stat in one day → toast “Gains fading — rotate.”

Hunger < 12 blocks train/work.

---

## 9. Live workouts (important)

Training is **not** a one-click lump. Player walks to the hotspot, starts a set, each rep adds a little XP, drains hunger/energy/mood/interest, and can **STOP**.

Auto-stop if energy < 8, hunger < 10, mood < 10, or interest ≤ 0.

Hours billed at end: `max(1, round(def.hours * reps_done / def.reps))` if at least one rep, else 0.

Pads: $8 at start, once per calendar day (`padsDay`).

Spar / temple spar: at full finish, `chip` chance to lose `chipHp` HP.

| id | unit | reps | sec/rep | hours | gains per rep | drain/rep |
|----|------|------|---------|-------|---------------|-----------|
| pushups | push-up | 12 | 1.55 | 2 | str 0.048, stm 0.018 | en 1.35, hu 0.70, mood 0.85, interest 7 |
| shadow | round | 12 | 1.50 | 2 | agi 0.040, tec 0.016 | 1.20 / 0.55 / 0.75 / 7 |
| home_bag | combo | 12 | 1.55 | 2 | str 0.042, tec 0.014 | 1.35 / 0.70 / 0.80 / 7 |
| home_skip | set | 12 | 1.45 | 2 | agi 0.042, stm 0.016 | 1.10 / 0.50 / 0.70 / 6 |
| pads | round | 8 | 1.50 | 1 | tec 0.056, agi 0.035 | 1.75 / 0.75 / 0.50 / 6 + $8 |
| bag | combo | 12 | 1.60 | 2 | str 0.050, tec 0.020 | 1.70 / 0.85 / 0.80 / 7 |
| spar | exchange | 14 | 1.70 | 3 | tec 0.032, agi 0.022, stm 0.012 | 1.70 / 0.85 / 0.70 / 6, chip 0.25 / 8 hp |
| weights | rep | 12 | 1.65 | 2 | str 0.055, stm 0.020 | 1.70 / 1.00 / 0.85 / 7 |
| skip | set | 12 | 1.50 | 2 | agi 0.050, stm 0.020 | 1.35 / 0.70 / 0.75 / 6 |
| rope_alley | lap | 12 | 1.50 | 2 | agi 0.038, stm 0.014 | 1.25 / 0.65 / 0.80 / 7 |
| temple_bag | combo | 12 | 1.60 | 2 | str 0.055, tec 0.026 | 1.85 / 0.85 / 0.80 / 7 |
| temple_spar | exchange | 14 | 1.70 | 3 | tec 0.036, agi 0.024, str 0.010 | 1.85 / 0.85 / 0.70 / 6, chip 0.30 / 10 hp |

UI during a set: `Push-ups · 2/12`, `STR +0.10  STM +0.04`, Interest bar, **STOP**.

---

## 10. Work (lump resolve, then result card)

Not live-rep. Walk → short busy anim → result.

| id | hours | energy | hunger | mood | pay / effect |
|----|-------|--------|--------|------|----------------|
| haul | 4 | 26 | 14 | −6 | $12 + floor(str/4) + $4 20%; sets `hauled`; +0.22 str +0.18 stm XP (session bumpStat) |
| manifests | 3 | 12 | 6 | −4 | $9 + floor(tec/5); +0.20 tec; 35% Pier 9 clue once |
| watch | 4, evening | 20 | 10 | −5 | $16 + floor(stm/5); +0.28 stm; watchCount++; 40% Pier 9 lights clue |
| overtime | 6, needs hauled | 38 | 20 | −10 | $22 + floor(str/3) + $6 20% |
| dishes | 2 | 14 | 6 | −2 | $7; +0.12 stm |

Dumpster (alley, once/day): +32 hunger, −8 HP, −12 mood, 1 hour.

Mae free stew if hunger < 35 and money < 12 and `maeMeals < 3`: +6 HP, +8 energy, +44 hunger, +8 mood, +4 rel mae, 1 hour.

Buy food at canteen/diner → **fridge**, eat at home (1 hour). First eat sets `ateStart` and fires flyer.

---

## 11. Food / items

Fridge foods (eat at bunk):

| id | $ | hunger | energy | hp | mood | extra |
|----|---|--------|--------|----|------|-------|
| noodles | 3 | 28 | 4 | 0 | 4 | start with 1 in fridge |
| stew | 8 | 44 | 8 | 6 | 8 | |
| coffee | 4 | 6 | 14 | 0 | 2 | |
| plate | 14 | 58 | 10 | 10 | 12 | |
| protein | 22 | 40 | 6 | 8 | 6 | proteinBuff = 2 days |

Gear:

| id | slot | $ | bonus |
|----|------|---|-------|
| wraps | hands | 12 | tec +1 |
| scuffed | hands | 35 | str +1, tec +1 |
| harbor | hands | 90 | str +2, tec +1 |
| decks | feet | 40 | agi +2 |
| boots | feet | 85 | agi +2, stm +1 |

Consumables: salve $8 / +22 HP; salts $15 / +18 fight stam (once per fight) or +12 energy out of fight; tape $6 / next bout less injury; coil $6 / `boughtCoil` for Oz radio.

Shop list: noodles, stew, coffee, plate, protein, wraps, scuffed, harbor, decks, boots, salve, salts, tape, coil.

Gym: Rust $15 / 7 days. Temple $40 / 7 days (unlock later). Temple members can use rust equipment.

Flat: $80 cash and fame ≥ 8 to see offer; then buy from bunk menu if you have a cushion. Home `flat` improves sleep.

---

## 12. Combat

Not button-mash. Each round the player picks a **plan**. Enemy picks from `bias` list.

| plan | dmg | acc | stam tax | vs press | vs box | vs counter | vs stall |
|------|-----|-----|----------|----------|--------|------------|----------|
| press | 1.22 | 0.82 | 1.25 | 1.00 | 0.96 | 0.72 | 1.28 |
| box | 1.00 | 0.90 | 1.00 | 1.08 | 1.00 | 0.88 | 0.95 |
| counter | 0.90 | 0.80 | 0.78 | 1.38 | 1.05 | 1.00 | 0.70 |
| stall | 0.58 | 0.74 | 0.55 | 0.80 | 1.02 | 1.18 | 1.00 |

Per round: 5 exchanges. Higher AGI goes first (if |diff| < 2, coin flip).

```
hit_chance = clamp(acc + (agi_atk - agi_def)*0.012 - (0.12 if stam<25) - (0.12 if stam<10), 0.18, 0.94)
damage = (str*0.55 + tec*0.45) * 0.85 * plan.dmg * vs[enemy_plan]
if stam < 25: damage *= 0.8
damage *= 0.88 + rng*0.28
if enemy stalled and rng < 0.25: damage *= 0.6
damage = max(2, round(damage))
```

Each punch: attacker stam `-= 9 * plan.stam`. Defender stam `-= 4` on hit. After round both stam `+= 8` (max 100).

Knockdown if `dmg >= 16% maxHP` and hp > 0 and `rng < 0.35 + dmg/80`. 3 KD = lose.

Default 3 rounds. Vargas / Sophie / Crowe / Reed: 5 rounds.

Fight stats modified by gear, hunger < 20 (−10% all), injured (−12% str/agi), energy < 25 (−15% stm, −10% agi), `kadeStyle` (+1 tec).

Need energy ≥ 15 to fight. Fee if listed.

### After a fight

- Win: money += purse; fame += 4 + floor(opp.hp/40); mood +18; `beat_{id}`; 2 hours.
- Loss: fame −1; injury 1 or 2 days (0 if taped); mood +10.
- Fame 12 → unlock crane. 20 → arena. 22 → temple.
- If HP < 15 and money ≥ 20: auto canteen doctor $20, HP = 40.

Pre-fight talk (`boutChain`) then the bell. Tommy remembers leaving the **card** on the **table** / looking like **rent**.

---

## 13. Opponents

Story opponents `vargas` and `crowe` need flags `vargasUnlocked` / `croweUnlocked`.

| id | name | loc | purse | fee | fameNeed | extra | stats str/agi/stm/tec/hp | bias |
|----|------|-----|-------|-----|----------|-------|---------------------------|------|
| tommy | Bin Rat Tommy | alley | 24 | 0 | 0 | rematch | 7/9/8/4/88 | press press stall box |
| wren | Pipe Wren | alley | 32 | 0 | 4 | winNeed 1, rematch | 10/7/9/6/100 | press box press press |
| moss | Pallet Moss | alley | 28 | 0 | 2 | winNeed 1, rematch | 8/8/9/5/94 | stall press box stall |
| cobb | Cobb the Bolt | alley | 36 | 0 | 6 | winNeed 2, rematch | 11/8/10/6/104 | press press box press |
| sal | Hook-Hand Sal | alley | 40 | 0 | 10 | needFlag heardLocker | 9/10/10/8/108 | counter box counter press |
| twin | Twin Hook | alley | 48 | 0 | 12 | needFlag openedLocker | 10/12/10/9/112 | counter box counter press |
| nunzio | Brick Nunzio | rustgym | 36 | 0 | 6 | gym rust | 12/6/11/5/120 | press press stall press |
| delia | Delia Pins | rustgym | 42 | 0 | 8 | winNeed 2, gym rust, rematch | 9/11/10/8/110 | box counter box stall |
| hoss | Hoss Plate | rustgym | 52 | 0 | 14 | winNeed 4, gym rust | 14/7/13/6/128 | press stall press press |
| lila | Neon Lila | crane | 70 | 10 | 14 | | 9/13/11/12/115 | box counter box press |
| perry | Glassjaw Perry | crane | 55 | 8 | 18 | rematch-ish | 11/11/9/10/96 | press box press counter |
| kit | Kit Neon | crane | 62 | 8 | 16 | needFlag craneOpen, rematch | 10/13/11/11/118 | box box counter press |
| marlow | Marlow Vein | crane | 78 | 10 | 20 | winNeed 5 | 12/12/12/12/124 | counter press box counter |
| vargas | Crane Vargas | arena | 90 | 0 | 0 | story, 5 rounds | 14/10/13/9/140 | press press box stall |
| reed | Reed the Invoice | arena | 100 | 12 | 24 | needFlag vargasUnlocked, 5r | 13/12/14/12/142 | box press box stall |
| sophie | Iron Sophie | arena | 120 | 15 | 26 | 5 rounds | 13/12/14/13/150 | box counter box press |
| crowe | Silas Crowe | arena | 200 | 0 | 0 | story, 5 rounds | 15/13/15/14/165 | box counter press box |

---

## 14. Locations and unlocks

Start unlocked: bunk, docks, canteen, diner, market.

| id | name | district | unlock |
|----|------|----------|--------|
| bunk | Bunkhouse 4C | quay | start |
| docks | Blackwater Docks | quay | start |
| canteen | Union Canteen | quay | start |
| alley | Bin Alley Circuit | yard | flyer |
| rustgym | Rust Bucket Gym | yard | flyer or meet Kade |
| diner | The Last Whistle | wharf | start |
| market | Night Market | wharf | start |
| crane | Blue Crane Club | wharf | fame ≥ 12 or crane event |
| temple | Iron Temple | yard | fame ≥ 22 or Kade points you |
| arena | Harbor Arena | deep | fame ≥ 20 or Vargas offer |
| barge | Pier 9 — Quiet Ledger | deep | radio or raidReady |

Travel 0 hours (walk inside room). Map is a separate screen of district spots.

---

## 15. Twelve chapters (from flags, never from day)

```python
def chapter_of(s):
    f = s["flags"]
    if f.get("croweUnlocked") or f.get("croweInvite"): return 12
    if f.get("raidReady") or f.get("planMae"): return 11
    if f.get("vargasOffer") or f.get("vargasUnlocked"): return 10
    if f.get("radio"): return 9
    if f.get("craneOpen") or f.get("beat_lila") or f.get("lilaTalk"): return 8
    if f.get("hornEcho") or f.get("quayNight") or s.get("clues", 0) >= 3: return 7
    if f.get("ozMet"): return 6
    if f.get("maeMet"): return 5
    if f.get("openedLocker") or f.get("heardLocker"): return 4
    if f.get("kadeMet") or s.get("gym"): return 3
    if f.get("flyer"): return 2
    return 1
```

Names: 1 CLOCK IN, 2 ALLEY CARD, 3 RUST, 4 BAY C, 5 UNION, 6 WAFFLE, 7 FOG NOTE, 8 BLUE CRANE, 9 SHORTWAVE, 10 EXHIBITION, 11 LAUNCH, 12 THE WHISTLE.

Card night flavor: `day % 3 == 0` (does **not** lock fights).

---

## 16. Story events (IDs, when, flags)

Fire the first event whose `when` is true and (`once` not already in `flags["ev_"+id]`).

| id | when | sets / unlocks |
|----|------|----------------|
| intro | day==1 and not intro | intro; journal tape/rent |
| day1_nudge | day==1, intro, not ateStart | day1Nudge |
| flyer | intro and (ateStart or day>1) | flyer; unlock alley, rustgym |
| brant_d1 | loc docks, day 1, intro | brant |
| meet_kade | wins≥1 or loc rustgym | kadeMet; unlock rustgym |
| oz_intro | loc diner | ozMet |
| mae_intro | loc canteen and (brant or flyer) | maeMet |
| heard_locker | brant, loc docks, (hauled or wins≥1) | heardLocker |
| open_locker | openedLocker (set by locker activity) | journal Pier 9 |
| horn_echo | hornEar, docks, hour≥18 | hornEcho, +1 clue |
| lila_after | beat_lila | lilaTalk; unlock crane |
| radio | locker and (ozOpenRadio or ozCoil or clues≥2) | radio; unlock barge |
| vargas_offer | fame≥16, wins≥3, (locker or radio) | vargasOffer, vargasUnlocked; unlock arena |
| mae_raid | planMae and beat_vargas | raidReady; unlock barge |
| crowe_invite | (beat_vargas or beat_sophie) and fame≥22 | croweInvite, croweUnlocked |
| kade_style | gym==rust, rel.kade≥12, wins≥2 | kadeStyle (counter hook, +1 tec in fights) |
| rent_warn | day == rentDueOn-1 | |
| flat_offer | money≥80, fame≥8 | flatOffer |
| temple_unlock | fame≥18 and gym rust | templeSeen; unlock temple |
| juno_tape2 | replayTape | second listen: Vargas laugh |
| neighbor_4b | bunk, intro, ateStart, day>1 | neighbor4b |
| card_night | card night, flyer, hour<22 | flavor |
| harbor_slip | bunk, morning, day>3, day%4==0 | rotating rumor slip |
| brant_overtime | docks, brant, hauled | brantOver |
| kade_week | rustgym and (gym rust or kadeYes) | kadeWeek |
| scout | fame≥8, alley, flyer | scoutSeen |
| mae_file_find | maeFile and docks | maeFileFound, +clue, Pier 9 margin |
| oz_antenna | ozMet, diner, no radio, (locker or clues≥1) | ozAntenna |
| coil_buy | ozAntenna and boughtCoil | ozCoil |
| crane_open | fame≥12 | craneOpen; unlock crane |
| juno_dream | openedLocker, bunk, hour==8 | |
| commission_letter | fame≥14 and (locker or wins≥3) | |
| watch_serial | watchCount≥3 | +clue, same boat Pier 9 |
| barge_early | loc barge and not radio | you leave |

**Need-gated lines** (skip if need is false): Brant “on time” only if `grit`. Oz delayed boat line if player only asked for the plate (`ozQuiet`). Kade babysitter talk if `kadeNo`.

After a choice: insert the player’s spoken line (`said` or `label`) unless `silent`, then the NPC `reply`.

Talk menus (`talk_mae` / `kade` / `oz` / `lila`) pick the **first** line whose `need(state)` is true.

Sneak barge: needs `radio` or `raidReady`, evening or title bell. `planMae` + after Crowe → rescue/both. Else 45%+agi glimpse or get caught.

---

## 17. Full intro / tape / pad / cine copy (use verbatim)

### Cinematic order (do not shuffle)

1. **SIX DAYS AGO** — Juno Vale stands on a gangway in a rust shirt, radio in hand. They try to warn you and do not finish the sentence.
2. **THE TAPE** — `"Ren— don't take the night bout. If I don't come back, the ledger is in the—"` Static. A horn.
3. **AFTER** — Six days later. Juno's badge is gone. There is no barge log. The gangway is empty. The light is still on.
4. **NOW** — You cover Juno's shift. Foreman Brant still wants two people on Crane 4. He will get you.
5. **BUNKHOUSE 4C** — The cassette is still on the blanket. You play it until you know the horn by heart.
6. **MORNING — DAY 1** — Rent is due in seven days. The alarm goes off. You get up.

After cine: name + background select → CLOCK IN → **intro event must play** (do not pre-set `intro` / `ev_intro` or the tape scene is skipped).

### Intro event

- BUNKHOUSE 4C: The alarm goes off. You are alone in the bunk. Juno has been gone for six days.
- TAPE: Juno: "Ren— don't take the night bout. If I don't come back, the ledger is in the—"
- TAPE: The tape dies. You hear static, then a horn, then someone swearing. Juno never finishes the sentence.
- YOU: Six days. No badge. No barge log. Brant still has your name on Juno's shift. You have to clock in or lose the bunk.
  - **Get dressed and go to work.** → grit. You leave the tape, pull on boots.
  - **Play the tape again. Listen to the horn.** → hornEar. Reply must contain **interval** / **horn** / **channel**: “You play it again. The horn is longer than the main channel. You file the interval in your head and get up anyway.”

### Fridge nudge

Juno left a box of noodles. They always bought extra when a shift ran long. Eat, then walk to work.

### Look texts

- Quay day: Cranes. Gulls. A bollard with last winter's rope. (Must keep words **cranes** or **bollard**.)
- Quay + hornEar: you listen for the tape’s **horn**.
- Quay night first time: +1 clue, journal Pier 9 fog note.
- Mug: two mugs; Juno’s has a sugar crust; do not wash it.
- Bench: wrenches, tape, a glove that lost its twin. Not a clue.
- Juno’s bunk: navy-wrong fold. First look: Commission chip in the slat, +1 clue.
- Pad: the grocery list in section 2.

All other story/talk/bout lines live in `js/story.js` and `js/campaign.js`. Port them as data (JSON). Do not rewrite into fragments.

---

## 18. Rooms (Punch Club dollhouse)

16:9 painted room. Avatar walks on a floor plane (y ~ 70–86). Click hotspot → walk to `stand` → act.

Hotspot coords are **percent of the room** (x, y, w, h). See `js/rooms.js` for the full tables (bunk has 18 spots: door, quay, Juno bunk, cot, sofa, garage bag, skip, mats, bench, fridge, sink, kettle, mug, locker shadowbox, TV, tape, note).

Spawns (percent): bunk 48,80; docks 52,76; etc.

Poses: punch, lift, skip, down, idle, walk.

Walk speed: 70 percent-units / second. Snap when dist ≤ max(1.6, step).

HUD: HP, energy, hunger, mood bars; STR AGI STM TEC; money; analog clock; MAP BAG LOG.

Dialog: readable font (Courier / system). **Do not** put scanlines on top of text (that made “PAD” look like “PADED”).

---

## 19. Presentation / art direction

- Punch Club: cutaway rooms, walking doll, not FPS.
- Palette: paper `#efe4c8`, ink `#2a2418`, rust, teal, gold.
- Existing art in `art/`: `home.png` (playable bunk cutaway — do not invent a new home layout if you reuse it), room PNGs, cine stills, hero frames.
- Python remake may use the same PNGs or redraw. Keep 16:9.

Cine assets: `cine_02_juno`, `cine_tape_msg`, `cine_gone`, `cine_01_harbor`, `cine_03_tape`, `cine_06_home` (that order).

---

## 20. Suggested Python layout

```
last_whistle_py/
  main.py              pygame loop, 1280x720
  state.py             create/save/load, rng, clamp
  engine.py            time, rent, activities, workouts
  combat.py            plans, simulate_round
  story.py             events, talk, chapter_of
  content.py           dicts (or data/*.json)
  rooms.py             hotspots, walk
  render.py            blit room, doll, HUD, dialog
  data/story.json      all dialogue chains
  save.json
```

Stack that fits: **pygame-ce** + JSON data. No web required.

### Minimal pygame loop

```python
import pygame, json, time
from state import create_state, save, load
from engine import tick, start_workout, stop_workout, do_activity, spend_hours
from story import maybe_story, continue_story
from combat import pick_plan
from render import draw

pygame.init()
screen = pygame.display.set_mode((1280, 720))
clock = pygame.time.Clock()
S = load() or create_state(name="Ren", background="dock")
maybe_story(S)

while True:
    dt = clock.tick(60) / 1000
    for e in pygame.event.get():
        if e.type == pygame.QUIT:
            save(S); raise SystemExit
        if e.type == pygame.MOUSEBUTTONDOWN:
            handle_click(S, e.pos)   # walk / choice / STOP / fight plan
    tick(S, dt)                      # walk + workout reps
    draw(screen, S)
    pygame.display.flip()
```

### Worksheet: one workout rep

```python
def do_rep(S):
    w, d = S["workout"], WORKOUTS[S["workout"]["id"]]
    w["rep"] += 1
    for stat, amt in d["gains"].items():
        add_xp(S, stat, amt)
        w["gained"][stat] = w["gained"].get(stat, 0) + xp_gain(S, stat, amt)
    S["energy"] = max(0, S["energy"] - d["drain"]["energy"])
    S["hunger"] = max(0, S["hunger"] - d["drain"]["hunger"])
    S["mood"] = max(0, S["mood"] - d["drain"]["mood"])
    w["interest"] = max(0, w["interest"] - d["drain"]["interest"])
```

---

## 21. Story flags (complete list you will set)

`intro grit hornEar day1Nudge ateStart flyer flyerKeep flyerLeave brant brantQuiet brantAsk brantOver kadeMet kadeYes kadeAlley kadeNo kadeWeek kadeStyle ozMet ozChipAsk ozSaidAsk ozQuiet ozRadioHint ozOpenRadio ozAntenna ozCoil boughtCoil maeMet maeAlly maeFile maeSolo maeFileFound heardLocker ruiCover ruiPress openedLocker ledgerTook ledgerCopy hornEcho quayNight junoBunk replayTape lilaMet lilaTalk lilaSoft lilaPress lilaEcho lilaQuiet radio planMae planSolo vargasOffer vargasUnlocked takeVargas spitVargas vargasName vargasBell raidReady croweInvite croweUnlocked croweForJuno croweForBelt croweOver beat_* hauled rescued bargeSeen bargeEarly scoutSeen scoutName scoutJuno neighbor4b quietTape loudTape craneOpen templeSeen flatOffer commissionLetter watchSerial junoDream manifestClue useTapeNext tapedBout`

Also `ev_{eventId}` for once-events, `rentWarn{dueDay}`, `card{day}`, `slip{day}`.

Relationship keys: kade, mae, oz, lila.

---

## 22. Tests the JS already has (port these)

27 unit tests in `tests/run.js`. Critical ones:

- Cine[0] who contains `SIX DAYS`; cine[5] contains `MORNING`.
- Stats start at 0; leftover noodles in fridge.
- Intro → eat → flyer unlocks alley.
- Tommy pre-fight text has `table` or `card` or `rent` if flyer left on table.
- Horn replay reply has `interval` or `horn` or `channel`.
- Quay look has `cranes` or `bollard` or `horn`.
- Kade remembers `babysitter`.
- Oz plate-first still yields `boat` / `Quiet Ledger` later.
- Brant “on time” only if `grit`.
- Vargas offer waits on locker/radio even if day is 80.
- Push-ups also raise STM; live set can STOP; hunger/energy/mood drain during reps.
- Fade toast after two train sessions the same day.
- Mae 3 free meals; dumpster once/day; pads $8 once/day.

---

## 23. What not to do

- Do not calendar-gate Crowe or Vargas (no “day 36”).
- Do not skip the tape scene after the intro movie.
- Do not overwrite story into clever fragments.
- Do not make a first-person game.
- Do not daily-spiral every stat to zero (mild rust only).
- Do not hide the Quiet Ledger = boat fact behind a missable-only option.

---

## 24. Dialogue source

Port **all** chains from:

- `js/story.js` — EVENTS, TALK, ENDINGS, CINE, boutChain, boutResult, boutBell
- `js/campaign.js` — extra events, SLIPS, extra bout lines, chapter blurbs

Copy the strings. They are already written in complete sentences. A Python bot should load them as JSON, not rewrite them.

If you need a first playable slice in Python, implement in this order:

1. State + clock + bunk room + walk
2. Fridge noodles → flyer
3. Live push-ups + STOP
4. Docks haul + Brant
5. Alley Tommy fight (3 rounds, 4 plans)
6. Then Mae, Oz, locker, radio, Vargas, Crowe

That is the whole game.
