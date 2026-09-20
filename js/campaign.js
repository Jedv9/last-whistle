/* Last Whistle — 12-hour campaign spine.
   ~12 chapters / ~48 days. Fight card every 3 days.
   Finale cannot fire in the first month. */
(function (root) {
  const C = root.LW_CONTENT;
  const S = root.LW_STORY;
  if (!C || !S) return;

  const CHAPTERS = [
    { id: 1, name: "CLOCK IN", blurb: "Eat Juno's noodles. Clock in at the docks. Pay rent in seven days." },
    { id: 2, name: "ALLEY CARD", blurb: "A fight flyer slid under the door. Bin Alley pays cash." },
    { id: 3, name: "RUST", blurb: "Kade will coach you at the Rust Bucket for fifteen a week." },
    { id: 4, name: "BAY C", blurb: "Juno's locker is still in Bay C. Brant told you not to look." },
    { id: 5, name: "UNION", blurb: "Mae says Juno filed a safety complaint the morning they vanished." },
    { id: 6, name: "WAFFLE", blurb: "Oz saw Juno last. The Quiet Ledger is a boat, not a book." },
    { id: 7, name: "FOG NOTE", blurb: "The horn on the tape is coming from the water at night." },
    { id: 8, name: "BLUE CRANE", blurb: "Lila saw Vargas walk Juno toward Pier 9." },
    { id: 9, name: "SHORTWAVE", blurb: "Juno is alive on the Quiet Ledger. The title fight is a trap." },
    { id: 10, name: "EXHIBITION", blurb: "Beat Vargas if you want a shot at Crowe." },
    { id: 11, name: "LAUNCH", blurb: "Mae will hit Pier 9 while you keep Crowe busy." },
    { id: 12, name: "THE WHISTLE", blurb: "Fight Crowe. Save Juno, take the title, or lose both." },
  ];

  function chapterOf(s) {
    const f = (s && s.flags) || {};
    if (f.croweUnlocked || f.croweInvite) return CHAPTERS[11];
    if (f.raidReady || f.planMae) return CHAPTERS[10];
    if (f.vargasOffer || f.vargasUnlocked) return CHAPTERS[9];
    if (f.radio) return CHAPTERS[8];
    if (f.craneOpen || f.beat_lila || f.lilaTalk) return CHAPTERS[7];
    if (f.hornEcho || f.quayNight || (s && (s.clues || 0) >= 3)) return CHAPTERS[6];
    if (f.ozMet) return CHAPTERS[5];
    if (f.maeMet) return CHAPTERS[4];
    if (f.openedLocker || f.heardLocker) return CHAPTERS[3];
    if (f.kadeMet || (s && s.gym)) return CHAPTERS[2];
    if (f.flyer) return CHAPTERS[1];
    return CHAPTERS[0];
  }

  function isCardNight(s) {
    return (s.day || 1) % 3 === 0;
  }

  const MORE_OPPONENTS = {
    moss: {
      id: "moss",
      name: "Pallet Moss",
      rank: "Alley",
      purse: 28,
      fee: 0,
      fameNeed: 2,
      winNeed: 1,
      rematch: true,
      loc: "alley",
      stats: { str: 8, agi: 8, stm: 9, tec: 5, hp: 94 },
      bias: ["stall", "press", "box", "stall"],
      sprite: "scrappy",
      intro: "Moss smells like wet wood. He clinches until you cannot breathe.",
      win: "Moss sits on a pallet. Card night, he says. Come back poorer.",
      lose: "He held on until you ran out of air.",
    },
    cobb: {
      id: "cobb",
      name: "Cobb the Bolt",
      rank: "Alley",
      purse: 36,
      fee: 0,
      fameNeed: 6,
      winNeed: 2,
      rematch: true,
      loc: "alley",
      stats: { str: 11, agi: 8, stm: 10, tec: 6, hp: 104 },
      bias: ["press", "press", "box", "press"],
      sprite: "heavy",
      intro: "Cobb tightens a bolt on the rope. Then he tries to do the same to you.",
      win: "Cobb nods. The bolt is still tighter than you were.",
      lose: "Your shoulder will remember that for a few days.",
    },
    twin: {
      id: "twin",
      name: "Twin Hook",
      rank: "Alley",
      purse: 48,
      fee: 0,
      fameNeed: 12,
      needFlag: "openedLocker",
      loc: "alley",
      stats: { str: 10, agi: 12, stm: 10, tec: 9, hp: 112 },
      bias: ["counter", "box", "counter", "press"],
      sprite: "slick",
      intro: "Nobody agrees which twin this is. Both of them hit the same.",
      win: "They grin. Sal sends a nod, they say.",
      lose: "You were fighting someone who trains as a pair.",
    },
    delia: {
      id: "delia",
      name: "Delia Pins",
      rank: "Gym",
      purse: 42,
      fee: 0,
      fameNeed: 8,
      winNeed: 2,
      loc: "rustgym",
      gym: "rust",
      rematch: true,
      stats: { str: 9, agi: 11, stm: 10, tec: 8, hp: 110 },
      bias: ["box", "counter", "box", "stall"],
      sprite: "slick",
      intro: "Delia pins the bag still with a look. Then she pins you.",
      win: "Delia says Kade still oversteeps the tea. You, less so.",
      lose: "Your footwork goes back to where it started.",
    },
    hoss: {
      id: "hoss",
      name: "Hoss Plate",
      rank: "Gym",
      purse: 52,
      fee: 0,
      fameNeed: 14,
      winNeed: 4,
      loc: "rustgym",
      gym: "rust",
      stats: { str: 14, agi: 7, stm: 13, tec: 6, hp: 128 },
      bias: ["press", "stall", "press", "press"],
      sprite: "heavy",
      intro: "Hoss is built like a loading plate. Do not let him walk through you.",
      win: "Hoss laughs. The windows rattle.",
      lose: "He walked through you.",
    },
    kit: {
      id: "kit",
      name: "Kit Neon",
      rank: "Club",
      purse: 62,
      fee: 8,
      fameNeed: 16,
      needFlag: "craneOpen",
      loc: "crane",
      rematch: true,
      stats: { str: 10, agi: 13, stm: 11, tec: 11, hp: 118 },
      bias: ["box", "box", "counter", "press"],
      sprite: "slick",
      intro: "Kit borrows Lila's pink light and none of her patience.",
      win: "Kit says tell Lila the echo got louder.",
      lose: "The light stays. You sit down.",
    },
    marlow: {
      id: "marlow",
      name: "Marlow Vein",
      rank: "Club",
      purse: 78,
      fee: 10,
      fameNeed: 20,
      winNeed: 5,
      loc: "crane",
      stats: { str: 12, agi: 12, stm: 12, tec: 12, hp: 124 },
      bias: ["counter", "press", "box", "counter"],
      sprite: "slick",
      intro: "Marlow sells rumors between rounds. Tonight you are the rumor.",
      win: "Marlow says Pier 9 has been loud. He did not say that.",
      lose: "He is already selling the story of your loss.",
    },
    reed: {
      id: "reed",
      name: "Reed the Invoice",
      rank: "Commission",
      purse: 100,
      fee: 12,
      fameNeed: 24,
      needFlag: "vargasUnlocked",
      loc: "arena",
      rounds: 5,
      stats: { str: 13, agi: 12, stm: 14, tec: 12, hp: 142 },
      bias: ["box", "press", "box", "stall"],
      sprite: "heavy",
      intro: "Reed jabs like he is writing an invoice. Crowe likes his math.",
      win: "Reed says the whistle still is not yours. The numbers moved.",
      lose: "The card has your name. You paid in lights.",
    },
  };

  Object.keys(MORE_OPPONENTS).forEach(function (id) {
    C.OPPONENTS[id] = MORE_OPPONENTS[id];
  });

  C.OPPONENTS.wren.winNeed = 1;
  C.OPPONENTS.wren.rematch = true;
  C.OPPONENTS.sal.needFlag = "heardLocker";
  C.OPPONENTS.lila.fameNeed = 14;
  C.OPPONENTS.perry.fameNeed = 18;
  C.OPPONENTS.sophie.fameNeed = 26;
  C.OPPONENTS.vargas.rounds = 5;
  C.OPPONENTS.crowe.rounds = 5;
  C.OPPONENTS.sophie.rounds = 5;

  const SLIPS = [
    "A crane on Pier 9 moved at 3 a.m. The official board says it did not move.",
    "Union stew ran out before the second shift. Mae did not apologize.",
    "Someone left Harbor Commission gloves in the canteen lost-and-found. They are Juno's size.",
    "The alley hat had more cash in it on Tuesday. The seagull looked offended.",
    "Brant smiled. On this quay, that is a warning.",
    "Oz burned a waffle on purpose. He said it remembered a person.",
    "Kade oversteeped the tea and called it conditioning.",
    "The night market sold a rumor for six dollars. You did not buy it. It followed you anyway.",
    "A horn that was not the main channel. You almost did not write it down.",
    "4B knocked and asked for quiet. You had none to spare.",
    "Harbor Commission posted a scout schedule. Every card night, a man with a clipboard shows up.",
    "The Quiet Ledger is not on any freight list. That is how you know it matters.",
  ];

  const EXTRA = [
    {
      id: "neighbor_4b",
      once: true,
      when: (s) => s.loc === "bunk" && s.flags.intro && s.flags.ateStart && s.day > 1,
      set: { neighbor4b: true },
      journal: "Neighbor 4B wants the tape turned down. You still need to hear Juno's warning.",
      chain: [
        { who: "4B", text: "Keep that tape down. Some of us still have a morning shift." },
        {
          who: "YOU",
          text: "They close the hatch. The cassette is still on your blanket.",
          choices: [
            { id: "sorry", label: "I'll keep it low.", set: { quietTape: true }, reply: { who: "4B", text: "Do that." } },
            { id: "not", label: "It's a missing person.", set: { loudTape: true }, reply: { who: "4B", text: "Then find them somewhere that is not my wall." } },
          ],
        },
      ],
    },
    {
      id: "card_night",
      once: false,
      when: (s) => isCardNight(s) && s.flags.flyer && !s.flags["card" + s.day] && (s.hour || 8) < 22,
      setDynamic: (s) => ({ ["card" + s.day]: true }),
      journal: "Card night. New names on the alley board. The hat has more cash in it.",
      chain: [
        {
          who: "CARD",
          text: "Tonight the alley board has names that were not there yesterday. The purse in the hat is heavier. If you trained, this is why.",
        },
      ],
    },
    {
      id: "harbor_slip",
      once: false,
      when: (s) =>
        s.loc === "bunk" &&
        (s.hour || 8) <= 10 &&
        s.day > 3 &&
        s.day % 4 === 0 &&
        !s.flags["slip" + s.day],
      setDynamic: (s) => ({ ["slip" + s.day]: true }),
      chain: [
        {
          who: "HARBOR SLIP",
          text: "",
        },
      ],
    },
    {
      id: "brant_overtime",
      once: true,
      when: (s) => s.loc === "docks" && s.flags.brant && s.flags.hauled,
      set: { brantOver: true },
      journal: "Brant opened double shifts. Six hours. More cash. Stay off Bay C on his clock.",
      chain: [
        {
          who: "FOREMAN BRANT",
          text: "Double shift is open. Six hours. You want the coin, you stop looking at Bay C on my time.",
        },
      ],
    },
    {
      id: "kade_week",
      once: true,
      when: (s) => s.loc === "rustgym" && s.flags.kadeMet && (s.gym === "rust" || s.flags.kadeYes),
      set: { kadeWeek: true },
      journal: "Kade wants pads the morning of every card night. Skip a week and your timing rusts.",
      chain: [
        {
          who: "KADE RUIZ",
          text: "Card nights every three days. Hit the pads the morning of. Skip that and do not call it a plan.",
        },
      ],
    },
    {
      id: "scout",
      once: true,
      when: (s) => s.fame >= 8 && s.loc === "alley" && s.flags.flyer,
      set: { scoutSeen: true },
      clues: 1,
      journal: "A Harbor Commission scout was at the alley. He wrote your name. He did not write Juno.",
      chain: [
        {
          who: "SCOUT",
          text: "Name. Weight. Whether you will sign. I do not do siblings.",
          choices: [
            { id: "name", label: "Vale. Dockhand.", set: { scoutName: true }, reply: { who: "SCOUT", text: "Filed. Do not get interesting too early." } },
            { id: "juno", label: "You already filed a Vale.", set: { scoutJuno: true }, clues: 1, reply: { who: "SCOUT", text: "I file what I am paid to file. Go bleed somewhere that is on my list." } },
          ],
        },
      ],
    },
    {
      id: "mae_file_find",
      once: true,
      when: (s) => s.flags.maeFile && s.loc === "docks",
      set: { maeFileFound: true },
      clues: 1,
      journal: "Juno's safety complaint: stamped received, never read. Pier 9 and night bell in the margin.",
      chain: [
        {
          who: "CLOSET",
          text: "Dust. A stamp that says received. Nobody received it. In the margin Juno wrote: P9 — night bell.",
        },
      ],
    },
    {
      id: "oz_antenna",
      once: true,
      when: (s) => s.flags.ozMet && s.loc === "diner" && !s.flags.radio && (s.flags.openedLocker || s.clues >= 1),
      set: { ozAntenna: true },
      journal: "Oz needs a radio coil from the night market before the shortwave will pick up a name.",
      chain: [
        {
          who: "OZ PELL",
          text: "The weather radio is shy. Buy me a coil at the night market. Then we can listen for Juno.",
        },
      ],
    },
    {
      id: "coil_buy",
      once: true,
      when: (s) => s.flags.ozAntenna && s.flags.boughtCoil,
      set: { ozCoil: true },
      journal: "The coil is in Oz's storeroom. The shortwave can talk now.",
      chain: [
        { who: "OZ PELL", text: "Coil is in. If Brant asks, we were fighting about pickles." },
      ],
    },
    {
      id: "crane_open",
      once: true,
      when: (s) => s.fame >= 12 && !s.flags.craneOpen,
      set: { craneOpen: true },
      unlock: ["crane"],
      journal: "Blue Crane Club opened a stool with your name on it, spelled wrong.",
      chain: [
        {
          who: "NOTICE",
          text: "Blue Crane Club wants you for exhibitions. Do not sign the first paper they hand you. Or the second.",
        },
      ],
    },
    {
      id: "juno_dream",
      once: true,
      when: (s) => s.flags.openedLocker && s.loc === "bunk" && (s.hour || 8) === 8,
      set: { junoDream: true },
      chain: [
        {
          who: "DREAM",
          text: "You dream Juno knotting wraps the navy-wrong way. They say don't take the night fight. You already knew. Knowing is not the same as doing it.",
        },
      ],
    },
    {
      id: "commission_letter",
      once: true,
      when: (s) => s.fame >= 14 && (s.flags.openedLocker || s.wins >= 3),
      set: { commissionLetter: true },
      journal: "A Commission letter: exhibitions, then a title shot. Juno is not mentioned.",
      chain: [
        {
          who: "LETTER",
          text: "Harbor Commission. They want you on an exhibition path that ends in a title fight. Siblings are not on the letter.",
        },
      ],
    },
    {
      id: "watch_serial",
      once: true,
      when: (s) => (s.flags.watchCount || 0) >= 3 && !s.flags.watchSerial,
      set: { watchSerial: true },
      clues: 1,
      journal: "Three night watches. Same unnamed boat. Same hour. Near Pier 9.",
      chain: [
        {
          who: "YOU",
          text: "Three nights. Same hull. Same hour that is not on the board. You stop calling it a coincidence.",
        },
      ],
    },
    {
      id: "barge_early",
      once: true,
      when: (s) => s.loc === "barge" && !s.flags.radio,
      set: { bargeEarly: true },
      chain: [
        {
          who: "GANGWAY",
          text: "A light on the hull. A laugh like a chain. You are here too early and you do not have Juno's radio yet. You leave.",
        },
      ],
    },
  ];

  EXTRA.forEach(function (e) {
    if (e.id === "harbor_slip") {
      const ev = e;
      const oldWhen = ev.when;
      ev.when = function (s) {
        if (!oldWhen(s)) return false;
        ev.chain = [{ who: "HARBOR SLIP", text: SLIPS[s.day % SLIPS.length] }];
        return true;
      };
    }
    S.EVENTS.push(e);
  });

  const prevChain = S.boutChain;
  S.boutChain = function (state, o) {
    if (o.id === "moss") {
      return [
        { who: "PALLET MOSS", text: "Clinch first. Purse after. That is a rule." },
        {
          who: "PALLET MOSS",
          text: isCardNight(state) ? "Card night. The hat has cash in it." : "Not card night. I still clinch.",
          choices: [
            { id: "hug", label: "Don't clinch me.", set: { mossNo: true }, reply: { who: "MOSS", text: "We'll see." } },
            { id: "ok", label: "Ring the bell.", set: { mossGo: true }, reply: { who: "MOSS", text: "Polite. I hate polite." } },
          ],
        },
      ];
    }
    if (o.id === "marlow") {
      return [
        {
          who: "MARLOW VEIN",
          text: state.flags.openedLocker ? "You smell like a locker that had a ledger in it." : "I sell rumors. Tonight you are the product.",
        },
      ];
    }
    if (o.id === "reed") {
      return [
        {
          who: "REED",
          text: state.flags.spitVargas ? "Vargas said you asked a name. I write names on invoices. I do not say them." : "Five rounds. Crowe likes a long fight.",
        },
      ];
    }
    return prevChain(state, o);
  };

  S.chapterOf = chapterOf;
  S.CHAPTERS = CHAPTERS;
  S.isCardNight = isCardNight;
  C.CAMPAIGN = {
    chapters: 12,
    hours: 12,
    gate: "story",
  };
})(typeof window !== "undefined" ? window : global);
