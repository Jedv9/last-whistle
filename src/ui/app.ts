import { resolveFight } from "../game/combat";
import { LADDER, opponentAt } from "../game/opponents";
import { clearSave, hasSave, loadSave, writeSave } from "../game/persist";
import {
  applyClinic,
  applyFightResult,
  applyRest,
  bumpStat,
  canFight,
  endDay,
  fightBlockReason,
  go,
  newGame,
  spendAction,
  startNextDay,
} from "../game/state";
import {
  CLINIC_COST,
  FIGHT_CONDITION_MIN,
  FIGHT_FATIGUE_MAX,
  type GameState,
  type Screen,
} from "../game/types";

function needsClinic(s: GameState): boolean {
  const wrecked =
    s.fighter.condition < FIGHT_CONDITION_MIN || s.fighter.fatigue > FIGHT_FATIGUE_MAX;
  return s.fighter.condition < 50 || s.fighter.fatigue > 70 || (wrecked && s.actionsLeft > 0);
}

function esc(value: string): string {
  return value.replace(/[&<>"']/g, (ch) => {
    const map: Record<string, string> = {
      "&": "&amp;",
      "<": "&lt;",
      ">": "&gt;",
      '"': "&quot;",
      "'": "&#39;",
    };
    return map[ch];
  });
}

function bar(value: number, kind = ""): string {
  const width = Math.max(0, Math.min(100, value));
  const cls = kind ? `fill ${kind}` : "fill";
  return `<div class="track"><div class="${cls}" style="width:${width}%"></div></div>`;
}

let state: GameState | null = null;
let root: HTMLElement;

function commit(next: GameState): void {
  state = next;
  if (next.screen !== "title") writeSave(next);
  render();
}

function header(s: GameState): string {
  return `
    <header class="top">
      <div class="brand">Last Whistle</div>
      <div class="meta">
        <span>Day <strong>${s.day}</strong></span>
        <span>$<strong>${s.cash}</strong></span>
      </div>
    </header>
  `;
}

function titleView(): string {
  const cont = hasSave();
  return `
    <section class="shell title-screen">
      <div class="grow"></div>
      <div class="title-mark"></div>
      <h1>Last<br/>Whistle</h1>
      <p class="lede">Between shifts you run a fight club on the docks. Train. Climb the card. Don't get broken.</p>
      <div class="field">
        <label for="name">Your name</label>
        <input id="name" maxlength="16" value="Rook" autocomplete="off" enterkeyhint="done" />
      </div>
      <div class="actions">
        <button class="btn primary" data-act="new">New game</button>
        <button class="btn ghost" data-act="continue" ${cont ? "" : "disabled"}>Continue</button>
      </div>
    </section>
  `;
}

function hubView(s: GameState): string {
  const f = s.fighter;
  const block = fightBlockReason(s);
  const condKind = f.condition < FIGHT_CONDITION_MIN ? "warn" : "";
  const fatKind = f.fatigue > 70 ? "ember" : "";
  return `
    <section class="shell">
      ${header(s)}
      <div class="grow">
        ${s.cardCleared ? `<div class="banner">You cleared the local card. Exhibition fights still pay, just less.</div>` : ""}
        <article class="card">
          <h2 class="fighter-name">${esc(f.name)}</h2>
          <div class="bars">
            <div class="bar-row"><span>Condition</span>${bar(f.condition, condKind)}<span>${f.condition}</span></div>
            <div class="bar-row"><span>Fatigue</span>${bar(f.fatigue, fatKind)}<span>${f.fatigue}</span></div>
          </div>
          <div class="stats">
            <div class="stat"><b>${f.strength}</b><span>Strength</span></div>
            <div class="stat"><b>${f.grit}</b><span>Grit</span></div>
            <div class="stat"><b>${f.stamina}</b><span>Stamina</span></div>
          </div>
        </article>
        <p class="note">${s.actionsLeft} action${s.actionsLeft === 1 ? "" : "s"} left today.</p>
        ${block && s.actionsLeft > 0 ? `<p class="note warn">${esc(block)}</p>` : ""}
      </div>
      <div class="actions">
        <button class="btn" data-act="train" ${s.actionsLeft ? "" : "disabled"}>
          Train
          <span class="sub">Raise a stat. Costs fatigue.</span>
        </button>
        <button class="btn" data-act="card" ${s.actionsLeft ? "" : "disabled"}>
          The card
          <span class="sub">${s.cardCleared ? "Exhibition bout" : `Next: ${opponentAt(s.nextOpponent).name}`}</span>
        </button>
        <button class="btn" data-act="rest" ${s.actionsLeft ? "" : "disabled"}>
          Rest
          <span class="sub">Drop fatigue. Patch up.</span>
        </button>
        ${needsClinic(s) ? `
        <button class="btn" data-act="clinic" ${s.cash >= CLINIC_COST ? "" : "disabled"}>
          Clinic · $${CLINIC_COST}
          <span class="sub">Doesn't spend an action.</span>
        </button>` : ""}
        <button class="btn primary" data-act="end">End day</button>
      </div>
    </section>
  `;
}

