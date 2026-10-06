import { expect, test, type Page } from '@playwright/test';

const OUT = '/cursor/stores/self/media/app-screenshots/manga';

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
  await page.getByRole('button', { name: 'Más días' }).click();
  await page.getByRole('button', { name: 'Continuar' }).click();
  await page.getByLabel('Nombre').fill('Antonio');
  await page.getByRole('button', { name: 'Empezar' }).click();
  await expect(page.getByText('Chispa')).toBeVisible();
}

async function ponerCasiBrasa(page: Page): Promise<void> {
  await page.evaluate(async () => {
    const db = await new Promise<IDBDatabase>((resolve, reject) => {
      const request = indexedDB.open('poder-fitness');
      request.onerror = () => reject(request.error);
      request.onsuccess = () => resolve(request.result);
    });
    await new Promise<void>((resolve, reject) => {
      const tx = db.transaction('profile', 'readwrite');
      const store = tx.objectStore('profile');
      const read = store.get('singleton');
      read.onsuccess = () => {
        const profile = read.result as { xpTotal: number; ranksSeen: string[] };
        profile.xpTotal = 800;
        profile.ranksSeen = [];
        store.put(profile, 'singleton');
      };
      tx.oncomplete = () => resolve();
      tx.onerror = () => reject(tx.error);
    });
    db.close();
  });
}

async function shot(page: Page, name: string): Promise<void> {
  await page.screenshot({ path: `${OUT}/${name}.png`, fullPage: false });
}

test('capturas del avatar manga', async ({ page }) => {
  test.setTimeout(180_000);
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto('/onboarding');
  await expect(page.getByText('Paso 1 de 7')).toBeVisible();
  await expect(page.locator('.rank-card img').first()).toHaveAttribute('src', /\/avatar\/male\/chispa\.png$/);
  await page.getByRole('radio', { name: 'Mujer' }).click();
  await expect(page.locator('.rank-card img').first()).toHaveAttribute('src', /\/avatar\/female\/chispa\.png$/);
  await page.getByRole('radio', { name: 'Hombre' }).click();
  await page.locator('.rank-card img').nth(0).evaluate((img: HTMLImageElement) => img.decode());
  await page.locator('.rank-card img').nth(1).evaluate((img: HTMLImageElement) => img.decode());
  await shot(page, 'onboarding');

  await onboard(page);
  await expect(page.locator('.dashboard .avatar-frame img')).toHaveAttribute('src', /\/avatar\/male\/chispa\.png$/);
  for (const name of ['Sentadilla', 'Zancada', 'Curl femoral deslizante']) {
    await expect(page.locator('.session-list li', { hasText: name })).toBeVisible();
  }
  await shot(page, 'hoy');

  await page.goto('/plan');
  await expect(page.getByRole('heading', { name: /Semana/ })).toBeVisible();
  await shot(page, 'plan');

  await page.goto('/biblioteca');
  await expect(page.getByRole('heading', { name: 'Biblioteca' })).toBeVisible();
  await shot(page, 'biblioteca');

  await page.goto('/biblioteca/sentadilla-corporal');
  await expect(page.getByRole('heading', { name: 'Sentadilla' })).toBeVisible();
  await expect(page.locator('.screen img[src$="sentadilla.png"]')).toBeVisible();
  await shot(page, 'ficha');

  await page.goto('/');
  await page.getByRole('button', { name: 'Empezar entreno' }).click();
  await expect(page.getByRole('button', { name: 'Completar serie' })).toBeVisible();
  await expect(page.locator('.player-hero img')).toBeVisible();
  await shot(page, 'reproductor');

  await page.locator('.set-line.is-current input').last().fill('8');
  await page.getByRole('button', { name: 'Completar serie' }).click();
  await expect(page.getByText('¡ZAS!')).toBeVisible();
  await shot(page, 'impacto');

  await ponerCasiBrasa(page);
  await page.getByRole('button', { name: 'Terminar' }).click();
  await page.getByRole('button', { name: 'Terminar con lo que ya hiciste' }).click();
  await expect(page.getByText('Tu nivel de poder entra en Brasa.')).toBeVisible();
  await expect(page.locator('.transform-avatar img')).toBeVisible();
  await page.waitForTimeout(300);
  await shot(page, 'transformacion');
  await page.getByRole('button', { name: 'Seguir' }).click();
  await expect(page.locator('.victory-hero img')).toBeVisible();
  await shot(page, 'victoria');
  await page.getByRole('button', { name: 'Listo' }).click();

  await page.goto('/reto');
  await expect(page.getByRole('heading', { name: 'Reto del héroe' })).toBeVisible();
  await shot(page, 'reto');

  await page.goto('/historial/volumen');
  await expect(page.getByRole('heading', { name: 'Volumen' })).toBeVisible();
  await shot(page, 'estadisticas');

  await page.goto('/ajustes');
  await expect(page.getByRole('heading', { name: 'Ajustes' })).toBeVisible();
  await expect(page.getByRole('radio', { name: 'Mujer' }).locator('img')).toHaveAttribute('src', /\/avatar\/female\//);
  await shot(page, 'ajustes');
});

test('video de la transformacion', async ({ browser }) => {
  test.setTimeout(180_000);
  const context = await browser.newContext({
    viewport: { width: 390, height: 844 },
    locale: 'es-ES',
    baseURL: 'http://127.0.0.1:4173',
    recordVideo: { dir: '/tmp/manga-video', size: { width: 390, height: 844 } },
  });
  const page = await context.newPage();
  await onboard(page);
  await page.goto('/');
  await page.getByRole('button', { name: 'Empezar entreno' }).click();
  await page.locator('.set-line.is-current input').last().fill('8');
  await page.getByRole('button', { name: 'Completar serie' }).click();
  await ponerCasiBrasa(page);
  await page.getByRole('button', { name: 'Terminar' }).click();
  await page.getByRole('button', { name: 'Terminar con lo que ya hiciste' }).click();
  await expect(page.getByText('Tu nivel de poder entra en Brasa.')).toBeVisible();
  await page.waitForTimeout(600);
  const video = page.video();
  await context.close();
  await video?.saveAs(`${OUT}/transformacion.webm`);
});
