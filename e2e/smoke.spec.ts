import { expect, test, type Page } from '@playwright/test'
import { mkdirSync } from 'node:fs'

const WEEK = ['Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb', 'Dom']
const MONTHS = ['enero', 'febrero', 'marzo', 'abril', 'mayo', 'junio', 'julio', 'agosto', 'septiembre', 'octubre', 'noviembre', 'diciembre']

async function shot(page: Page, name: string, fullPage = false) {
  mkdirSync('docs/screenshots', { recursive: true })
  await page.screenshot({ path: `docs/screenshots/${name}.png`, fullPage })
}

test('humo de onboarding, entreno, biblioteca, reto y datos', async ({ page }, info) => {
  const mobile = info.project.name === 'mobile'
  await page.goto('/')
  await expect(page.getByRole('heading', { name: 'Cómo te llamamos' })).toBeVisible()
  if (!mobile) await shot(page, 'onboarding-desktop', true)
  await page.getByLabel('Tu nombre').fill('Antonio')
  await page.getByRole('button', { name: 'Siguiente' }).click()
  await page.getByRole('button', { name: /Principiante/ }).click()
  await page.getByRole('button', { name: 'Siguiente' }).click()
  await page.getByRole('button', { name: /Hipertrofia/ }).click()
  await page.getByRole('button', { name: 'Siguiente' }).click()
  await page.getByRole('button', { name: 'Siguiente' }).click()
  const weekday = await page.evaluate(() => (new Date().getDay() + 6) % 7)
  const preset = [0, 2, 4]
  if (!preset.includes(weekday)) {
    await page.getByRole('button', { name: WEEK[weekday], exact: true }).click()
    const drop = preset.find((day) => day !== weekday) ?? 4
    await page.getByRole('button', { name: WEEK[drop], exact: true }).click()
  }
  await page.getByRole('button', { name: 'Siguiente' }).click()
  await page.getByRole('checkbox', { name: 'Lo he leído' }).check()
  await page.getByRole('button', { name: 'Empezar el arco' }).click()
  await expect(page.getByRole('heading', { name: 'Hola, Antonio' })).toBeVisible()
  await shot(page, mobile ? 'home-mobile' : 'home-desktop', true)

  await page.getByRole('link', { name: 'Ver sesión' }).click()
  await page.getByRole('button', { name: 'Empezar' }).first().click()
  await expect(page.getByRole('button', { name: 'Hecha' }).first()).toBeVisible()
  await shot(page, mobile ? 'player-mobile' : 'player-desktop')
  await page.getByRole('button', { name: 'Hecha' }).first().click()
  await expect(page.getByRole('timer', { name: 'Descanso' })).toBeVisible()
  await page.getByRole('button', { name: 'Terminar' }).click()
  await page.getByRole('button', { name: 'Cerrar sesión' }).click()
  await expect(page.getByRole('heading', { name: 'Poder de hoy' })).toBeVisible()
  const seguir = page.getByRole('button', { name: 'Seguir' })
  for (let i = 0; i < 4; i += 1) {
    try {
      await seguir.waitFor({ state: 'visible', timeout: 1500 })
    } catch {
      break
    }
    await seguir.click()
  }
  await expect(page.locator('p.tabular').getByText(/\+[1-9]\d* XP/)).toBeVisible()

  await page.goto('/biblioteca')
  await page.getByLabel('Buscar').fill('flexión')
  await expect(page.locator('main a.list-row').first()).toContainText('Flexión')
  if (!mobile) await shot(page, 'library-desktop')
  await page.getByRole('link', { name: /flexi/i }).first().click()
  await expect(page.getByRole('listitem').first()).toBeVisible()
  if (!mobile) await shot(page, 'exercise-desktop')

  await page.goto('/poder/reto')
  await page.getByRole('button', { name: '+1 flexiones' }).click()
  await expect(page.getByText('Flexiones: 1/')).toBeVisible()
  if (!mobile) await shot(page, 'hero-desktop')
  await page.goto('/historial')
  const stamp = await page.evaluate((months: string[]) => {
    const date = new Date()
    return `${date.getDate()} de ${months[date.getMonth()]}`
  }, MONTHS)
  await page.getByRole('button', { name: new RegExp(`^${stamp}`) }).click()
  await expect(page.getByText('Flexiones: 1', { exact: true })).toBeVisible()
  if (!mobile) await shot(page, 'stats-desktop')

  await page.goto('/poder')
  await page.getByRole('button', { name: 'Volver a ver el rango' }).click()
  const rango = page.getByRole('dialog', { name: 'Chispa' })
  await expect(rango.getByText('El arco reconoce el primer entreno.')).toBeVisible()
  await expect(rango.getByRole('button', { name: 'Seguir' })).toBeVisible()
  if (!mobile) await shot(page, 'transformation-desktop')
  await rango.getByRole('button', { name: 'Seguir' }).click()

  await page.goto('/ajustes/datos')
  await expect(page.getByRole('button', { name: 'Exportar' })).toBeVisible()
  await expect(page.getByRole('button', { name: 'Importar' })).toBeVisible()
  await expect(page.getByRole('button', { name: 'Borrar' })).toBeVisible()
})
