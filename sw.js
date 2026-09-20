const CACHE = "last-whistle-v19";
const ASSETS = [
  "./",
  "./index.html",
  "./css/game.css",
  "./js/content.js",
  "./js/story.js",
  "./js/campaign.js",
  "./js/combat.js",
  "./js/engine.js",
  "./js/rooms.js",
  "./js/sprites.js",
  "./js/audio.js",
  "./js/ui.js",
  "./js/main.js",
  "./manifest.json",
  "./icons/icon.svg",
  "./art/gym.png",
  "./art/bunk.png",
  "./art/docks.png",
  "./art/diner.png",
  "./art/alley.png",
  "./art/canteen.png",
  "./art/market.png",
  "./art/crane.png",
  "./art/arena.png",
  "./art/barge.png",
  "./art/temple.png",
  "./art/map.png",
  "./art/ring.png",
  "./art/home.png",
  "./art/cine_01_harbor.png",
  "./art/cine_02_juno.png",
  "./art/cine_03_tape.png",
  "./art/cine_04_locker.png",
  "./art/cine_05_pier.png",
  "./art/cine_06_home.png",
  "./art/cine_tape_msg.png",
  "./art/cine_gone.png",
  "./art/juno_idle.png",
  "./art/hero_idle.png",
  "./art/hero_walk.png",
  "./art/hero_walk2.png",
  "./art/hero_punch.png",
  "./art/hero_lift.png",
  "./art/hero_down.png",
  "./art/hero_skip.png",
];

self.addEventListener("install", (e) => {
  e.waitUntil(caches.open(CACHE).then((c) => c.addAll(ASSETS)).then(() => self.skipWaiting()));
});

self.addEventListener("activate", (e) => {
  e.waitUntil(
    caches.keys().then((keys) => Promise.all(keys.filter((k) => k !== CACHE).map((k) => caches.delete(k)))).then(() => self.clients.claim())
  );
});

self.addEventListener("fetch", (e) => {
  e.respondWith(caches.match(e.request).then((r) => r || fetch(e.request)));
});
