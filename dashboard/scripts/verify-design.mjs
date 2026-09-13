import { chromium, firefox } from "playwright";
import AxeBuilder from "@axe-core/playwright";
import fs from "node:fs";
import path from "node:path";
import { pathToFileURL } from "node:url";
import assert from "node:assert/strict";
const preview = path.resolve(process.env.PREVIEW_PATH || "design-preview.html");
const output = path.resolve(process.env.DESIGN_SHOTS || "test-results/design");
fs.mkdirSync(output, { recursive: true });
const browserName = process.env.DESIGN_BROWSER || "chrome";
const browser = await (browserName === "firefox"
  ? firefox.launch()
  : chromium.launch({ channel: "chrome" }));
const context = await browser.newContext({
  viewport: { width: 1440, height: 1000 },
});
await context.addInitScript(() => {
  Element.prototype.requestPointerLock = () => Promise.resolve();
  Element.prototype.setPointerCapture = () => {};
});
const page = await context.newPage(),
  errors = [],
  network = [],
  checks = [];
page.on("pageerror", (e) => errors.push(e.message));
page.on("requestfailed", (r) =>
  errors.push(r.url() + ": " + r.failure()?.errorText),
);
page.on("request", (r) => {
  if (r.url().startsWith("http")) network.push(r.url());
});
const settle = () =>
  page.evaluate(
    () =>
      new Promise((resolve) =>
        requestAnimationFrame(() => requestAnimationFrame(resolve)),
      ),
  );
const shot = (name, fullPage = false) =>
  page.screenshot({ path: path.join(output, name + ".png"), fullPage });
await page.goto(pathToFileURL(preview).href);
await page.locator(".dispatch-cover").waitFor();
await page
  .getByRole("heading", { name: "The departure desk.", exact: true })
  .waitFor();
await page.evaluate(() => document.fonts.ready);
await page.evaluate(async () => {
  for (const image of document.images) image.loading = "eager";
  await Promise.all(
    [...document.images].map((i) => i.decode().catch(() => {})),
  );
  window.scrollTo({ top: 0, behavior: "instant" });
});
await page.waitForTimeout(900);
await shot("dashboard-desktop");
const transform = (selector) =>
  page.locator(selector).evaluate((el) => getComputedStyle(el).transform);
const first = await transform(".cover-photograph"),
  ticketFirst = await transform(".departure-ticket-plane");
async function sceneAt(selector, progress, stageSelector) {
  await page.locator(selector).evaluate(
    (el, { progress, stageSelector }) => {
      const stage = el.querySelector(stageSelector);
      window.scrollTo({
        top:
          el.getBoundingClientRect().top +
          scrollY -
          22 +
          Math.max(0, el.offsetHeight - stage.offsetHeight) * progress,
        behavior: "instant",
      });
    },
    { progress, stageSelector },
  );
  await page.waitForTimeout(180);
}
await sceneAt(".launch-runway", 0.12, ".launch-stage");
const frameStart = await transform(".dispatch-cover");
const strokeStart = await page
  .locator(".flight-trail")
  .evaluate((el) => getComputedStyle(el).strokeDashoffset);
await shot("launch-entry");
await sceneAt(".launch-runway", 0.85, ".launch-stage");
assert.notEqual(frameStart, await transform(".dispatch-cover"));
assert.notEqual(
  strokeStart,
  await page
    .locator(".flight-trail")
    .evaluate((el) => getComputedStyle(el).strokeDashoffset),
);
assert.notEqual(first, await transform(".cover-photograph"));
assert.notEqual(ticketFirst, await transform(".departure-ticket-plane"));
await shot("scroll-cover");
const launchBox = await page.locator(".launch-stage").boundingBox();
const tiltStart = await transform(".dispatch-cover-wrap");
await page.mouse.move(
  launchBox.x + launchBox.width * 0.85,
  launchBox.y + launchBox.height * 0.3,
);
await page.waitForTimeout(100);
assert.notEqual(tiltStart, await transform(".dispatch-cover-wrap"));
await page.mouse.move(1, 1);
for (const [index, name] of [
  [0, "Ubud"],
  [1, "Uluwatu"],
]) {
  await page.locator(`[data-route-stop="${index}"]`).evaluate((el) =>
    window.scrollTo({
      top: el.getBoundingClientRect().top + scrollY - innerHeight * 0.28,
      behavior: "instant",
    }),
  );
  await page.waitForTimeout(950);
  assert.equal(
    await page.locator(".bookmark-photo-caption strong").innerText(),
    name,
  );
  await shot("scroll-route-" + name.toLowerCase());
}
await page
  .getByRole("button", { name: "Read about Ubud", exact: true })
  .click();
