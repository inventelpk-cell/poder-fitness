import { expect, test, type Page } from '@playwright/test'
import { mkdirSync } from 'node:fs'

const WEEK = ['Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb', 'Dom']
const MONTHS = ['enero', 'febrero', 'marzo', 'abril', 'mayo', 'junio', 'julio', 'agosto', 'septiembre', 'octubre', 'noviembre', 'diciembre']
const FORBIDDEN = ['Estiramiento de cuádriceps a cuatro patas', 'Ciclismo', 'Peso muerto de coche', 'Rueda de Conan']
const UNMARKED = ['Flexión con pies altos', 'Remo invertido', 'Encogimiento inverso', 'Puente a una pierna']

async function shot(page: Page, name: string) {
  mkdirSync('/opt/cursor/artifacts/audit', { recursive: true })
  await page.screenshot({ path: `/opt/cursor/artifacts/audit/${name}.png`, fullPage: true })
}

async function onboard(page: Page) {
  await page.goto('/')
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
}

async function dismissSeguir(page: Page) {
  const seguir = page.getByRole('button', { name: 'Seguir' })
  for (let i = 0; i < 6; i += 1) {
    try {
      await seguir.waitFor({ state: 'visible', timeout: 1500 })
    } catch {
      break
    }
    await seguir.click()
  }
}

test('sustitutos, récords, ficha y reto en 390×844', async ({ page }, info) => {
  test.skip(info.project.name !== 'mobile', 'la comprobación es el viewport 390×844')
  expect(page.viewportSize()).toEqual({ width: 390, height: 844 })
  const fecha = await page.evaluate((months: string[]) => {
    const date = new Date()
    return `${date.getDate()} de ${months[date.getMonth()]} de ${date.getFullYear()}`
  }, MONTHS)
  await onboard(page)

  await page.getByRole('link', { name: 'Ver sesión' }).click()
  await page.getByRole('button', { name: 'Empezar' }).first().click()
  await expect(page.getByRole('button', { name: 'Hecha' }).first()).toBeVisible()

  for (let i = 0; i < 8; i += 1) {
    const title = (await page.locator('h1.screen-title').innerText()).toLocaleLowerCase('es')
    if (title === 'sentadilla') break
    const next = page.getByRole('button', { name: 'Siguiente' })
    await expect(next).toBeEnabled()
    await next.click()
  }
  await expect(page.locator('h1.screen-title')).toHaveText('Sentadilla')

  await page.getByRole('button', { name: 'Más' }).click()
  await page.getByRole('button', { name: 'Sustituir' }).click()
  const dialog = page.getByRole('dialog', { name: 'Sustituir' })
  await expect(dialog).toBeVisible()
  const names = (await dialog.locator('li button').allTextContents()).map((name) => name.trim())
  expect(names.length).toBeGreaterThan(0)
  expect(names[0]).toMatch(/sentadilla|zancada/i)
  expect(names.every((name) => /sentadilla|zancada/i.test(name))).toBe(true)
  for (const forbidden of FORBIDDEN) expect(names).not.toContain(forbidden)
  await shot(page, '01-sustituir')
  await page.locator('.modal-back').click({ position: { x: 8, y: 8 } })
  await expect(dialog).toBeHidden()

  const row = page.locator('.set-row').filter({ hasText: 'Trabajo' }).first()
  await row.getByLabel('Peso en kg').fill('20')
  await row.getByLabel('Repeticiones').fill('8')
  await row.getByRole('button', { name: 'Hecha' }).click()
  await page.getByRole('button', { name: 'Terminar' }).click()
  await page.getByRole('button', { name: 'Cerrar sesión' }).click()
  await expect(page.getByRole('heading', { name: 'Poder de hoy' })).toBeVisible()
  await dismissSeguir(page)

  await page.getByRole('link', { name: 'Historial' }).click()
  await expect(page.getByRole('heading', { name: 'Historial' })).toBeVisible()
  const records = page.locator('article').filter({ has: page.getByRole('heading', { name: 'Récords' }) })
  await records.scrollIntoViewIfNeeded()
  const lines = (await records.locator('p').allTextContents()).map((line) => line.trim()).filter(Boolean)
  expect(lines.some((line) => line.includes('Sentadilla') && line.includes('25,3'))).toBe(true)
  expect(lines.some((line) => line.includes('8 reps a 20 kg') && line.includes(fecha))).toBe(true)
  expect(lines.every((line) => /· .+kg/.test(line))).toBe(true)
  for (const name of UNMARKED) expect(lines.join('\n')).not.toContain(name)
  await shot(page, '02-records')

  const semana = await page.evaluate((months: string[]) => {
    const date = new Date()
    date.setDate(date.getDate() - ((date.getDay() + 6) % 7))
    return `${date.getDate()} ${months[date.getMonth()].slice(0, 3)}`
  }, MONTHS)
  const volume = page.locator('article').filter({ has: page.getByRole('heading', { name: 'Volumen semanal' }) })
  const volumeTable = volume.getByRole('table', { name: 'Volumen semanal en kg por grupo' })
  await expect(volumeTable).toContainText(semana)
  await expect(volumeTable).not.toContainText(/\d{2}-\d{2}/)
  await expect(volume.getByRole('img', { name: 'Volumen de las últimas 12 semanas' }).getByText(semana)).toBeVisible()
  await volumeTable.scrollIntoViewIfNeeded()
  await page.screenshot({ path: '/opt/cursor/artifacts/audit/02b-volumen.png' })

  await page.locator('#e1rm').selectOption({ label: 'Sentadilla' })
  const table = page.getByRole('table', { name: '1RM estimado' })
  await expect(table).toBeVisible()
  await expect(table).toContainText(fecha)
  await expect(table).toContainText('25,3')
  await expect(table).not.toContainText('10-06')
  await expect(table).not.toContainText('25.3')
  await table.scrollIntoViewIfNeeded()
  await page.screenshot({ path: '/opt/cursor/artifacts/audit/03-1rm.png' })

  await page.getByRole('link', { name: /XP/ }).click()
  await expect(page.getByText(`${fecha} ·`)).toBeVisible()
  await expect(page.locator('main')).not.toContainText('2026-10-06')
  await shot(page, '04-sesion')

  const poder = page.getByRole('navigation', { name: 'Destinos' }).getByRole('link', { name: 'Poder' })
  await poder.click()
  await page.getByRole('button', { name: 'Volver a ver el rango' }).click()
  await page.waitForTimeout(280)
  const live = await page.evaluate(() => {
    const flash = document.querySelector('.pf-tx__flash')
    const speed = document.querySelector('.pf-tx__speed')
    const emblem = document.querySelector('.pf-tx__emblem')
    const root = document.querySelector('.pf-tx')
    return {
      flashName: flash ? getComputedStyle(flash).animationName : '',
      flashOpacity: flash ? Number(getComputedStyle(flash).opacity) : 0,
      speedName: speed ? getComputedStyle(speed).animationName : '',
      emblemSrc: emblem instanceof HTMLImageElement ? emblem.currentSrc || emblem.src : '',
      runs: root?.getAnimations({ subtree: true }).length ?? 0,
    }
  })
  expect(live.flashName).toBe('pf-tx-flash')
  expect(live.flashOpacity).toBeGreaterThan(0.12)
  expect(live.speedName).toBe('pf-tx-speed')
  expect(live.emblemSrc).toContain('chispa.svg')
  expect(live.runs).toBeGreaterThan(0)
  await expect(page.getByRole('button', { name: 'Seguir' })).toHaveCount(0)
  await page.screenshot({ path: '/opt/cursor/artifacts/audit/06-rango-vivo.png' })
  const rango = page.getByRole('dialog', { name: 'Chispa' })
  await expect(rango.getByRole('button', { name: 'Seguir' })).toBeVisible()
  await expect(rango.getByText('El arco reconoce el primer entreno.')).toBeVisible()
  await rango.getByRole('button', { name: 'Seguir' }).click()
  await expect(page.locator('.pf-tx')).toHaveCount(0)
  await page.getByRole('link', { name: 'Reto del héroe' }).click()
  await expect(page.getByRole('heading', { name: 'Reto del héroe' })).toBeVisible()
  const flexiones = page.getByLabel('Anotar Flexiones')
  await flexiones.fill('25')
  await flexiones.blur()
  await expect(page.getByText('25/20', { exact: true })).toBeVisible()
  const km = page.getByLabel('Anotar Kilómetros')
  await km.fill('2,5')
  await km.blur()
  await expect(page.getByText('2,5/1', { exact: true })).toBeVisible()
  await page.getByRole('navigation', { name: 'Destinos' }).getByRole('link', { name: 'Inicio' }).click()
  await expect(page.getByRole('heading', { name: 'Hola, Antonio' })).toBeVisible()
  await poder.click()
  await page.getByRole('link', { name: 'Reto del héroe' }).click()
  await expect(page.getByText('25/20', { exact: true })).toBeVisible()
  await expect(page.getByText('2,5/1', { exact: true })).toBeVisible()
  await expect(page.getByLabel('Anotar Kilómetros')).toHaveValue('2,5')
  await expect(page.getByText('Km: 2,5/1')).toBeVisible()
  await expect(page.getByText(fecha)).toBeVisible()
  await expect(page.locator('main')).not.toContainText('2026-10-06')
  await expect(page.locator('main')).not.toContainText('2.5')
  await page.getByRole('heading', { name: 'Historial' }).scrollIntoViewIfNeeded()
  await shot(page, '05-reto')
})