function trainView(s: GameState): string {
  return `
    <section class="shell">
      ${header(s)}
      <div class="grow">
        <h2>Train</h2>
        <p class="lede">One drill. One action. Body pays in fatigue.</p>
      </div>
      <div class="actions">
        <button class="btn" data-act="bags">
          Heavy bag
          <span class="sub">+2 strength · +14 fatigue</span>
        </button>
        <button class="btn" data-act="iron">
          Iron
          <span class="sub">+2 grit · +14 fatigue</span>
        </button>
        <button class="btn" data-act="road">
          Roadwork
          <span class="sub">+2 stamina · +14 fatigue</span>
        </button>
        <button class="btn ghost" data-act="back">Back</button>
      </div>
    </section>
  `;
}

function cardView(s: GameState): string {
  const block = fightBlockReason(s);
  const rows = LADDER.map((opp, i) => {
    const done = s.beaten.includes(opp.id);
    const next = i === s.nextOpponent && !s.cardCleared;
    const cls = done ? "opp done" : next ? "opp next" : "opp";
    const tag = done ? "Beaten" : next ? "Next" : opp.title;
    return `
      <div class="${cls}">
        <div>
          <div class="who">${esc(opp.name)}</div>
          <div class="tag">${esc(tag)}</div>
        </div>
        <div class="tag">$${opp.purse}</div>
      </div>
    `;
  }).join("");

  const next = opponentAt(s.nextOpponent);
  return `
    <section class="shell">
      ${header(s)}
      <div class="grow">
        <h2>The card</h2>
        <p class="lede">${esc(next.blurb)}</p>
        <div class="opp-list">${rows}</div>
        ${block ? `<p class="note warn">${esc(block)}</p>` : ""}
      </div>
      <div class="actions">
        <button class="btn primary" data-act="fight" ${canFight(s) ? "" : "disabled"}>
          ${s.cardCleared ? "Exhibition" : `Fight ${esc(next.name)}`}
        </button>
        <button class="btn ghost" data-act="back">Back</button>
      </div>
    </section>
  `;
}

function fightView(s: GameState): string {
  const opp = opponentAt(s.nextOpponent);
  const step = s.fightStep;
  const ex = s.lastOutcome?.exchanges[Math.max(0, step - 1)];
  const pHp = ex ? ex.playerHp : 100;
  const oHp = ex ? ex.oppHp : 100;
  const text = step === 0
    ? `You meet ${opp.name} under the crane lights.`
    : ex?.text ?? "";
  const last = !!s.lastOutcome && step >= s.lastOutcome.exchanges.length;
  return `
    <section class="shell">
      ${header(s)}
      <div class="grow">
        <div class="fight-head">
          <div>
            <h3>${esc(s.fighter.name)}</h3>
            ${bar(pHp, pHp < 35 ? "warn" : "")}
          </div>
          <div class="vs">VS</div>
          <div class="right">
            <h3>${esc(opp.name)}</h3>
            ${bar(oHp, oHp < 35 ? "warn" : "")}
          </div>
        </div>
        <article class="card log"><p>${esc(text)}</p></article>
      </div>
      <button class="btn primary" data-act="next">${last ? "Result" : "Next"}</button>
    </section>
  `;
}

