import { chromium, firefox } from "playwright";
import AxeBuilder from "@axe-core/playwright";
import fs from "node:fs";
import path from "node:path";
import { pathToFileURL } from "node:url";

// Read-only visual coverage for the portable sample workspace. This does not
// exercise payment processing or make claims about a running backend.
const preview = path.resolve(process.env.PREVIEW_PATH || "design-preview.html");
const output = path.resolve(
  process.env.DESIGN_SHOTS || "test-results/consistency",
);
fs.mkdirSync(output, { recursive: true });
const browserName = process.env.DESIGN_BROWSER || "chrome";
const browser = await (browserName === "firefox"
  ? firefox.launch()
  : chromium.launch({ channel: "chrome" }));
const checks = [],
  failures = [],
  screenshots = [],
  runtimeErrors = [];
const pages = [
  "Overview",
  "Travel plans",
  "People",
  "Payments",
  "Calendar",
  "Settings",
];
const slug = (text) =>
  text
    .toLowerCase()
    .replaceAll(/[^a-z0-9]+/g, "-")
    .replace(/-$/, "");

async function settle(page) {
  await page.evaluate(async () => {
    await document.fonts.ready;
    for (const image of document.images) image.loading = "eager";
    await Promise.all(
      [...document.images].map((image) => image.decode().catch(() => {})),
    );
    await new Promise((resolve) =>
      requestAnimationFrame(() => requestAnimationFrame(resolve)),
    );
  });
  await page.waitForTimeout(220);
}

async function navigate(page, label) {
  const opener = page.getByRole("button", {
    name: "Open navigation",
    exact: true,
  });
  if (
    (await opener.isVisible()) &&
    !(await page
      .locator(".sidebar")
      .evaluate((el) => el.classList.contains("open")))
  )
    await opener.click();
  await page
    .locator(".sidebar")
    .getByRole("button", { name: label, exact: true })
    .click();
  await page.evaluate(() => window.scrollTo({ top: 0, behavior: "instant" }));
  await settle(page);
}

async function capture(page, label, size) {
  const name = `consistency-${slug(label)}-${size}`;
  const viewport = page.viewportSize();
  await page.mouse.move(viewport.width - 1, viewport.height - 1);
  await page.waitForTimeout(160);
  await page.screenshot({ path: path.join(output, name + ".png") });
  screenshots.push({ name, label, size });
  const visual = await page.evaluate(() => {
    const selectors = [
      "html",
      "body",
      ".main",
      ".workspace",
      ".sidebar",
      ".topbar",
      ".page-heading h1",
      ".orbital-intro",
      ".desk-numbers",
      ".journey-reader",
      ".route-stop",
      ".desk-collection",
      ".desk-close",
      ".travel-card",
      ".table-wrap",
      ".payment-card",
      ".gateway-card",
      ".calendar",
      ".calendar-grid",
      ".agenda",
      ".settings-profile",
      ".settings-row",
      ".modal",
      ".modal-head",
      ".modal-body",
      ".login-form",
      ".login-story",
      ".button.primary",
      "input",
      "select",
    ];
    const surfaceSamples = selectors.flatMap((selector) => {
      const element = [...document.querySelectorAll(selector)].find((el) => {
        const r = el.getBoundingClientRect();
        return (
          r.width &&
          r.height &&
          r.bottom > 0 &&
          r.top < innerHeight &&
          r.right > 0 &&
          r.left < innerWidth &&
          getComputedStyle(el).visibility !== "hidden"
        );
      });
      if (!element) return [];
      const style = getComputedStyle(element);
      return [
        {
          selector,
          background: style.backgroundColor,
          backgroundImage: style.backgroundImage,
          color: style.color,
          font: style.fontFamily,
          borderColor: style.borderColor,
          borderRadius: style.borderRadius,
        },
      ];
    });
    const overflow = document.documentElement.scrollWidth - innerWidth;
    const overflowElements =
      overflow > 1
        ? [...document.querySelectorAll("body *")]
            .filter((el) => {
              const r = el.getBoundingClientRect();
              return (
                r.width > 0 &&
                r.right > innerWidth + 1 &&
                r.left >= 0 &&
                getComputedStyle(el).position !== "fixed"
              );
            })
            .slice(0, 15)
            .map((el) => ({
              tag: el.tagName,
              className: String(el.className),
              right: Math.round(el.getBoundingClientRect().right),
            }))
        : [];
    return {
      viewport: { width: innerWidth, height: innerHeight },
      overflow,
      overflowElements,
      heading: document
        .querySelector("dialog[open] h2, h1, .login-form h2")
        ?.textContent?.trim(),
      surfaceSamples,
    };
  });
  const axe = await new AxeBuilder({ page })
    .withTags(["wcag2a", "wcag2aa", "wcag21aa"])
    .analyze();
  const violations = axe.violations.map((v) => ({
    id: v.id,
    impact: v.impact,
    nodes: v.nodes.map((n) => ({
      target: n.target,
      summary: n.failureSummary,
    })),
  }));
  checks.push({
    label,
    size,
    screenshot: name + ".png",
    ...visual,
    violations,
  });
  if (visual.overflow > 1)
    failures.push(
      `${label} (${size}) has ${visual.overflow}px document overflow`,
    );
  if (violations.length)
    failures.push(
      `${label} (${size}): ${violations.map((v) => v.id).join(", ")}`,
    );
  console.log(
    `${browserName} ${size}: ${label}; overflow=${visual.overflow}px; axe=${violations.length}`,
  );
}

