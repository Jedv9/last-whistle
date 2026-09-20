#!/usr/bin/env node
"use strict";

const fs = require("fs");
const path = require("path");
const vm = require("vm");

const root = path.join(__dirname, "..");
const sandbox = {
  console,
  Date,
  Math,
  setTimeout,
  clearTimeout,
  devicePixelRatio: 1,
  localStorage: {
    _s: {},
    getItem(k) {
      return Object.prototype.hasOwnProperty.call(this._s, k) ? this._s[k] : null;
    },
    setItem(k, v) {
      this._s[k] = String(v);
    },
    removeItem(k) {
      delete this._s[k];
    },
  },
};
sandbox.window = sandbox;
sandbox.global = sandbox;
sandbox.self = sandbox;
sandbox.AudioContext = function () {};

function load(file) {
  const code = fs.readFileSync(path.join(root, file), "utf8");
  vm.runInNewContext(code, sandbox, { filename: file });
}

load("js/content.js");
load("js/story.js");
load("js/campaign.js");
load("js/combat.js");
load("js/engine.js");
load("js/rooms.js");
sandbox.LW_FAST = true;

const E = sandbox.LW_ENGINE;
const assert = (cond, msg) => {
  if (!cond) throw new Error(msg);
};

let passed = 0;
function test(name, fn) {
  fn();
  passed += 1;
  console.log("ok - " + name);
}

function drainStory(s) {
  let guard = 0;
  while (s.story && guard++ < 80) {
    const node = s.story.chain[s.story.idx];
    if (node.choices) E.storyContinue(s, node.choices[0].id);
    else E.storyContinue(s, null);
  }
}

test("intro cinematic has video beats", () => {
  const cine = sandbox.LW_STORY.CINE;
  assert(cine && cine.length === 6, "six beats");
  cine.forEach(function (b) {
    assert(b.video && b.img && b.who && b.text, "beat fields " + (b.who || "?"));
  });
  assert(cine[0].who.indexOf("SIX DAYS") >= 0, "starts in the past");
  assert(cine[5].who.indexOf("MORNING") >= 0, "ends at morning");
});

test("new game starts at zero stats and leftover noodles", () => {
  const s = E.createState({ name: "Ren", background: "dock", seed: 1 });
  assert(s.str === 0 && s.agi === 0 && s.stm === 0 && s.tec === 0, "stats zero");
  assert(s.hour === 8, "morning hour");
  assert(s.fridge.noodles === 1, "leftover in fridge");
  assert(s.mood === 58, "starting mood");
});

test("new game + intro + eat + flyer chain", () => {
  const s = E.createState({ name: "Ren", background: "dock", seed: 42 });
  E.maybeStory(s);
  assert(s.story && s.story.id === "intro", "intro should start");
  drainStory(s);
  assert(s.flags.intro, "intro flag");
  assert(s.flags.day1Nudge, "eat-then-work nudge");
  assert(!s.flags.flyer, "flyer waits on breakfast");
  E.doActivity(s, "fridge");
  E.eatFridge(s, "noodles");
  if (s.story) drainStory(s);
  assert(s.flags.ateStart, "ate leftovers");
  assert(s.flags.flyer, "flyer after eat");
  assert(s.unlocked.indexOf("alley") >= 0, "alley unlocked");
  assert(s.screen === "hub", "hub after stories");
});

test("haul pays and spends a slot", () => {
  const s = E.createState({ name: "Ren", background: "dock", seed: 7 });
  s.flags.intro = true;
  s.flags.flyer = true;
  s.flags.ev_intro = true;
  s.flags.ev_flyer = true;
  E.travel(s, "docks");
  drainStory(s);
  const money = s.money;
  const hour = s.hour;
  E.doActivity(s, "haul");
  assert(s.money > money, "paid");
  assert(s.hour === hour + 4 || s.day > 1, "time passed");
  assert(s.result, "result overlay");
  E.ackResult(s);
});

