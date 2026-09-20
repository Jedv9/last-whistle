/* Last Whistle — round combat (stance plans, not button mash) */
(function (root) {
  const PLANS = {
    press: {
      name: "Press",
      blurb: "Walk them down. High damage, high stamina tax.",
      dmg: 1.22,
      acc: 0.82,
      stam: 1.25,
      vs: { press: 1.0, box: 0.96, counter: 0.72, stall: 1.28 },
    },
    box: {
      name: "Box",
      blurb: "Jab, move, pick spots. The honest job.",
      dmg: 1.0,
      acc: 0.9,
      stam: 1.0,
      vs: { press: 1.08, box: 1.0, counter: 0.88, stall: 0.95 },
    },
    counter: {
      name: "Counter",
      blurb: "Invite the rush. Punish greed.",
      dmg: 0.9,
      acc: 0.8,
      stam: 0.78,
      vs: { press: 1.38, box: 1.05, counter: 1.0, stall: 0.7 },
    },
    stall: {
      name: "Clinch / stall",
      blurb: "Tie up, breathe, make the round ugly.",
      dmg: 0.58,
      acc: 0.74,
      stam: 0.55,
      vs: { press: 0.8, box: 1.02, counter: 1.18, stall: 1.0 },
    },
  };

  const LINES = {
    land: ["Straight through.", "Hook around the guard.", "Body. Air leaves.", "Chin. Lights tilt.", "Jab lands."],
    miss: ["Air.", "Slips out.", "Guard eats it.", "Short."],
    kd: ["Down. Canvas is loud.", "Knockdown."],
    tired: ["Legs go late-shift.", "Hands drop."],
  };

  function pick(rng, arr) {
    return arr[Math.floor(rng() * arr.length)];
  }

  function fightStats(s) {
    const items = root.LW_CONTENT.ITEMS;
    let str = s.str, agi = s.agi, stm = s.stm, tec = s.tec;
    ["hands", "feet"].forEach((slot) => {
      const id = s.equipped[slot];
      if (id && items[id] && items[id].bonus) {
        const b = items[id].bonus;
        str += b.str || 0;
        agi += b.agi || 0;
        stm += b.stm || 0;
        tec += b.tec || 0;
      }
    });
    if (s.hunger < 20) {
      str *= 0.9; agi *= 0.9; stm *= 0.9; tec *= 0.9;
    }
    if (s.injured > 0) {
      str *= 0.88; agi *= 0.88;
    }
    if (s.energy < 25) {
      stm *= 0.85; agi *= 0.9;
    }
    if (s.flags.kadeStyle) tec += 1;
    return { str, agi, stm, tec };
  }

  function makeFight(s, oppId) {
    const o = root.LW_CONTENT.OPPONENTS[oppId];
    const ps = fightStats(s);
    return {
      oppId,
      round: 1,
      maxRounds: o.rounds || 3,
      waiting: true,
      over: false,
      result: null,
      log: [(root.LW_STORY && root.LW_STORY.boutBell && root.LW_STORY.boutBell(s, o)) || o.intro],
      p: {
        hp: Math.max(30, Math.min(s.hp, s.maxHp)),
        maxHp: s.maxHp,
        stam: 100,
        kd: 0,
        plan: null,
      },
      e: {
        hp: o.stats.hp,
        maxHp: o.stats.hp,
        stam: 100,
        kd: 0,
        name: o.name,
      },
      pBase: ps,
      eBase: { str: o.stats.str, agi: o.stats.agi, stm: o.stats.stm, tec: o.stats.tec },
      bias: o.bias.slice(),
      anim: "idle",
      combo: 0,
      popup: null,
      usedSalts: false,
      taped: !!s.flags.tapedBout,
    };
  }

  function enemyPlan(fight, rng) {
    const b = fight.bias;
    return b[Math.floor(rng() * b.length)];
  }

  function hitChance(acc, agiAtk, agiDef, stamAtk) {
    let c = acc + (agiAtk - agiDef) * 0.012;
    if (stamAtk < 25) c -= 0.12;
    if (stamAtk < 10) c -= 0.12;
    return Math.max(0.18, Math.min(0.94, c));
  }

  function dmgOf(base, plan, eplan, stam) {
    const P = PLANS[plan];
    const vs = P.vs[eplan] || 1;
    let d = (base.str * 0.55 + base.tec * 0.45) * 0.85 * P.dmg * vs;
    if (stam < 25) d *= 0.8;
    return Math.max(3, d);
  }

  function simulateRound(fight, plan, rng) {
    const log = [];
    fight.p.plan = plan;
    const eplan = enemyPlan(fight, rng);
    log.push("You " + PLANS[plan].name.toLowerCase() + ". " + fight.e.name + " " + PLANS[eplan].name.toLowerCase() + "s.");

    const exchanges = 5;
    let first = fight.pBase.agi >= fight.eBase.agi ? "p" : "e";
    if (Math.abs(fight.pBase.agi - fight.eBase.agi) < 2) first = rng() < 0.5 ? "p" : "e";

    for (let i = 0; i < exchanges; i++) {
      const pTurn = (first === "p") === (i % 2 === 0);
      if (pTurn) {
        applyPunch(fight, "p", "e", plan, eplan, rng, log);
      } else {
        applyPunch(fight, "e", "p", eplan, plan, rng, log);
      }
      if (fight.p.hp <= 0 || fight.e.hp <= 0) break;
    }

    fight.p.stam = Math.min(100, fight.p.stam + 8);
    fight.e.stam = Math.min(100, fight.e.stam + 8);
    if (fight.p.stam < 20) log.push(pick(rng, LINES.tired));

    fight.log = fight.log.concat(log).slice(-12);

    if (fight.p.hp <= 0 || fight.p.kd >= 3) {
      finish(fight, "loss");
    } else if (fight.e.hp <= 0 || fight.e.kd >= 3) {
      finish(fight, fight.e.kd >= 3 || fight.e.hp <= 0 ? "win" : "win");
    } else if (fight.round >= fight.maxRounds) {
      if (fight.p.hp === fight.e.hp) finish(fight, fight.p.kd >= fight.e.kd ? "loss" : "win");
      else finish(fight, fight.p.hp > fight.e.hp ? "win" : "loss");
    } else {
      fight.round += 1;
      fight.waiting = true;
      fight.anim = "idle";
    }
    return fight;
  }

  function applyPunch(fight, atk, def, plan, eplan, rng, log) {
    const A = atk === "p" ? fight.p : fight.e;
    const D = def === "p" ? fight.p : fight.e;
    const Ab = atk === "p" ? fight.pBase : fight.eBase;
    const Db = def === "p" ? fight.pBase : fight.eBase;
    const P = PLANS[plan];
    A.stam = Math.max(0, A.stam - 9 * P.stam);

    const chance = hitChance(P.acc, Ab.agi, Db.agi, A.stam);
    if (rng() > chance) {
      log.push((atk === "p" ? "You miss. " : fight.e.name + " misses. ") + pick(rng, LINES.miss));
      fight.anim = atk === "p" ? "pmiss" : "emiss";
      if (atk === "p") fight.combo = 0;
      return;
    }

    let dmg = dmgOf(Ab, plan, eplan, A.stam);
    dmg *= 0.88 + rng() * 0.28;
    if (eplan === "stall" && rng() < 0.25) dmg *= 0.6;
    dmg = Math.max(2, Math.round(dmg));
    D.hp = Math.max(0, D.hp - dmg);
    D.stam = Math.max(0, D.stam - 4);
    log.push((atk === "p" ? "You land. " : fight.e.name + " lands. ") + pick(rng, LINES.land) + " (" + dmg + ")");
    fight.anim = atk === "p" ? "phit" : "ehit";
    if (atk === "p") {
      fight.combo = (fight.combo || 0) + 1;
      fight.popup = { t: Date.now(), dmg: dmg, combo: fight.combo };
    }

    if (dmg >= D.maxHp * 0.16 && D.hp > 0 && rng() < 0.35 + dmg / 80) {
      D.kd += 1;
      D.stam = Math.max(0, D.stam - 15);
      log.push(pick(rng, LINES.kd) + " (" + (atk === "p" ? fight.e.name : "You") + " " + D.kd + "/3)");
      fight.anim = atk === "p" ? "ekd" : "pkd";
    }
  }

  function finish(fight, result) {
    fight.over = true;
    fight.waiting = false;
    fight.result = result;
    fight.anim = result === "win" ? "win" : "loss";
  }

  function useSalts(fight) {
    if (fight.usedSalts || fight.over) return false;
    fight.usedSalts = true;
    fight.p.stam = Math.min(100, fight.p.stam + 18);
    fight.log.push("Salts. The world gets sharp again.");
    return true;
  }

  root.LW_COMBAT = { PLANS, fightStats, makeFight, simulateRound, useSalts };
})(typeof window !== "undefined" ? window : global);
