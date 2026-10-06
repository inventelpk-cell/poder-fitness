import { expect, test, type Page } from '@playwright/test';

const OUT = '/cursor/stores/self/media/app-screenshots/premium';

async function shot(page: Page, name: string): Promise<void> {
  await page.screenshot({ path: `${OUT}/${name}.png`, fullPage: false });
}

test('capturas del paquete premium', async ({ page }) => {
  test.setTimeout(180_000);
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto('/onboarding');
  await expect(page.getByText('Paso 1 de 7')).toBeVisible();
  await expect(page.locator('.rank-card')).toHaveCount(3);
  const railTops = await page.locator('.step-rail li').evaluateAll((nodes) => nodes.map((node) => Math.round(node.getBoundingClientRect().top)));
  expect(new Set(railTops).size).toBe(1);
  const cardBox = await page.locator('.rank-card').first().boundingBox();
  const cardImg = await page.locator('.rank-card img').first().boundingBox();
  expect(cardBox && cardImg && cardImg.height >= cardBox.height * 0.7).toBeTruthy();
  await shot(page, 'onboarding');

  await page.getByRole('radio', { name: 'Mujer' }).click();
  await page.getByRole('button', { name: 'Continuar' }).click();
  await expect(page.getByRole('heading', { name: 'Tu entrenador' })).toBeVisible();
  const dario = page.locator('.coach-card', { hasText: 'Darío Sanz' });
  await expect(dario.getByRole('radio', { name: 'Suave' })).toBeVisible();
  await expect(dario.getByRole('radio', { name: 'Brusco' })).toBeVisible();
  await shot(page, 'entrenadores');
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
  await expect(page.locator('.coach-bubble')).toBeVisible();
  const avatarBox = await page.locator('.dashboard .power-board .avatar-frame').boundingBox();
  expect(avatarBox && avatarBox.height >= 240 && avatarBox.width >= 150).toBeTruthy();
  const bubble = page.locator('.coach-bubble p');
  const bubbleText = (await bubble.innerText()).trim();
  expect(bubbleText.includes('…')).toBeFalsy();
  expect(bubbleText.length).toBeGreaterThan(20);
  const bubbleClip = await bubble.evaluate((el) => el.scrollHeight > el.clientHeight + 2 || el.scrollWidth > el.clientWidth + 2);
  expect(bubbleClip).toBeFalsy();
  const bars = page.locator('.hero-card .meter-bar');
  await expect(bars).toHaveCount(4);
  const barBox = await bars.first().boundingBox();
  expect(barBox && barBox.width > barBox.height * 4).toBeTruthy();
  await shot(page, 'hoy');

  await page.goto('/plan');
  await expect(page.getByRole('heading', { name: /Semana/ })).toBeVisible();
  await shot(page, 'plan');

  await page.goto('/biblioteca');
  await expect(page.getByRole('heading', { name: 'Biblioteca' })).toBeVisible();
  await shot(page, 'biblioteca');

  await page.goto('/biblioteca/sentadilla-corporal');
  await expect(page.getByRole('heading', { name: 'Sentadilla' })).toBeVisible();
  await shot(page, 'ficha');

  await page.goto('/');
  await page.getByRole('button', { name: 'Empezar entreno' }).click();
  await expect(page.getByRole('button', { name: 'Completar serie' })).toBeVisible();
  await expect(page.locator('.coach-bubble')).toBeVisible();
  await shot(page, 'reproductor');

  await page.locator('.set-line.is-current input').last().fill('8');
  await page.getByRole('button', { name: 'Completar serie' }).click();
  await expect(page.getByText('¡ZAS!')).toBeVisible();
  await shot(page, 'impacto');
  await expect(page.getByRole('region', { name: 'Descanso' })).toBeVisible();
  await shot(page, 'descanso');

  await page.getByRole('button', { name: 'Terminar' }).click();
  await page.getByRole('button', { name: 'Terminar con lo que ya hiciste' }).click();
  await expect(page.getByRole('button', { name: 'Listo' })).toBeVisible();
  await shot(page, 'resumen');

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
  await page.goto('/');
  await page.getByRole('button', { name: 'Empezar entreno' }).click();
  if (await page.getByRole('button', { name: 'Seguir el entreno a medias' }).isVisible().catch(() => false)) {
    await page.getByRole('button', { name: 'Descartarlo' }).click();
    await page.getByRole('button', { name: 'Empezar entreno' }).click();
  }
  await page.locator('.set-line.is-current input').last().fill('8');
  await page.getByRole('button', { name: 'Completar serie' }).click();
  await page.getByRole('button', { name: 'Terminar' }).click();
  await page.getByRole('button', { name: 'Terminar con lo que ya hiciste' }).click();
  await expect(page.getByText('Tu nivel de poder entra en Brasa.')).toBeVisible();
  await page.waitForTimeout(400);
  await shot(page, 'transformacion');
  await page.getByRole('button', { name: 'Seguir' }).click();
  await page.getByRole('button', { name: 'Listo' }).click();

  await page.goto('/reto');
  await expect(page.getByRole('heading', { name: 'Reto del héroe' })).toBeVisible();
  await shot(page, 'reto');

  await page.goto('/historial');
  await expect(page.getByRole('heading', { name: 'Historial' })).toBeVisible();
  await shot(page, 'historial');

  await page.goto('/poder');
  await expect(page.getByRole('heading', { name: /Nivel/ })).toBeVisible();
  await shot(page, 'progreso');

  await page.goto('/historial/volumen');
  await expect(page.getByRole('table')).toBeVisible();
  await shot(page, 'estadisticas');

  await page.goto('/ajustes');
  await expect(page.getByRole('heading', { name: 'Ajustes' })).toBeVisible();
  await expect(page.getByRole('radio', { name: 'Lino Vega' })).toBeVisible();
  await shot(page, 'ajustes');
});
