import { useState, type ReactElement } from 'react';
import { useNavigate } from 'react-router';
import { EQUIPMENT, type Equipment, type Goal, type Level } from '../catalog/types';
import { createProfile } from '../db/db';
import { defaultWeekdays } from '../domain/dates';
import { HEALTH_LINE, LEVEL_HELP, WEEKDAY_SHORT, labelEquipment, labelGoal, labelLevel, labelWeekday } from '../domain/labels';
import type { Profile } from '../domain/model';
import { useApp } from '../state/app-state';

function onboardingArt(step: number): string {
  if (step <= 2) return '/design/illustrations/onboarding-enciende.svg';
  if (step === 3) return '/design/illustrations/onboarding-rangos.svg';
  if (step === 5) return '/design/illustrations/onboarding-racha.svg';
  return '/design/illustrations/onboarding-listo.svg';
}

const GOALS: Goal[] = ['fuerza', 'hipertrofia', 'resistencia', 'grasa'];
const LEVELS: Level[] = ['principiante', 'intermedio', 'avanzado'];
const STEP_TITLES = ['Tu nombre', 'Tu nivel', 'Tu objetivo', 'Tu equipo', 'Tus días', 'Tu punto de partida'] as const;

export function OnboardingPage(): ReactElement {
  const navigate = useNavigate();
  const { refresh } = useApp();
  const [step, setStep] = useState(1);
  const [name, setName] = useState('');
  const [nameError, setNameError] = useState('');
  const [level, setLevel] = useState<Level | null>(null);
  const [goal, setGoal] = useState<Goal | null>(null);
  const [equipment, setEquipment] = useState<Equipment[]>([]);
  const [equipError, setEquipError] = useState('');
  const [count, setCount] = useState(3);
  const [days, setDays] = useState<number[]>(defaultWeekdays(3));
  const [touched, setTouched] = useState(false);
  const [busy, setBusy] = useState(false);

  function toggleEquipment(id: Equipment): void {
    setEquipError('');
    if (id === 'peso-corporal') {
      setEquipment(['peso-corporal']);
      return;
    }
    setEquipment((current) => {
      const withoutBody = current.filter((item) => item !== 'peso-corporal');
      return withoutBody.includes(id) ? withoutBody.filter((item) => item !== id) : [...withoutBody, id];
    });
  }

  function changeCount(next: number): void {
    const value = Math.max(1, Math.min(7, next));
    setCount(value);
    if (!touched) setDays(defaultWeekdays(value));
  }

  function toggleDay(day: number): void {
    setTouched(true);
    setDays((current) => (current.includes(day) ? current.filter((item) => item !== day) : [...current, day].sort((a, b) => a - b)));
  }

  async function finish(): Promise<void> {
    if (!level || !goal || equipment.length === 0) return;
    setBusy(true);
    const profile: Profile = {
      name: name.trim(),
      level,
      goal,
      equipment,
      daysPerWeek: count,
      weekdays: [...days].sort((a, b) => a - b),
      unit: 'kg',
      increment: 2.5,
      theme: 'media',
      sound: true,
      xpTotal: 0,
      ranksSeen: [],
      createdAt: new Date().toISOString(),
    };
    await createProfile(profile);
    await refresh();
    navigate('/');
  }

  function next(): void {
    if (step === 1) {
      const trimmed = name.trim();
      if (trimmed.length < 1 || trimmed.length > 24) {
        setNameError('Escribe tu nombre.');
        return;
      }
      setNameError('');
    }
    if (step === 2 && !level) return;
    if (step === 3 && !goal) return;
    if (step === 4 && equipment.length === 0) {
      setEquipError('Elige un equipo.');
      return;
    }
    if (step === 5 && days.length !== count) return;
    setStep((value) => Math.min(6, value + 1));
  }

  const daysOk = days.length === count;

  return (
    <main className="screen onboard">
      <img className="wordmark-img" src="/design/brand/logo-horizontal.svg" alt="Poder Fitness" />
      <p className="kicker">Paso {step} de 6</p>
      <ol className="step-rail" aria-hidden="true">
        {STEP_TITLES.map((title, index) => (
          <li key={title} className={index + 1 === step ? 'is-on' : index + 1 < step ? 'is-done' : ''} />
        ))}
      </ol>
      <img className="onboard-art" src={onboardingArt(step)} alt="" width="280" height="180" />
      <h1>{STEP_TITLES[step - 1]}</h1>
      {step === 1 ? (
        <label className="field">
          <span>Nombre</span>
          <input value={name} maxLength={24} onChange={(event) => setName(event.target.value)} aria-invalid={nameError ? true : undefined} />
          <small>Cómo quieres que te llamemos</small>
          {nameError ? <strong className="error">{nameError}</strong> : null}
        </label>
      ) : null}
      {step === 2 ? (
        <div className="choice-grid" role="radiogroup" aria-label="Nivel">
          {LEVELS.map((item) => (
            <button key={item} type="button" role="radio" aria-checked={level === item} className={level === item ? 'choice is-on' : 'choice'} onClick={() => setLevel(item)}>
              <strong>{labelLevel(item)}</strong>
              <span>{LEVEL_HELP[item]}</span>
            </button>
          ))}
        </div>
      ) : null}
      {step === 3 ? (
        <div className="choice-grid" role="radiogroup" aria-label="Objetivo">
          {GOALS.map((item) => (
            <button key={item} type="button" role="radio" aria-checked={goal === item} className={goal === item ? 'choice is-on' : 'choice'} onClick={() => setGoal(item)}>
              {labelGoal(item)}
            </button>
          ))}
        </div>
      ) : null}
      {step === 4 ? (
        <div className="chips" role="group" aria-label="Equipo">
          {EQUIPMENT.map((item) => (
            <button
              key={item}
              type="button"
              aria-pressed={equipment.includes(item)}
              className={equipment.includes(item) ? 'chip is-on' : 'chip'}
              onClick={() => toggleEquipment(item)}
            >
              {item === 'peso-corporal' ? 'Solo peso corporal' : labelEquipment(item)}
            </button>
          ))}
          {equipError ? <strong className="error">{equipError}</strong> : null}
        </div>
      ) : null}
      {step === 5 ? (
        <div>
          <div className="stepper">
            <button type="button" onClick={() => changeCount(count - 1)} aria-label="Menos días">
              −
            </button>
            <span className="num">{count}</span>
            <button type="button" onClick={() => changeCount(count + 1)} aria-label="Más días">
              +
            </button>
          </div>
          <div className="chips" role="group" aria-label="Días de entreno">
            {WEEKDAY_SHORT.map((label, index) => {
              const day = index + 1;
              return (
                <button key={label} type="button" aria-pressed={days.includes(day)} className={days.includes(day) ? 'chip is-on' : 'chip'} onClick={() => toggleDay(day)}>
                  {label}
                  <span className="sr">{labelWeekday(day)}</span>
                </button>
              );
            })}
          </div>
          {!daysOk ? <strong className="error">Elige {count} días.</strong> : null}
        </div>
      ) : null}
      {step === 6 && level && goal ? (
        <section className="card">
          <p><strong>{name.trim()}</strong></p>
          <p>{labelLevel(level)}</p>
          <p>{labelGoal(goal)}</p>
          <p>{equipment.map((item) => (item === 'peso-corporal' ? 'Solo peso corporal' : labelEquipment(item))).join(', ')}</p>
          <p>{days.map((day) => labelWeekday(day)).join(', ')}</p>
          <p>{HEALTH_LINE}</p>
        </section>
      ) : null}
      <div className="row">
        {step > 1 ? (
          <button type="button" className="btn" onClick={() => setStep((value) => value - 1)}>
            Atrás
          </button>
        ) : null}
        {step < 6 ? (
          <button type="button" className="btn btn-primary" onClick={next} disabled={(step === 2 && !level) || (step === 3 && !goal) || (step === 5 && !daysOk)}>
            Continuar
          </button>
        ) : (
          <button type="button" className="btn btn-primary" onClick={() => void finish()} disabled={busy}>
            Empezar
          </button>
        )}
      </div>
    </main>
  );
}
