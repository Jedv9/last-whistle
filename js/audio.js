/* Last Whistle — tiny web-audio stings */
(function (root) {
  let ac;
  function ctx() {
    if (!ac) ac = new (root.AudioContext || root.webkitAudioContext)();
    if (ac.state === "suspended") ac.resume();
    return ac;
  }
  function beep(freq, dur, type, vol) {
    try {
      const a = ctx();
      const o = a.createOscillator();
      const g = a.createGain();
      o.type = type || "square";
      o.frequency.value = freq;
      g.gain.value = vol || 0.04;
      o.connect(g);
      g.connect(a.destination);
      o.start();
      g.gain.exponentialRampToValueAtTime(0.001, a.currentTime + dur);
      o.stop(a.currentTime + dur);
    } catch (e) {}
  }
  let cineNodes = [];
  function stopCine() {
    cineNodes.forEach(function (n) {
      try {
        if (n.stop) n.stop();
        if (n.disconnect) n.disconnect();
      } catch (e) {}
    });
    cineNodes = [];
  }
  function cine() {
    if (cineNodes.length) return;
    try {
      const a = ctx();
      const drone = a.createOscillator();
      const g = a.createGain();
      drone.type = "sine";
      drone.frequency.value = 52;
      g.gain.value = 0.028;
      drone.connect(g);
      g.connect(a.destination);
      drone.start();
      const horn = a.createOscillator();
      const hg = a.createGain();
      horn.type = "triangle";
      horn.frequency.value = 98;
      hg.gain.value = 0.0001;
      horn.connect(hg);
      hg.connect(a.destination);
      horn.start();
      hg.gain.setValueAtTime(0.0001, a.currentTime + 1.6);
      hg.gain.linearRampToValueAtTime(0.035, a.currentTime + 2.0);
      hg.gain.exponentialRampToValueAtTime(0.0001, a.currentTime + 4.2);
      cineNodes = [drone, g, horn, hg];
    } catch (e) {}
  }
  root.LW_AUDIO = {
    tap: () => beep(220, 0.05, "square", 0.03),
    ok: () => {
      beep(330, 0.07, "square", 0.04);
      setTimeout(() => beep(440, 0.08, "square", 0.04), 70);
    },
    hit: () => beep(90, 0.09, "sawtooth", 0.05),
    win: () => {
      beep(392, 0.1);
      setTimeout(() => beep(523, 0.16), 100);
    },
    lose: () => beep(110, 0.25, "triangle", 0.05),
    story: () => beep(262, 0.06, "square", 0.025),
    cine,
    stopCine,
  };
})(typeof window !== "undefined" ? window : global);
