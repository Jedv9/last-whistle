(function () {
  try {
    const E = LW_ENGINE;
    LW_DRAFT = { name: "Ren", bg: "dock" };
    LW_STATE = { screen: "title" };

    function toastClear() {
      const s = LW_STATE;
      if (s && s.toast) {
        setTimeout(function () {
          if (LW_STATE && LW_STATE.toast) {
            LW_STATE.toast = null;
            LW_UI.render();
          }
        }, 2400);
      }
    }

    const _render = LW_UI.render;
    LW_UI.render = function () {
      _render();
      toastClear();
    };

    LW_UI.bind();
    LW_UI.render();

    (function paintLoop() {
      let last = performance.now();
      function frame(now) {
        const dt = Math.min(0.05, (now - last) / 1000);
        last = now;
        const s = LW_STATE;
        const S = LW_SPRITES;
        const E = LW_ENGINE;
        if (s && s.day && E.tickActor) {
          const r = E.tickActor(s, dt);
          if (r === "render") LW_UI.render();
        }
        if (s && s.screen === "cine" && s.cineFallback && s.cineAt) {
          const vid = document.querySelector(".cine-video");
          const playing = vid && !vid.paused && !vid.ended && vid.readyState > 2;
          if (!playing && Date.now() - s.cineAt > 8000) {
            s.cineFallback = false;
            LW_UI.cineAdvance(false);
          }
        }
        if (s && S) {
          if (!s.day || s.screen === "title") {
            const sky = document.getElementById("sky");
            if (sky) S.skyline(sky);
          } else if (s.screen === "fight" && s.fight) {
            const r = document.getElementById("ring");
            if (r) S.ring(r, s.fight);
          } else if (s.screen !== "create" && s.screen !== "end" && !s.ending) {
            const sc = document.getElementById("scene");
            if (sc) {
              if (s.screen === "map") S.map(sc, s);
              else S.scene(sc, s.loc, s);
            }
          }
        }
        requestAnimationFrame(frame);
      }
      requestAnimationFrame(frame);
    })();

    if ("serviceWorker" in navigator && location.protocol === "https:") {
      navigator.serviceWorker.register("sw.js").catch(function () {});
    }
  } catch (err) {
    var s = document.getElementById("screen");
    if (s) s.innerHTML = "<pre style='padding:16px;color:#e85d4c;white-space:pre-wrap'>" + String(err && err.stack ? err.stack : err) + "</pre>";
    throw err;
  }
})();