await page.waitForTimeout(900);
assert.equal(
  await page.locator(".bookmark-photo-caption strong").innerText(),
  "Ubud",
);
await sceneAt(".collection-runway", 0, ".collection-stage");
const railStart = await transform(".editorial-journeys");
await shot("gallery-start");
await sceneAt(".collection-runway", 0.95, ".collection-stage");
assert.notEqual(railStart, await transform(".editorial-journeys"));
await shot("gallery-end");
await sceneAt(".collection-runway", 0, ".collection-stage");
await page.locator("[data-journey-card='0'] .journey-portrait").focus();
for (let i = 0; i < 4; i++) await page.keyboard.press("Tab");
await page.waitForFunction(() => {
  const card = document
    .querySelector("[data-journey-card='2'] .journey-portrait")
    .getBoundingClientRect();
  const viewport = document
    .querySelector(".collection-window")
    .getBoundingClientRect();
  return card.left >= viewport.left && card.right <= viewport.right;
});
const visibleCard = await page
  .locator("[data-journey-card='2'] .journey-portrait")
  .boundingBox();
const railWindow = await page.locator(".collection-window").boundingBox();
assert(
  visibleCard.x >= railWindow.x - 5 &&
    visibleCard.x + visibleCard.width <= railWindow.x + railWindow.width + 5,
  "Keyboard focus must reveal the last gallery plan: " +
    JSON.stringify({
      visibleCard,
      railWindow,
      state: await page.evaluate(() => ({
        scrollY,
        active: document.activeElement?.outerHTML.slice(0, 100),
        p: document
          .querySelector("[data-rail]")
          .style.getPropertyValue("--rail-progress"),
      })),
    }),
);
await page
  .getByRole("button", { name: "Previous saved journey", exact: true })
  .click();
await page.waitForTimeout(900);
await page
  .getByRole("button", { name: "Next saved journey", exact: true })
  .click();
await page.waitForTimeout(900);
await page.locator(".desk-close").scrollIntoViewIfNeeded();
await page.waitForTimeout(950);
assert.equal(
  (await page.locator(".desk-close h2").innerText()).replace(/\s+/g, " "),
  "Where next?",
);
assert.equal(
  await page
    .locator(".desk-close .closing-copy")
    .evaluate((el) => getComputedStyle(el).opacity),
  "1",
);
await shot("scroll-close");
await audit("Overview with motion", 1440);
await page.setViewportSize({ width: 390, height: 844 });
await page.waitForTimeout(200);
assert.equal(
  await page
    .locator(".collection-stage")
    .evaluate((el) => getComputedStyle(el).position),
  "static",
);
await page
  .locator(".collection-window")
  .evaluate((el) => el.scrollTo({ left: el.scrollWidth, behavior: "instant" }));
await page.locator(".collection-window").scrollIntoViewIfNeeded();
await page.waitForTimeout(250);
await shot("gallery-mobile");
await audit("Overview with motion", 390);
for (const width of [320, 820, 1024]) {
  await page.setViewportSize({ width, height: 1000 });
  await page.waitForTimeout(200);
  await audit("Overview with motion", width);
}
await page.setViewportSize({ width: 1440, height: 1000 });
await page.evaluate(() => window.scrollTo({ top: 0, behavior: "instant" }));
await page
  .getByRole("button", { name: "Explore itinerary", exact: true })
  .click();
await shot("itinerary-desktop");
await page.getByRole("button", { name: "Close dialog", exact: true }).click();
await page.emulateMedia({ reducedMotion: "reduce" });
await page.waitForFunction(
  () =>
    matchMedia("(prefers-reduced-motion: reduce)").matches &&
    getComputedStyle(document.querySelector(".cover-photograph")).transform ===
      "none",
);
assert.equal(await transform(".cover-photograph"), "none");
assert.equal(
  await page
    .locator(".route-bookmark")
    .evaluate((el) => getComputedStyle(el).position),
  "static",
);
await shot("reduced-motion");
await shot("dashboard-full", true);
async function audit(screen, width) {
  assert(
    await page.evaluate(
      () => document.documentElement.scrollWidth <= innerWidth,
    ),
    `Overflow: ${screen} at ${width}`,
  );
  const result = await new AxeBuilder({ page })
    .withTags(["wcag2a", "wcag2aa", "wcag21aa"])
    .analyze();
  checks.push({
    screen,
    width,
    violations: result.violations.map((v) => ({
      id: v.id,
      nodes: v.nodes.map((n) => ({
        target: n.target,
        summary: n.failureSummary,
      })),
    })),
  });
}
for (const width of [1440, 390, 320]) {
  await page.setViewportSize({ width, height: width === 1440 ? 1000 : 844 });
  await settle();
  if (width === 390) {
    await page.evaluate(() => window.scrollTo({ top: 0, behavior: "instant" }));
    await shot("dashboard-mobile");
    await shot("dashboard-mobile-full", true);
  }
  await audit("Overview", width);
}
await page.setViewportSize({ width: 390, height: 844 });
for (const label of [
  "Travel plans",
  "People",
  "Payments",
  "Calendar",
  "Settings",
]) {
  await page.getByRole("button", { name: "Open navigation" }).click();
  await page
    .locator(".sidebar")
    .getByRole("button", { name: label, exact: true })
    .click();
  await audit(label, 390);
}
await page.setViewportSize({ width: 1440, height: 1000 });
await page
  .locator(".sidebar")
  .getByRole("button", { name: "Travel plans", exact: true })
  .click();
