#!/usr/bin/env node
"use strict";
const fs = require("fs");
const puppeteer = require("/tmp/pup/node_modules/puppeteer-core");

(async () => {
  const browser = await puppeteer.launch({
    executablePath: "/usr/local/bin/google-chrome",
    headless: "new",
    args: ["--no-sandbox", "--disable-gpu", "--window-size=1280,720"],
    defaultViewport: { width: 1280, height: 720, deviceScaleFactor: 1, isMobile: false, hasTouch: true },
  });
  const page = await browser.newPage();
  const errors = [];
  page.on("pageerror", (e) => errors.push(String(e)));
  page.on("console", (m) => {
    if (m.type() === "error") errors.push("console:" + m.text());
  });
  async function drainStories() {
    for (let i = 0; i < 20; i++) {
      const choice = await page.$("[data-choice]");
      if (!choice) return;
      await page.click("[data-choice]");
      await new Promise((r) => setTimeout(r, 160));
    }
  }

  await page.goto("http://127.0.0.1:4173/", { waitUntil: "networkidle0", timeout: 20000 });
  await page.evaluate(() => {
    window.LW_FAST = true;
  });
  await page.screenshot({ path: "/tmp/e2e-01-title.png" });

  await page.click('[data-go="create"]');
  await page.waitForSelector("[data-cine], .name-in");
  if (await page.$("[data-cine]")) {
    await page.click('[data-cine="skip"]');
  }
  await page.waitForSelector(".name-in");
  await page.click(".name-in");
  await page.evaluate(() => {
    const el = document.querySelector(".name-in");
    el.value = "";
    el.dispatchEvent(new Event("input", { bubbles: true }));
  });
  await page.type(".name-in", "Ren");
  await page.click('[data-bg="courier"]');
  await page.screenshot({ path: "/tmp/e2e-02-create.png" });
  await page.click('[data-go="start"]');

  await page.waitForSelector(".dialog-dock, .room-view", { timeout: 8000 });
  await page.screenshot({ path: "/tmp/e2e-03-story.png" });
  await drainStories();
  await page.waitForSelector(".room-view", { timeout: 8000 });
  const hasMood = await page.$(".need.md");
  if (!hasMood) throw new Error("mood bar missing from HUD");
  await page.screenshot({ path: "/tmp/e2e-04-hub.png" });

  await page.waitForSelector('[data-act="look_quay"]');
  await page.click('[data-act="look_quay"]');
  await page.waitForSelector(".dialog-dock", { timeout: 12000 });
  await page.screenshot({ path: "/tmp/e2e-home-look.png" });
  await drainStories();
  await page.waitForSelector('[data-act="fridge"]');
  await page.click('[data-act="fridge"]');
  await page.waitForSelector(".prop-bubble.fridge", { timeout: 12000 });
  await page.screenshot({ path: "/tmp/e2e-home-fridge.png" });
  if (await page.$("[data-eat]")) {
    await page.click("[data-eat]");
    await new Promise((r) => setTimeout(r, 200));
  } else if (await page.$('[data-nav="hub"]')) {
    await page.click('[data-nav="hub"]');
  }
  await drainStories();
  await page.waitForSelector(".room-view");
  await page.screenshot({ path: "/tmp/e2e-home-after.png" });

  await page.click('[data-nav="map"]');
  await page.waitForSelector('[data-travel="docks"]');
  await page.screenshot({ path: "/tmp/e2e-05-map.png" });
  await page.click('[data-travel="docks"]');
  await drainStories();
  await page.waitForSelector('[data-act="haul"]');
  await page.click('[data-act="haul"]');
  await page.waitForSelector("[data-ack]", { timeout: 12000 });
  await page.screenshot({ path: "/tmp/e2e-06-haul.png" });
  await page.click("[data-ack]");
  await new Promise((r) => setTimeout(r, 150));
  await drainStories();

  await page.click('[data-nav="map"]');
  await page.waitForSelector('[data-travel="alley"]');
  await page.click('[data-travel="alley"]');
  await drainStories();
  await page.waitForSelector('[data-act="board"]');
  if (await page.$('[data-act="dumpster"]')) {
    await page.click('[data-act="dumpster"]');
    await page.waitForSelector("[data-ack], .dialog-dock", { timeout: 12000 });
    await page.screenshot({ path: "/tmp/e2e-dumpster.png" });
    if (await page.$("[data-ack]")) await page.click("[data-ack]");
    await new Promise((r) => setTimeout(r, 200));
    await drainStories();
  }
  await page.waitForSelector('[data-act="board"]');
  await page.click('[data-act="board"]');
  await page.waitForSelector('[data-fight="tommy"]');
  await page.screenshot({ path: "/tmp/e2e-07-board.png" });
  await page.click('[data-fight="tommy"]');
  await drainStories();
  await page.waitForSelector("[data-plan]");
  await page.screenshot({ path: "/tmp/e2e-08-fight.png" });
  for (let r = 0; r < 6; r++) {
    const plan = (await page.$('[data-plan="box"]')) || (await page.$("[data-plan]"));
    if (!plan) break;
    await plan.click();
    await new Promise((r) => setTimeout(r, 80));
  }
  await page.waitForSelector("[data-ack], .end-view", { timeout: 8000 });
  await page.screenshot({ path: "/tmp/e2e-09-result.png" });
  if (await page.$("[data-ack]")) await page.click("[data-ack]");
  await new Promise((r) => setTimeout(r, 200));
  await drainStories();
  await page.screenshot({ path: "/tmp/e2e-10-afterfight.png" });

  if (await page.$('[data-nav="journal"]')) {
    await page.click('[data-nav="journal"]');
    await new Promise((r) => setTimeout(r, 150));
    await page.screenshot({ path: "/tmp/e2e-11-journal.png" });
  }

  const text = await page.evaluate(() => document.body.innerText.slice(0, 500));
  console.log("BODY:\n" + text);
  console.log("ERRORS:\n" + (errors.join("\n") || "none"));
  if (errors.length) process.exitCode = 1;
  await browser.close();
})().catch(async (e) => {
  console.error(e);
  process.exit(1);
});