async function scene(page, selector, stageSelector) {
  await page.locator(selector).evaluate((element, stageSelector) => {
    const stage = stageSelector ? element.querySelector(stageSelector) : null;
    window.scrollTo({
      top:
        element.getBoundingClientRect().top +
        scrollY -
        30 +
        (stage
          ? Math.max(0, element.offsetHeight - stage.offsetHeight) * 0.42
          : 0),
      behavior: "instant",
    });
  }, stageSelector);
  await settle(page);
}

async function closeDialog(page) {
  await page.getByRole("button", { name: "Close dialog", exact: true }).click();
  await page.getByRole("dialog").waitFor({ state: "hidden" });
}

for (const [size, viewport] of [
  ["desktop", { width: 1440, height: 1000 }],
  ["mobile", { width: 390, height: 844 }],
]) {
  const context = await browser.newContext({
    viewport,
    reducedMotion: "no-preference",
  });
  await context.addInitScript(() => {
    Element.prototype.requestPointerLock = () => Promise.resolve();
    Element.prototype.setPointerCapture = () => {};
  });
  const page = await context.newPage();
  page.setDefaultTimeout(12000);
  page.on("pageerror", (error) =>
    runtimeErrors.push(`${size}: ${error.message}`),
  );
  try {
    await page.goto(pathToFileURL(preview).href);
    await page.locator(".sidebar").waitFor({ state: "attached" });
    await settle(page);
    for (const label of pages) {
      await navigate(page, label);
      await capture(page, label, size);
    }
    await navigate(page, "Overview");
    await scene(page, ".journey-reader");
    await capture(page, "Home itinerary", size);
    await scene(page, ".collection-runway", ".collection-stage");
    await capture(page, "Home collection", size);
    await scene(page, ".desk-close");
    await capture(page, "Home closing", size);

    for (const [section, action, label] of [
      ["Travel plans", "Create travel plan", "Travel editor"],
      ["People", "Add person", "Person editor"],
      ["Payments", "Add payment method", "Payment editor"],
    ]) {
      await navigate(page, section);
      await page.getByRole("button", { name: action, exact: true }).click();
      await page.getByRole("dialog").waitFor();
      await settle(page);
      await capture(page, label, size);
      await closeDialog(page);
    }
    await navigate(page, "Travel plans");
    await page
      .getByRole("button", { name: /^View / })
      .first()
      .click();
    await page.getByRole("dialog").waitFor();
    await settle(page);
    await capture(page, "Travel detail", size);
    await closeDialog(page);
    const helpButton = page.getByRole("button", { name: "Help", exact: true });
    if (await helpButton.isVisible()) await helpButton.click();
    else {
      await page
        .getByRole("button", { name: "Open navigation", exact: true })
        .click();
      await page
        .getByRole("button", { name: "Help & getting started", exact: true })
        .click();
    }
    await page.getByRole("dialog").waitFor();
    await settle(page);
    await capture(page, "Workspace guide", size);
    await closeDialog(page);
    await navigate(page, "Settings");
    await page.getByRole("button", { name: /Sign out/i }).click();
    await page.locator(".login-form").waitFor();
    await settle(page);
    await capture(page, "Login", size);
    await page
      .getByLabel("Password", { exact: true })
      .fill("preview-visual-review");
    await page.getByRole("button", { name: "Sign in", exact: true }).click();
    await page.locator(".sidebar").waitFor({ state: "attached" });
  } catch (error) {
    failures.push(`${size}: ${error.stack}`);
    await page
      .screenshot({
        path: path.join(output, `consistency-failure-${size}.png`),
      })
      .catch(() => {});
  } finally {
    await context.close();
  }
}

