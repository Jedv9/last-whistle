# Last Whistle

A mobile-first dockyard fighting management game. Same *shape* as Punch Club — days, time slots, training, work, food, and a fight ladder — with an original story.

You are a Vale at **Blackwater Docks**. Your sibling Juno vanished after a Harbor Commission night bout. Rent is due. The alley pays cash. The water is lying.

## Play

Open `index.html` in a browser (phone or desktop). Portrait works best.

```bash
cd last-whistle
python3 -m http.server 4173
```

Then visit `http://localhost:4173`.

On a phone: **Add to Home Screen** for a standalone app.

## Loop

- Three slots a day: morning, afternoon, evening.
- **Work** the docks for coin. **Train** at the Rust Bucket (dues) or Iron Temple later. **Eat** or your stats fall apart. **Sleep** to close the day.
- Fight from the **FIGHT** tab at Bin Alley, the gym, Blue Crane, or Harbor Arena. Each round you pick a stance: Press, Box, Counter, Stall.
- Follow the journal. Talk to Kade, Mae, Oz, and Lila. The Quiet Ledger is not a book.

## Tests

```bash
node tests/run.js
```