test.describe('rango con movimiento reducido', () => {
  test.use({ reducedMotion: 'reduce' })

  test('la pantalla queda estática y sin destello', async ({ page }, info) => {
    test.skip(info.project.name !== 'mobile', 'la comprobación es el viewport 390×844')
    expect(page.viewportSize()).toEqual({ width: 390, height: 844 })
    await onboard(page)
    await page.getByRole('navigation', { name: 'Destinos' }).getByRole('link', { name: 'Poder' }).click()
    await page.getByRole('button', { name: 'Volver a ver el rango' }).click()
    const dialog = page.getByRole('dialog', { name: 'Chispa' })
    await expect(dialog.getByRole('button', { name: 'Seguir' })).toBeVisible()
    await expect(dialog.getByText('El arco reconoce el primer entreno.')).toBeVisible()
    const still = await page.evaluate(() => {
      const flash = document.querySelector('.pf-tx__flash')
      const speed = document.querySelector('.pf-tx__speed')
      const from = document.querySelector('.pf-tx__from')
      const root = document.querySelector('.pf-tx')
      return {
        flashOpacity: flash ? getComputedStyle(flash).opacity : '',
        flashName: flash ? getComputedStyle(flash).animationName : '',
        speedName: speed ? getComputedStyle(speed).animationName : '',
        fromOpacity: from ? getComputedStyle(from).opacity : '',
        runs: root?.getAnimations({ subtree: true }).length ?? -1,
      }
    })
    expect(still.flashOpacity).toBe('0')
    expect(still.flashName).toBe('none')
    expect(still.speedName).toBe('none')
    expect(still.fromOpacity).toBe('0')
    expect(still.runs).toBe(0)
    await page.screenshot({ path: '/opt/cursor/artifacts/audit/07-rango-quieto.png' })
    await dialog.getByRole('button', { name: 'Seguir' }).click()
    await expect(page.locator('.pf-tx')).toHaveCount(0)
  })
})
