import { chromium } from "playwright";
import fs from "node:fs";
import path from "node:path";
import { pathToFileURL } from "node:url";
const preview = path.resolve(process.env.PREVIEW_PATH || "design-preview.html");
const output = path.resolve(process.env.DESIGN_SHOTS || "test-results/design");
fs.mkdirSync(output, { recursive: true });
const browser = await chromium.launch({ channel: "chrome" });
const context = await browser.newContext({
  viewport: { width: 1280, height: 900 },
  recordVideo: {
    dir: path.resolve("test-results/recordings"),
    size: { width: 1280, height: 900 },
  },
});
await context.addInitScript(() => {
  Element.prototype.requestPointerLock = () => Promise.resolve();
  Element.prototype.setPointerCapture = () => {};
});
const page = await context.newPage();
await page.goto(pathToFileURL(preview).href);
await page.locator(".launch-stage").waitFor();
await page.evaluate(async () => {
  await document.fonts.ready;
  for (const i of document.images) i.loading = "eager";
  await Promise.all(
    [...document.images].map((i) => i.decode().catch(() => {})),
  );
});
async function move(top, duration) {
  await page.evaluate(
    async ({ top, duration }) => {
      const from = scrollY,
        start = performance.now();
      await new Promise((done) => {
        function paint(now) {
          const p = Math.min(1, (now - start) / duration),
            ease = p < 0.5 ? 2 * p * p : 1 - Math.pow(-2 * p + 2, 2) / 2;
          window.scrollTo({
            top: from + (top - from) * ease,
            behavior: "instant",
          });
          if (p < 1) requestAnimationFrame(paint);
          else done();
        }
        requestAnimationFrame(paint);
      });
    },
    { top, duration },
  );
}
async function to(selector, duration, offset = 120) {
  const top = await page
    .locator(selector)
    .first()
    .evaluate(
      (e, gap) => e.getBoundingClientRect().top + scrollY - gap,
      offset,
    );
  await move(top, duration);
}
async function scene(selector, stageSelector, progress, duration) {
  const top = await page
    .locator(selector)
    .evaluate(
      (e, { stageSelector, progress }) =>
        e.getBoundingClientRect().top +
        scrollY -
        22 +
        (e.offsetHeight - e.querySelector(stageSelector).offsetHeight) *
          progress,
      { stageSelector, progress },
    );
  await move(top, duration);
}
await page.waitForTimeout(800);
await scene(".launch-runway", ".launch-stage", 0, 1400);
await scene(".launch-runway", ".launch-stage", 1, 4200);
await to(".desk-numbers", 1500, 180);
await page.waitForTimeout(500);
await to('[data-route-stop="0"]', 1800, 220);
await page.waitForTimeout(700);
await to('[data-route-stop="1"]', 1800, 220);
await page.waitForTimeout(1100);
await scene(".collection-runway", ".collection-stage", 0, 1900);
await page.waitForTimeout(650);
await scene(".collection-runway", ".collection-stage", 1, 4300);
await page.waitForTimeout(650);
await to(".desk-close", 1800, 80);
await page.waitForTimeout(1300);
const video = page.video();
await context.close();
await video.saveAs(path.join(output, "design-motion.webm"));
const staticPage = await browser.newPage({
  viewport: { width: 1440, height: 1000 },
  reducedMotion: "reduce",
});
await staticPage.goto(pathToFileURL(preview).href);
await staticPage.locator(".dispatch-cover").waitFor();
await staticPage.evaluate(async () => {
  await document.fonts.ready;
  for (const image of document.images) image.loading = "eager";
  await Promise.all(
    [...document.images].map((image) => image.decode().catch(() => {})),
  );
});
await staticPage.screenshot({
  path: path.join(output, "dashboard-full.png"),
  fullPage: true,
});
await staticPage.close();
const sheet = await browser.newPage({
  viewport: { width: 1600, height: 1800 },
});
const names = [
  "launch-entry",
  "scroll-cover",
  "scroll-route-uluwatu",
  "gallery-start",
  "gallery-end",
  "scroll-close",
];
await sheet.setContent(
  "<html><style>body{margin:0;padding:30px;background:#f5f3ed;color:#262c29;font:14px Arial}h1{font-size:26px;margin:0 0 20px}main{display:grid;grid-template-columns:1fr 1fr;gap:24px}figure{margin:0}img{width:100%;height:480px;object-fit:contain;background:#e8e8df}figcaption{padding:8px 0;font-size:13px}</style><h1>Kinetic Atlas · scroll sequence</h1><main>" +
    names
      .map(
        (name) =>
          '<figure><img src="data:image/png;base64,' +
          fs.readFileSync(path.join(output, name + ".png")).toString("base64") +
          '"><figcaption>' +
          name.replaceAll("-", " ") +
          "</figcaption></figure>",
      )
      .join("") +
    "</main></html>",
);
await sheet.evaluate(() =>
  Promise.all([...document.images].map((i) => i.decode())),
);
await sheet.screenshot({
  path: path.join(output, "scroll-contact-sheet.png"),
  fullPage: true,
});
await browser.close();
console.log("Kinetic scroll recording and contact sheet saved.");
