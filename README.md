# Last Whistle

A Punch Club–style dockyard fighting game you can play in a phone browser.

You manage one fighter between shifts. Train, rest, take fights on a local card, scrape together cash. v0 is a short playable slice — not a finished game.

## Run it

```bash
npm install
npm run dev
```

Open the URL Vite prints (usually `http://localhost:5173`) on your phone or in a desktop browser. Portrait works best.

```bash
npm run build
npm run preview
```

builds a static folder in `dist/` you can host anywhere.

No account. No install. Progress saves in `localStorage` on that browser.

## How to play

1. **New game** — name your fighter (or keep Rook).
2. **Yard (home)** — day, cash, condition, fatigue, strength / grit / stamina.
3. **Train** — bag (strength), iron (grit), or roadwork (stamina). Each raises a stat and fatigue.
4. **The card** — 7 local names. Fight the next one if you can stand.
5. **Fight** — tap through exchanges. Win pays. Lose still drips a little cash. Either way you get hurt and tired.
6. **End day** — night pass, some recovery, next morning.

Two actions per day (train, rest, or fight). Clinic costs cash and does **not** spend an action — that's the soft recovery if you're too beaten up to fight. A bad night can also make the next day a short shift (one action) instead of locking the run.

Refresh keeps the run. **New game** wipes it.

## What's in / what's not

See `DESIGN.md`. Short version: one fighter, a small ladder, simple stats, no shop beyond the clinic, no story campaign, no backend.