await shot("travel-plans-desktop");
const title = "Design review trip " + Date.now();
await page
  .getByRole("button", { name: "Create travel plan", exact: true })
  .click();
for (const [label, value] of Object.entries({
  "Travel plan name": title,
  Description: "A locally saved preview itinerary.",
  "Start date": "2027-01-10",
  "End date": "2027-01-15",
  Destination: "Ubud",
  Country: "Indonesia",
  Activities: "Cooking workshop",
  Accommodation: "Boutique hotel",
  Transportation: "Private car",
}))
  await page.getByLabel(label, { exact: true }).fill(value);
await shot("travel-editor-desktop");
await page
  .getByRole("dialog")
  .getByRole("button", { name: "Create travel plan", exact: true })
  .click();
await page.getByRole("dialog").waitFor({ state: "hidden" });
await page.reload();
await page
  .locator(".sidebar")
  .getByRole("button", { name: "Travel plans", exact: true })
  .click();
await page.getByLabel("Search travel plans").fill(title);
await page.getByRole("heading", { name: title, exact: true }).waitFor();
await page.getByRole("button", { name: "Edit " + title, exact: true }).click();
await page
  .getByLabel("Travel plan name", { exact: true })
  .fill(title + " revised");
await page.getByRole("button", { name: "Save changes", exact: true }).click();
await page.getByRole("dialog").waitFor({ state: "hidden" });
const downloadPromise = page.waitForEvent("download");
await page.getByRole("button", { name: "Export", exact: true }).click();
assert.equal((await downloadPromise).suggestedFilename(), "travel-plans.csv");
await page
  .getByRole("button", { name: "Delete " + title + " revised", exact: true })
  .click();
await page.getByRole("button", { name: "Delete record", exact: true }).click();
await page.getByText("No journeys found", { exact: true }).waitFor();
await page.emulateMedia({ reducedMotion: "no-preference" });
for (const count of [0, 1]) {
  await page.evaluate((count) => {
    const state = structuredClone(window.TRAVEL_PLAN_SAMPLE);
    state.travels = state.travels.slice(0, count);
    localStorage.setItem(
      "travel-plan-departure-preview-v2",
      JSON.stringify(state),
    );
  }, count);
  await page.reload();
  await page
    .getByRole("heading", { name: "The departure desk.", exact: true })
    .waitFor();
  await page.waitForTimeout(150);
  assert(
    (await page.locator(".collection-runway").boundingBox()).height < 500,
    "Empty collection must not add a pinned scroll span",
  );
  assert.equal(await page.locator("[data-journey-card]").count(), 0);
  assert.equal(await page.locator(".launch-runway").count(), count);
}
assert.equal(errors.length, 0, JSON.stringify(errors));
assert.equal(
  network.length,
  0,
  "Preview made external requests: " + network.join(","),
);
fs.writeFileSync(
  path.join(output, "design-verification.json"),
  JSON.stringify(
    {
      browser: browserName,
      browserVersion: browser.version(),
      scope:
        "Self-contained frontend design preview; local sample-data adapter, not live backend",
      motion: {
        independentLayers: true,
        expandingFrame: true,
        drawnFlightPath: true,
        pointerDepth: true,
        horizontalGallery: true,
        keyboardRevealsOffscreenCards: true,
        mobileNativeGallery: true,
        routeSelection: true,
        routeNavigation: true,
        reducedMotionStatic: true,
      },
      workflows: {
        create: true,
        edit: true,
        persistOnReload: true,
        delete: true,
        csvExport: true,
        emptyAndSinglePlanLayouts: true,
      },
      externalRequests: network.length,
      errors,
      checks,
    },
    null,
    2,
  ),
);
console.log(JSON.stringify(checks, null, 2));
await context.close();
await browser.close();
assert(
  checks.every((c) => c.violations.length === 0),
  "Accessibility findings need attention",
);
console.log(
  "Design verification passed: motion, five widths, six screens, local CRUD, persistence, export, no external requests.",
);
