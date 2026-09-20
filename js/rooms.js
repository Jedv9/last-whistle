/* Last Whistle — clickable hotspots aligned to painted 16:9 rooms */
(function (root) {
  const SPAWNS = {
    bunk: { x: 48, y: 80 },
    docks: { x: 52, y: 76 },
    canteen: { x: 72, y: 76 },
    alley: { x: 58, y: 74 },
    rustgym: { x: 56, y: 80 },
    diner: { x: 58, y: 76 },
    market: { x: 50, y: 76 },
    temple: { x: 48, y: 76 },
    crane: { x: 38, y: 76 },
    arena: { x: 50, y: 76 },
    barge: { x: 48, y: 74 },
  };

  const POSES = {
    skip: "skip",
    rope_alley: "skip",
    bag: "punch",
    temple_bag: "punch",
    spar: "punch",
    temple_spar: "punch",
    shadow: "punch",
    weights: "lift",
    haul: "lift",
    overtime: "lift",
    dishes: "idle",
    home_bag: "punch",
    home_skip: "skip",
    pushups: "down",
    sleep: "down",
    sit_sofa: "down",
    tv: "idle",
    kettle: "lift",
    wash_sink: "idle",
    pads: "punch",
    dumpster: "lift",
  };

  const HOTSPOTS = {
    bunk: [
      { nav: "map", x: 78, y: 16, w: 20, h: 48, stand: { x: 84, y: 80 }, label: "Door — harbor", icon: "door" },
      { act: "look_quay", x: 78, y: 64, w: 22, h: 28, stand: { x: 86, y: 86 }, label: "Quay — look out", icon: "look" },
      { act: "look_juno_bunk", x: 60, y: 22, w: 18, h: 18, stand: { x: 66, y: 76 }, label: "Juno's bunk", icon: "look" },
      { act: "sleep", x: 58, y: 40, w: 20, h: 24, stand: { x: 64, y: 78 }, label: "Cot — sleep", icon: "sleep" },
      { act: "sit_sofa", x: 36, y: 48, w: 20, h: 16, stand: { x: 46, y: 78 }, label: "Sofa — nap", icon: "rest" },
      { act: "home_bag", x: 1, y: 20, w: 12, h: 38, stand: { x: 14, y: 80 }, label: "Garage bag", icon: "train" },
      { act: "home_skip", x: 1, y: 62, w: 12, h: 14, stand: { x: 12, y: 84 }, label: "Skip rope", icon: "train" },
      { act: "pushups", x: 8, y: 72, w: 16, h: 16, stand: { x: 18, y: 86 }, label: "Mats — push-ups", icon: "train" },
      { act: "look_bench", x: 12, y: 42, w: 12, h: 22, stand: { x: 20, y: 80 }, label: "Workbench", icon: "look" },
      { act: "fridge", x: 22, y: 22, w: 10, h: 34, stand: { x: 28, y: 78 }, label: "Fridge — eat", icon: "eat" },
      { act: "wash_sink", x: 32, y: 34, w: 10, h: 18, stand: { x: 36, y: 78 }, label: "Sink — wash up", icon: "rest" },
      { act: "kettle", x: 40, y: 32, w: 8, h: 16, stand: { x: 42, y: 78 }, label: "Kettle", icon: "eat" },
      { act: "look_mug", x: 38, y: 24, w: 10, h: 10, stand: { x: 42, y: 78 }, label: "Juno's mug", icon: "look" },
      { act: "shadow", x: 48, y: 22, w: 10, h: 28, stand: { x: 50, y: 76 }, label: "Locker — shadowbox", icon: "train" },
      { act: "tv", x: 27, y: 52, w: 10, h: 18, stand: { x: 34, y: 80 }, label: "The box — TV", icon: "rest" },
      { act: "replay", x: 43, y: 62, w: 8, h: 12, stand: { x: 46, y: 80 }, label: "Juno's tape", icon: "story", bang: true },
      { act: "look_note", x: 50, y: 64, w: 8, h: 10, stand: { x: 52, y: 80 }, label: "Juno's note", icon: "look" },
    ],
    docks: [
      { act: "haul", x: 22, y: 14, w: 34, h: 38, stand: { x: 44, y: 76 }, label: "Crates — haul" },
      { act: "manifests", x: 30, y: 54, w: 22, h: 24, stand: { x: 42, y: 78 }, label: "Manifest desk" },
      { act: "watch", x: 74, y: 10, w: 24, h: 48, stand: { x: 72, y: 76 }, label: "Fence — night watch" },
      { act: "overtime", x: 56, y: 40, w: 16, h: 22, stand: { x: 60, y: 76 }, label: "Double shift" },
      { act: "locker", x: 2, y: 16, w: 16, h: 50, stand: { x: 18, y: 76 }, label: "Juno's locker", bang: true },
      { nav: "map", x: 0, y: 0, w: 10, h: 12, stand: { x: 8, y: 72 }, label: "Leave docks" },
    ],
    canteen: [
      { act: "noodles", x: 0, y: 8, w: 16, h: 36, stand: { x: 14, y: 74 }, label: "Cup noodles $3" },
      { act: "stew", x: 16, y: 28, w: 28, h: 28, stand: { x: 30, y: 74 }, label: "Union stew $8" },
      { act: "talk_mae", x: 48, y: 20, w: 18, h: 60, stand: { x: 56, y: 76 }, label: "Mae Okonkwo" },
      { nav: "map", x: 82, y: 8, w: 16, h: 58, stand: { x: 86, y: 74 }, label: "Door — map" },
    ],
    alley: [
      { act: "board", x: 3, y: 2, w: 28, h: 54, stand: { x: 18, y: 72 }, label: "Fight board" },
      { act: "rope_alley", x: 20, y: 70, w: 52, h: 24, stand: { x: 48, y: 80 }, label: "Potholes — footwork" },
      { act: "dumpster", x: 72, y: 48, w: 22, h: 28, stand: { x: 78, y: 76 }, label: "Bins — leftover burger", icon: "eat" },
      { nav: "map", x: 42, y: 18, w: 16, h: 22, stand: { x: 50, y: 72 }, label: "Street — map" },
    ],
    rustgym: [
      { act: "join_rust", x: 86, y: 8, w: 13, h: 22, stand: { x: 84, y: 70 }, label: "Dues board $15" },
      { act: "bag", x: 18, y: 4, w: 22, h: 38, stand: { x: 30, y: 58 }, label: "Heavy bag" },
      { act: "weights", x: 0, y: 20, w: 22, h: 52, stand: { x: 14, y: 74 }, label: "Bent bar" },
      { act: "skip", x: 70, y: 62, w: 18, h: 32, stand: { x: 80, y: 82 }, label: "Skip rope" },
      { act: "spar", x: 24, y: 50, w: 42, h: 38, stand: { x: 48, y: 80 }, label: "Spar mat" },
      { act: "talk_kade", x: 70, y: 34, w: 12, h: 28, stand: { x: 74, y: 70 }, label: "Kade Ruiz" },
      { act: "pads", x: 56, y: 8, w: 16, h: 26, stand: { x: 62, y: 58 }, label: "Pads with Kade $8", icon: "train" },
      { nav: "map", x: 0, y: 0, w: 10, h: 12, stand: { x: 8, y: 70 }, label: "Leave gym" },
    ],
    diner: [
      { act: "coffee", x: 32, y: 30, w: 12, h: 22, label: "Whistle coffee $4" },
      { act: "plate", x: 16, y: 56, w: 28, h: 24, label: "Dock plate $14" },
      { act: "protein", x: 62, y: 52, w: 16, h: 20, label: "Protein pile $22" },
      { act: "talk_oz", x: 46, y: 26, w: 16, h: 32, label: "Oz Pell" },
      { act: "dishes", x: 62, y: 30, w: 14, h: 18, label: "Wash the stack" },
      { nav: "map", x: 80, y: 8, w: 18, h: 58, label: "Door — map" },
    ],
    market: [
      { act: "shop", x: 4, y: 18, w: 78, h: 70, label: "Night stalls" },
      { nav: "map", x: 84, y: 18, w: 14, h: 52, label: "Street — map" },
    ],
    temple: [
      { act: "join_temple", x: 78, y: 6, w: 20, h: 28, label: "Iron dues $40" },
      { act: "temple_bag", x: 8, y: 8, w: 28, h: 54, label: "Temple bag" },
      { act: "temple_spar", x: 32, y: 48, w: 40, h: 36, label: "Prospect spar" },
      { nav: "map", x: 0, y: 0, w: 10, h: 12, label: "Leave temple" },
    ],
    crane: [
      { act: "crane_board", x: 8, y: 4, w: 36, h: 34, label: "Exhibition board" },
      { act: "talk_lila", x: 52, y: 26, w: 18, h: 60, label: "Neon Lila" },
      { nav: "map", x: 88, y: 0, w: 12, h: 28, label: "Stairs — map" },
    ],
    arena: [
      { act: "arena_board", x: 26, y: 4, w: 48, h: 28, label: "Commission card" },
      { nav: "map", x: 0, y: 0, w: 10, h: 14, label: "Leave arena" },
    ],
    barge: [
      { act: "sneak_barge", x: 20, y: 40, w: 42, h: 42, label: "Gangway" },
      { nav: "map", x: 0, y: 70, w: 18, h: 24, label: "Back to pier" },
    ],
  };

  const MAP_SPOTS = [
    { travel: "bunk", x: 2, y: 30, w: 14, h: 28, label: "Bunkhouse 4C" },
    { travel: "docks", x: 16, y: 30, w: 13, h: 26, label: "Blackwater Docks" },
    { travel: "canteen", x: 28, y: 32, w: 11, h: 26, label: "Union Canteen" },
    { travel: "rustgym", x: 38, y: 32, w: 11, h: 26, label: "Rust Bucket Gym" },
    { travel: "alley", x: 40, y: 56, w: 12, h: 10, label: "Bin Alley" },
    { travel: "diner", x: 49, y: 32, w: 14, h: 26, label: "The Last Whistle" },
    { travel: "market", x: 62, y: 42, w: 14, h: 18, label: "Night Market" },
    { travel: "temple", x: 84, y: 30, w: 14, h: 28, label: "Iron Temple" },
    { travel: "crane", x: 74, y: 22, w: 12, h: 24, label: "Blue Crane" },
    { travel: "arena", x: 62, y: 20, w: 14, h: 24, label: "Harbor Arena" },
    { travel: "barge", x: 72, y: 62, w: 22, h: 18, label: "Pier 9" },
  ];

  function visibleHotspots(state, loc) {
    const list = HOTSPOTS[loc] || [];
    const flags = (state && state.flags) || {};
    const acts = root.LW_CONTENT && root.LW_CONTENT.ACTIVITIES;
    return list
      .filter(function (h) {
        if (!h.act) return true;
        const act = acts && acts.find(function (a) {
          return a.id === h.act;
        });
        if (!act) return true;
        if (act.once && flags[act.once]) return false;
        if (act.needFlag && !flags[act.needFlag]) return false;
        return true;
      })
      .map(function (h) {
        if (h.act === "fridge" && !flags.ateStart) {
          return Object.assign({}, h, { bang: true, icon: "story", label: "Fridge — eat leftovers" });
        }
        return h;
      });
  }

  root.LW_ROOMS = { HOTSPOTS, MAP_SPOTS, SPAWNS, POSES, visibleHotspots };
})(typeof window !== "undefined" ? window : global);
