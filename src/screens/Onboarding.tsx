import { useState } from 'react'
import { useNavigate } from 'react-router'
import { motion, useReducedMotion } from 'motion/react'
import {
  DEFAULT_WEEKDAYS,
  GOAL_COPY,
  LEVEL_COPY,
  PROFILE_EQUIPMENT,
  WEEKDAY_LABELS,
  validateName,
} from '../domain/labels'
import type { EquipId, Goal, Level } from '../domain/types'
import { usePoder } from '../state/store'
import { asset } from '../ui/asset'

const ART = [
  'art/onboarding/despierta.svg',
  'art/onboarding/despierta.svg',
  'art/onboarding/elige-arco.svg',
  'art/onboarding/elige-arco.svg',
  'art/onboarding/asciende.svg',
  'art/onboarding/asciende.svg',
]

export function Onboarding() {
  const poder = usePoder()
  const navigate = useNavigate()
  const reduced = useReducedMotion()
  const [step, setStep] = useState(0)
  const [name, setName] = useState('')
  const [nameError, setNameError] = useState(false)
  const [level, setLevel] = useState<Level | null>(null)
  const [goal, setGoal] = useState<Goal | null>(null)
  const [equipment, setEquipment] = useState<EquipId[]>(['cuerpo'])
  const [days, setDays] = useState(3)
  const [weekdays, setWeekdays] = useState<number[]>([0, 2, 4])
  const [read, setRead] = useState(false)

  function chooseDays(count: number) {
    setDays(count)
    setWeekdays([...(DEFAULT_WEEKDAYS[count] ?? [0])])
  }

  function toggleDay(day: number) {
    setWeekdays((current) => current.includes(day)
      ? current.filter((item) => item !== day)
      : [...current, day].sort((a, b) => a - b))
  }

  function toggleEquip(id: EquipId) {
    if (id === 'cuerpo') return
    setEquipment((current) => current.includes(id) ? current.filter((item) => item !== id) : [...current, id])
  }

  function next() {
    if (step === 0) {
      if (!validateName(name)) {
        setNameError(true)
        return
      }
      setNameError(false)
    }
    if (step === 1 && !level) return
    if (step === 2 && !goal) return
    if (step === 4 && weekdays.length !== days) return
    setStep((value) => Math.min(5, value + 1))
  }

  async function finish() {
    const clean = validateName(name)
    if (!clean || !level || !goal || !read || weekdays.length !== days) return
    await poder.finishOnboarding({
      name: clean,
      level,
      goal,
      equipment,
      daysPerWeek: days,
      weekdays,
      disclaimerAcceptedAt: new Date().toISOString(),
    })
    navigate('/')
  }

  const dayMismatch = weekdays.length !== days

  return (
    <motion.section
      className="stack"
      initial={reduced ? false : { opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      key={step}
    >
      <img className="brand" src={asset('brand/logo.svg')} alt="Poder Fitness" />
      <p className="pf-kicker">{step + 1} de 6</p>
      <img className="empty-art" src={asset(ART[step] ?? ART[0])} alt="" />
      {step === 0 ? (
        <>
          <h1 className="screen-title">Cómo te llamamos</h1>
          <label htmlFor="nombre">Tu nombre</label>
          <input
            id="nombre"
            className="field"
            placeholder="Tu nombre"
            value={name}
            maxLength={24}
            onChange={(event) => setName(event.target.value)}
          />
          {nameError ? <p role="alert">Escribe un nombre de hasta 24 caracteres</p> : null}
        </>
      ) : null}
      {step === 1 ? (
        <>
          <h1 className="screen-title">Nivel</h1>
          {LEVEL_COPY.map((item) => (
            <button key={item.id} type="button" className="choice" aria-pressed={level === item.id} onClick={() => setLevel(item.id)}>
              <strong>{item.label}</strong>
              <span className="muted"> {item.text}</span>
            </button>
          ))}
        </>
      ) : null}
      {step === 2 ? (
        <>
          <h1 className="screen-title">Objetivo</h1>
          {GOAL_COPY.map((item) => (
            <button key={item.id} type="button" className="choice" aria-pressed={goal === item.id} onClick={() => setGoal(item.id)}>
              <strong>{item.label}</strong>
              <span className="muted"> {item.text}</span>
            </button>
          ))}
        </>
      ) : null}
      {step === 3 ? (
        <>
          <h1 className="screen-title">Equipo</h1>
          <div className="chips">
            {PROFILE_EQUIPMENT.map((item) => (
              <button
                key={item.id}
                type="button"
                className="chip"
                aria-pressed={equipment.includes(item.id)}
                disabled={item.locked}
                onClick={() => toggleEquip(item.id)}
              >
                {item.label}
              </button>
            ))}
          </div>
        </>
      ) : null}
      {step === 4 ? (
        <>
          <h1 className="screen-title">Días</h1>
          <div className="chips" aria-label="Número de días">
            {[1, 2, 3, 4, 5, 6].map((count) => (
              <button
                key={count}
                type="button"
                className="chip"
                aria-pressed={days === count}
                aria-label={count === 1 ? '1 día' : `${count} días`}
                onClick={() => chooseDays(count)}
              >
                {count}
              </button>
            ))}
          </div>
          <div className="chips" aria-label="Días de la semana">
            {WEEKDAY_LABELS.map((label, index) => (
              <button key={label} type="button" className="chip" aria-pressed={weekdays.includes(index)} onClick={() => toggleDay(index)}>
                {label}
              </button>
            ))}
          </div>
        </>
      ) : null}
      {step === 5 ? (
        <>
          <h1 className="screen-title">Aviso</h1>
          <p>Poder Fitness organiza tus entrenos y guarda lo que anotas. No es un consejo médico ni sustituye a un profesional. Si algo duele de forma aguda, paras.</p>
          <label className="check">
            <input type="checkbox" checked={read} onChange={(event) => setRead(event.target.checked)} />
            Lo he leído
          </label>
        </>
      ) : null}
      <div className="split">
        {step > 0 ? <button className="btn ghost" type="button" onClick={() => setStep((value) => value - 1)}>Atrás</button> : <span />}
        {step < 5 ? (
          <button className="btn primary" type="button" onClick={next} disabled={(step === 1 && !level) || (step === 2 && !goal) || (step === 4 && dayMismatch)}>
            {step === 4 && dayMismatch ? `Elige ${days} días` : 'Siguiente'}
          </button>
        ) : (
          <button className="btn primary" type="button" onClick={() => { void finish() }} disabled={!read}>Empezar el arco</button>
        )}
      </div>
    </motion.section>
  )
}
