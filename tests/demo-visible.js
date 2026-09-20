#!/usr/bin/env node
"use strict";
const puppeteer = require("/tmp/pup/node_modules/puppeteer-core");

const pause = (ms) => new Promise((r) => setTimeout(r, ms));

(async () => {
  const browser = await puppeteer.connect({
    browserURL: "http://127.0.0.1:9333",
    defaultViewport: null,
  });
  const pages = await browser.pages();
  const page = pages.find((p) => (p.url() || "").includes("4173")) || pages[0];
  await page.bringToFront();
  await page.goto("http://127.0.0.1:4173/", { waitUntil: "networkidle0" });
  await pause(900);

  async function drain() {
    for (let i = 0; i < 16; i++) {
      if (!(await page.$(".dialog-dock"))) return;
      const c = await page.$("[data-choice]");
      if (c) {
        await c.click();
        await pause(550);
      }
    }
  }

  await page.click('[data-go="create"]');
  await pause(700);
  await page.waitForSelector(".name-in");
  await page.click('[data-bg="courier"]');
  await pause(500);
  await page.click('[data-go="start"]');
  await pause(700);
  await drain();
  await pause(800);

  await page.click('[data-nav="map"]');
  await pause(700);
  await page.waitForSelector('[data-travel="docks"]');
  await page.click('[data-travel="docks"]');
  await pause(600);
  await drain();
  await page.waitForSelector('[data-act="haul"]');
  await page.click('[data-act="haul"]');
  await pause(900);
  if (await page.$("[data-ack]")) {
    await page.click("[data-ack]");
    await pause(500);
  }
  await drain();

  await page.click('[data-nav="map"]');
  await pause(600);
  await page.click('[data-travel="alley"]');
  await pause(600);
  await drain();
  await page.click('[data-act="board"]');
  await pause(700);
  await page.click('[data-fight="tommy"]');
  await pause(900);
  for (let r = 0; r < 6; r++) {
    const plan = (await page.$('[data-plan="box"]')) || (await page.$("[data-plan]"));
    if (!plan) break;
    await plan.click();
    await pause(700);
  }
  await pause(600);
  if (await page.$("[data-ack]")) {
    await page.click("[data-ack]");
    await pause(500);
  }
  await drain();
  if (await page.$('[data-nav="journal"]')) {
    await page.click('[data-nav="journal"]');
    await pause(1200);
  }
  console.log("demo done", await page.evaluate(() => document.body.innerText.slice(0, 180)));
  await browser.disconnect();
})().catch((e) => {
  console.error(e);
  process.exit(1);
});