test("sleep ends the day", () => {
  const s = E.createState({ name: "Ren", background: "galley", seed: 3 });
  s.flags.intro = true;
  s.flags.ev_intro = true;
  s.flags.flyer = true;
  s.flags.ev_flyer = true;
  const d = s.day;
  E.doActivity(s, "sleep");
  assert(s.day === d + 1, "new day");
  assert(s.hour === 8, "morning");
  assert(s.energy > 50, "rested");
});

test("gym membership gates bag work", () => {
  const s = E.createState({ name: "Ren", background: "dock", seed: 9 });
  s.loc = "rustgym";
  s.unlocked.push("rustgym");
  const act = sandbox.LW_CONTENT.ACTIVITIES.find((a) => a.id === "bag");
  const err = E.canActivity(s, act);
  assert(err, "should block");
  s.money = 100;
  E.doActivity(s, "join_rust");
  E.ackResult(s);
  assert(s.gym === "rust", "joined");
  assert(!E.canActivity(s, act), "bag open");
});

test("alley board talks before the bell", () => {
  const s = E.createState({ name: "Ren", background: "dock", seed: 31 });
  s.flags.intro = true;
  s.flags.ev_intro = true;
  s.flags.flyer = true;
  s.flags.ev_flyer = true;
  s.flags.flyerLeave = true;
  s.str = 16;
  s.agi = 16;
  s.stm = 16;
  s.tec = 14;
  s.hp = 100;
  s.loc = "alley";
  E.approachFight(s, "tommy");
  assert(s.story && s.story.id === "bout_tommy", "pre-fight talk");
  assert(/table|card|rent/i.test(s.story.chain[s.story.idx].text + (s.story.chain[1] && s.story.chain[1].text || "")), "remembers the card");
  drainStory(s);
  assert(s.fight, "bell after talk");
  assert(s.screen === "fight", "fight screen");
});

test("alley fight resolves to a record", () => {
  const s = E.createState({ name: "Ren", background: "dock", seed: 99 });
  s.flags.intro = true;
  s.flags.ev_intro = true;
  s.flags.flyer = true;
  s.flags.ev_flyer = true;
  s.str = 16;
  s.agi = 16;
  s.stm = 16;
  s.tec = 14;
  s.hp = 100;
  s.loc = "alley";
  E.startFight(s, "tommy");
  assert(s.fight, "fight started");
  let n = 0;
  while (s.fight && n++ < 8) {
    E.pickPlan(s, "box");
  }
  assert(!s.fight, "fight settled");
  assert(s.wins + s.losses === 1, "record moved");
  E.ackResult(s);
});

test("rent collects or misses", () => {
  const s = E.createState({ name: "Ren", background: "dock", seed: 5 });
  s.flags.intro = true;
  s.flags.ev_intro = true;
  s.flags.flyer = true;
  s.flags.ev_flyer = true;
  s.day = 6;
  s.hour = 20;
  s.slot = 2;
  s.money = 100;
  E.doActivity(s, "sleep");
  assert(s.day === 7, "rent day");
  assert(s.money < 100, "rent took money");
  assert(s.rentDueOn === 14, "next week");
});

test("save and load", () => {
  const s = E.createState({ name: "Mae-Ann", background: "night", seed: 11 });
  s.money = 77;
  E.persist(s);
  const loaded = E.load();
  assert(loaded.name === "Mae-Ann", "name");
  assert(loaded.money === 77, "money");
});

test("crowe win with Mae plan is double bell", () => {
  const s = E.createState({ name: "Ren", background: "dock", seed: 1 });
  s.flags.planMae = true;
  s.flags.vargasUnlocked = true;
  s.flags.croweUnlocked = true;
  s.str = 24;
  s.agi = 24;
  s.stm = 24;
  s.tec = 24;
  s.hp = 100;
  s.maxHp = 100;
  s.loc = "arena";
  E.startFight(s, "crowe");
  let n = 0;
  while (s.fight && n++ < 10) E.pickPlan(s, "box");
  assert(s.ending === "both" || s.ending === "glory" || s.ending === "rescue" || s.ending === "net", "ending set " + s.ending);
  if (s.flags.beat_crowe && s.flags.planMae) assert(s.ending === "both", "both ending");
});

