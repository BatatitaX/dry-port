import { test, expect, type Page } from "@playwright/test";
const SAVE_KEY = "dry-portfolio-save-v4";
async function enterGame(page: Page) {
  await page.goto("/jornada");
  await page.getByRole("button", { name: /COMEÇAR JORNADA/ }).click();
  await expect(page.locator(".phaser-world canvas[data-ready=true]")).toBeVisible();
  // A rendered scene has published its starting position and completed asset loading.
  await expect(page.getByRole("alert")).toHaveCount(0);
  await expect.poll(() => page.evaluate(key => localStorage.getItem(key), SAVE_KEY)).not.toBeNull();
}
async function position(page: Page) { return page.evaluate(key => JSON.parse(localStorage.getItem(key)!).pos, SAVE_KEY); }

test("professional routes work independently of the game and save", async ({ page }) => {
  await page.goto("/portfolio");
  await expect(page.getByRole("link", { name: /BAIXAR CV/ })).toBeVisible();
  await expect(page.locator("canvas")).toHaveCount(0);
  await expect(page.locator(".certificate-section")).toHaveCount(0);
  await page.locator('a[href="/projetos/prever?lang=pt"]').click();
  await expect(page.getByRole("heading", { name: "PREVER", exact: true })).toBeVisible();
  await page.reload();
  await expect(page.getByRole("heading", { name: "PREVER", exact: true })).toBeVisible();
  const pdf = await page.request.get("/Curriculo_Adryel_Luis_Rodrigues.pdf");
  expect(pdf.ok()).toBeTruthy(); expect((await pdf.body()).subarray(0,4).toString()).toBe("%PDF");
});

test("invalid saves recover and keyboard movement stops on blur", async ({ page, isMobile }) => {
  test.skip(isMobile, "Keyboard-only regression; touch is covered separately.");
  await page.addInitScript(key => localStorage.setItem(key, 'null'), SAVE_KEY);
  await enterGame(page);
  const initial = await position(page);
  await page.keyboard.down("ArrowRight");
  await expect.poll(async () => (await position(page)).x).toBeGreaterThan(initial.x+40);
  await page.evaluate(() => window.dispatchEvent(new Event("blur")));
  await page.keyboard.up("ArrowRight");
  // Poll for a persisted snapshot after the blur and assert that it remains fixed.
  await page.waitForTimeout(1100);
  const stopped = await position(page);
  await page.waitForTimeout(1100);
  expect(await position(page)).toEqual(stopped);
});

test("map traps focus, closes on Escape, and language controls remain available", async ({ page }) => {
  await enterGame(page);
  await page.getByRole("button", { name: "Abrir mapa", exact: true }).first().click();
  const dialog = page.getByRole("dialog", { name: "Mapa da jornada" });
  await expect(dialog).toBeVisible();
  await page.keyboard.press("Tab");
  expect(await dialog.evaluate(element => element.contains(document.activeElement))).toBe(true);
  await page.keyboard.press("Escape");
  await expect(dialog).toHaveCount(0);
  await page.getByRole("button", { name: "English", exact: true }).click();
  await expect(page.locator("html")).toHaveAttribute("lang", "en");
  await expect(page.getByRole("button", { name: "Quick portfolio", exact: true })).toBeVisible();
});

test("holding touch direction moves continuously with no release jump", async ({ page, isMobile }) => {
  test.skip(!isMobile, "Directional pad is a mobile control.");
  await enterGame(page);
  const start = await position(page);
  const right = page.getByRole("button", { name: "Mover para a direita", exact: true });
  const box = await right.boundingBox(); expect(box).not.toBeNull();
  await page.mouse.move(box!.x+box!.width/2, box!.y+box!.height/2);
  await page.mouse.down();
  await expect.poll(async () => (await position(page)).x).toBeGreaterThan(start.x+40);
  await page.mouse.up();
  await page.waitForTimeout(1100);
  const stopped=await position(page); await page.waitForTimeout(1100);
  expect(await position(page)).toEqual(stopped);
  await expect(page.getByRole("button", { name: "Portfólio rápido", exact: true })).toBeVisible();
});
