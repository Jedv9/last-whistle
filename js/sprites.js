/* Last Whistle — painted rooms + canvas boxers on the ring */
(function (root) {
  const W = 960, H = 540;

  function ctx(c) {
    const g = c.getContext("2d");
    g.imageSmoothingEnabled = true;
    g.imageSmoothingQuality = "high";
    return g;
  }
  function fit(c) {
    const dpr = Math.min(2, root.devicePixelRatio || 1);
    const bw = W * dpr, bh = H * dpr;
    if (c.width !== bw || c.height !== bh) {
      c.width = bw;
      c.height = bh;
    }
    const g = ctx(c);
    g.setTransform(dpr, 0, 0, dpr, 0, 0);
    return g;
  }
  function R(g, x, y, w, h, col) {
    g.fillStyle = col;
    g.fillRect(x | 0, y | 0, Math.max(1, w | 0), Math.max(1, h | 0));
  }
  function tick() {
    return ((Date.now() / 220) | 0) % 2;
  }
  function tick3() {
    return ((Date.now() / 180) | 0) % 3;
  }

  function load(name) {
    const i = new Image();
    i.src = "art/" + name + ".png";
    return i;
  }
  const ART = {
    rustgym: load("gym"),
    bunk: load("home"),
    docks: load("docks"),
    diner: load("diner"),
    alley: load("alley"),
    canteen: load("canteen"),
    market: load("market"),
    crane: load("crane"),
    arena: load("arena"),
    barge: load("barge"),
    temple: load("temple"),
    map: load("map"),
    ring: load("ring"),
  };
  const HERO = {
    idle: load("hero_idle"),
    walk: load("hero_walk"),
    walk2: load("hero_walk2"),
    punch: load("hero_punch"),
    lift: load("hero_lift"),
    down: load("hero_down"),
    skip: load("hero_skip"),
  };
  const HERO_H = { idle: 208, walk: 208, walk2: 208, punch: 192, lift: 186, down: 102, skip: 218 };
  const HERO_FOOT = { idle: 0.98, walk: 0.97, walk2: 0.97, punch: 0.97, lift: 0.96, down: 0.9, skip: 0.78 };

  function blit(g, key) {
    const i = ART[key];
    if (i && i.complete && i.naturalWidth) {
      g.drawImage(i, 0, 0, W, H);
      return true;
    }
    R(g, 0, 0, W, H, "#141210");
    return false;
  }

  function fig(g, x, y, pal, pose, sc, dir) {
    sc = sc || 2.2;
    dir = dir == null ? 1 : dir;
    const skin = pal.skin || "#e0b090";
    const hair = pal.hair || "#2a1c14";
    const cloth = pal.bare ? skin : pal.shirt || "#3d7a9a";
    const pants = pal.pants || "#2c3038";
    const shoe = pal.shoes || "#1a1410";
    const glove = pal.glove || "#d0d4d8";
    const ink = "#1a1410";
    const t = tick();
    if (pose === "skip") y += (t ? -2.2 : 0) * sc;
    if (pose === "walk") y += (t ? -0.6 : 0) * sc;
    const p = function (sx, sy, w, h, col) {
      const dx = dir === -1 ? 14 - sx - w : sx;
      R(g, x + dx * sc, y + sy * sc, w * sc, h * sc, col);
    };
    const box = function (sx, sy, w, h, col) {
      p(sx - 0.45, sy - 0.45, w + 0.9, h + 0.9, ink);
      p(sx, sy, w, h, col);
    };
    if (pose === "down") {
      box(1, 16, 12, 4, cloth);
      box(10, 14, 4, 4, skin);
      box(11, 13, 3, 2, hair);
      return;
    }
    box(4, 0, 6, 3, hair);
    box(4.5, 2.2, 5.2, 5, skin);
    box(6.2, 4.4, 1.6, 1.1, "#1a1410");
    if (pose === "punch" && t) {
      box(11, 7, 5, 2.2, skin);
      box(15, 6.2, 3.2, 3.2, glove);
      box(1, 8, 2.4, 5, skin);
      box(0.4, 7.2, 2.6, 2.6, glove);
    } else if (pose === "lift") {
      box(1, 2, 2.4, 6, skin);
      box(10.4, 2, 2.4, 6, skin);
      box(0.2, 1.2, 12.6, 1.6, "#2a2418");
      box(1.2, 0.4, 10.6, 1.2, "#6a6458");
    } else if (pose === "skip") {
      box(1.2, 7, 2.4, 4, skin);
      box(10.4, 7, 2.4, 4, skin);
      g.strokeStyle = "#c9a227";
      g.lineWidth = Math.max(2, sc * 0.45);
      g.beginPath();
      g.ellipse(x + 7 * sc, y + 16 * sc, 8 * sc, (t ? 10 : 4) * sc, 0, 0, Math.PI * 2);
      g.stroke();
    } else if (pose === "walk") {
      box(10, 7, 2.4, 4, skin);
      box(1.2, 8, 2.4, 4, skin);
    } else {
      box(9.5, 5.5, 3, 3, glove);
      box(8.4, 8, 2.2, 3.5, skin);
      box(0.5, 7, 2.6, 4.5, skin);
      box(0.2, 6.2, 2.8, 2.8, glove);
    }
    box(3.6, 8, 6.8, 7.5, cloth);
    if (pal.bare) {
      R(g, x + (dir === -1 ? 14 - 5.5 - 3.2 : 5.5) * sc, y + 10 * sc, 3.2 * sc, 1.2 * sc, "#c09078");
    }
    if (pose === "walk" && t) {
      box(4.2, 15.2, 2.6, 7.2, pants);
      box(7.4, 16.4, 2.6, 6, pants);
      box(3.8, 22, 3.2, 2, shoe);
      box(7.6, 22.4, 3.2, 2, shoe);
    } else if (pose === "walk") {
      box(4.2, 16.4, 2.6, 6, pants);
      box(7.4, 15.2, 2.6, 7.2, pants);
      box(3.8, 22.4, 3.2, 2, shoe);
      box(7.6, 22, 3.2, 2, shoe);
    } else {
      box(4.2, 15.2, 2.6, 7.2, pants);
      box(7.4, 15.2, 2.6, 7.2, pants);
      box(3.8, 22, 3.2, 2, shoe);
      box(7.6, 22, 3.2, 2, shoe);
    }
  }

  function heroReady(img) {
    return img && img.complete && img.naturalWidth;
  }

  function drawHero(g, ax, ay, pose, dir, pal, shrink) {
    let key = pose || "idle";
    if (key === "walk") key = tick() ? "walk" : "walk2";
    const img = HERO[key] || HERO.idle;
    shrink = shrink || 1;
    if (!heroReady(img)) {
      const sc = 4.15 * shrink;
      fig(g, ax - 7 * sc, ay - 24 * sc, pal || youPal(), pose || "idle", sc, dir);
      return { top: ay - 24 * sc };
    }
    const target = (HERO_H[key] || 186) * shrink;
    const scale = target / img.naturalHeight;
    const dw = img.naturalWidth * scale;
    const dh = img.naturalHeight * scale;
    const foot = HERO_FOOT[key] || 0.97;
    g.save();
    g.fillStyle = "rgba(10,8,6,0.34)";
    g.beginPath();
    g.ellipse(ax, ay - 3, Math.max(18, dw * 0.26), 9, 0, 0, Math.PI * 2);
    g.fill();
    g.translate(ax, ay);
    if (dir === -1) g.scale(-1, 1);
    if (key === "skip" && tick()) g.translate(0, -7);
    if (key === "down" && tick()) g.translate(0, 3);
    if ((key === "walk" || key === "walk2") && tick()) g.translate(0, -2);
    g.drawImage(img, -dw / 2, -dh * foot, dw, dh);
    g.restore();
    return { top: ay - dh * foot };
  }

  function hourglass(g, x, y) {
    g.fillStyle = "#1a1410";
    g.fillRect(x - 8, y - 16, 16, 20);
    g.fillStyle = "#efe4c8";
    g.fillRect(x - 6, y - 14, 12, 16);
    g.fillStyle = "#c9a227";
    g.beginPath();
    g.moveTo(x - 5, y - 13);
    g.lineTo(x + 5, y - 13);
    g.lineTo(x, y - 6);
    g.closePath();
    g.fill();
    g.beginPath();
    g.moveTo(x, y - 6);
    g.lineTo(x - 5, y + 1);
    g.lineTo(x + 5, y + 1);
    g.closePath();
    g.fill();
  }

  function bang(g, x, y) {
    mark(g, x, y, "story");
  }

  function mark(g, x, y, kind) {
    const bob = ((Date.now() / 240) | 0) % 2 ? -2 : 0;
    const cy = y + bob;
    g.fillStyle = "#1a1410";
    g.beginPath();
    g.moveTo(x, cy + 12);
    g.lineTo(x - 9, cy);
    g.lineTo(x + 9, cy);
    g.closePath();
    g.fill();
    const pal = {
      story: "#f0c430",
      train: "#e07090",
      eat: "#6fbf73",
      sleep: "#5aa0d4",
      rest: "#c9a227",
      look: "#efe4c8",
      door: "#c45c32",
    };
    g.fillStyle = pal[kind] || "#efe4c8";
    g.fillRect(x - 7, cy - 20, 14, 14);
    g.strokeStyle = "#1a1410";
    g.lineWidth = 2;
    g.strokeRect(x - 7, cy - 20, 14, 14);
    g.fillStyle = "#1a1410";
    g.font = "bold 11px sans-serif";
    g.textAlign = "center";
    g.textBaseline = "middle";
    const glyph = { story: "!", train: "+", eat: "E", sleep: "Z", rest: "~", look: "?", door: ">" };
    g.fillText(glyph[kind] || "•", x, cy - 13);
    g.textBaseline = "alphabetic";
  }

  function youPal(s) {
    const bg = s && s.background;
    if (bg === "courier") return { skin: "#d0a078", hair: "#1a1a16", shirt: "#3a6a88", pants: "#2a2e34", shoes: "#c9a227" };
    if (bg === "night") return { skin: "#e8c8a8", hair: "#3a2218", shirt: "#5a5080", pants: "#1c1c28" };
    if (bg === "galley") return { skin: "#d8a878", hair: "#4a2410", shirt: "#f4efe0", pants: "#3a3228" };
    return { skin: "#e0b090", hair: "#24180e", shirt: "#2f7a6e", pants: "#2c3038", glove: "#c45c32" };
  }

  function scene(canvas, loc, state) {
    const g = fit(canvas);
    const s = state || {};
    const key = loc === "rustgym" ? "rustgym" : loc;
    blit(g, ART[key] ? key : "bunk");
    if (loc === "bunk" && s.props && s.props.tvOn) {
      const pulse = 0.16 + (((Date.now() / 180) | 0) % 2 ? 0.08 : 0);
      g.fillStyle = "rgba(160, 210, 255," + pulse + ")";
      g.fillRect(272, 300, 68, 50);
      g.fillStyle = "rgba(240, 250, 255, 0.1)";
      g.beginPath();
      g.moveTo(306, 328);
      g.lineTo(360, 470);
      g.lineTo(250, 470);
      g.closePath();
      g.fill();
    }
    if (loc === "bunk" && (s.screen === "fridge" || (s.props && s.props.fridgeOpen))) {
      g.fillStyle = "rgba(170, 220, 200, 0.2)";
      g.beginPath();
      g.moveTo(255, 210);
      g.lineTo(175, 400);
      g.lineTo(360, 400);
      g.closePath();
      g.fill();
    }
    if ((s.hour != null ? s.hour : s.slot === 2 ? 20 : 8) >= 20) {
      g.fillStyle = "rgba(12, 18, 48, 0.18)";
      g.fillRect(0, 0, W, H);
    }
    const rooms = root.LW_ROOMS;
    if (rooms && loc !== "map" && !(s.story || s.result || s.screen === "fridge")) {
      const list = rooms.visibleHotspots ? rooms.visibleHotspots(s, loc) : rooms.HOTSPOTS[loc] || [];
      list.forEach(function (h) {
        let kind = h.icon;
        if (!kind && h.act && root.LW_CONTENT) {
          const act = root.LW_CONTENT.ACTIVITIES.find(function (a) {
            return a.id === h.act;
          });
          const tag = act && act.tag;
          kind =
            tag === "Train" || tag === "Work" || tag === "Gym"
              ? "train"
              : tag === "Eat" || tag === "Shop"
              ? "eat"
              : tag === "Rest"
              ? "rest"
              : tag === "Story" || tag === "Fight"
              ? "story"
              : tag === "Look" || tag === "Talk"
              ? "look"
              : null;
        }
        if (!kind) kind = h.bang ? "story" : h.nav ? "door" : "look";
        mark(g, ((h.x + h.w / 2) / 100) * W, ((h.y + 2) / 100) * H, kind);
      });
    }
    const a = s.actor;
    if (a && loc !== "map") {
      const ax = (a.x / 100) * W;
      const ay = (a.y / 100) * H;
      const box = drawHero(g, ax, ay, a.pose || "idle", a.dir == null ? 1 : a.dir, youPal(s), loc === "bunk" ? 0.56 : 1);
      if (a.busyLeft > 0) hourglass(g, ax, box.top - 6);
      (a.fx || []).forEach(function (f) {
        const age = (Date.now() - f.t) / 900;
        if (age > 1) return;
        g.globalAlpha = 1 - age;
        g.fillStyle = f.col || "#5aa0d4";
        g.beginPath();
        g.arc(ax + (f.dx || 0), box.top - 4 - age * 48, 7, 0, Math.PI * 2);
        g.fill();
        g.globalAlpha = 1;
      });
    }
  }

  function map(canvas, state) {
    const g = fit(canvas);
    blit(g, "map");
    const unlocked = (state && state.unlocked) || [];
    const spots = (root.LW_ROOMS && root.LW_ROOMS.MAP_SPOTS) || [];
    spots.forEach(function (sp) {
      if (unlocked.indexOf(sp.travel) >= 0) return;
      g.fillStyle = "rgba(8,10,14,0.5)";
      g.fillRect((sp.x / 100) * W, (sp.y / 100) * H, (sp.w / 100) * W, (sp.h / 100) * H);
    });
    if (state && (state.hour != null ? state.hour : 8) >= 20) {
      g.fillStyle = "rgba(12, 18, 48, 0.18)";
      g.fillRect(0, 0, W, H);
    }
  }

  function ring(canvas, fight) {
    const g = fit(canvas);
    blit(g, "ring");
    const anim = fight.anim || "idle";
    const pop = fight.popup;
    if (anim === "phit" || anim === "ehit") {
      R(g, 448, 210, 40, 40, "#f0c878");
      R(g, 458, 220, 20, 20, "#c45c32");
    }
    if (pop && Date.now() - pop.t < 900) {
      const age = (Date.now() - pop.t) / 900;
      g.save();
      g.globalAlpha = 1 - age;
      g.translate(480, 210 - age * 40);
      if (pop.combo >= 2) {
        g.fillStyle = "#f0c430";
        g.beginPath();
        for (let i = 0; i < 8; i++) {
          const ang = (i / 8) * Math.PI * 2 - Math.PI / 2;
          const r = i % 2 ? 28 : 52;
          g.lineTo(Math.cos(ang) * r, Math.sin(ang) * r);
        }
        g.closePath();
        g.fill();
        g.fillStyle = "#1a1410";
        g.font = "bold 16px sans-serif";
        g.textAlign = "center";
        g.fillText("COMBO", 0, -4);
        g.font = "bold 22px sans-serif";
        g.fillText(String(pop.combo), 0, 18);
      } else if (pop.dmg) {
        g.fillStyle = "#f0c878";
        g.font = "bold 22px sans-serif";
        g.textAlign = "center";
        g.fillText("-" + pop.dmg, 0, 0);
      }
      g.restore();
    }
  }

  function skyline(canvas) {
    const g = fit(canvas);
    blit(g, "rustgym");
  }

  function portrait(canvas, who) {
    const g = fit(canvas);
    blit(g, "rustgym");
    const mapP = {
      "KADE RUIZ": { skin: "#c8a080", hair: "#8a907c", shirt: "#3a3228", pants: "#1a1a18" },
      "MAE OKONKWO": { skin: "#6a4028", hair: "#1a0a08", shirt: "#2f7a6e", pants: "#1a1a18" },
      "OZ PELL": { skin: "#e8c8a8", hair: "#c45c32", shirt: "#f4efe0", pants: "#2a1a10" },
      "NEON LILA": { skin: "#e8c8b0", hair: "#c45c32", shirt: "#d03080", pants: "#1a0a18" },
      "SILAS CROWE": { skin: "#e0d0b0", hair: "#f0e8d8", shirt: "#1a1a1a", pants: "#111" },
      "CRANE VARGAS": { skin: "#c09070", hair: "#111", shirt: "#8a3318", pants: "#1a1208", bare: true },
    };
    fig(g, 420, 140, mapP[who] || youPal(root.LW_STATE), "idle", 5.5, 1);
  }

  root.LW_SPRITES = { scene, map, ring, skyline, portrait, fig, youPal, W, H };
})(typeof window !== "undefined" ? window : global);
