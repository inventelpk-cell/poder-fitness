import { useEffect, useMemo, useState } from 'react'
import { Link } from 'react-router'
import { filterLibrary } from '../domain/library'
import { usePoder } from '../state/store'
import { asset } from '../ui/asset'
import { CATEGORIES, EQUIPMENT, LEVELS, MUSCLES, categoryLabel, equipmentLabel, muscleLabel } from '../ui/catalog'

export function Library() {
  const poder = usePoder()
  const [query, setQuery] = useState('')
  const [debounced, setDebounced] = useState('')
  const [muscles, setMuscles] = useState<string[]>([])
  const [equipment, setEquipment] = useState<string[]>([])
  const [categories, setCategories] = useState<string[]>([])
  const [levels, setLevels] = useState<string[]>([])
  useEffect(() => {
    const timer = window.setTimeout(() => setDebounced(query), 150)
    return () => window.clearTimeout(timer)
  }, [query])
  const filtered = useMemo(() => filterLibrary(poder.exercises, {
    query: debounced,
    muscles,
    equipment,
    categories,
    levels,
  }), [poder.exercises, debounced, muscles, equipment, categories, levels])
  const dirty = query.length > 0 || muscles.length + equipment.length + categories.length + levels.length > 0

  function toggle(list: string[], value: string, set: (next: string[]) => void) {
    set(list.includes(value) ? list.filter((item) => item !== value) : [...list, value])
  }

  return (
    <section className="stack">
      <h1 className="screen-title">Biblioteca</h1>
      <label htmlFor="buscar">Buscar</label>
      <input id="buscar" className="field" value={query} placeholder="Buscar ejercicio" onChange={(event) => setQuery(event.target.value)} />
      <div className="filters">
        <ChipRow label="Músculo" options={MUSCLES.map((item) => item.id)} selected={muscles} nameOf={muscleLabel} onToggle={(id) => toggle(muscles, id, setMuscles)} />
        <ChipRow label="Equipo" options={[...EQUIPMENT.map((item) => item.id), 'sin-material']} selected={equipment} nameOf={equipmentLabel} onToggle={(id) => toggle(equipment, id, setEquipment)} />
        <ChipRow label="Categoría" options={CATEGORIES.map((item) => item.id)} selected={categories} nameOf={categoryLabel} onToggle={(id) => toggle(categories, id, setCategories)} />
        <ChipRow label="Nivel" options={LEVELS.map((item) => item.id)} selected={levels} nameOf={(id) => LEVELS.find((item) => item.id === id)?.nombre ?? id} onToggle={(id) => toggle(levels, id, setLevels)} />
      </div>
      {poder.libraryMissing ? (
        <article className="card">
          <img className="empty-art" src={asset('art/empty/biblioteca.svg')} alt="" />
          <p>Falta la biblioteca en data/exercises</p>
        </article>
      ) : null}
      {filtered.length === 0 ? (
        <article className="card stack">
          <img className="empty-art" src={asset('art/empty/biblioteca.svg')} alt="" />
          <p>Nada con esos filtros</p>
          {dirty ? <button className="btn ghost" type="button" onClick={() => { setQuery(''); setMuscles([]); setEquipment([]); setCategories([]); setLevels([]) }}>Limpiar filtros</button> : null}
        </article>
      ) : (
        <ul>
          {filtered.map((exercise) => (
            <li key={exercise.id}>
              <Link className="list-row" to={`/biblioteca/${encodeURIComponent(exercise.id)}`}>
                <strong>{exercise.nombre}</strong>
                <span className="muted">{muscleLabel(exercise.musculosPrimarios[0] ?? '')} · {equipmentLabel(exercise.equipo)}</span>
              </Link>
            </li>
          ))}
        </ul>
      )}
    </section>
  )
}

function ChipRow({ label, options, selected, nameOf, onToggle }: {
  label: string
  options: string[]
  selected: string[]
  nameOf: (id: string) => string
  onToggle: (id: string) => void
}) {
  return (
    <div className="chips" aria-label={label}>
      {options.map((id) => (
        <button key={id} type="button" className="chip" aria-pressed={selected.includes(id)} onClick={() => onToggle(id)}>
          {nameOf(id)}
        </button>
      ))}
    </div>
  )
}
