import { expect, test, type Page } from '@playwright/test';

const OUT = '/cursor/stores/self/media/app-screenshots';

async function onboard(page: Page): Promise<void> {
  await page.goto('/');
  await page.getByLabel('Nombre').fill('Antonio');
  await page.getByRole('button', { name: 'Continuar' }).click();
  await page.getByRole('heading', { name: 'Tu entrenador' }).waitFor();
  await page.getByRole('button', { name: 'Continuar' }).click();
  await page.getByRole('radio', { name: /Principiante/ }).click();
  await page.getByRole('button', { name: 'Continuar' }).click();
  await page.getByRole('radio', { name: 'Hipertrofia' }).click();
  await page.getByRole('button', { name: 'Continuar' }).click();
  await page.getByRole('button', { name: 'Solo peso corporal' }).click();
  await page.getByRole('button', { name: 'Continuar' }).click();
  await expect(page.getByText('Paso 6 de 7')).toBeVisible();
  await expect(page.getByRole('heading', { name: 'Tus días' })).toBeVisible();
  await page.getByRole('button', { name: 'Más días' }).click();
  await page.getByRole('button', { name: 'Continuar' }).click();
  await expect(page.getByText('Paso 7 de 7')).toBeVisible();
  await page.getByRole('button', { name: 'Empezar' }).click();
  await expect(page.getByText('Chispa')).toBeVisible();
}

async function nearBrasa(page: Page): Promise<void> {
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
  await page.reload();
}

async function shot(page: Page, name: string, fullPage = true): Promise<void> {
  await page.screenshot({ path: `${OUT}/${name}.png`, fullPage });
}

