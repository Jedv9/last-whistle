/* Last Whistle — state, activities, time, save */
(function (root) {
  const C = () => root.LW_CONTENT;
  const S = () => root.LW_STORY;
  const K = () => root.LW_COMBAT;
  const SAVE = "lastWhistleSaveV1";

  function rngFn(state) {
    return function () {
      state.seed = (state.seed * 16807) % 2147483647;
      return (state.seed - 1) / 2147483646;
    };
  }

  function clamp(n, a, b) {
    return Math.max(a, Math.min(b, n));
  }

  function createState(opts) {
    const bg = C().BACKGROUNDS.find((b) => b.id === (opts.background || "dock"));
    const seed = (opts.seed || Date.now() % 1000000) + 1;
    return {
      screen: "hub",
      seed: seed,
      day: 1,
      hour: 8,
      slot: 0,
      name: (opts.name || "Ren").slice(0, 14),
      background: bg.id,
      style: bg.style,
      loc: "bunk",
      str: 0,
      agi: 0,
      stm: 0,
      tec: 0,
      xp: { str: 0, agi: 0, stm: 0, tec: 0 },
      trained: { str: 0, agi: 0, stm: 0, tec: 0 },
      hp: 100,
      maxHp: 100,
      energy: 100,
      maxEnergy: 100,
      hunger: 62,
      mood: 58,
      money: 38,
      maeMeals: 0,
      padsDay: 0,
      dumpsterDay: 0,
      fame: 0,
      injured: 0,
      rentDueOn: 7,
      rentMissed: 0,
      home: "bunk",
      gym: null,
      gymPaidUntil: 0,
      items: { salve: 1 },
      fridge: { noodles: 1, stew: 0, coffee: 0, plate: 0, protein: 0 },
      gear: [],
      equipped: { hands: null, feet: null },
      flags: {},
      rel: { kade: 0, mae: 0, oz: 0, lila: 0 },
      wins: 0,
      losses: 0,
      koWins: 0,
      clues: 0,
      journal: [
        "Day 1. Juno has been missing for six days. Their tape cuts off on the word ledger. Rent is due in seven days.",
      ],
      unlocked: ["bunk", "docks", "canteen", "diner", "market"],
      boutDone: {},
      fight: null,
      story: null,
      result: null,
      ending: null,
      toast: null,
      sheet: "bag",
      shopOpen: false,
      boardOpen: false,
      proteinBuff: 0,
      watchCount: 0,
      playSec: 0,
      props: { tvOn: false, fridgeOpen: false },
      actor: spawnActor("bunk"),
    };
  }

  function spawnActor(loc) {
    const rooms = root.LW_ROOMS;
    const p = (rooms && rooms.SPAWNS && rooms.SPAWNS[loc]) || { x: 50, y: 64 };
    return { x: p.x, y: p.y, dir: 1, pose: "idle", walking: false, job: null, busyLeft: 0, fx: [] };
  }

  function ensureActor(state) {
    if (!state.actor) state.actor = spawnActor(state.loc || "bunk");
    return state.actor;
  }

  function load() {
    try {
      const raw = root.localStorage && root.localStorage.getItem(SAVE);
      if (!raw) return null;
      const s = JSON.parse(raw);
      if (!s || !s.name) return null;
      if (!s.actor) s.actor = spawnActor(s.loc || "bunk");
      if (s.hour == null) s.hour = 8;
      if (!s.fridge) s.fridge = { noodles: 0, stew: 0, coffee: 0, plate: 0, protein: 0 };
      if (!s.props) s.props = { tvOn: false, fridgeOpen: false };
      if (s.mood == null) s.mood = 58;
      if (s.maeMeals == null) s.maeMeals = 0;
      if (s.padsDay == null) s.padsDay = 0;
      if (s.dumpsterDay == null) s.dumpsterDay = 0;
      if (s.pendingFight && !s.story) s.pendingFight = null;
      if (s.workout) s.workout = null;
      return s;
    } catch (e) {
      return null;
    }
  }

  function persist(state) {
    if (!root.localStorage) return;
    const copy = Object.assign({}, state, { fight: null, story: null, result: null, toast: null, actor: null, workout: null });
    root.localStorage.setItem(SAVE, JSON.stringify(copy));
  }

  function clearSave() {
    if (root.localStorage) root.localStorage.removeItem(SAVE);
  }

  function addJournal(state, line) {
    if (!line) return;
    const entry = "Day " + state.day + ". " + line;
    if (state.journal[state.journal.length - 1] === entry) return;
    state.journal.push(entry);
    if (state.journal.length > 40) state.journal.shift();
  }

  function addRel(state, rel) {
    if (!rel) return;
    Object.keys(rel).forEach((k) => {
      state.rel[k] = clamp((state.rel[k] || 0) + rel[k], -20, 100);
    });
  }

  function unlock(state, ids) {
    (ids || []).forEach((id) => {
      if (state.unlocked.indexOf(id) < 0) state.unlocked.push(id);
    });
  }

  function applySet(state, set) {
    if (!set) return;
    Object.keys(set).forEach((k) => {
      state.flags[k] = set[k];
    });
  }

  function bumpMood(state, amt) {
    if (!amt) return;
    state.mood = clamp((state.mood == null ? 58 : state.mood) + amt, 0, 100);
  }

  function xpGain(state, key, amt) {
    const dim = 1 / (1 + (state.trained[key] || 0) * 0.45);
    let gain = amt * dim;
    if ((state.mood == null ? 58 : state.mood) < 50) gain *= 0.5;
    if (state.proteinBuff > 0 && (key === "str" || key === "stm")) gain *= 1.25;
    if (state.gym === "temple") gain *= 1.2;
    else if (state.gym === "rust") gain *= 1.08;
    return gain;
  }

  function addXp(state, key, amt) {
    const gain = xpGain(state, key, amt);
    state.xp[key] = (state.xp[key] || 0) + gain;
    let ups = 0;
    while (state.xp[key] >= 1) {
      state.xp[key] -= 1;
      state[key] += 1;
      ups += 1;
    }
    return ups;
  }

  function bumpStat(state, key, amt) {
    const ups = addXp(state, key, amt);
    state.trained[key] = (state.trained[key] || 0) + 1;
    return ups;
  }

  function spend(state, money, energy, hunger) {
    if (money) state.money -= money;
    if (energy) state.energy = clamp(state.energy - energy, 0, state.maxEnergy);
    if (hunger) state.hunger = clamp(state.hunger - hunger, 0, 100);
  }

  function heal(state, hp, energy, hunger) {
    if (hp) state.hp = clamp(state.hp + hp, 0, state.maxHp);
    if (energy) state.energy = clamp(state.energy + energy, 0, state.maxEnergy);
    if (hunger) state.hunger = clamp(state.hunger + hunger, 0, 100);
  }

  function activityById(id) {
    return C().ACTIVITIES.find((a) => a.id === id);
  }

  function locOpen(state, loc) {
    if (state.unlocked.indexOf(loc) < 0) return false;
    if (loc === "crane" && state.fame < 8 && !state.flags.lilaMet && !state.flags.beat_lila) return state.unlocked.indexOf("crane") >= 0;
    if (loc === "barge") return !!state.flags.raidReady || !!state.flags.radio;
    return true;
  }

  function canActivity(state, act) {
    if (!act) return "Unknown.";
    if (act.loc && act.loc !== state.loc) return "Not here.";
    if (act.once && state.flags[act.once]) return "Already done.";
    if (act.needFlag && !state.flags[act.needFlag]) return "Not yet.";
    if (act.slot === 2 && (state.hour || 8) < 18) return "Only in the evening.";
    if (act.gym) {
      const member =
        state.gym === act.gym || (act.gym === "rust" && state.gym === "temple");
      if (!member) return "Members only. Pay dues.";
      if (state.gymPaidUntil < state.day) return "Dues lapsed. Pay the board.";
    }
    if ((act.money || 0) > state.money) return "Not enough coin.";
    if ((act.energyMin || 0) > state.energy) return "Too cooked. Eat or sleep.";
    const TRAIN_WORK = [
      "haul",
      "manifests",
      "watch",
      "bag",
      "spar",
      "weights",
      "skip",
      "temple_bag",
      "temple_spar",
      "pushups",
      "shadow",
      "rope_alley",
      "home_bag",
      "home_skip",
      "pads",
      "overtime",
      "dishes",
    ];
    if (TRAIN_WORK.indexOf(act.id) >= 0 && (state.hunger == null ? 62 : state.hunger) < 12) {
      return "Too hungry. Eat first.";
    }
    if (act.id === "pads" && state.padsDay === state.day) return "Kade already ran pads today.";
    if (act.id === "dumpster" && state.dumpsterDay === state.day) return "You already fished the bin.";
    if (act.id === "overtime" && !state.flags.hauled) return "Haul a shift first. Then Brant talks double.";
    const needH = hoursFor(act.id);
    if (needH && (state.hour || 8) + needH > 24) return "Too late. Sleep.";
    if (["haul", "manifests", "watch", "bag", "spar", "weights", "skip", "temple_bag", "temple_spar", "pushups", "shadow", "rope_alley"].indexOf(act.id) >= 0) {
      if (state.injured > 0 && ["spar", "temple_spar"].indexOf(act.id) >= 0) return "Injured. Don't spar.";
    }
    return null;
  }

  const INPLACE = ["pushups", "shadow", "bag", "weights", "skip", "spar", "temple_bag", "temple_spar", "rope_alley", "home_bag", "home_skip", "pads"];

  const HOURS = {
    pushups: 2,
    shadow: 2,
    replay: 1,
    haul: 4,
    manifests: 3,
    watch: 4,
    locker: 1,
    noodles: 1,
    stew: 1,
    talk_mae: 1,
    board: 0,
    rope_alley: 2,
    join_rust: 1,
    bag: 2,
    spar: 3,
    weights: 2,
    skip: 2,
    talk_kade: 1,
    coffee: 1,
    plate: 1,
    protein: 1,
    talk_oz: 1,
    shop: 1,
    tv: 1,
    fridge: 0,
    home_bag: 2,
    home_skip: 2,
    look_quay: 0,
    look_mug: 0,
    look_bench: 0,
    look_note: 0,
    look_juno_bunk: 0,
    wash_sink: 0,
    kettle: 1,
    sit_sofa: 2,
    pads: 1,
    dumpster: 1,
    overtime: 6,
    dishes: 2,
    join_temple: 1,
    temple_bag: 2,
    temple_spar: 3,
    sneak_barge: 2,
  };

  function hoursFor(id) {
    return HOURS[id] || 0;
  }

  function actBusy(id) {
    if (root.LW_FAST) return id === "sleep" ? 0.2 : 0.12;
    const h = hoursFor(id);
    if (id === "sleep") return 4.2;
    if (!h) return 0.65;
    return Math.min(16, 3.2 + h * 2.1);
  }

  const WORKOUTS = {
    pushups: { name: "Push-ups", unit: "push-up", reps: 12, sec: 1.55, hours: 2, gains: { str: 0.048, stm: 0.018 }, drain: { energy: 1.35, hunger: 0.7, mood: 0.85, interest: 7 } },
    shadow: { name: "Shadowbox", unit: "round", reps: 12, sec: 1.5, hours: 2, gains: { agi: 0.04, tec: 0.016 }, drain: { energy: 1.2, hunger: 0.55, mood: 0.75, interest: 7 } },
    home_bag: { name: "Garage bag", unit: "combo", reps: 12, sec: 1.55, hours: 2, gains: { str: 0.042, tec: 0.014 }, drain: { energy: 1.35, hunger: 0.7, mood: 0.8, interest: 7 } },
    home_skip: { name: "Skip rope", unit: "set", reps: 12, sec: 1.45, hours: 2, gains: { agi: 0.042, stm: 0.016 }, drain: { energy: 1.1, hunger: 0.5, mood: 0.7, interest: 6 } },
    pads: { name: "Pads", unit: "round", reps: 8, sec: 1.5, hours: 1, fee: 8, gains: { tec: 0.056, agi: 0.035 }, drain: { energy: 1.75, hunger: 0.75, mood: 0.5, interest: 6 } },
    bag: { name: "Heavy bag", unit: "combo", reps: 12, sec: 1.6, hours: 2, gains: { str: 0.05, tec: 0.02 }, drain: { energy: 1.7, hunger: 0.85, mood: 0.8, interest: 7 } },
    spar: { name: "Spar", unit: "exchange", reps: 14, sec: 1.7, hours: 3, chip: 0.25, chipHp: 8, gains: { tec: 0.032, agi: 0.022, stm: 0.012 }, drain: { energy: 1.7, hunger: 0.85, mood: 0.7, interest: 6 } },
    weights: { name: "Lifts", unit: "rep", reps: 12, sec: 1.65, hours: 2, gains: { str: 0.055, stm: 0.02 }, drain: { energy: 1.7, hunger: 1, mood: 0.85, interest: 7 } },
    skip: { name: "Skip rope", unit: "set", reps: 12, sec: 1.5, hours: 2, gains: { agi: 0.05, stm: 0.02 }, drain: { energy: 1.35, hunger: 0.7, mood: 0.75, interest: 6 } },
    rope_alley: { name: "Potholes", unit: "lap", reps: 12, sec: 1.5, hours: 2, gains: { agi: 0.038, stm: 0.014 }, drain: { energy: 1.25, hunger: 0.65, mood: 0.8, interest: 7 } },
    temple_bag: { name: "Temple bag", unit: "combo", reps: 12, sec: 1.6, hours: 2, gains: { str: 0.055, tec: 0.026 }, drain: { energy: 1.85, hunger: 0.85, mood: 0.8, interest: 7 } },
    temple_spar: { name: "Temple spar", unit: "exchange", reps: 14, sec: 1.7, hours: 3, chip: 0.3, chipHp: 10, gains: { tec: 0.036, agi: 0.024, str: 0.01 }, drain: { energy: 1.85, hunger: 0.85, mood: 0.7, interest: 6 } },
  };

  function isWorkout(id) {
    return !!WORKOUTS[id];
  }

  function workoutPose(id, rep) {
    const rooms = root.LW_ROOMS;
    const base = rooms && rooms.POSES ? rooms.POSES[id] : "idle";
    if (base === "punch" && (rep || 0) % 2 === 0) return "idle";
    if (base === "down" && (rep || 0) % 2 === 1) return "idle";
    if (base === "skip" && (rep || 0) % 2 === 1) return "idle";
    if (base === "lift" && (rep || 0) % 2 === 0) return "idle";
    return base || "idle";
  }

  function workoutQuitWhy(state) {
    const w = state.workout;
    if (!w) return null;
    if ((state.energy == null ? 100 : state.energy) < 8) return "energy";
    if ((state.hunger == null ? 62 : state.hunger) < 10) return "hunger";
    if ((state.mood == null ? 58 : state.mood) < 10) return "mood";
    if ((w.interest == null ? 100 : w.interest) <= 0) return "interest";
    return null;
  }

  function doWorkoutRep(state) {
    const w = state.workout;
    const def = w && WORKOUTS[w.id];
    if (!def) return;
    w.rep += 1;
    Object.keys(def.gains).forEach(function (k) {
      const ups = addXp(state, k, def.gains[k]);
      w.gained[k] = (w.gained[k] || 0) + xpGain(state, k, def.gains[k]);
      if (ups) w.leveled = (w.leveled || 0) + ups;
    });
    spend(state, 0, def.drain.energy || 0, def.drain.hunger || 0);
    bumpMood(state, -(def.drain.mood || 0));
    w.interest = clamp((w.interest == null ? 100 : w.interest) - (def.drain.interest || 7), 0, 100);
    const a = ensureActor(state);
    a.pose = workoutPose(w.id, w.rep);
    a.fx = [
      { t: Date.now(), col: "#e07090", dx: -8 },
      { t: Date.now(), col: "#5aa0d4", dx: 6 },
    ];
    const bits = Object.keys(def.gains).map(function (k) {
      return k.toUpperCase() + " " + (state.xp[k] || 0).toFixed(2);
    });
    state.toast = def.name + " " + w.rep + "/" + def.reps + " · " + bits.join(" · ");
  }

  function markWorkoutTrained(state) {
    const w = state.workout;
    if (!w || !w.rep) return;
    Object.keys(w.gained || {}).forEach(function (k) {
      state.trained[k] = (state.trained[k] || 0) + 1;
    });
  }

  function endWorkout(state, why) {
    const w = state.workout;
    if (!w) return;
    const def = WORKOUTS[w.id] || { name: "Set", reps: 1, hours: 1, unit: "rep" };
    markWorkoutTrained(state);
    if (w.rep > 0) {
      const hours = Math.max(1, Math.round((def.hours || 1) * (w.rep / def.reps)));
      spendHours(state, hours);
    }
    if ((why === "done" || w.rep >= def.reps) && def.chip && rngFn(state)() < def.chip) {
      state.hp = clamp(state.hp - (def.chipHp || 8), 1, state.maxHp);
    }
    const fade = ["str", "agi", "stm", "tec"].some(function (k) {
      return (state.trained[k] || 0) >= 2;
    });
    const bits = Object.keys(w.gained || {}).map(function (k) {
      return "+" + (w.gained[k] || 0).toFixed(2) + " " + k.toUpperCase();
    });
    let title = def.name;
    if (why === "stop") title = "Stopped at " + w.rep + "/" + def.reps;
    else if (why === "energy") title = "Out of gas. You stop.";
    else if (why === "hunger") title = "Too hungry. You stop.";
    else if (why === "mood" || why === "interest") title = "You lose interest. You stop.";
    else title = def.reps + " " + (def.unit || "rep") + (def.reps === 1 ? "" : "s") + ". Done.";
    if (w.rep === 0) title = "You stand back up.";
    state.toast = (bits.length ? bits.join(" · ") + " · " : "") + title + (fade ? " · Gains fading — rotate." : "");
    state.result = null;
    state.workout = null;
    const a = ensureActor(state);
    a.pose = "idle";
    a.busyLeft = 0;
    a.busyPose = null;
    a.job = null;
    a.walking = false;
    if (!state.story) maybeStory(state);
  }

  function startWorkout(state, id) {
    const def = WORKOUTS[id];
    if (!def) return;
    const act = activityById(id);
    const err = canActivity(state, act);
    if (err) {
      state.toast = err;
      return;
    }
    if (state.props) state.props.tvOn = false;
    if (def.fee) {
      if (state.money < def.fee) {
        state.toast = "Not enough coin.";
        return;
      }
      state.money -= def.fee;
    }
    if (id === "pads") state.padsDay = state.day;
    state.workout = {
      id: id,
      name: def.name,
      unit: def.unit,
      reps: def.reps,
      rep: 0,
      acc: 0,
      interest: 100,
      gained: {},
      leveled: 0,
    };
    const a = ensureActor(state);
    a.job = null;
    a.walking = false;
    a.busyLeft = 0;
    a.busyPose = workoutPose(id, 0);
    a.pose = a.busyPose;
    state.toast = def.name + ". Each " + (def.unit || "rep") + " is progress. Stop whenever you want.";
    if (root.LW_FAST) {
      while (state.workout && state.workout.rep < def.reps && !workoutQuitWhy(state)) {
        doWorkoutRep(state);
      }
      const why = workoutQuitWhy(state) || "done";
      endWorkout(state, why);
    }
  }

  function stopWorkout(state) {
    if (!state.workout) return;
    endWorkout(state, "stop");
  }

  function tickWorkout(state, dt) {
    const w = state.workout;
    const def = w && WORKOUTS[w.id];
    if (!def) return null;
    w.acc = (w.acc || 0) + (dt || 0.016);
    let painted = false;
    while (state.workout && w.acc >= def.sec && w.rep < def.reps) {
      w.acc -= def.sec;
      doWorkoutRep(state);
      painted = true;
      const why = workoutQuitWhy(state);
      if (why) {
        endWorkout(state, why);
        return "render";
      }
    }
    if (state.workout && w.rep >= def.reps) {
      endWorkout(state, "done");
      return "render";
    }
    const a = ensureActor(state);
    a.pose = workoutPose(w.id, w.rep);
    return painted ? "render" : "paint";
  }

  function syncSlot(state) {
    const h = state.hour == null ? 8 : state.hour;
    state.slot = h < 12 ? 0 : h < 18 ? 1 : 2;
  }

  function spendHours(state, used) {
    if (!used) {
      persist(state);
      return;
    }
    state.hour = (state.hour == null ? 8 : state.hour) + used;
    if (state.hour >= 24) {
      state.hour -= 24;
      endDay(state);
    }
    syncSlot(state);
    persist(state);
  }

  function queueWalk(state, job) {
    if (state.workout) stopWorkout(state);
    const a = ensureActor(state);
    a.job = job;
    a.tx = job.x;
    a.ty = job.y;
    a.walking = true;
    a.pose = "walk";
    a.busyLeft = 0;
    if (typeof job.x === "number" && job.x < a.x) a.dir = -1;
    else a.dir = 1;
  }

  function finishJob(state) {
    const a = ensureActor(state);
    const job = a.job;
    a.job = null;
    a.walking = false;
    a.busyLeft = 0;
    a.pose = "idle";
    if (!job) return;
    if (job.kind === "act") doActivity(state, job.id);
    else if (job.kind === "nav" && job.id === "map") state.screen = "map";
  }

  function tickActor(state, dt) {
    if (!state || !state.day) return null;
    state.playSec = (state.playSec || 0) + (dt || 0);
    const a = ensureActor(state);
    if (a.fx && a.fx.length) {
      a.fx = a.fx.filter(function (f) {
        return Date.now() - f.t < 900;
      });
    }
    if (state.workout) return tickWorkout(state, dt);
    if (a.busyLeft > 0) {
      a.busyLeft -= dt || 0.016;
      if (a.busyLeft <= 0) {
        a.busyLeft = 0;
        finishJob(state);
        return "render";
      }
      a.pose = a.busyPose || "idle";
      return "paint";
    }
    if (!a.walking) return a.fx && a.fx.length ? "paint" : null;
    const dx = a.tx - a.x;
    const dy = a.ty - a.y;
    const dist = Math.sqrt(dx * dx + dy * dy);
    const speed = 70;
    const step = speed * (dt || 0.016);
    if (dist <= Math.max(1.6, step)) {
      a.x = a.tx;
      a.y = a.ty;
      a.walking = false;
      const job = a.job;
      const rooms = root.LW_ROOMS;
      const pose = job && job.kind === "act" && rooms && rooms.POSES ? rooms.POSES[job.id] : null;
      if (job && job.kind === "act" && isWorkout(job.id)) {
        startWorkout(state, job.id);
        return "render";
      }
      const timed = job && job.kind === "act" && (INPLACE.indexOf(job.id) >= 0 || hoursFor(job.id) >= 2);
      if (pose || timed) {
        a.busyPose = pose || "idle";
        a.pose = pose || "idle";
        a.busyLeft = actBusy(job.id);
        a.busyMax = a.busyLeft;
        return "render";
      }
      finishJob(state);
      return "render";
    }
    a.x += (dx / dist) * step;
    a.y += (dy / dist) * step;
    a.dir = dx < 0 ? -1 : 1;
    a.pose = "walk";
    return "paint";
  }

  function nextEvent(state) {
    const evs = S().EVENTS;
    for (let i = 0; i < evs.length; i++) {
      const e = evs[i];
      if (e.once && state.flags["ev_" + e.id]) continue;
      if (e.when(state)) return e;
    }
    return null;
  }

  function firstLiveIdx(chain, state, from) {
    let i = from || 0;
    while (i < chain.length) {
      const n = chain[i];
      if (!n.need || n.need(state)) return i;
      i += 1;
    }
    return i;
  }

  function startEvent(state, e) {
    if (!e) return;
    if (e.once) state.flags["ev_" + e.id] = true;
    applySet(state, e.set);
    if (e.setDynamic) applySet(state, e.setDynamic(state));
    addRel(state, e.rel);
    unlock(state, e.unlock);
    addJournal(state, e.journal);
    if (e.clues) state.clues += e.clues;
    const chain = (e.chain || []).slice();
    const idx = firstLiveIdx(chain, state, 0);
    if (idx >= chain.length) return;
    state.story = { id: e.id, idx: idx, chain: chain };
    state.screen = "story";
  }

  function maybeStory(state) {
    if (state.ending || state.story || state.fight || state.result) return;
    const e = nextEvent(state);
    if (e) startEvent(state, e);
  }

  function advanceSlot(state, used) {
    spendHours(state, used === 1 ? 4 : used === 2 ? 8 : used === 3 ? 12 : used);
  }

  function mildRust(state) {
    const rng = rngFn(state);
    const keys = ["str", "agi", "stm", "tec"];
    let rusted = false;
    keys.forEach(function (k) {
      if ((state[k] || 0) <= 2) return;
      if ((state.trained[k] || 0) > 0) return;
      if (rng() >= 0.35) return;
      state.xp[k] = (state.xp[k] || 0) - 0.2;
      if (state.xp[k] < 0) {
        state[k] -= 1;
        state.xp[k] += 1;
        rusted = true;
      }
    });
    if (rusted && !state.toast) state.toast = "Unused muscle rusts a little. Train it or lose it slow.";
  }

  function endDay(state) {
    mildRust(state);
    state.day += 1;
    state.trained = { str: 0, agi: 0, stm: 0, tec: 0 };
    if (state.proteinBuff > 0) state.proteinBuff -= 1;
    if (state.injured > 0) state.injured -= 1;
    state.hunger = clamp(state.hunger - 8, 0, 100);
    bumpMood(state, -3);
    if (state.hunger < 15) {
      state.hp = clamp(state.hp - 8, 1, state.maxHp);
      bumpMood(state, -6);
      state.toast = "Starving. The body starts eating the backup generator.";
    }
    if (state.hp < state.maxHp) state.hp = clamp(state.hp + 4, 0, state.maxHp);
    if (state.day === state.rentDueOn) collectRent(state);
    checkLose(state);
  }

  function collectRent(state) {
    const cost = C().RENT[state.home] || 35;
    if (state.money >= cost) {
      state.money -= cost;
      state.rentDueOn += 7;
      state.toast = "Rent paid ($" + cost + "). The lock still likes you.";
    } else {
      state.rentMissed += 1;
      state.rentDueOn += 7;
      state.maxEnergy = clamp(state.maxEnergy - 10, 60, 100);
      state.toast = "Rent failed. The bunkhouse gets colder. Energy cap drops.";
      if (state.rentMissed >= 2) finish(state, "evicted");
    }
  }

  function checkLose(state) {
    if (state.ending) return;
    if (state.hp <= 0) finish(state, "broken");
    if (state.losses >= 6 && state.wins === 0) finish(state, "fade");
    if (state.losses >= 8 && state.wins < 3) finish(state, "fade");
  }

  function chatter(state, who, text) {
    state.story = {
      id: "look",
      idx: 0,
      chain: [{ who: who, text: text }],
    };
    state.screen = "story";
  }

  const TV_SHOWS = [
    "Harbor weather: fog tonight, fog tomorrow. They show a crane that is not on the official chart.",
    "A soap opera. Everyone on it is a longshoreman. The acting is paid overtime.",
    "Commission fight highlights. Nobody bleeds in the slow-motion.",
    "An ad for boxing gloves that do not exist in any shop you know.",
    "A cooking show. Mae is in the back, uncredited, judging a potato.",
    "Static, then a horn, then a man selling boats to people who cannot swim.",
  ];

  function sleep(state) {
    const hour = state.hour == null ? 8 : state.hour;
    const early = hour <= 20;
    const homeBonus = state.home === "flat" ? 22 : 0;
    const eGain = 48 + homeBonus + (early ? 12 : 0) + Math.floor(state.stm * 1.2);
    const hGain = 10 + (state.home === "flat" ? 10 : 0);
    heal(state, hGain, eGain, 0);
    spend(state, 0, 0, 12);
    bumpMood(state, 8);
    state.hp = clamp(state.hp, 0, state.maxHp);
    endDay(state);
    state.hour = 8;
    if (state.props) state.props.tvOn = false;
    syncSlot(state);
    persist(state);
    const msg = early
      ? "You sleep early. Morning comes. Energy is back: +" + eGain + "."
      : "You drop into the cot late. Horns go all night. Morning comes anyway. +" + eGain + " energy.";
    chatter(state, "MORNING", msg);
  }

  function doActivity(state, id) {
    const act = activityById(id);
    const err = canActivity(state, act);
    state.toast = null;
    if (err) {
      state.toast = err;
      return;
    }
    if (state.props && id !== "tv") state.props.tvOn = false;
    if (id === "sleep") return sleep(state);
    if (id === "board" || id === "crane_board" || id === "arena_board") {
      state.boardOpen = true;
      state.screen = "board";
      return;
    }
    if (id === "shop") {
      state.shopOpen = true;
      state.screen = "shop";
      return;
    }
    if (id === "fridge") {
      state.props = state.props || {};
      state.props.fridgeOpen = true;
      state.screen = "fridge";
      return;
    }
    if (id === "look_quay" || id === "look_mug" || id === "look_bench" || id === "look_note" || id === "look_juno_bunk") {
      lookThing(state, id);
      persist(state);
      return;
    }
    if (id === "tv") {
      heal(state, 0, 10, 0);
      bumpMood(state, 16);
      state.props = state.props || {};
      state.props.tvOn = true;
      chatter(state, "THE BOX", TV_SHOWS[(state.day + (state.hour || 8)) % TV_SHOWS.length]);
      spendHours(state, hoursFor(id));
      return;
    }
    if (id === "sit_sofa") {
      heal(state, 0, 18, 0);
      spend(state, 0, 0, 6);
      bumpMood(state, 10);
      chatter(state, "SOFA", "A two-hour nap. Not a full night. You get some energy back and a little mood. Then you get up.");
      spendHours(state, hoursFor(id));
      return;
    }
    if (id === "kettle") {
      heal(state, 0, 8, 2);
      bumpMood(state, 3);
      chatter(state, "KETTLE", "The kettle screams. The tea is weak and hot. You feel a little more human.");
      spendHours(state, hoursFor(id));
      return;
    }
    if (id === "wash_sink") {
      heal(state, 2, 2, 0);
      bumpMood(state, 2);
      chatter(state, "SINK", "Cold water on your face. You look less like you slept in a locker.");
      persist(state);
      return;
    }
    if (id === "talk_mae") return talkMae(state);
    if (id === "talk_kade") return talk(state, "kade");
    if (id === "talk_oz") return talk(state, "oz");
    if (id === "talk_lila") return talk(state, "lila");
    if (id === "sneak_barge") return sneak(state);

    if ((id === "join_rust" || id === "join_temple") && state.gymPaidUntil >= state.day && ((id === "join_rust" && state.gym === "rust") || (id === "join_temple" && state.gym === "temple"))) {
      state.toast = "Dues already cover this week.";
      return;
    }
    if (isWorkout(id)) {
      startWorkout(state, id);
      persist(state);
      return;
    }
    const r = resolveActivity(state, act);
    if (INPLACE.indexOf(id) >= 0) {
      const fade = ["str", "agi", "stm", "tec"].some(function (k) {
        return (state.trained[k] || 0) >= 2;
      });
      state.toast = (r.delta ? r.delta + " · " : "") + r.title + (fade ? " · Gains fading — rotate." : "");
      state.result = null;
      const a = ensureActor(state);
      a.fx = [
        { t: Date.now(), col: "#e07090", dx: -10 },
        { t: Date.now(), col: "#5aa0d4", dx: 4 },
        { t: Date.now(), col: "#6fbf73", dx: 16 },
      ];
    } else {
      state.result = r;
    }
    if (act.once) state.flags[act.once] = true;
    if (id === "locker") {
      state.flags.openedLocker = true;
      state.clues += 1;
    }
    if (id === "replay") {
      state.flags.replayTape = true;
      state.clues += 1;
    }
    spendHours(state, hoursFor(id));
  }

  function ensureFridge(state) {
    if (!state.fridge) state.fridge = { noodles: 0, stew: 0, coffee: 0, plate: 0, protein: 0 };
    return state.fridge;
  }

  function stockFridge(state, id) {
    const it = C().ITEMS[id];
    if (!it) return;
    ensureFridge(state);
    state.fridge[id] = (state.fridge[id] || 0) + 1;
    if (it.price) state.money -= it.price;
  }

  function eatFridge(state, id) {
    const it = C().ITEMS[id];
    ensureFridge(state);
    if (!it || !it.food || !(state.fridge[id] > 0)) {
      state.toast = "Fridge is a sad metal box.";
      return;
    }
    if ((state.hour || 8) + 1 > 24) {
      state.toast = "Too late. Sleep.";
      return;
    }
    state.fridge[id] -= 1;
    heal(state, it.hp || 0, it.energy || 0, it.hunger || 0);
    bumpMood(state, it.mood || 0);
    if (it.buff) state.proteinBuff = 2;
    state.flags.ateStart = true;
    state.toast = "Ate " + it.name + ".";
    state.screen = "hub";
    if (state.props) state.props.fridgeOpen = false;
    spendHours(state, 1);
    maybeStory(state);
  }

  function resolveActivity(state, act) {
    const rng = rngFn(state);
    const id = act.id;
    let title = act.name;
    let text = "";
    let delta = [];

    function gain(stat, amt) {
      const u = bumpStat(state, stat, amt);
      if (u) delta.push("+" + u + " " + stat.toUpperCase());
    }

    if (id === "pushups") {
      spend(state, 0, 16, 8);
      gain("str", 0.42);
      bumpMood(state, 2);
      text = "The cot creaks in protest. Your shoulders clock in.";
    } else if (id === "shadow") {
      spend(state, 0, 14, 6);
      gain("agi", 0.4);
      gain("tec", 0.18);
      bumpMood(state, 2);
      text = "You slip the locker door. 4B knocks back, unamused.";
    } else if (id === "replay") {
      spend(state, 0, 0, 0);
      text = "You play the tape again. Same warning. Same cutoff. Under the horn you start to hear a laugh.";
    } else if (id === "haul") {
      const pay = 12 + Math.floor(state.str / 4) + (rng() < 0.2 ? 4 : 0);
      state.money += pay;
      spend(state, 0, 26, 14);
      gain("str", 0.22);
      gain("stm", 0.18);
      bumpMood(state, -6);
      state.flags.hauled = true;
      text = "Brant points. You lift. The crate does not care who is missing. You get $" + pay + ".";
      delta.push("+$" + pay);
    } else if (id === "manifests") {
      const pay = 9 + Math.floor(state.tec / 5);
      state.money += pay;
      spend(state, 0, 12, 6);
      gain("tec", 0.2);
      bumpMood(state, -4);
      text = "Ink and stamps. One line says Q.L. and then someone crossed it out. You get $" + pay + ".";
      delta.push("+$" + pay);
      if (rng() < 0.35 && !state.flags.manifestClue) {
        state.flags.manifestClue = true;
        state.clues += 1;
        text += " You copy a Pier 9 time in your head.";
        addJournal(state, "A dock manifest mentioned Pier 9 and the Quiet Ledger, then someone crossed it out.");
      }
    } else if (id === "watch") {
      const pay = 16 + Math.floor(state.stm / 5);
      state.money += pay;
      spend(state, 0, 20, 10);
      gain("stm", 0.28);
      bumpMood(state, -5);
      state.watchCount = (state.watchCount || 0) + 1;
      text = "You walk the fence with a thermos. A boat sits where no boat is listed. You get $" + pay + ".";
      delta.push("+$" + pay);
      if (rng() < 0.4) {
        state.clues += 1;
        text += " Lights on Pier 9 where lights shouldn't be.";
      }
    } else if (id === "locker") {
      text = "The lock still knows your birthday. Inside: wraps, a photo, and half a ledger. You take what you can carry.";
    } else if (id === "noodles" || id === "stew" || id === "coffee" || id === "plate" || id === "protein") {
      stockFridge(state, id);
      text = "Into the fridge. Eat it at home when the clock allows.";
    } else if (id === "home_bag") {
      spend(state, 0, 16, 8);
      gain("str", 0.4);
      gain("tec", 0.16);
      bumpMood(state, 2);
      text = "The garage bag leaks sand onto the mats. It still teaches.";
    } else if (id === "home_skip") {
      spend(state, 0, 12, 6);
      gain("agi", 0.42);
      gain("stm", 0.16);
      bumpMood(state, 2);
      text = "Rope ticks. The quay listens through the door.";
    } else if (id === "join_rust") {
      spend(state, 15, 0, 0);
      state.gym = "rust";
      state.gymPaidUntil = state.day + 7;
      addRel(state, { kade: 6 });
      text = "Kade hangs a tag with your name. It is misspelled. He does not care.";
    } else if (id === "join_temple") {
      spend(state, 40, 0, 0);
      state.gym = "temple";
      state.gymPaidUntil = state.day + 7;
      text = "Someone polishes the bell. No one polishes you.";
    } else if (id === "pads") {
      spend(state, 8, 14, 6);
      gain("tec", 0.45);
      gain("agi", 0.28);
      bumpMood(state, 4);
      state.padsDay = state.day;
      text = "Kade holds the pads. Slap, slap, count. Your hands learn a language. Once a day. Don't waste it.";
    } else if (id === "overtime") {
      const pay = 22 + Math.floor(state.str / 3) + (rng() < 0.2 ? 6 : 0);
      state.money += pay;
      spend(state, 0, 38, 20);
      gain("str", 0.28);
      gain("stm", 0.26);
      bumpMood(state, -10);
      text = "Six hours. Brant doesn't say thanks. The crates don't either. +$" + pay + ".";
      delta.push("+$" + pay);
    } else if (id === "dishes") {
      const pay = 7;
      state.money += pay;
      spend(state, 0, 14, 6);
      gain("stm", 0.12);
      bumpMood(state, -2);
      text = "Oz points at a stack. You become the stack. +$7.";
      delta.push("+$7");
    } else if (id === "dumpster") {
      heal(state, 0, 0, 32);
      state.hp = clamp(state.hp - 8, 1, state.maxHp);
      bumpMood(state, -12);
      state.dumpsterDay = state.day;
      text = "A leftover burger from the alley bins. It fills you up. It also costs you health and mood.";
      delta.push("+32 hunger", "-8 hp", "-12 mood");
    } else if (id === "bag") {
      spend(state, 0, 20, 10);
      gain("str", 0.5);
      gain("tec", 0.22);
      bumpMood(state, 2);
      text = "Sand leaks. You do not. Kade nods once, which is a parade.";
    } else if (id === "spar") {
      spend(state, 0, 24, 12);
      gain("tec", 0.4);
      gain("agi", 0.28);
      gain("stm", 0.15);
      bumpMood(state, 3);
      const chip = rng() < 0.25;
      if (chip) {
        state.hp = clamp(state.hp - 8, 1, state.maxHp);
        delta.push("-8 hp");
        text = "A regular tags your eyebrow. Learning is expensive.";
      } else text = "Live hands. You steal a round and a little pride.";
    } else if (id === "weights") {
      spend(state, 0, 20, 12);
      gain("str", 0.55);
      gain("stm", 0.2);
      bumpMood(state, 2);
      text = "The bar is crooked. Your back files the complaint internally.";
    } else if (id === "skip") {
      spend(state, 0, 16, 8);
      gain("agi", 0.5);
      gain("stm", 0.22);
      bumpMood(state, 2);
      text = "Kade counts. He always counts. Your feet start paying rent.";
    } else if (id === "rope_alley") {
      spend(state, 0, 15, 8);
      gain("agi", 0.38);
      bumpMood(state, 2);
      text = "Potholes as agility ladder. Cats as judges. Mixed reviews.";
    } else if (id === "temple_bag") {
      spend(state, 0, 22, 10);
      gain("str", 0.58);
      gain("tec", 0.3);
      bumpMood(state, 2);
      text = "The bag doesn't leak. It judges.";
    } else if (id === "temple_spar") {
      spend(state, 0, 26, 12);
      gain("tec", 0.48);
      gain("agi", 0.32);
      gain("str", 0.12);
      bumpMood(state, 3);
      if (rng() < 0.3) {
        state.hp = clamp(state.hp - 10, 1, state.maxHp);
        delta.push("-10 hp");
      }
      text = "A prospect tries to become a story. You edit them.";
    } else {
      text = "You do the thing.";
    }

    if (state.hunger < 25) text += " Your stomach heckles the performance.";
    return { title: title, text: text, delta: delta.join("  ") };
  }

  function talkMae(state) {
    if ((state.hunger == null ? 62 : state.hunger) < 35 && state.money < 12 && (state.maeMeals || 0) < 3) {
      state.maeMeals = (state.maeMeals || 0) + 1;
      heal(state, 6, 8, 44);
      bumpMood(state, 8);
      addRel(state, { mae: 4 });
      const left = 3 - state.maeMeals;
      chatter(
        state,
        "MAE OKONKWO",
        left
          ? "Sit. The till did not see that. That is free meal " + state.maeMeals + " of 3. After three, you pay."
          : "Last free bowl. After this you pay like everyone else. If you want to haul, you eat first."
      );
      spendHours(state, 1);
      persist(state);
      return;
    }
    return talk(state, "mae");
  }

  function talk(state, who) {
    const lines = S().TALK[who] || [];
    let picked = lines[lines.length - 1];
    for (let i = 0; i < lines.length; i++) {
      if (lines[i].need(state)) {
        picked = lines[i];
        break;
      }
    }
    applySet(state, picked.set);
    if (picked.clues) state.clues += picked.clues;
    addRel(state, { [who]: 3 });
    const chain = picked.chain
      ? picked.chain.slice()
      : [{ who: picked.who, text: picked.text, choices: picked.choices }];
    state.story = {
      id: "talk_" + who,
      idx: firstLiveIdx(chain, state, 0),
      chain: chain,
    };
    state.screen = "story";
    spendHours(state, 1);
    persist(state);
  }

  function sneak(state) {
    if (!state.flags.raidReady && !state.flags.radio) {
      state.toast = "Not yet. You would just be swimming at a locked hull. Wait for Juno's radio, or Mae's plan.";
      return;
    }
    if (state.slot !== 2 && !state.flags.croweFightStarted) {
      state.toast = "Wait for evening, or for the title bell to start.";
      return;
    }
    if (state.flags.planMae && state.flags.croweOver) {
      state.flags.rescued = true;
      finish(state, state.flags.beat_crowe ? "both" : "rescue");
      return;
    }
    spend(state, 0, 25, 10);
    const rng = rngFn(state);
    if (state.flags.planMae) {
      state.flags.rescued = true;
      state.result = {
        title: "PIER 9",
        text: "Mae's launch hits the hull. You find Juno cuffed to a pipe, swearing, alive. You take them and copies of the ledger.",
        delta: "Juno is alive.",
      };
      addJournal(state, "Pier 9 raid. Juno recovered.");
      spendHours(state, 2);
      return;
    }
    if (rng() < 0.45 + state.agi * 0.01) {
      state.clues += 2;
      state.flags.bargeSeen = true;
      state.result = {
        title: "HULL",
        text: "You see bunks, cuffs, and a chalkboard of fight names, including yours. A guard turns. You leave before they catch you.",
        delta: "+clues",
      };
    } else {
      state.hp = clamp(state.hp - 18, 1, state.maxHp);
      state.injured = Math.max(state.injured, 1);
      state.result = {
        title: "CAUGHT",
        text: "A flashlight. Vargas laughs. You swim away with a new bruise and no sibling.",
        delta: "-18 hp, injured",
      };
    }
    spendHours(state, 2);
  }

  function availableBouts(state) {
    const out = [];
    const O = C().OPPONENTS;
    Object.keys(O).forEach((id) => {
      const o = O[id];
      if (o.loc !== state.loc && !(o.loc === "alley" && state.loc === "alley")) return;
      if (o.story && id === "vargas" && !state.flags.vargasUnlocked) return;
      if (o.story && id === "crowe" && !state.flags.croweUnlocked) return;
      if (o.gym && state.gym !== o.gym && state.gym !== "temple") return;
      if (o.fameNeed && state.fame < o.fameNeed) return;
      if (o.winNeed && (state.wins || 0) < o.winNeed) return;
      if (o.needFlag && !state.flags[o.needFlag]) return;
      if (state.boutDone[id] && !o.rematch && id !== "tommy" && id !== "wren" && id !== "perry") {
        if (id === "crowe" || id === "vargas" || o.story) return;
        if (!o.rematch) return;
      }
      if (state.loc !== o.loc) return;
      out.push(o);
    });
    return out;
  }

  function fightBlock(state, o) {
    if (state.energy < 15) return "You can barely lift a fork.";
    if (o.fee && state.money < o.fee) return "Gate fee: $" + o.fee;
    return null;
  }

  function approachFight(state, oppId) {
    const o = C().OPPONENTS[oppId];
    if (!o) return;
    const err = fightBlock(state, o);
    if (err) {
      state.toast = err;
      return;
    }
    const talk = S().boutChain && S().boutChain(state, o);
    if (talk && talk.length) {
      state.pendingFight = oppId;
      state.boardOpen = false;
      state.story = { id: "bout_" + oppId, idx: firstLiveIdx(talk, state, 0), chain: talk.slice() };
      state.screen = "story";
      persist(state);
      return;
    }
    startFight(state, oppId);
  }

  function startFight(state, oppId) {
    const o = C().OPPONENTS[oppId];
    if (!o) return;
    const err = fightBlock(state, o);
    if (err) {
      state.toast = err;
      return;
    }
    if (o.fee) state.money -= o.fee;
    if (state.items.tape > 0 && state.flags.useTapeNext) {
      state.items.tape -= 1;
      state.flags.tapedBout = true;
      state.flags.useTapeNext = false;
    } else state.flags.tapedBout = false;
    state.fight = K().makeFight(state, oppId);
    state.screen = "fight";
    state.boardOpen = false;
    persist(state);
  }

  function pickPlan(state, plan) {
    if (!state.fight || !state.fight.waiting) return;
    const rng = rngFn(state);
    state.fight.waiting = false;
    K().simulateRound(state.fight, plan, rng);
    if (state.fight.over) settleFight(state);
  }

  function settleFight(state) {
    const f = state.fight;
    const o = C().OPPONENTS[f.oppId];
    state.hp = clamp(f.p.hp, 1, state.maxHp);
    state.energy = clamp(state.energy - 22, 5, state.maxEnergy);
    state.hunger = clamp(state.hunger - 14, 0, 100);
    const taped = f.taped;
    bumpMood(state, f.result === "win" ? 18 : 10);
    if (f.result === "win") {
      state.wins += 1;
      state.money += o.purse;
      state.fame += 4 + Math.floor(o.stats.hp / 40);
      state.boutDone[o.id] = "win";
      state.flags["beat_" + o.id] = true;
      if (f.e.hp <= 0 || f.e.kd >= 3) state.koWins += 1;
      addRel(state, { kade: 2 });
      const line = (S().boutResult && S().boutResult(state, o, true)) || o.win;
      state.result = {
        title: "WIN — " + o.name,
        text: line + " Purse $" + o.purse + ".",
        delta: "+$" + o.purse + "  fame up",
      };
      if (o.id === "crowe") {
        state.flags.beat_crowe = true;
        state.flags.croweOver = true;
        if (state.flags.planMae) {
          state.flags.rescued = true;
          finish(state, "both");
        } else finish(state, "glory");
      }
    } else {
      state.losses += 1;
      state.boutDone[o.id] = "loss";
      state.fame = Math.max(0, state.fame - 1);
      const inj = taped ? 0 : rngFn(state)() < 0.5 ? 2 : 1;
      state.injured = Math.max(state.injured, inj);
      state.hp = clamp(state.hp, 1, state.maxHp);
      state.result = {
        title: "LOSS — " + o.name,
        text: (S().boutResult && S().boutResult(state, o, false)) || o.lose,
        delta: inj ? "injured " + inj + "d" : "taped, less hurt",
      };
      if (o.id === "crowe") {
        state.flags.croweOver = true;
        if (state.flags.planMae) {
          state.flags.rescued = true;
          finish(state, "rescue");
        } else finish(state, "net");
      }
    }
    if (state.fame >= 12) unlock(state, ["crane"]);
    if (state.fame >= 20) unlock(state, ["arena"]);
    if (state.fame >= 22) unlock(state, ["temple"]);
    if (state.hp < 15 && !state.ending) {
      if (state.money >= 20) {
        state.money -= 20;
        state.hp = 40;
        state.toast = "Canteen doctor. $20. You keep most of your teeth.";
      }
    }
    checkLose(state);
    state.fight = null;
    if (!state.ending) state.screen = "hub";
    spendHours(state, 2);
  }

  function finish(state, id) {
    state.ending = id;
    state.screen = "end";
    persist(state);
  }

  function buy(state, itemId) {
    const it = C().ITEMS[itemId];
    if (!it) return;
    if (state.money < it.price) {
      state.toast = "Too rich for your blood? Other way around.";
      return;
    }
    state.money -= it.price;
    if (it.food) {
      ensureFridge(state);
      state.fridge[itemId] = (state.fridge[itemId] || 0) + 1;
      state.toast = it.name + " in the fridge.";
    } else if (it.consumable) {
      state.items[itemId] = (state.items[itemId] || 0) + 1;
    } else {
      if (state.gear.indexOf(itemId) < 0) state.gear.push(itemId);
      if (it.slot) state.equipped[it.slot] = itemId;
    }
    if (itemId === "coil") state.flags.boughtCoil = true;
    state.toast = it.food ? it.name + " in the fridge." : "Bought " + it.name + ".";
    persist(state);
  }

  function equip(state, itemId) {
    const it = C().ITEMS[itemId];
    if (!it || !it.slot) return;
    if (state.gear.indexOf(itemId) < 0) return;
    state.equipped[it.slot] = itemId;
    persist(state);
  }

  function useItem(state, itemId) {
    if (itemId === "salve") {
      if (!(state.items.salve > 0)) return;
      state.items.salve -= 1;
      heal(state, 22, 0, 0);
      state.toast = "Salve. The bruise agrees to a ceasefire.";
    } else if (itemId === "salts") {
      if (!(state.items.salts > 0)) return;
      if (state.fight) {
        if (K().useSalts(state.fight)) {
          state.items.salts -= 1;
        }
      } else {
        state.items.salts -= 1;
        heal(state, 0, 12, 0);
        state.toast = "Salts. A bit dramatic for a bunk.";
      }
    } else if (itemId === "tape") {
      if (!(state.items.tape > 0)) return;
      state.flags.useTapeNext = true;
      state.toast = "You'll wrap before the next bell.";
    }
    persist(state);
  }

  function lookThing(state, id) {
    let who = "YOU";
    let text = "You look.";
    if (id === "look_quay") {
      who = "THE QUAY";
      const night = (state.hour || 8) >= 18;
      if (state.flags.hornEar && night) {
        text = "That horn is the same interval as the tape. It is coming from the water, not the main channel. Someone is signaling Pier 9.";
      } else if (state.flags.hornEar) {
        text = "Cranes. Gulls. A bollard with last winter's rope still on it. You listen for the tape's horn. Daylight is keeping it quiet.";
      } else if (night) {
        text = "The quay is quiet. Far off, a horn that is not the main channel. You do not know that note yet.";
      } else {
        text = "Cranes. Gulls. A bollard with last winter's rope still on it. The water looks the same as it did the day Juno left.";
      }
      if (night && !state.flags.quayNight) {
        state.flags.quayNight = true;
        state.clues += 1;
        addJournal(state, "From the bunkhouse door after dark: a fog horn that is not the main channel. It sounds like Pier 9.");
        text += state.flags.hornEar
          ? " You were right to memorize it."
          : " You write it down. It might matter.";
      }
    } else if (id === "look_mug") {
      who = "SHELF";
      text = state.flags.openedLocker
        ? "Two mugs. Juno's still has a sugar crust. In the locker photo they were grinning. This mug is waiting for a person who is not here."
        : "Two mugs. One is Juno's. They always put too much sugar in it. You do not wash it.";
    } else if (id === "look_bench") {
      who = "WORKBENCH";
      text = "Wrenches, tape, and a glove that lost its twin. Nothing here is a clue. You leave it.";
    } else if (id === "look_note") {
      who = "JUNO'S NOTE";
      text = state.flags.hornEar
        ? "Juno wrote this on the scratch pad by the cot:\n\nnoodles\nlisten for the horn — the same interval as the tape, not the main channel\ndon't take the night fight\n\nThat is the whole note. They never came back to add the rest."
        : "Juno wrote this on the scratch pad by the cot:\n\nnoodles\nlisten for the horn\ndon't take the night fight\n\nThat is the whole note. They never came back to add the rest.";
    } else if (id === "look_juno_bunk") {
      who = "JUNO'S BUNK";
      text = "The top bunk is still folded the way Juno folds a sheet — navy-wrong, on purpose. You do not touch the fold.";
      if (!state.flags.junoBunk) {
        state.flags.junoBunk = true;
        state.clues += 1;
        addJournal(state, "Juno's top bunk is still folded their way. A Harbor Commission chip was wedged in the slat.");
        text += " A Harbor Commission chip is wedged in the slat. You pocket the chip. You leave the fold.";
      }
    }
    chatter(state, who, text);
  }

  function travel(state, loc) {
    if (!locOpen(state, loc)) {
      state.toast = "Not open to you yet.";
      return;
    }
    if (state.unlocked.indexOf(loc) < 0) {
      state.toast = "You don't know that door.";
      return;
    }
    const from = state.loc;
    state.loc = loc;
    state.screen = "hub";
    state.toast = null;
    state.actor = spawnActor(loc);
    if (state.props) {
      state.props.tvOn = false;
      state.props.fridgeOpen = false;
    }
    spendHours(state, from === loc ? 0 : 1);
    if (!state.result) maybeStory(state);
  }

  function storyContinue(state, choiceId) {
    const st = state.story;
    if (!st) {
      state.screen = "hub";
      return;
    }
    const node = st.chain[st.idx];
    if (!node) {
      state.story = null;
      state.screen = "hub";
      persist(state);
      maybeStory(state);
      return;
    }
    if (node.choices && !choiceId) return;
    if (node.choices && choiceId) {
      const ch = node.choices.find((c) => c.id === choiceId);
      if (ch) {
        applySet(state, ch.set);
        addRel(state, ch.rel);
        addJournal(state, ch.journal);
        if (ch.clues) state.clues += ch.clues;
        const extra = [];
        if (!ch.silent) extra.push({ who: "YOU", text: ch.said || ch.label });
        if (ch.reply) {
          (Array.isArray(ch.reply) ? ch.reply : [ch.reply]).forEach(function (r) {
            extra.push(typeof r === "string" ? { who: node.who || "YOU", text: r } : r);
          });
        }
        if (extra.length) {
          st.chain = st.chain.slice(0, st.idx + 1).concat(extra, st.chain.slice(st.idx + 1));
        }
      }
    }
    st.idx = firstLiveIdx(st.chain, state, st.idx + 1);
    if (st.idx >= st.chain.length) {
      state.story = null;
      const pending = state.pendingFight;
      state.pendingFight = null;
      persist(state);
      if (pending) {
        startFight(state, pending);
        return;
      }
      state.screen = "hub";
      maybeStory(state);
    }
  }

  function ackResult(state) {
    state.result = null;
    persist(state);
    maybeStory(state);
  }

  function moveInFlat(state) {
    if (state.money < 40) {
      state.toast = "Need a cushion to move.";
      return;
    }
    state.home = "flat";
    state.toast = "A door that closes. Revolutionary.";
    persist(state);
  }

  root.LW_ENGINE = {
    createState,
    load,
    persist,
    clearSave,
    doActivity,
    startWorkout,
    stopWorkout,
    isWorkout,
    queueWalk,
    tickActor,
    travel,
    approachFight,
    startFight,
    pickPlan,
    buy,
    equip,
    useItem,
    storyContinue,
    ackResult,
    eatFridge,
    spendHours,
    availableBouts,
    canActivity,
    locOpen,
    maybeStory,
    startEvent,
    nextEvent,
    moveInFlat,
    rngFn,
    SAVE,
  };
})(typeof window !== "undefined" ? window : global);

if (typeof module !== "undefined") {
  module.exports = global.LW_ENGINE;
}
