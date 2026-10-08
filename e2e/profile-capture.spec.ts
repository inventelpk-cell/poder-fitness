import { expect, test, type Page } from '@playwright/test';

const OUT = '/cursor/stores/self/media/app-screenshots/profile';

async function onboard(page: Page): Promise<void> {
  await page.goto('/');
  await page.getByRole('button', { name: 'Continuar' }).click();
  await page.getByRole('heading', { name: 'Tu entrenador' }).waitFor();
  await page.getByRole('button', { name: 'Continuar' }).click();
  await page.getByRole('radio', { name: /Principiante/ }).click();
  await page.getByRole('button', { name: 'Continuar' }).click();
  await page.getByRole('radio', { name: 'Hipertrofia' }).click();
  await page.getByRole('button', { name: 'Continuar' }).click();
  await page.getByRole('button', { name: 'Solo peso corporal' }).click();
  await page.getByRole('button', { name: 'Continuar' }).click();
  await page.getByRole('radio', { name: '30 min' }).click();
  await page.getByRole('button', { name: 'Más días' }).click();
  await page.getByRole('button', { name: 'Continuar' }).click();
  await page.getByLabel('Nombre').fill('Antonio');
  await page.getByRole('button', { name: 'Empezar' }).click();
  await expect(page.getByText('Chispa')).toBeVisible();
}

async function shot(page: Page, name: string): Promise<void> {
  await page.screenshot({ path: `${OUT}/${name}.png`, fullPage: false });
}

test('capturas perfil y medios gym visual', async ({ page }) => {
  test.setTimeout(180_000);
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto('/onboarding');
  await page.evaluate(() => {
    indexedDB.deleteDatabase('poder-fitness');
  });
  await page.reload();
  await onboard(page);

  await page.getByRole('link', { name: 'Biblioteca' }).click();
  await page.getByLabel('Buscar ejercicio').fill('press de banca');
  await expect(page.getByRole('link', { name: /Press de banca/ }).first()).toBeVisible();
  await expect(page.locator('.gv-media img[src$=".jpg"]').first()).toBeVisible();
  await shot(page, 'biblioteca');

  await page.goto('/biblioteca/gv-0025');
  await expect(page.getByRole('heading', { name: 'Press de banca con barra' })).toBeVisible();
  await expect(page.getByText('Cómo se hace')).toBeVisible();
  await expect(page.getByText('© Gym visual').first()).toBeVisible();
  await expect(page.locator('.gv-media img[src$=".gif"]')).toBeVisible();
  await shot(page, 'ficha');

  await page.goto('/');
  await expect(page.locator('.session-list li').first()).toBeVisible();
  const namesBefore = await page.locator('.session-list .session-name').allTextContents();

  await page.goto('/ajustes');
  await page.getByRole('button', { name: 'Mancuernas', exact: true }).click();
  await page.getByRole('button', { name: 'Barra', exact: true }).click();
  await page.getByLabel('Objetivo').selectOption('fuerza');
  await page.getByRole('button', { name: 'Guardar perfil' }).click();
  await page.getByRole('button', { name: 'Regenerar', exact: true }).click();
  await page.goto('/');
  await expect(page.locator('.session-list li').first()).toBeVisible();
  const namesAfter = await page.locator('.session-list .session-name').allTextContents();
  expect(namesBefore.length).toBeGreaterThan(0);
  expect(namesAfter.length).toBeGreaterThan(0);
  await shot(page, 'hoy-despues');

  await page.getByRole('button', { name: 'Empezar entreno' }).click();
  await expect(page.getByRole('button', { name: 'Completar serie' })).toBeVisible();
  await expect(page.locator('.player-exercise-media img[src$=".gif"]')).toBeVisible();
  await shot(page, 'reproductor');
});