// Contact sheets pair the same page at both widths. Actual screenshots are
// embedded locally, preserving a single portable, reviewable artifact.
const escape = (text) => text.replaceAll("&", "&amp;").replaceAll("<", "&lt;");
const image = (label, size) => {
  const shot = screenshots.find((s) => s.label === label && s.size === size);
  return shot
    ? `<img class="${size}" alt="${escape(label)} ${size}" src="data:image/png;base64,${fs.readFileSync(path.join(output, shot.name + ".png")).toString("base64")}">`
    : "";
};
const sheet = await browser.newPage({
  viewport: { width: 1680, height: 1100 },
});
for (const [file, title, labels] of [
  [
    "all-pages-contact-sheet",
    "Travel Plan · One workspace, every screen",
    [...pages, "Home itinerary", "Home collection", "Home closing"],
  ],
  [
    "forms-contact-sheet",
    "Travel Plan · Details, forms & access",
    [
      "Travel editor",
      "Person editor",
      "Payment editor",
      "Travel detail",
      "Workspace guide",
      "Login",
    ],
  ],
]) {
  await sheet.setContent(
    `<html><style>*{box-sizing:border-box}body{margin:0;padding:34px;background:#080e14;color:#f4f0e6;font:14px Arial,sans-serif}header{display:flex;justify-content:space-between;align-items:end;margin-bottom:25px}h1{font-size:28px;font-weight:500;margin:0}header p{color:#e7ab87;margin:0}main{display:grid;grid-template-columns:repeat(3,minmax(0,1fr));gap:26px 20px}figure{margin:0;border-top:1px solid #334049;padding-top:10px}figcaption{font-size:14px;margin-bottom:10px}.pair{display:flex;align-items:flex-start;gap:10px}.desktop{width:76%;height:auto}.mobile{width:22%;height:auto}img{display:block;border:1px solid #23343e}footer{font-size:12px;color:#aeb7bb;padding-top:22px}</style><header><h1>${title}</h1><p>Desktop 1440px / Mobile 390px</p></header><main>${labels.map((label) => `<figure><figcaption>${escape(label)}</figcaption><div class="pair">${image(label, "desktop")}${image(label, "mobile")}</div></figure>`).join("")}</main><footer>Sample workspace · ${browserName} · Original screenshots; no retouching.</footer></html>`,
  );
  await sheet.evaluate(() =>
    Promise.all([...document.images].map((el) => el.decode())),
  );
  await sheet.screenshot({
    path: path.join(output, file + ".png"),
    fullPage: true,
  });
}
await browser.close();
failures.push(...runtimeErrors);
fs.writeFileSync(
  path.join(output, "consistency-verification.json"),
  JSON.stringify(
    {
      browser: browserName,
      scope:
        "Read-only portable sample UI; six pages, three Home sections, forms, details, guide and sign-in at desktop and mobile sizes. Palette observations are reported for visual review, not asserted as hardcoded colors.",
      passed: failures.length === 0,
      checks,
      failures,
    },
    null,
    2,
  ) + "\n",
);
console.log(
  JSON.stringify(
    { browser: browserName, checkedScreens: checks.length, failures },
    null,
    2,
  ),
);
if (failures.length) process.exitCode = 1;