test('capturas de la app en marcha', async ({ page }) => {
  test.setTimeout(180_000);
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto('/onboarding');
  await expect(page.getByText('Paso 1 de 7')).toBeVisible();
  await shot(page, 'onboarding-movil');

  await page.setViewportSize({ width: 1440, height: 900 });
  await page.goto('/onboarding');
  await expect(page.getByRole('heading', { name: 'Tu nombre' })).toBeVisible();
  await expect(page.getByText('Paso 1 de 7')).toBeVisible();
  await shot(page, 'onboarding');
  await onboard(page);
  await shot(page, 'hoy');

  await page.getByRole('link', { name: 'Biblioteca' }).click();
  await page.getByLabel('Buscar ejercicio').fill('press de banca');
  await expect(page.getByRole('link', { name: /Press de banca/ }).first()).toBeVisible();
  await shot(page, 'biblioteca');
  await page.goto('/biblioteca/bench-press');
  await expect(page.getByRole('heading', { name: 'Press de banca' })).toBeVisible();
  const exerciseUrl = page.url();
  await shot(page, 'ejercicio');

  await page.getByRole('link', { name: 'Plan', exact: true }).click();
  await page.getByRole('button', { name: 'Empezar entreno' }).click();
  await expect(page.getByRole('button', { name: 'Completar serie' })).toBeVisible();
  await shot(page, 'reproductor');

  await page.getByRole('button', { name: 'Terminar' }).click();
  await page.getByRole('button', { name: 'Terminar con lo que ya hiciste' }).click();
  await expect(page.getByText('Sin series de trabajo no hay poder nuevo.')).toBeVisible();

  await nearBrasa(page);
  await page.getByRole('link', { name: 'Plan', exact: true }).click();
  await page.getByRole('button', { name: 'Martes' }).click();
  if (await page.getByRole('button', { name: 'Seguir el entreno a medias' }).isVisible().catch(() => false)) {
    await page.getByRole('button', { name: 'Descartarlo' }).click();
  }
  await page.getByRole('button', { name: 'Empezar entreno' }).click();
  await page.getByLabel('Repeticiones').first().fill('8');
  await page.getByRole('button', { name: 'Completar serie' }).click();
  await page.getByRole('button', { name: 'Terminar' }).click();
  await page.getByRole('button', { name: 'Terminar con lo que ya hiciste' }).click();
  await expect(page.getByText('Tu nivel de poder entra en Brasa.')).toBeVisible();
  await page.waitForTimeout(400);
  await shot(page, 'transformacion');
  await page.setViewportSize({ width: 390, height: 844 });
  await page.waitForTimeout(200);
  await shot(page, 'transformacion-movil');
  await page.getByRole('button', { name: 'Seguir' }).click();
  await page.getByRole('button', { name: 'Listo' }).click();

  await page.setViewportSize({ width: 1440, height: 900 });
  await page.goto('/reto');
  await expect(page.getByRole('heading', { name: 'Reto del héroe' })).toBeVisible();
  await shot(page, 'reto');
  await page.goto('/historial/volumen');
  await expect(page.getByRole('table')).toBeVisible();
  await shot(page, 'estadisticas');

  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto('/');
  await expect(page.getByText('Antonio')).toBeVisible();
  await expect(page.getByRole('button', { name: 'Empezar entreno' })).toBeVisible();
  for (const name of ['Sentadilla', 'Zancada', 'Curl femoral deslizante']) {
    await expect(page.locator('.session-list li', { hasText: name }).locator('.exercise-thumb')).toHaveCount(1);
  }
  await expect(page.locator('.thumb-fallback')).toHaveCount(0);
  const startBox = await page.getByRole('button', { name: 'Empezar entreno' }).boundingBox();
  const heroBox = await page.locator('.hero-card').boundingBox();
  const tabBox = await page.locator('.tabbar').boundingBox();
  expect(startBox && tabBox && startBox.y + startBox.height <= tabBox.y + 1).toBeTruthy();
  expect(heroBox && tabBox && heroBox.y + heroBox.height <= tabBox.y + 1).toBeTruthy();
  const hoyArt = await page.locator('.session-list li').evaluateAll((nodes) =>
    nodes.map((li) => ({
      name: (li.querySelector(':scope > span')?.textContent ?? '').trim(),
      src: li.querySelector('img')?.getAttribute('src') ?? '',
    })),
  );
  await shot(page, 'hoy-movil', false);
  await page.goto('/biblioteca');
  await page.getByLabel('Buscar ejercicio').fill('flexion');
  const libraryRow = page.getByRole('link', { name: /Flexión de pecho/ });
  await expect(libraryRow).toBeVisible();
  await libraryRow.evaluate((el) => {
    const top = el.getBoundingClientRect().top + window.scrollY;
    window.scrollTo(0, Math.max(0, top - 16));
  });
  await expect(page.locator('.thumb-fallback')).toHaveCount(0);
  await shot(page, 'biblioteca-movil', false);
  await page.goto(exerciseUrl);
  await expect(page.getByRole('heading', { name: 'Press de banca' })).toBeVisible();
  await shot(page, 'ejercicio-movil');
  await page.goto('/');
  await page.getByRole('button', { name: 'Empezar entreno' }).click();
  if (await page.getByRole('button', { name: 'Seguir el entreno a medias' }).isVisible().catch(() => false)) {
    await page.getByRole('button', { name: 'Seguir el entreno a medias' }).click();
  }
  for (let attempt = 0; attempt < 8; attempt += 1) {
    const resting = await page.getByRole('region', { name: 'Descanso' }).isVisible();
    if (resting) break;
    await page.locator('.set-line.is-current input').last().fill('8');
    await page.getByRole('button', { name: 'Completar serie' }).click();
    await expect(page.getByRole('region', { name: 'Descanso' })).toBeVisible();
  }
  const stageName = (await page.locator('.player-title h1').innerText()).trim();
  expect(hoyArt.some((item) => item.name === stageName)).toBeTruthy();
  await expect(page.locator('.player-hero img')).toBeVisible();
  await expect(page.locator('.rest-ring')).toBeVisible();
  await page.getByText('Más opciones').click();
  await expect(page.locator('.switch-ui').first()).toBeVisible();
  await expect(page.locator('.set-line.is-current input').last()).toBeEnabled();
  await expect(page.locator('.thumb-fallback')).toHaveCount(0);
  const avatarBox = await page.locator('.player-hero img').boundingBox();
  const ringBox = await page.locator('.rest-ring').boundingBox();
  expect(avatarBox && ringBox && ringBox.y >= avatarBox.y).toBeTruthy();
  await shot(page, 'reproductor-movil', false);
  await page.goto('/reto');
  await shot(page, 'reto-movil');
  await page.goto('/historial/volumen');
  await expect(page.getByRole('table')).toBeVisible();
  await shot(page, 'estadisticas-movil');
});
