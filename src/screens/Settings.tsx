import { useEffect, useRef, useState } from 'react'
import { Link } from 'react-router'
import { unlockAudio, playEnd } from '../audio/engine'
import { GOAL_COPY, LEVEL_COPY, PROFILE_EQUIPMENT, WEEKDAY_LABELS, validateName } from '../domain/labels'
import { fieldToKg, kgToField } from '../ui/weight'
import type { EquipId, Goal, Level, Profile } from '../domain/types'
import { usePoder } from '../state/store'

export function Settings() {
  const poder = usePoder()
  const profile = poder.profile
  const [draft, setDraft] = useState<Profile | null>(profile)
  const [bar, setBar] = useState(kgToField(poder.settings.barWeightKg, poder.settings.unit))
  const barDirty = useRef(false)
  useEffect(() => {
    setBar(kgToField(poder.settings.barWeightKg, poder.settings.unit))
    barDirty.current = false
  }, [poder.settings.unit, poder.settings.barWeightKg])
  if (!profile || !draft) return null

  function saveProfile() {
    if (!draft) return
    const name = validateName(draft.name)
    if (!name || draft.weekdays.length !== draft.daysPerWeek) return
    void poder.updateProfile({ ...draft, name })
  }

  return (
    <section className="stack">
      <h1 className="screen-title">Ajustes</h1>
      <fieldset className="stack">
        <legend>Unidad</legend>
        {(['kg', 'lb'] as const).map((unit) => (
          <label key={unit} className="check">
            <input type="radio" name="unidad" checked={poder.settings.unit === unit} onChange={() => { void poder.updateSettings({ ...poder.settings, unit }) }} />
            {unit === 'kg' ? 'Kilogramos' : 'Libras'}
          </label>
        ))}
      </fieldset>
      <label htmlFor="barra">Peso de la barra ({poder.settings.unit === 'lb' ? 'lb' : 'kg'})
        <input id="barra" className="field" inputMode="decimal" value={bar} onChange={(event) => { barDirty.current = true; setBar(event.target.value) }} onBlur={(event) => {
          if (!barDirty.current) return
          barDirty.current = false
          const kg = fieldToKg(event.currentTarget.value, poder.settings.unit)
          if (kg == null || kg <= 0) return
          if (Math.abs(kg - poder.settings.barWeightKg) < 0.0001) return
          void poder.updateSettings({ ...poder.settings, barWeightKg: kg })
        }} />
      </label>
      <fieldset className="chips">
        <legend>Intensidad</legend>
        {([['calma', 'Calma'], ['pulso', 'Pulso'], ['maximo', 'Máximo']] as const).map(([id, label]) => (
          <button key={id} type="button" className="chip" aria-pressed={poder.settings.themeIntensity === id} onClick={() => { void poder.updateSettings({ ...poder.settings, themeIntensity: id }) }}>{label}</button>
        ))}
      </fieldset>
      <label htmlFor="volumen">Volumen del descanso: {poder.settings.restVolume}
        <input id="volumen" type="range" min={0} max={100} value={poder.settings.restVolume} onChange={(event) => { void poder.updateSettings({ ...poder.settings, restVolume: Number(event.target.value) }) }} />
      </label>
      <button className="btn ghost" type="button" onClick={() => { void unlockAudio().then(() => playEnd(poder.settings.restVolume)) }}>Probar sonido</button>
      <h2>Perfil</h2>
      <label htmlFor="nombre-ajuste">Nombre
        <input id="nombre-ajuste" className="field" value={draft.name} onChange={(event) => setDraft({ ...draft, name: event.target.value })} />
      </label>
      <div className="chips">
        {LEVEL_COPY.map((item) => (
          <button key={item.id} type="button" className="chip" aria-pressed={draft.level === item.id} onClick={() => setDraft({ ...draft, level: item.id as Level })}>{item.label}</button>
        ))}
      </div>
      <div className="chips">
        {GOAL_COPY.map((item) => (
          <button key={item.id} type="button" className="chip" aria-pressed={draft.goal === item.id} onClick={() => setDraft({ ...draft, goal: item.id as Goal })}>{item.label}</button>
        ))}
      </div>
      <div className="chips">
        {PROFILE_EQUIPMENT.map((item) => (
          <button key={item.id} type="button" className="chip" disabled={item.locked} aria-pressed={draft.equipment.includes(item.id)} onClick={() => {
            const equipment = draft.equipment.includes(item.id)
              ? draft.equipment.filter((id) => id !== item.id)
              : [...draft.equipment, item.id as EquipId]
            setDraft({ ...draft, equipment })
          }}>{item.label}</button>
        ))}
      </div>
      <div className="chips" aria-label="Días de entreno">
        {WEEKDAY_LABELS.map((label, index) => (
          <button key={label} type="button" className="chip" aria-pressed={draft.weekdays.includes(index)} onClick={() => {
            const weekdays = draft.weekdays.includes(index)
              ? draft.weekdays.filter((day) => day !== index)
              : [...draft.weekdays, index].sort((a, b) => a - b)
            setDraft({ ...draft, weekdays, daysPerWeek: weekdays.length })
          }}>{label}</button>
        ))}
      </div>
      <button className="btn primary" type="button" onClick={saveProfile}>Guardar perfil</button>
      <Link className="btn ghost" to="/poder/reto">Cuota del reto</Link>
      <Link className="btn ghost" to="/ajustes/datos">Datos</Link>
      <Link className="btn ghost" to="/ajustes/acerca">Acerca de</Link>
      <p className="muted">Poder Fitness 1.0.0 · schemaVersion 1</p>
    </section>
  )
}
