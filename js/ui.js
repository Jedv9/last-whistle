/* Last Whistle — room stage UI */
(function (root) {
  const $ = (sel) => document.querySelector(sel);
  const esc = (s) =>
    String(s == null ? "" : s)
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;");

  function pips(n, max) {
    let h = "";
    const on = Math.round((n / max) * 5);
    for (let i = 0; i < 5; i++) h += '<div class="en-pip ' + (i < on ? "on" : "") + '"></div>';
    return h;
  }

  function bar(n, max, cls) {
    const pct = Math.max(0, Math.min(100, Math.round((n / max) * 100)));
    return (
      '<div class="need-row"><i class="need-ico ' +
      cls +
      '"></i><div class="need ' +
      cls +
      '"><i style="width:' +
      pct +
      '%"></i></div></div>'
    );
  }

  function hud(s) {
    const hours = s.hour == null ? [8, 14, 20][s.slot] || 8 : s.hour;
    const rot = (hours % 12) * 30;
    const ch = root.LW_STORY.chapterOf ? root.LW_STORY.chapterOf(s) : { id: 1 };
    return (
      '<div class="pc-hud"><div class="en-col">' +
      bar(s.hp, s.maxHp, "hp") +
      bar(s.energy, s.maxEnergy, "en") +
      bar(s.hunger, 100, "hu") +
      bar(s.mood == null ? 58 : s.mood, 100, "md") +
      '</div><div class="stat str"><span class="ico i-str"></span>' +
      s.str +
      '</div><div class="stat agi"><span class="ico i-agi"></span>' +
      s.agi +
      '</div><div class="stat stm"><span class="ico i-stm"></span>' +
      s.stm +
      '</div><div class="stat tec"><span class="ico i-tec"></span>' +
      s.tec +
      '</div><div class="hud-cash"><span>$' +
      s.money +
      "</span></div><div class=\"hud-clock\"><div class=\"face\"><i class=\"hand\" style=\"transform:rotate(" +
      rot +
      'deg)"></i></div><div class="dlabel">' +
      hours +
      ":00<br>ch " +
      ch.id +
      "/12 · d" +
      s.day +
      "</div></div></div>"
    );
  }

  function chrome(s, tab) {
    return (
      '<div class="chrome"><button data-nav="map" class="' +
      (tab === "map" ? "on" : "") +
      '">MAP</button><button data-nav="bag" class="' +
      (tab === "bag" ? "on" : "") +
      '">BAG</button><button data-nav="journal" class="' +
      (tab === "journal" ? "on" : "") +
      '">LOG</button></div>'
    );
  }

  function spotsHtml(s) {
    if (s.story || s.result) return "";
    if (s.screen === "fridge") return "";
    if (s.workout) return "";
    if (s.actor && (s.actor.walking || s.actor.busyLeft > 0)) return "";
    if (s.screen === "map") {
      return root.LW_ROOMS.MAP_SPOTS.map(function (h) {
        const open = s.unlocked.indexOf(h.travel) >= 0;
        return (
          '<button class="hot" data-travel="' +
          h.travel +
          '" data-label="' +
          esc(h.label) +
          (open ? "" : " (locked)") +
          '" style="left:' +
          h.x +
          "%;top:" +
          h.y +
          "%;width:" +
          h.w +
          "%;height:" +
          h.h +
          '%"' +
          (open ? "" : " disabled") +
          "></button>"
        );
      }).join("");
    }
    const list = (root.LW_ROOMS.visibleHotspots ? root.LW_ROOMS.visibleHotspots(s, s.loc) : root.LW_ROOMS.HOTSPOTS[s.loc]) || [];
    return list
      .map(function (h) {
        if (h.act) {
          const wx = h.stand ? h.stand.x : h.x + h.w * 0.5;
          const wy = h.stand ? h.stand.y : Math.min(92, h.y + h.h * 0.78);
          return (
            '<button class="hot" data-act="' +
            h.act +
            '" data-wx="' +
            wx +
            '" data-wy="' +
            wy +
            '" data-icon="' +
            (h.icon || "") +
            '" data-label="' +
            esc(h.label) +
            '" style="left:' +
            h.x +
            "%;top:" +
            h.y +
            "%;width:" +
            h.w +
            "%;height:" +
            h.h +
            '%"></button>'
          );
        }
        const wx = h.stand ? h.stand.x : h.x + h.w * 0.5;
        const wy = h.stand ? h.stand.y : Math.min(92, h.y + h.h * 0.78);
        return (
          '<button class="hot" data-nav="' +
          h.nav +
          '" data-wx="' +
          wx +
          '" data-wy="' +
          wy +
          '" data-label="' +
          esc(h.label) +
          '" style="left:' +
          h.x +
          "%;top:" +
          h.y +
          "%;width:" +
          h.w +
          "%;height:" +
          h.h +
          '%"></button>'
        );
      })
      .join("");
  }

  function overlay(s) {
    let h = "";
    if (s.workout) {
      const w = s.workout;
      const pct = Math.max(0, Math.min(100, Math.round((100 * (w.rep || 0)) / (w.reps || 1))));
      const bits = Object.keys(w.gained || {}).map(function (k) {
        return k.toUpperCase() + " +" + (w.gained[k] || 0).toFixed(2);
      });
      h +=
        '<div class="workout-dock"><div class="who">WORKOUT</div><div class="line">' +
        esc(w.name || "Set") +
        " · " +
        (w.rep || 0) +
        "/" +
        (w.reps || 0) +
        (bits.length ? "<br>" + esc(bits.join("  ")) : "") +
        '</div><div class="interest"><span>Interest</span><i style="width:' +
        Math.max(0, Math.min(100, w.interest == null ? 100 : w.interest)) +
        '%"></i></div><button class="btn" data-stop-workout="1">STOP</button></div>';
      h += '<div class="act-bar"><i style="width:' + pct + '%"></i></div>';
    } else if (s.actor && s.actor.busyLeft > 0 && s.actor.busyMax) {
      const pct = Math.max(0, Math.min(100, Math.round(100 * (1 - s.actor.busyLeft / s.actor.busyMax))));
      h += '<div class="act-bar"><i style="width:' + pct + '%"></i></div>';
    }
    if (s.toast) h += '<div class="toast">' + esc(s.toast) + "</div>";
    if (s.result) {
      h +=
        '<div class="result-overlay"><div class="result-card"><h3>' +
        esc(s.result.title) +
        "</h3><p>" +
        esc(s.result.text) +
        '</p><div class="delta">' +
        esc(s.result.delta || "") +
        '</div><button class="btn primary" data-ack="1" style="width:100%;margin-top:8px">OK</button></div></div>';
    }
    return h;
  }

  function dialog(s) {
    if (!s.story) return "";
    const node = s.story.chain[s.story.idx];
    if (!node) return "";
    const ax = Math.max(28, Math.min(46, ((s.actor && s.actor.x) || 50) - 18));
    const ay = 18;
    let html =
      '<div class="dialog-dock speech" style="left:' +
      ax +
      "%;top:" +
      ay +
      '%"><div class="who">' +
      esc(node.who || "…") +
      '</div><div class="line">' +
      esc(node.text).replace(/\n/g, "<br>") +
      '</div><div class="story-actions">';
    if (node.choices) {
      node.choices.forEach(function (c) {
        html += '<button class="btn choice" data-choice="' + c.id + '">' + esc(c.label) + "</button>";
      });
    } else html += '<button class="speech-go" data-choice="next">continue</button>';
    return html + "</div></div>";
  }

  function sheetBag(s) {
    const I = root.LW_CONTENT.ITEMS;
    let html = '<div class="sheet"><h2>LOCKER</h2>';
    html += "<p>Hands: " + esc((s.equipped.hands && I[s.equipped.hands].name) || "bare") + " · Feet: " + esc((s.equipped.feet && I[s.equipped.feet].name) || "work boots") + "</p>";
    s.gear.forEach(function (id) {
      const it = I[id];
      html += '<div class="item-row"><div><b>' + esc(it.name) + "</b><br><span class=\"muted\">" + esc(it.desc) + '</span></div><button class="btn" data-equip="' + id + '">WEAR</button></div>';
    });
    ["salve", "salts", "tape"].forEach(function (id) {
      const n = s.items[id] || 0;
      const it = I[id];
      html += '<div class="item-row"><div><b>' + esc(it.name) + " ×" + n + "</b></div>" + (n ? '<button class="btn" data-use="' + id + '">USE</button>' : "") + "</div>";
    });
    html += '<button class="btn" data-nav="hub">CLOSE</button></div>';
    return html;
  }

  function sheetLog(s) {
    const ch = root.LW_STORY.chapterOf ? root.LW_STORY.chapterOf(s) : null;
    let html = '<div class="sheet"><h2>JOURNAL</h2>';
    if (ch) html += "<p><b>Chapter " + ch.id + " — " + esc(ch.name) + "</b><br><span class=\"muted\">" + esc(ch.blurb) + "</span></p>";
    s.journal
      .slice()
      .reverse()
      .forEach(function (j) {
        html += "<p>" + esc(j) + "</p>";
      });
    html += '<button class="btn" data-nav="hub">CLOSE</button></div>';
    return html;
  }

  function sheetShop(s) {
    const I = root.LW_CONTENT.ITEMS;
    let html = '<div class="sheet shop-sheet"><h2>NIGHT STALLS</h2><p class="muted">Buy some food and kit here.</p><div class="shop-grid">';
    root.LW_CONTENT.SHOP.forEach(function (id) {
      const it = I[id];
      const owned = !it.consumable && s.gear.indexOf(id) >= 0;
      html +=
        '<button class="shop-item" data-buy="' +
        id +
        '"' +
        (owned || s.money < it.price ? " disabled" : "") +
        "><b>" +
        esc(it.name) +
        '</b><span class="muted">' +
        esc(it.desc) +
        '</span><span class="price">$' +
        it.price +
        "</span></button>";
    });
    html += '</div><div class="shop-actions"><button class="btn" data-nav="hub">CLOSE</button></div></div>';
    return html;
  }

  function bubbleFridge(s) {
    const I = root.LW_CONTENT.ITEMS;
    const F = s.fridge || {};
    let html = '<div class="prop-bubble fridge"><div class="who">FRIDGE</div>';
    if (!s.flags.ateStart) html += '<p class="muted">Eat first. Then the docks.</p>';
    let any = false;
    ["noodles", "stew", "coffee", "plate", "protein"].forEach(function (id) {
      const n = F[id] || 0;
      if (!n) return;
      any = true;
      const it = I[id];
      html += '<button class="btn" data-eat="' + id + '">' + esc(it.name) + " ×" + n + "</button>";
    });
    if (!any) html += '<p class="muted">A sad metal box. Buy food at the stalls or the canteen.</p>';
    html += '<button class="speech-go" data-nav="hub">close</button></div>';
    return html;
  }

  function sheetBoard(s) {
    const bouts = root.LW_ENGINE.availableBouts(s);
    let html =
      '<div class="sheet"><h2>FIGHT CARD</h2><p class="muted">Names show up when the story does. Days can run. The board waits on you, not the calendar.</p>';
    if (!bouts.length) html += "<p>No names for you yet.</p>";
    bouts.forEach(function (o) {
      html +=
        '<button class="btn" data-fight="' +
        o.id +
        '"><b>' +
        esc(o.name) +
        "</b> · " +
        esc(o.rank) +
        " · purse $" +
        o.purse +
        (s.boutDone[o.id] ? " · fought" : "") +
        "</button>";
    });
    html += '<button class="btn" data-nav="hub">BACK</button></div>';
    return html;
  }

  function stageView(s) {
    const tab = s.screen;
    const isMap = tab === "map";
    let extra = "";
    if (tab === "bag") extra = sheetBag(s);
    if (tab === "journal") extra = sheetLog(s);
    if (tab === "shop") extra = sheetShop(s);
    if (tab === "fridge") extra = bubbleFridge(s);
    if (tab === "board") extra = sheetBoard(s);
    return (
      '<div class="view room-view">' +
      hud(s) +
      chrome(s, tab) +
      '<div class="stage"><canvas id="scene"></canvas><div class="hotspots">' +
      spotsHtml(s) +
      '</div><div class="hint" id="hint">' +
      esc(root.LW_CONTENT.LOCATIONS[s.loc] ? root.LW_CONTENT.LOCATIONS[s.loc].name : "Blackwater") +
      "</div></div>" +
      extra +
      dialog(s) +
      overlay(s) +
      "</div>"
    );
  }

  function cineView(s) {
    const beats = root.LW_STORY.CINE || [];
    const i = Math.min(s.cineIdx || 0, Math.max(0, beats.length - 1));
    const b = beats[i] || { img: "cine_06_home", video: "cine_06_home", who: "…", text: "" };
    const vid = b.video || b.img;
    return (
      '<div class="view cine-view"><video class="cine-video" poster="art/' +
      b.img +
      '.png" autoplay muted playsinline preload="auto"><source src="art/' +
      vid +
      '.mp4" type="video/mp4"><source src="art/' +
      vid +
      '.webm" type="video/webm"></video><img class="cine-still" src="art/' +
      b.img +
      '.png" alt=""><div class="cine-bars" aria-hidden="true"></div><div class="cine-cap"><div class="who">' +
      esc(b.who) +
      '</div><div class="line">' +
      esc(b.text) +
      '</div><div class="cine-nav"><button class="speech-go" data-cine="next">continue</button><button class="speech-go" data-cine="skip">skip</button></div></div><div class="cine-prog">' +
      (i + 1) +
      " / " +
      beats.length +
      '</div><div class="cine-scrub"><i id="cine-scrub"></i></div></div>'
    );
  }

  function cineAdvance(skip) {
    const s = root.LW_STATE;
    if (!s || s.screen !== "cine") return;
    if (s.cineLock) return;
    s.cineLock = true;
    const beats = root.LW_STORY.CINE || [];
    if (skip || (s.cineIdx || 0) >= beats.length - 1) {
      if (root.LW_AUDIO && root.LW_AUDIO.stopCine) root.LW_AUDIO.stopCine();
      root.LW_DRAFT = root.LW_DRAFT || { name: "Ren", bg: "dock" };
      root.LW_STATE = { screen: "create" };
    } else {
      s.cineIdx = (s.cineIdx || 0) + 1;
      s.cineAt = Date.now();
      s.cineLock = false;
    }
    if (root.LW_AUDIO && root.LW_AUDIO.story) root.LW_AUDIO.story();
    render();
  }

  function armCine() {
    const s = root.LW_STATE;
    if (!s || s.screen !== "cine") {
      if (root.LW_AUDIO && root.LW_AUDIO.stopCine) root.LW_AUDIO.stopCine();
      return;
    }
    if (root.LW_AUDIO && root.LW_AUDIO.cine) root.LW_AUDIO.cine();
    const v = document.querySelector(".cine-video");
    const still = document.querySelector(".cine-still");
    if (!v) return;
    s.cineLock = false;
    const hideStill = function () {
      if (still) still.classList.add("hidden");
      v.classList.add("on");
    };
    v.addEventListener("playing", hideStill);
    v.addEventListener("loadeddata", function () {
      if (v.readyState >= 2) hideStill();
    });
    v.addEventListener("ended", function () {
      cineAdvance(false);
    });
    v.addEventListener("error", function () {
      s.cineFallback = true;
      s.cineAt = Date.now();
    });
    v.addEventListener("timeupdate", function () {
      const bar = document.getElementById("cine-scrub");
      if (bar && v.duration) bar.style.width = Math.round((100 * v.currentTime) / v.duration) + "%";
    });
    const play = v.play();
    if (play && play.catch) {
      play.catch(function () {
        s.cineFallback = true;
        s.cineAt = Date.now();
      });
    }
  }

  function titleView() {
    const has = !!root.LW_ENGINE.load();
    return (
      '<div class="view title-view"><div class="skyline"><canvas id="sky"></canvas></div><div class="title-shade"></div><div class="brand"><h1>LAST WHISTLE</h1><div class="sub">DOCKYARD FIGHTING CLUB</div></div><div class="menu-col"><button class="btn primary" data-go="create">NEW GAME</button>' +
      (has ? '<button class="btn gold" data-go="continue">CONTINUE</button>' : "") +
      '</div><div class="fineprint">Twelve chapters. Days keep going. The story is what opens the next door.</div></div>'
    );
  }

  function createView(draft) {
    const bgs = root.LW_CONTENT.BACKGROUNDS;
    return (
      '<div class="view create-view"><h1>WHO CLOCKS IN?</h1><input class="name-in" maxlength="14" value="' +
      esc(draft.name) +
      '" placeholder="REN" onfocus="this.select()" /><div class="bg-pick">' +
      bgs
        .map(function (b) {
          return (
            '<button class="bg-card ' +
            (draft.bg === b.id ? "on" : "") +
            '" data-bg="' +
            b.id +
            '"><b>' +
            esc(b.name) +
            "</b>" +
            esc(b.blurb) +
            "</button>"
          );
        })
        .join("") +
      '</div><button class="btn primary" data-go="start">CLOCK IN</button><button class="btn ghost" data-go="title">BACK</button></div>'
    );
  }

  function fightView(s) {
    const f = s.fight;
    const o = root.LW_CONTENT.OPPONENTS[f.oppId];
    const plans = root.LW_COMBAT.PLANS;
    const keys = Object.keys(plans);
    let html =
      '<div class="view fight-view"><div class="fight-hud"><div class="fh"><div class="hpnums">' +
      Math.round(f.p.hp) +
      " / " +
      f.p.maxHp +
      '</div><div class="hpbar"><i style="width:' +
      Math.max(0, (f.p.hp / f.p.maxHp) * 100) +
      '%"></i></div><div class="stambar"><i style="width:' +
      f.p.stam +
      '%"></i></div><div class="stamnums">' +
      Math.round(f.p.stam) +
      " / 100</div></div><div class=\"round-tag\">ROUND<br><b>" +
      f.round +
      "</b><span>of " +
      f.maxRounds +
      '</span></div><div class="fh" style="text-align:right"><div class="hpnums">' +
      Math.round(f.e.hp) +
      " / " +
      f.e.maxHp +
      '</div><div class="hpbar"><i style="width:' +
      Math.max(0, (f.e.hp / f.e.maxHp) * 100) +
      '%"></i></div><div class="stambar"><i style="width:' +
      f.e.stam +
      '%"></i></div><div class="stamnums">' +
      Math.round(f.e.stam) +
      " / 100</div></div></div><div class=\"ring-wrap\"><canvas id=\"ring\"></canvas>";
    if (f.waiting && !f.over) {
      html += '<div class="tactics left">';
      html += '<button data-plan="' + keys[0] + '">' + plans[keys[0]].name + "</button>";
      html += '<button data-plan="' + keys[2] + '">' + plans[keys[2]].name + "</button></div>";
      html += '<div class="tactics right">';
      html += '<button data-plan="' + keys[1] + '">' + plans[keys[1]].name + "</button>";
      html += '<button data-plan="' + keys[3] + '">' + plans[keys[3]].name + "</button></div>";
    }
    html +=
      '<div class="flog">' +
      f.log
        .slice(-3)
        .map(function (l) {
          return "<div>" + esc(l) + "</div>";
        })
        .join("") +
      "</div></div>" +
      overlay(s) +
      "</div>";
    return html;
  }

  function endView(s) {
    const e = root.LW_STORY.ENDINGS[s.ending] || root.LW_STORY.ENDINGS.fade;
    return (
      '<div class="view end-view"><h1>' +
      esc(e.title) +
      "</h1><p>" +
      esc(e.text) +
      "</p><p>" +
      esc(s.name) +
      " · " +
      s.wins +
      "–" +
      s.losses +
      '</p><button class="btn primary" data-go="title">SHIFT CHANGE</button></div>'
    );
  }

  function paint(s) {
    const sc = $("#scene");
    if (!sc || !root.LW_SPRITES) return;
    if (s.screen === "map") root.LW_SPRITES.map(sc, s);
    else root.LW_SPRITES.scene(sc, s.loc, s);
  }

  function render() {
    const s = root.LW_STATE;
    const mount = $("#screen");
    if (!s || s.screen === "title") {
      mount.innerHTML = titleView();
      const sky = $("#sky");
      if (sky) root.LW_SPRITES.skyline(sky);
      return;
    }
    if (s.screen === "cine") {
      mount.innerHTML = cineView(s);
      armCine();
      return;
    }
    if (s.screen === "create") {
      mount.innerHTML = createView(root.LW_DRAFT);
      return;
    }
    if (s.ending || s.screen === "end") {
      mount.innerHTML = endView(s);
      return;
    }
    if (s.screen === "fight" && s.fight) {
      mount.innerHTML = fightView(s);
      const r = $("#ring");
      if (r) root.LW_SPRITES.ring(r, s.fight);
      return;
    }
    mount.innerHTML = stageView(s);
    paint(s);
  }

  function bind() {
    const screen = document.getElementById("screen");
    screen.addEventListener("mouseover", function (ev) {
      const t = ev.target.closest("[data-label]");
      const hint = document.getElementById("hint");
      if (hint && t) hint.textContent = t.getAttribute("data-label");
    });
    screen.addEventListener("click", function (ev) {
      const t = ev.target.closest("[data-go],[data-act],[data-nav],[data-bg],[data-travel],[data-choice],[data-plan],[data-fight],[data-buy],[data-equip],[data-use],[data-ack],[data-cine],[data-eat],[data-stop-workout]");
      const E = root.LW_ENGINE;
      let s = root.LW_STATE;
      if (!t) {
        if (ev.target.closest(".dialog-dock,.sheet,.result-overlay,.chrome,.pc-hud,.prop-bubble,.workout-dock")) return;
        const stage = ev.target.closest(".stage");
        if (stage && s && s.day && (s.screen === "hub" || s.screen === "story" || s.screen === "fridge") && !s.story && !s.result) {
          if (s.workout) return;
          if (s.actor && (s.actor.walking || s.actor.busyLeft > 0)) return;
          if (s.screen === "fridge") {
            s.screen = "hub";
            if (s.props) s.props.fridgeOpen = false;
            render();
            return;
          }
          const r = stage.getBoundingClientRect();
          const x = ((ev.clientX - r.left) / r.width) * 100;
          const y = ((ev.clientY - r.top) / r.height) * 100;
          if (y < 16 || y > 94) return;
          E.queueWalk(s, { kind: "idle", x: x, y: Math.max(48, y) });
          render();
        }
        return;
      }
      root.LW_AUDIO.tap();

      if (t.dataset.go === "create") {
        root.LW_STATE = { screen: "cine", cineIdx: 0, cineAt: Date.now() };
        render();
        return;
      }
      if (t.dataset.go === "title") {
        if (s && s.ending) E.clearSave();
        root.LW_STATE = { screen: "title" };
        render();
        return;
      }
      if (t.dataset.go === "continue") {
        const loaded = E.load();
        if (loaded) {
          root.LW_STATE = loaded;
          loaded.screen = loaded.ending ? "end" : "hub";
          loaded.fight = null;
          loaded.story = null;
          loaded.result = null;
          loaded.pendingFight = null;
          E.maybeStory(loaded);
        }
        render();
        return;
      }
      if (t.dataset.go === "start") {
        const input = document.querySelector(".name-in");
        const name = (input && input.value.trim()) || "Ren";
        root.LW_STATE = E.createState({ name: name, background: root.LW_DRAFT.bg });
        E.maybeStory(root.LW_STATE);
        E.persist(root.LW_STATE);
        root.LW_AUDIO.ok();
        render();
        return;
      }
      if (t.dataset.bg) {
        root.LW_DRAFT.bg = t.dataset.bg;
        render();
        return;
      }
      if (t.dataset.cine) {
        cineAdvance(t.dataset.cine === "skip");
        return;
      }
      if (!s || !s.day) return;

      if (t.dataset.stopWorkout) {
        E.stopWorkout(s);
        render();
        return;
      }
      if (s.workout) return;

      if (t.dataset.ack) {
        E.ackResult(s);
        s.toast = null;
        render();
        return;
      }
      if (t.dataset.nav === "hub") {
        s.screen = "hub";
        if (s.props) s.props.fridgeOpen = false;
        render();
        return;
      }
      if (t.dataset.nav === "map") {
        if (t.dataset.wx) {
          E.queueWalk(s, { kind: "nav", id: "map", x: +t.dataset.wx, y: +t.dataset.wy });
        } else {
          s.screen = "map";
        }
        render();
        return;
      }
      if (t.dataset.nav === "bag") {
        s.screen = "bag";
        render();
        return;
      }
      if (t.dataset.nav === "journal") {
        s.screen = "journal";
        render();
        return;
      }
      if (t.dataset.travel) {
        E.travel(s, t.dataset.travel);
        render();
        return;
      }
      if (t.dataset.act) {
        if (t.dataset.wx) {
          E.queueWalk(s, { kind: "act", id: t.dataset.act, x: +t.dataset.wx, y: +t.dataset.wy });
        } else {
          E.doActivity(s, t.dataset.act);
        }
        root.LW_AUDIO.ok();
        render();
        return;
      }
      if (t.dataset.choice) {
        E.storyContinue(s, t.dataset.choice === "next" ? null : t.dataset.choice);
        root.LW_AUDIO.story();
        render();
        return;
      }
      if (t.dataset.plan) {
        E.pickPlan(s, t.dataset.plan);
        root.LW_AUDIO.hit();
        if (s.fight && s.fight.over) root.LW_AUDIO[s.fight.result === "win" ? "win" : "lose"]();
        render();
        return;
      }
      if (t.dataset.fight) {
        (E.approachFight || E.startFight)(s, t.dataset.fight);
        render();
        return;
      }
      if (t.dataset.buy) {
        E.buy(s, t.dataset.buy);
        render();
        return;
      }
      if (t.dataset.equip) {
        E.equip(s, t.dataset.equip);
        render();
        return;
      }
      if (t.dataset.use) {
        E.useItem(s, t.dataset.use);
        render();
        return;
      }
      if (t.dataset.eat) {
        E.eatFridge(s, t.dataset.eat);
        render();
        return;
      }
    });
    screen.addEventListener("input", function (ev) {
      if (ev.target.classList.contains("name-in") && root.LW_DRAFT) root.LW_DRAFT.name = ev.target.value;
    });
  }

  root.LW_UI = { render, bind, cineAdvance, armCine };
})(typeof window !== "undefined" ? window : global);
