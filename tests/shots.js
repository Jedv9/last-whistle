#!/usr/bin/env node
"use strict";
const puppeteer = require("/tmp/pup/node_modules/puppeteer-core");

(async () => {
  const browser = await puppeteer.launch({
    executablePath: "/usr/local/bin/google-chrome",
    headless: "new",
    args: ["--no-sandbox", "--disable-gpu", "--window-size=1280,720"],
    defaultViewport: { width: 1280, height: 720, deviceScaleFactor: 1 },
  });
  const page = await browser.newPage();
  const pause = (ms) => new Promise((r) => setTimeout(r, ms));
  async function drain() {
    for (let i = 0; i < 20; i++) {
      if (!(await page.$("[data-choice]"))) return;
      await page.click("[data-choice]");
      await pause(80);
    }
  }

  await page.goto("http://127.0.0.1:4173/", { waitUntil: "networkidle0" });
  await pause(400);
  await page.screenshot({ path: "/tmp/shot-title.png" });

  await page.click('[data-go="create"]');
  await page.waitForSelector("[data-cine], .name-in");
  if (await page.$("[data-cine]")) await page.click('[data-cine="skip"]');
  await page.waitForSelector(".name-in");
  await page.click('[data-go="start"]');
  await page.waitForSelector(".dialog-dock, .room-view");
  await drain();
  await page.waitForSelector(".room-view");
  await pause(300);
  await page.screenshot({ path: "/tmp/shot-bunk.png" });

  await page.click('[data-nav="map"]');
  await page.waitForSelector('[data-travel="docks"]');
  await pause(250);
  await page.screenshot({ path: "/tmp/shot-map.png" });

  await page.click('[data-travel="rustgym"]');
  await drain();
  await pause(400);
  await page.screenshot({ path: "/tmp/shot-gym.png" });

  await page.click('[data-nav="map"]');
  await page.click('[data-travel="canteen"]');
  await drain();
  await pause(250);
  await page.screenshot({ path: "/tmp/shot-canteen.png" });

  await page.click('[data-nav="map"]');
  await page.click('[data-travel="diner"]');
  await drain();
  await pause(250);
  await page.screenshot({ path: "/tmp/shot-diner.png" });

  await page.click('[data-nav="map"]');
  await page.click('[data-travel="alley"]');
  await drain();
  await page.waitForSelector('[data-act="board"]');
  await page.screenshot({ path: "/tmp/shot-alley.png" });
  await page.click('[data-act="board"]');
  await page.waitForSelector('[data-fight="tommy"]');
  await page.click('[data-fight="tommy"]');
  await page.waitForSelector("[data-plan]");
  await pause(400);
  await page.screenshot({ path: "/tmp/shot-ring.png" });

  await browser.close();
  console.log("shots ok");
})().catch((e) => {
  console.error(e);
  process.exit(1);
});