test("walk to a hotspot then haul", () => {
  const s = E.createState({ name: "Ren", background: "dock", seed: 7 });
  s.flags.intro = true;
  s.flags.flyer = true;
  s.flags.ev_intro = true;
  s.flags.ev_flyer = true;
  E.travel(s, "docks");
  drainStory(s);
  const money = s.money;
  E.queueWalk(s, { kind: "act", id: "haul", x: 42, y: 48 });
  let n = 0;
  while (n++ < 120 && !s.result) E.tickActor(s, 0.05);
  assert(s.result, "result after walk");
  assert(s.money > money, "paid after walk");
  assert(Math.abs(s.actor.x - 42) < 2, "stood on crates");
});

test("home inspect objects talk in the room", () => {
  const s = E.createState({ name: "Ren", background: "dock", seed: 2 });
  s.flags.intro = true;
  s.flags.ev_intro = true;
  s.flags.flyer = true;
  s.flags.ev_flyer = true;
  E.doActivity(s, "look_quay");
  assert(s.story && /cranes|quay|bollard/i.test(s.story.chain[0].text), "quay line");
  drainStory(s);
  const clues = s.clues;
  E.doActivity(s, "look_juno_bunk");
  assert(s.clues === clues + 1, "juno bunk clue");
  assert(s.flags.junoBunk, "flag");
  drainStory(s);
});

test("sofa nap spends two hours; fridge eat at home", () => {
  const s = E.createState({ name: "Ren", background: "dock", seed: 4 });
  s.flags.intro = true;
  s.flags.ev_intro = true;
  s.flags.flyer = true;
  s.flags.ev_flyer = true;
  s.flags.ateStart = true;
  s.energy = 40;
  s.mood = 40;
  const hour = s.hour;
  E.doActivity(s, "sit_sofa");
  assert(s.energy > 50, "sofa nap energy");
  assert(s.mood > 40, "sofa nap mood");
  assert(s.hour === hour + 2, "two hours");
  drainStory(s);
  E.doActivity(s, "fridge");
  assert(s.screen === "fridge", "fridge open");
  const hunger = s.hunger;
  E.eatFridge(s, "noodles");
  assert(s.fridge.noodles === 0, "ate leftover");
  assert(s.hunger > hunger, "fed");
  assert(s.screen === "hub", "closed fridge");
});

test("walk to fridge then eat", () => {
  const s = E.createState({ name: "Ren", background: "dock", seed: 8 });
  s.flags.intro = true;
  s.flags.ev_intro = true;
  s.flags.flyer = true;
  s.flags.ev_flyer = true;
  E.queueWalk(s, { kind: "act", id: "fridge", x: 28, y: 78 });
  let n = 0;
  while (n++ < 120 && s.screen !== "fridge") E.tickActor(s, 0.05);
  assert(s.screen === "fridge", "opened after walk");
  assert(Math.abs(s.actor.x - 28) < 2, "stood at fridge");
});

test("hunger gates training and work", () => {
  const s = E.createState({ name: "Ren", background: "dock", seed: 12 });
  s.flags.intro = true;
  s.flags.ev_intro = true;
  s.flags.flyer = true;
  s.flags.ev_flyer = true;
  s.hunger = 8;
  s.loc = "docks";
  const haul = sandbox.LW_CONTENT.ACTIVITIES.find((a) => a.id === "haul");
  assert(E.canActivity(s, haul), "haul blocked when starving");
  s.loc = "bunk";
  const bag = sandbox.LW_CONTENT.ACTIVITIES.find((a) => a.id === "home_bag");
  assert(E.canActivity(s, bag), "bag blocked when starving");
  s.hunger = 40;
  assert(!E.canActivity(s, bag), "bag open after eating");
});