function resultView(s: GameState): string {
  const o = s.lastOutcome;
  if (!o) return hubView(s);
  return `
    <section class="shell">
      ${header(s)}
      <div class="grow">
        <p class="tiny">${o.won ? "Win" : "Loss"}</p>
        <h2>${o.won ? "Still standing" : "Down"}</h2>
        <p class="result-cash">+$${o.purse}</p>
        <article class="card">
          <p class="note">${o.won ? `${esc(o.opponentName)} is done.` : `${esc(o.opponentName)} keeps the name.`}</p>
          <p class="note">Condition −${o.conditionLoss}. Fatigue +${o.fatigueGain}.</p>
          ${o.won && o.opponentId === "night-foreman" && s.beaten.length === 7 ? `<p class="note">Last name on the card is yours now.</p>` : ""}
        </article>
      </div>
      <button class="btn primary" data-act="hub">Back to the yard</button>
    </section>
  `;
}

function nightView(s: GameState): string {
  return `
    <section class="shell">
      ${header(s)}
      <div class="grow">
        <p class="tiny">Last whistle</p>
        <h2>Day ${s.day}</h2>
        <p class="lede">${esc(s.nightNote)}</p>
      </div>
      <button class="btn primary" data-act="dawn">Next day</button>
    </section>
  `;
}

function view(): string {
  if (!state || state.screen === "title") return titleView();
  const screens: Record<Exclude<Screen, "title">, (s: GameState) => string> = {
    hub: hubView,
    train: trainView,
    card: cardView,
    fight: fightView,
    result: resultView,
    night: nightView,
  };
  return screens[state.screen](state);
}

function onClick(act: string): void {
  if (act === "new") {
    const input = root.querySelector<HTMLInputElement>("#name");
    clearSave();
    commit(newGame(input?.value ?? "Rook"));
    return;
  }
  if (act === "continue") {
    const saved = loadSave();
    if (saved) commit({ ...saved, screen: saved.screen === "title" ? "hub" : saved.screen });
    return;
  }
  if (!state) return;

  if (act === "train") commit(go(state, "train"));
  else if (act === "card") commit(go(state, "card"));
  else if (act === "back" || act === "hub") commit(go(state, "hub"));
  else if (act === "end") commit(endDay(state));
  else if (act === "dawn") commit(startNextDay(state));
  else if (act === "rest" && state.actionsLeft > 0) {
    commit(spendAction({ ...state, fighter: applyRest(state.fighter), screen: "hub" }));
  } else if (act === "clinic" && state.cash >= CLINIC_COST) {
    commit({
      ...state,
      cash: state.cash - CLINIC_COST,
      fighter: applyClinic(state.fighter),
      screen: "hub",
    });
  } else if (act === "bags" && state.actionsLeft > 0) {
    commit(spendAction({ ...state, fighter: bumpStat(state.fighter, "strength"), screen: "hub" }));
  } else if (act === "iron" && state.actionsLeft > 0) {
    commit(spendAction({ ...state, fighter: bumpStat(state.fighter, "grit"), screen: "hub" }));
  } else if (act === "road" && state.actionsLeft > 0) {
    commit(spendAction({ ...state, fighter: bumpStat(state.fighter, "stamina"), screen: "hub" }));
  } else if (act === "fight" && canFight(state)) {
    const opp = opponentAt(state.nextOpponent);
    const outcome = resolveFight(state.fighter, opp);
    if (state.cardCleared) outcome.purse = Math.round(opp.purse * 0.55);
    commit({ ...state, screen: "fight", lastOutcome: outcome, fightStep: 0 });
  } else if (act === "next" && state.lastOutcome) {
    if (state.fightStep >= state.lastOutcome.exchanges.length) {
      commit(applyFightResult(state));
    } else {
      commit({ ...state, fightStep: state.fightStep + 1 });
    }
  }
}

function bind(): void {
  root.querySelectorAll<HTMLButtonElement>("[data-act]").forEach((btn) => {
    btn.addEventListener("click", () => onClick(btn.dataset.act ?? ""));
  });
}

function render(): void {
  root.innerHTML = view();
  bind();
}

export function mount(el: HTMLElement): void {
  root = el;
  state = { ...newGame("Rook"), screen: "title" };
  render();
}
