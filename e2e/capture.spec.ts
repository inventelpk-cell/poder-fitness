import { expect, test, type Page } from '@playwright/test';

const OUT = '/cursor/stores/self/media/app-screenshots';

async function onboard(page: Page): Promise<void> {
  await page.goto('/');
  await page.getByLabel('Nombre').fill('Antonio');
  await page.getByRole('button', { name: 'Continuar' }).click();
  await page.getByRole('radio', { name: /Principiante/ }).click();
  await page.getByRole('button', { name: 'Continuar' }).click();
  await page.getByRole('radio', { name: 'Hipertrofia' }).click();
  await page.getByRole('button', { name: 'Continuar' }).click();
  await page.getByRole('button', { name: 'Solo peso corporal' }).click();
  await page.getByRole('button', { name: 'Continuar' }).click();
  await page.getByRole('button', { name: 'Continuar' }).click();
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

test('capturas de la app en marcha', async ({ page }) => {
  await page.setViewportSize({ width: 1280, height: 800 });
  await page.goto('/onboarding');
  await page.screenshot({ path: `${OUT}/onboarding.png`, fullPage: true });
  await onboard(page);
  await page.screenshot({ path: `${OUT}/hoy.png`, fullPage: true });

  await page.getByRole('link', { name: 'Biblioteca' }).click();
  await page.getByLabel('Buscar ejercicio').fill('flexion');
  await expect(page.getByRole('link', { name: /Flexión de pecho/ })).toBeVisible();
  await page.screenshot({ path: `${OUT}/biblioteca.png`, fullPage: true });
  await page.getByRole('link', { name: /Flexión de pecho/ }).click();
  await expect(page.getByRole('heading', { name: 'Flexión de pecho' })).toBeVisible();
  await page.screenshot({ path: `${OUT}/ejercicio.png`, fullPage: true });

  await page.getByRole('link', { name: 'Plan', exact: true }).click();
  await page.getByRole('button', { name: 'Empezar entreno' }).click();
  await expect(page.getByRole('button', { name: 'Completar serie' })).toBeVisible();
  await page.screenshot({ path: `${OUT}/reproductor.png`, fullPage: true });

  await page.getByRole('button', { name: 'Terminar' }).click();
  await page.getByRole('button', { name: 'Terminar con lo que ya hiciste' }).click();
  await expect(page.getByText('Sin series de trabajo no hay poder nuevo.')).toBeVisible();

  await nearBrasa(page);
  await page.getByRole('link', { name: 'Plan', exact: true }).click();
  await page.getByRole('button', { name: 'Lunes' }).click();
  const start = page.getByRole('button', { name: 'Empezar entreno' });
  if (await page.getByRole('button', { name: 'Seguir el entreno a medias' }).isVisible().catch(() => false)) {
    await page.getByRole('button', { name: 'Descartarlo' }).click();
  }
  await start.click();
  await page.getByLabel('Repeticiones').first().fill('8');
  await page.getByRole('button', { name: 'Completar serie' }).click();
  await page.getByRole('button', { name: 'Terminar' }).click();
  await page.getByRole('button', { name: 'Terminar con lo que ya hiciste' }).click();
  await expect(page.getByText('Tu nivel de poder entra en Brasa.')).toBeVisible();
  await page.screenshot({ path: `${OUT}/transformacion.png`, fullPage: true });
  await page.getByRole('button', { name: 'Seguir' }).click({ force: true });
  await page.getByRole('button', { name: 'Listo' }).click();

  await page.goto('/reto');
  await expect(page.getByRole('heading', { name: 'Reto del héroe' })).toBeVisible();
  await page.screenshot({ path: `${OUT}/reto.png`, fullPage: true });
  await page.goto('/historial/volumen');
  await expect(page.getByRole('table')).toBeVisible();
  await page.screenshot({ path: `${OUT}/estadisticas.png`, fullPage: true });

  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto('/');
  await expect(page.getByText('Antonio')).toBeVisible();
  await page.screenshot({ path: `${OUT}/hoy-movil.png`, fullPage: true });
  await page.goto('/plan');
  await page.getByRole('button', { name: 'Empezar entreno' }).click();
  if (await page.getByRole('button', { name: 'Seguir el entreno a medias' }).isVisible().catch(() => false)) {
    await page.getByRole('button', { name: 'Seguir el entreno a medias' }).click();
  }
  await expect(page.getByRole('button', { name: 'Completar serie' })).toBeVisible();
  await page.screenshot({ path: `${OUT}/reproductor-movil.png`, fullPage: true });
});
