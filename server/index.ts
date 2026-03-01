import express from "express";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { execSync } from "node:child_process";
import { mkdirSync } from "node:fs";
import puppeteer from "puppeteer";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const rootDir = path.resolve(__dirname, "..");
const distDir = path.join(rootDir, "dist");
const outputPath = path.join(distDir, "dashboard.png");
const chromeStateDir = path.join(rootDir, ".tmp", "chromium");
const port = Number(process.env.PORT ?? 3000);
const recaptureMinutes = Number(process.env.RECAPTURE_MINUTES ?? 0);

function buildFrontend() {
  execSync("npm run build", {
    cwd: rootDir,
    stdio: "inherit"
  });
}

function installChromeForPuppeteer() {
  console.log("Chrome not found. Installing browser for Puppeteer...");
  execSync("npx puppeteer browsers install chrome", {
    cwd: rootDir,
    stdio: "inherit"
  });
}

async function captureDashboard(dashboardUrl: string) {
  mkdirSync(chromeStateDir, { recursive: true });

  const launchOptions = {
    headless: true as const,
    env: {
      ...process.env,
      XDG_CONFIG_HOME: chromeStateDir,
      XDG_CACHE_HOME: chromeStateDir
    },
    args: [
      "--no-sandbox",
      "--disable-setuid-sandbox",
      "--disable-dev-shm-usage",
      "--disable-gpu",
      "--disable-crash-reporter",
      "--disable-breakpad",
      "--no-first-run",
      "--no-default-browser-check"
    ]
  };

  let browser;
  try {
    browser = await puppeteer.launch(launchOptions);
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    if (!message.includes("Could not find Chrome")) {
      throw error;
    }

    installChromeForPuppeteer();
    browser = await puppeteer.launch(launchOptions);
  }

  try {
    const page = await browser.newPage();
    await page.setViewport({
      width: 1280,
      height: 720,
      deviceScaleFactor: 1
    });
    await page.goto(dashboardUrl, { waitUntil: "networkidle0" });
    await page.waitForSelector("#root");
    await page.waitForFunction(() => {
      const root = document.getElementById("root");
      return !!root && root.childElementCount > 0;
    });
    await page.screenshot({
      path: outputPath,
      type: "png",
      clip: { x: 0, y: 0, width: 1280, height: 720 }
    });
  } finally {
    await browser.close();
  }
}

async function main() {
  buildFrontend();

  const app = express();
  app.use(express.static(distDir, { etag: false, maxAge: 0 }));
  app.get("/health", (_req, res) => res.json({ ok: true }));

  await new Promise<void>((resolve) => {
    app.listen(port, () => {
      console.log(`Serving dashboard image on http://localhost:${port}/dashboard.png`);
      resolve();
    });
  });

  const dashboardUrl = `http://localhost:${port}/`;
  await captureDashboard(dashboardUrl);

  if (recaptureMinutes > 0) {
    setInterval(async () => {
      try {
        await captureDashboard(dashboardUrl);
        console.log("Dashboard screenshot refreshed");
      } catch (error) {
        console.error("Failed to refresh dashboard screenshot", error);
      }
    }, recaptureMinutes * 60_000);
  }
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
