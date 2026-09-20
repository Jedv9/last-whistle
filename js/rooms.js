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

  // World-space cameras. Rooms stay readable; map reads as a zoomed-out hub.
  const CAM = {
    room: { scale: 0.84, cx: 50, cy: 52 },
    map: { scale: 0.74, cx: 50, cy: 46 },
  };

  const BACKDROPS = {
    bunk: "#8e949a",
    docks: "#7f868d",
    canteen: "#c4b08a",
    alley: "#101218",
    rustgym: "#7d8a96",
    diner: "#5a2424",
    market: "#1a1428",
    temple: "#161410",
    crane: "#1a1020",
    arena: "#2a2018",
    barge: "#0c1220",
    map: "#2a6ea0",
  };

  const FLOOR = {
    bunk: { minX: 6, maxX: 94, minY: 72, maxY: 93 },
    docks: { minX: 6, maxX: 94, minY: 68, maxY: 93 },
    canteen: { minX: 8, maxX: 94, minY: 70, maxY: 93 },
    alley: { minX: 18, maxX: 82, minY: 68, maxY: 92 },
    rustgym: { minX: 8, maxX: 94, minY: 62, maxY: 93 },
    diner: { minX: 8, maxX: 94, minY: 70, maxY: 93 },
    market: { minX: 8, maxX: 94, minY: 70, maxY: 93 },
    temple: { minX: 8, maxX: 94, minY: 66, maxY: 93 },
    crane: { minX: 8, maxX: 94, minY: 68, maxY: 93 },
    arena: { minX: 6, maxX: 94, minY: 70, maxY: 93 },
    barge: { minX: 8, maxX: 62, minY: 70, maxY: 94 },
  };

  // Furniture footprints in room % — keep official stand points walkable.
  const SOLIDS = {
    bunk: [
      { x: 0, y: 58, w: 13, h: 16 },
      { x: 10, y: 54, w: 13, h: 16 },
      { x: 21, y: 50, w: 12, h: 18 },
      { x: 32, y: 50, w: 24, h: 12 },
      { x: 26, y: 60, w: 11, h: 10 },
      { x: 41, y: 64, w: 17, h: 9 },
      { x: 50, y: 40, w: 9, h: 16 },
      { x: 58, y: 44, w: 20, h: 18 },
    ],
    docks: [
      { x: 1, y: 48, w: 15, h: 20 },
      { x: 20, y: 22, w: 30, h: 28 },
      { x: 27, y: 54, w: 22, h: 16 },
      { x: 80, y: 64, w: 14, h: 16 },
    ],
    canteen: [
      { x: 0, y: 48, w: 52, h: 22 },
    ],
    alley: [
      { x: 70, y: 52, w: 24, h: 20 },
    ],
    rustgym: [
      { x: 0, y: 28, w: 18, h: 28 },
      { x: 18, y: 8, w: 22, h: 28 },
      { x: 42, y: 18, w: 36, h: 22 },
      { x: 78, y: 28, w: 16, h: 22 },
      { x: 0, y: 70, w: 12, h: 16 },
    ],
    diner: [
      { x: 0, y: 52, w: 18, h: 20 },
      { x: 14, y: 62, w: 22, h: 12 },
      { x: 28, y: 36, w: 48, h: 28 },
      { x: 62, y: 58, w: 16, h: 12 },
    ],
    market: [
      { x: 2, y: 42, w: 28, h: 26 },
      { x: 30, y: 40, w: 34, h: 24 },
      { x: 64, y: 52, w: 18, h: 16 },
    ],
    temple: [
      { x: 6, y: 18, w: 22, h: 28 },
      { x: 78, y: 62, w: 18, h: 18 },
    ],
    crane: [
      { x: 4, y: 62, w: 28, h: 14 },
      { x: 8, y: 68, w: 18, h: 10 },
      { x: 70, y: 28, w: 26, h: 22 },
    ],
    arena: [
      { x: 4, y: 48, w: 18, h: 18 },
      { x: 28, y: 42, w: 44, h: 30 },
      { x: 82, y: 62, w: 14, h: 16 },
    ],
    barge: [
      { x: 28, y: 18, w: 62, h: 42 },
    ],
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
      { act: "dumpster", x: 72, y: 48, w: 22, h: 28, stand: { x: 68, y: 80 }, label: "Bins — leftover burger", icon: "eat" },
      { nav: "map", x: 42, y: 18, w: 16, h: 22, stand: { x: 50, y: 72 }, label: "Street — map" },
    ],
    rustgym: [
      { act: "join_rust", x: 86, y: 8, w: 13, h: 22, stand: { x: 84, y: 70 }, label: "Dues board $15" },
      { act: "bag", x: 18, y: 4, w: 22, h: 38, stand: { x: 30, y: 68 }, label: "Heavy bag" },
      { act: "weights", x: 0, y: 20, w: 22, h: 52, stand: { x: 20, y: 78 }, label: "Bent bar" },
      { act: "skip", x: 70, y: 62, w: 18, h: 32, stand: { x: 80, y: 82 }, label: "Skip rope" },
      { act: "spar", x: 24, y: 50, w: 42, h: 38, stand: { x: 48, y: 80 }, label: "Spar mat" },
      { act: "talk_kade", x: 70, y: 34, w: 12, h: 28, stand: { x: 74, y: 72 }, label: "Kade Ruiz" },
      { act: "pads", x: 56, y: 8, w: 16, h: 26, stand: { x: 62, y: 68 }, label: "Pads with Kade $8", icon: "train" },
      { nav: "map", x: 0, y: 0, w: 10, h: 12, stand: { x: 10, y: 66 }, label: "Leave gym" },
    ],
    diner: [
      { act: "coffee", x: 32, y: 30, w: 12, h: 22, stand: { x: 38, y: 78 }, label: "Whistle coffee $4" },
      { act: "plate", x: 16, y: 56, w: 28, h: 24, stand: { x: 30, y: 84 }, label: "Dock plate $14" },
      { act: "protein", x: 62, y: 52, w: 16, h: 20, stand: { x: 70, y: 80 }, label: "Protein pile $22" },
      { act: "talk_oz", x: 46, y: 26, w: 16, h: 32, stand: { x: 54, y: 78 }, label: "Oz Pell" },
      { act: "dishes", x: 62, y: 30, w: 14, h: 18, stand: { x: 68, y: 78 }, label: "Wash the stack" },
      { nav: "map", x: 80, y: 8, w: 18, h: 58, stand: { x: 86, y: 78 }, label: "Door — map" },
    ],
    market: [
      { act: "shop", x: 4, y: 18, w: 78, h: 70, stand: { x: 50, y: 82 }, label: "Night stalls" },
      { nav: "map", x: 84, y: 18, w: 14, h: 52, stand: { x: 88, y: 78 }, label: "Street — map" },
    ],
    temple: [
      { act: "join_temple", x: 78, y: 6, w: 20, h: 28, stand: { x: 72, y: 80 }, label: "Iron dues $40" },
      { act: "temple_bag", x: 8, y: 8, w: 28, h: 54, stand: { x: 22, y: 78 }, label: "Temple bag" },
      { act: "temple_spar", x: 32, y: 48, w: 40, h: 36, stand: { x: 50, y: 82 }, label: "Prospect spar" },
      { nav: "map", x: 0, y: 0, w: 10, h: 12, stand: { x: 8, y: 70 }, label: "Leave temple" },
    ],
    crane: [
      { act: "crane_board", x: 8, y: 4, w: 36, h: 34, stand: { x: 28, y: 78 }, label: "Exhibition board" },
      { act: "talk_lila", x: 52, y: 26, w: 18, h: 60, stand: { x: 60, y: 80 }, label: "Neon Lila" },
      { nav: "map", x: 88, y: 0, w: 12, h: 28, stand: { x: 90, y: 74 }, label: "Stairs — map" },
    ],
    arena: [
      { act: "arena_board", x: 26, y: 4, w: 48, h: 28, stand: { x: 22, y: 82 }, label: "Commission card" },
      { nav: "map", x: 0, y: 0, w: 10, h: 14, stand: { x: 8, y: 74 }, label: "Leave arena" },
    ],
    barge: [
      { act: "sneak_barge", x: 20, y: 40, w: 42, h: 42, stand: { x: 36, y: 82 }, label: "Gangway" },
      { nav: "map", x: 0, y: 70, w: 18, h: 24, stand: { x: 10, y: 84 }, label: "Back to pier" },
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

  function clamp(n, a, b) {
    return Math.max(a, Math.min(b, n));
  }

  function camFor(kind) {
    return (kind === "map" ? CAM.map : CAM.room) || CAM.room;
  }

  function camPoint(cam, x, y) {
    cam = cam || CAM.room;
    return {
      x: cam.cx + (x - cam.cx) * cam.scale,
      y: cam.cy + (y - cam.cy) * cam.scale,
    };
  }

  function uncamPoint(cam, x, y) {
    cam = cam || CAM.room;
    const s = cam.scale || 1;
    return {
      x: cam.cx + (x - cam.cx) / s,
      y: cam.cy + (y - cam.cy) / s,
    };
  }

  function camRect(cam, r) {
    const p = camPoint(cam, r.x, r.y);
    return { x: p.x, y: p.y, w: r.w * cam.scale, h: r.h * cam.scale };
  }

  function camHit(cam, r) {
    const out = camRect(cam, r);
    const minW = cam === CAM.map ? 7 : 8;
    const minH = cam === CAM.map ? 8 : 9;
    if (out.w < minW) {
      out.x -= (minW - out.w) / 2;
      out.w = minW;
    }
    if (out.h < minH) {
      out.y -= (minH - out.h) / 2;
      out.h = minH;
    }
    return out;
  }

  function pointIn(r, x, y, pad) {
    pad = pad || 0;
    return x >= r.x - pad && x <= r.x + r.w + pad && y >= r.y - pad && y <= r.y + r.h + pad;
  }

  function blocked(loc, x, y) {
    const floor = FLOOR[loc];
    if (floor) {
      if (x < floor.minX || x > floor.maxX || y < floor.minY || y > floor.maxY) return true;
    }
    const solids = SOLIDS[loc] || [];
    for (let i = 0; i < solids.length; i++) {
      if (pointIn(solids[i], x, y, 1.1)) return true;
    }
    return false;
  }

  function nearestWalkable(loc, x, y) {
    const floor = FLOOR[loc] || { minX: 6, maxX: 94, minY: 68, maxY: 93 };
    x = clamp(x, floor.minX, floor.maxX);
    y = clamp(y, floor.minY, floor.maxY);
    if (!blocked(loc, x, y)) return { x: x, y: y };
    for (let r = 1; r <= 28; r++) {
      const pts = [
        [x, y + r],
        [x + r, y + r],
        [x - r, y + r],
        [x + r, y],
        [x - r, y],
        [x, y - r],
        [x + r, y - r],
        [x - r, y - r],
      ];
      for (let i = 0; i < pts.length; i++) {
        const px = clamp(pts[i][0], floor.minX, floor.maxX);
        const py = clamp(pts[i][1], floor.minY, floor.maxY);
        if (!blocked(loc, px, py)) return { x: px, y: py };
      }
    }
    return { x: (floor.minX + floor.maxX) / 2, y: floor.maxY - 2 };
  }

  function resolveStep(loc, x, y, nx, ny) {
    if (!blocked(loc, nx, ny)) return { x: nx, y: ny };
    if (!blocked(loc, nx, y)) return { x: nx, y: y };
    if (!blocked(loc, x, ny)) return { x: x, y: ny };
    return { x: x, y: y };
  }

  function actDef(id) {
    const acts = root.LW_CONTENT && root.LW_CONTENT.ACTIVITIES;
    return acts && acts.find(function (a) {
      return a.id === id;
    });
  }

  function isStoryMark(state, h) {
    if (!h) return false;
    if (h.bang || h.icon === "story") return true;
    const flags = (state && state.flags) || {};
    if (h.act === "fridge" && !flags.ateStart) return true;
    const act = h.act && actDef(h.act);
    return !!(act && act.tag === "Story");
  }

  function visibleHotspots(state, loc) {
    const list = HOTSPOTS[loc] || [];
    const flags = (state && state.flags) || {};
    return list
      .filter(function (h) {
        if (!h.act) return true;
        const act = actDef(h.act);
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

  function markedHotspots(state, loc) {
    return visibleHotspots(state, loc).filter(function (h) {
      return isStoryMark(state, h);
    });
  }

  root.LW_ROOMS = {
    HOTSPOTS,
    MAP_SPOTS,
    SPAWNS,
    POSES,
    CAM,
    BACKDROPS,
    FLOOR,
    SOLIDS,
    visibleHotspots,
    markedHotspots,
    isStoryMark,
    camFor,
    camPoint,
    uncamPoint,
    camRect,
    camHit,
    blocked,
    nearestWalkable,
    resolveStep,
  };
})(typeof window !== "undefined" ? window : global);
