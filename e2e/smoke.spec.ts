import { expect, test } from '@playwright/test';

test('onboarding, entreno, biblioteca, reto y exportación', async ({ page }) => {
  await page.goto('/');
  await expect(page.getByRole('heading', { name: 'Tu nombre' })).toBeVisible();
  await expect(page.getByText('Paso 1 de 7')).toBeVisible();
  await page.getByLabel('Nombre').fill('Antonio');
  await page.getByRole('button', { name: 'Continuar' }).click();
  await expect(page.getByRole('heading', { name: 'Tu entrenador' })).toBeVisible();
  await page.getByRole('button', { name: 'Continuar' }).click();
  await page.getByRole('radio', { name: /Principiante/ }).click();
  await page.getByRole('button', { name: 'Continuar' }).click();
  await page.getByRole('radio', { name: 'Hipertrofia' }).click();
  await page.getByRole('button', { name: 'Continuar' }).click();
  await page.getByRole('button', { name: 'Solo peso corporal' }).click();
  await page.getByRole('button', { name: 'Continuar' }).click();
  await expect(page.getByText('Paso 6 de 7')).toBeVisible();
  await expect(page.getByRole('heading', { name: 'Tus días' })).toBeVisible();
  await page.getByRole('button', { name: 'Continuar' }).click();
  await page.getByRole('button', { name: 'Empezar' }).click();

  await expect(page.getByText('Antonio')).toBeVisible();
  await expect(page.getByText('Chispa')).toBeVisible();
  await page.getByRole('link', { name: 'Plan', exact: true }).click();
  await page.getByRole('button', { name: 'Empezar entreno' }).click();
  const reps = page.getByLabel('Repeticiones').first();
  await reps.fill('8');
  await page.getByRole('button', { name: 'Completar serie' }).click();
  await page.getByRole('button', { name: 'Terminar' }).click();
  await page.getByRole('button', { name: 'Terminar con lo que ya hiciste' }).click();
  await expect(page.getByText('56 XP').first()).toBeVisible();
  await page.getByRole('button', { name: 'Listo' }).click();

  await page.getByRole('link', { name: 'Biblioteca' }).click();
  await page.getByLabel('Buscar ejercicio').fill('flexion');
  await expect(page.getByRole('link', { name: /Flexión de pecho/ })).toBeVisible();

  await page.goto('/reto');
  await page.getByLabel('Flexiones').fill('40');
  await page.getByLabel('Abdominales').fill('10');
  await page.getByLabel('Sentadillas').fill('0');
  await page.getByLabel('Kilómetros').fill('0.5');
  await page.getByRole('button', { name: 'Guardar reto' }).click();
  await expect(page.getByText(/XP de hoy/)).toBeVisible();

  await page.goto('/ajustes');
  const download = page.waitForEvent('download');
  await page.getByRole('button', { name: 'Exportar copia' }).click();
  const file = await download;
  expect(file.suggestedFilename()).toContain('poder-fitness-');
});
