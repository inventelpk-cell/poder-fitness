import catalogs from '../../data/exercises/catalogs.json'

export const MUSCLES = catalogs.musculos
export const EQUIPMENT = catalogs.equipo
export const CATEGORIES = catalogs.categorias
export const LEVELS = catalogs.niveles

const muscleName = new Map(MUSCLES.map((item) => [item.id, item.nombre]))
const equipName = new Map(EQUIPMENT.map((item) => [item.id, item.nombre]))
const categoryName = new Map(CATEGORIES.map((item) => [item.id, item.nombre]))
const levelName = new Map(LEVELS.map((item) => [item.id, item.nombre]))
const mechanicName = new Map(catalogs.mecanica.map((item) => [item.id, item.nombre]))

export function muscleLabel(id: string): string {
  return muscleName.get(id) ?? id
}

export function equipmentLabel(id: string): string {
  if (id === 'sin-material') return 'Sin material'
  return equipName.get(id) ?? id
}

export function categoryLabel(id: string): string {
  return categoryName.get(id) ?? id
}

export function levelLabel(id: string): string {
  return levelName.get(id) ?? id
}

export function mechanicLabel(id: string | null): string {
  if (!id) return 'Sin mecánica'
  return mechanicName.get(id) ?? id
}
