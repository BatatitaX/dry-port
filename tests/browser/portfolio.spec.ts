import { test, expect, type Page } from "@playwright/test";
const SAVE_KEY = "dry-guided-tutorial-v2";
const TEST_KEY = "dry-guided-lab-v2";
async function enterGame(page: Page) {
  await page.goto("/jornada");
  await expect(page.locator(".guided-world canvas[data-ready=true]")).toBeVisible();
  await expect(page.getByRole("heading", { name: "Primeiro, encontre seu ritmo.", exact: true })).toBeVisible();
}
async function progress(page: Page, key = SAVE_KEY) {
  return page.evaluate(k => JSON.parse(localStorage.getItem(k) || "null"), key);
}

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


test("direct tutorial loads with a corrupt save and pauses on blur", async ({ page }) => {
  await page.addInitScript(key => localStorage.setItem(key, "null"), SAVE_KEY);
  await enterGame(page);
  await expect.poll(async () => (await progress(page))?.phase).toBe(0);
  await page.evaluate(() => window.dispatchEvent(new Event("blur")));
  await expect(page.getByRole("dialog", { name: "Seu jeito de jogar" })).toBeVisible();
  await page.getByRole("button", { name: "Continuar", exact: true }).click();
  await expect(page.getByRole("dialog")).not.toBeVisible();
});

test("pause keeps focus inside, languages update, and portfolio stays accessible", async ({ page }) => {
  await enterGame(page);
  await page.getByRole("button", { name: "Pausa", exact: true }).click();
  const dialog = page.getByRole("dialog", { name: "Seu jeito de jogar" });
  await expect(dialog).toBeVisible();
  await page.keyboard.press("Tab");
  expect(await dialog.evaluate(element => element.contains(document.activeElement))).toBe(true);
  await page.getByRole("button", { name: "English", exact: true }).click();
  await expect(page.locator("html")).toHaveAttribute("lang", "en");
  await page.getByRole("button", { name: "Resume", exact: true }).click();
  await page.getByRole("link", { name: "Portfolio", exact: true }).click();
  await expect(page).toHaveURL(/portfolio\?lang=en/);
});

test("laboratory reset cannot overwrite the normal game", async ({ page }) => {
  await enterGame(page);
  const original = await progress(page);
  await page.getByRole("button", { name: /Testes/, exact: false }).filter({ visible: true }).click();
  await page.getByRole("button", { name: "Entrar no laboratório", exact: true }).click();
  await page.getByRole("button", { name: /Testes/, exact: false }).filter({ visible: true }).click();
  await page.getByRole("button", { name: "3. Desvio", exact: true }).click();
  await expect.poll(async () => (await progress(page, TEST_KEY))?.phase).toBe(2);
  expect(await progress(page)).toEqual(original);
  await page.getByRole("button", { name: /Testes/, exact: false }).filter({ visible: true }).click();
  await page.getByRole("button", { name: "Voltar à partida", exact: true }).click();
  await expect(page.getByRole("heading", { name: "Primeiro, encontre seu ritmo.", exact: true })).toBeVisible();
});

test("touch controls and actions stay visible on a narrow screen", async ({ page, isMobile }) => {
  test.skip(!isMobile, "Touch layout only");
  await enterGame(page);
  const joystick = page.getByRole("group", { name: "Mover", exact: true });
  await expect(joystick).toBeVisible();
  for (const name of ["Ajustar", "Esquiva"]) await expect(page.getByRole("button", { name, exact: true })).toHaveCount(0);
  await expect(page.getByRole("link", { name: "Portfólio", exact: true })).toBeVisible();
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth)).toBe(true);
});