test("low mood halves training; TV restores mood", () => {
  const s = E.createState({ name: "Ren", background: "dock", seed: 13 });
  s.flags.intro = true;
  s.flags.ev_intro = true;
  s.flags.flyer = true;
  s.flags.ev_flyer = true;
  s.mood = 20;
  s.hunger = 80;
  const xpBefore = s.xp.str;
  E.doActivity(s, "pushups");
  const lowGain = s.xp.str - xpBefore;
  const s2 = E.createState({ name: "Ren", background: "dock", seed: 13 });
  s2.flags.intro = true;
  s2.flags.ev_intro = true;
  s2.flags.flyer = true;
  s2.flags.ev_flyer = true;
  s2.mood = 80;
  s2.hunger = 80;
  E.doActivity(s2, "pushups");
  assert(s2.xp.str > lowGain, "happy trains harder");
  const mood = s2.mood;
  drainStory(s2);
  E.doActivity(s2, "tv");
  assert(s2.mood > mood, "TV lifts mood");
});

test("Mae feeds three times when broke and hungry", () => {
  const s = E.createState({ name: "Ren", background: "dock", seed: 14 });
  s.flags.intro = true;
  s.flags.ev_intro = true;
  s.flags.flyer = true;
  s.flags.ev_flyer = true;
  s.flags.ev_mae_intro = true;
  s.loc = "canteen";
  s.hunger = 20;
  s.money = 8;
  E.doActivity(s, "talk_mae");
  assert(s.maeMeals === 1, "first plate");
  assert(s.hunger > 50, "stew fed");
  drainStory(s);
  s.hunger = 20;
  s.money = 5;
  E.doActivity(s, "talk_mae");
  drainStory(s);
  s.hunger = 20;
  s.money = 4;
  E.doActivity(s, "talk_mae");
  assert(s.maeMeals === 3, "three plates");
  drainStory(s);
  s.hunger = 20;
  s.money = 4;
  const hunger = s.hunger;
  E.doActivity(s, "talk_mae");
  assert(s.maeMeals === 3, "no fourth");
  assert(s.hunger === hunger, "no free stew after three");
});

test("dumpster burger feeds and hurts; pads once a day", () => {
  const s = E.createState({ name: "Ren", background: "dock", seed: 15 });
  s.flags.intro = true;
  s.flags.ev_intro = true;
  s.flags.flyer = true;
  s.flags.ev_flyer = true;
  s.loc = "alley";
  s.unlocked.push("alley");
  s.hunger = 10;
  s.mood = 60;
  const hp = s.hp;
  E.doActivity(s, "dumpster");
  assert(s.hunger > 30, "bin fed");
  assert(s.hp < hp, "bin hurt");
  assert(s.mood < 60, "bin mood");
  E.ackResult(s);
  const err = E.canActivity(s, sandbox.LW_CONTENT.ACTIVITIES.find((a) => a.id === "dumpster"));
  assert(err, "dumpster once a day");
  s.loc = "rustgym";
  s.unlocked.push("rustgym");
  s.money = 40;
  s.hunger = 50;
  E.doActivity(s, "pads");
  assert(s.money === 32, "pads cost 8");
  assert(s.padsDay === s.day, "pads marked");
  const padsErr = E.canActivity(s, sandbox.LW_CONTENT.ACTIVITIES.find((a) => a.id === "pads"));
  assert(padsErr, "pads once a day");
});

test("repeat training shows fade toast", () => {
  const s = E.createState({ name: "Ren", background: "dock", seed: 16 });
  s.flags.intro = true;
  s.flags.ev_intro = true;
  s.flags.flyer = true;
  s.flags.ev_flyer = true;
  s.hunger = 90;
  s.energy = 100;
  E.doActivity(s, "pushups");
  assert(s.xp.stm > 0, "push-ups also feed stamina");
  E.doActivity(s, "pushups");
  assert(s.toast && /fading/i.test(s.toast), "rotate toast");
});

