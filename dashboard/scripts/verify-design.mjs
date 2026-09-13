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
for (const item of await page.locator(".editorial-journey").all()) {
  await item.scrollIntoViewIfNeeded();
  await settle();
}
await page.evaluate(async () => {
  await Promise.all(
    [...document.images].map((i) => i.decode().catch(() => {})),
  );
  window.scrollTo({ top: 0, behavior: "instant" });
});
await page.waitForTimeout(900);
await shot("dashboard-desktop");
await shot("dashboard-full", true);
const transform = (selector) =>
  page.locator(selector).evaluate((el) => getComputedStyle(el).transform);
const first = await transform(".cover-photograph"),
  ticketFirst = await transform(".departure-ticket-plane");
await page.evaluate(() => window.scrollTo({ top: 340, behavior: "instant" }));
await settle();
assert.notEqual(first, await transform(".cover-photograph"));
assert.notEqual(ticketFirst, await transform(".departure-ticket-plane"));
await page.waitForTimeout(950);
await shot("scroll-cover");
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
await page.locator(".desk-close").scrollIntoViewIfNeeded();
await page.waitForTimeout(950);
assert.equal(await page.locator(".desk-close h2").innerText(), "Where next?");
assert.equal(
  await page
    .locator(".desk-close > div:first-child")
    .evaluate((el) => getComputedStyle(el).opacity),
  "1",
);
await shot("scroll-close");
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
  "Design verification passed: motion, three widths, six screens, local CRUD, persistence, export, no external requests.",
);