test("live push-ups tick per rep and can stop", () => {
  const prev = sandbox.LW_FAST;
  sandbox.LW_FAST = false;
  const s = E.createState({ name: "Ren", background: "dock", seed: 17 });
  s.flags.intro = true;
  s.flags.ev_intro = true;
  s.flags.flyer = true;
  s.flags.ev_flyer = true;
  s.hunger = 80;
  s.energy = 100;
  s.mood = 70;
  E.startWorkout(s, "pushups");
  assert(s.workout && s.workout.id === "pushups", "session started");
  const str0 = s.xp.str;
  const en0 = s.energy;
  const hu0 = s.hunger;
  const md0 = s.mood;
  let n = 0;
  while (n++ < 80 && s.workout && s.workout.rep < 4) E.tickActor(s, 0.2);
  assert(s.workout && s.workout.rep >= 3, "did reps");
  assert(s.xp.str > str0, "strength progress each push");
  assert(s.xp.stm > 0, "stamina too");
  assert(s.energy < en0 && s.hunger < hu0 && s.mood < md0, "needs drain while working");
  assert(s.workout.interest < 100, "interest drops");
  const hour = s.hour;
  const reps = s.workout.rep;
  E.stopWorkout(s);
  assert(!s.workout, "stopped mid-set");
  assert(reps < 12, "did not finish the set");
  assert(s.hour === hour + 1, "partial set still costs an hour");
  assert(s.xp.str > str0, "keeps the work already done");
  sandbox.LW_FAST = prev;
});

test("winning a fight lifts mood", () => {
  const s = E.createState({ name: "Ren", background: "dock", seed: 99 });
  s.flags.intro = true;
  s.flags.ev_intro = true;
  s.flags.flyer = true;
  s.flags.ev_flyer = true;
  s.str = 16;
  s.agi = 16;
  s.stm = 16;
  s.tec = 14;
  s.hp = 100;
  s.mood = 30;
  s.loc = "alley";
  E.startFight(s, "tommy");
  let n = 0;
  while (s.fight && n++ < 8) E.pickPlan(s, "box");
  assert(s.mood > 30, "fight restored mood");
});

test("choices insert a unique reply and plant flags", () => {
  const s = E.createState({ name: "Ren", background: "dock", seed: 21 });
  E.maybeStory(s);
  while (s.story && !s.story.chain[s.story.idx].choices) E.storyContinue(s, null);
  E.storyContinue(s, "again");
  assert(s.flags.hornEar, "listened again");
  if (s.story && !/interval|horn|channel/i.test(s.story.chain[s.story.idx].text)) E.storyContinue(s, null);
  assert(s.story && /interval|horn|channel/i.test(s.story.chain[s.story.idx].text), "unique reply");
  drainStory(s);
  assert(s.flags.day1Nudge, "nudge still chains");
});

test("quay look remembers the horn; Kade remembers babysitter", () => {
  const s = E.createState({ name: "Ren", background: "dock", seed: 22 });
  s.flags.intro = true;
  s.flags.ev_intro = true;
  s.flags.hornEar = true;
  s.flags.flyer = true;
  s.flags.ev_flyer = true;
  s.flags.ateStart = true;
  E.doActivity(s, "look_quay");
  assert(/horn|cranes|bollard/i.test(s.story.chain[0].text), "quay callback");
  drainStory(s);
  s.flags.kadeNo = true;
  s.flags.kadeMet = true;
  s.loc = "rustgym";
  s.unlocked.push("rustgym");
  E.doActivity(s, "talk_kade");
  assert(/babysitter/i.test(s.story.chain[0].text), "kade remembers");
});

test("Oz plate choice still yields the boat later", () => {
  const s = E.createState({ name: "Ren", background: "dock", seed: 23 });
  s.flags.intro = true;
  s.flags.ev_intro = true;
  s.flags.flyer = true;
  s.flags.ev_flyer = true;
  s.flags.ateStart = true;
  s.flags.ev_day1_nudge = true;
  s.unlocked.push("diner");
  s.loc = "diner";
  E.maybeStory(s);
  assert(s.story && s.story.id === "oz_intro", "oz intro");
  while (s.story && !s.story.chain[s.story.idx].choices) E.storyContinue(s, null);
  E.storyContinue(s, "eat");
  assert(s.flags.ozQuiet, "wanted the plate");
  drainStory(s);
  E.doActivity(s, "talk_oz");
  assert(/boat|Quiet Ledger/i.test(s.story.chain[0].text), "delayed boat clue");
});

test("campaign is a twelve-chapter haul", () => {
  assert(sandbox.LW_STORY.CHAPTERS && sandbox.LW_STORY.CHAPTERS.length === 12, "12 chapters");
  const s = E.createState({ name: "Ren", background: "dock", seed: 1 });
  assert(sandbox.LW_STORY.chapterOf(s).id === 1, "ch1 before story");
  s.flags.flyer = true;
  assert(sandbox.LW_STORY.chapterOf(s).id === 2, "flyer advances chapter");
  s.flags.croweUnlocked = true;
  assert(sandbox.LW_STORY.chapterOf(s).id === 12, "finale is a story beat");
  s.flags.croweUnlocked = false;
  s.loc = "alley";
  s.unlocked.push("alley");
  let bouts = E.availableBouts(s).map((o) => o.id);
  assert(bouts.indexOf("tommy") >= 0, "tommy open");
  assert(bouts.indexOf("wren") < 0, "wren waits on a win");
  s.wins = 1;
  s.fame = 6;
  bouts = E.availableBouts(s).map((o) => o.id);
  assert(bouts.indexOf("wren") >= 0, "wren after a win");
  const v = sandbox.LW_STORY.EVENTS.find((e) => e.id === "vargas_offer");
  s.fame = 40;
  s.wins = 8;
  assert(v && !v.when(s), "vargas waits on the locker or radio");
  s.flags.openedLocker = true;
  assert(v.when(s), "vargas after the story beat");
  s.day = 80;
  assert(v.when(s), "days can run; the gate is still the story");
});

test("Brant grit line only if you clocked in cold", () => {
  const cold = E.createState({ name: "Ren", background: "dock", seed: 24 });
  cold.flags.intro = true;
  cold.flags.ev_intro = true;
  cold.flags.grit = true;
  cold.flags.flyer = true;
  cold.flags.ev_flyer = true;
  cold.flags.ateStart = true;
  cold.flags.ev_day1_nudge = true;
  E.travel(cold, "docks");
  assert(cold.story && cold.story.id === "brant_d1", "brant");
  const gritLines = [];
  while (cold.story) {
    gritLines.push(cold.story.chain[cold.story.idx].text);
    const node = cold.story.chain[cold.story.idx];
    if (node.choices) E.storyContinue(cold, node.choices[0].id);
    else E.storyContinue(cold, null);
  }
  assert(gritLines.some((t) => /on time/i.test(t)), "grit gets the on-time line");
  const texts = [];
  const s2 = E.createState({ name: "Ren", background: "dock", seed: 24 });
  s2.flags.intro = true;
  s2.flags.ev_intro = true;
  s2.flags.hornEar = true;
  s2.flags.flyer = true;
  s2.flags.ev_flyer = true;
  s2.flags.ateStart = true;
  s2.flags.ev_day1_nudge = true;
  E.travel(s2, "docks");
  while (s2.story) {
    texts.push(s2.story.chain[s2.story.idx].text);
    const node = s2.story.chain[s2.story.idx];
    if (node.choices) E.storyContinue(s2, node.choices[0].id);
    else E.storyContinue(s2, null);
  }
  assert(!texts.some((t) => /on time/i.test(t)), "no grit compliment if you lingered on the tape");
});

console.log("\n" + passed + " tests passed");
