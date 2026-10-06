import { useState, type ReactElement } from 'react';
import { useNavigate } from 'react-router';
import { EQUIPMENT, type Equipment, type Goal, type Level, type RankId } from '../catalog/types';
import { COACHES, coachPortrait, type CoachId, type DarioTone } from '../domain/coach';
import { createProfile } from '../db/db';
import { defaultWeekdays } from '../domain/dates';
import { HEALTH_LINE, LEVEL_HELP, WEEKDAY_SHORT, labelEquipment, labelGoal, labelLevel, labelRank, labelWeekday } from '../domain/labels';
import type { AvatarGender, Profile } from '../domain/model';
import { useApp } from '../state/app-state';
import { Avatar } from '../ui/Avatar';

const FACE_RANKS = ['chispa', 'llama', 'nova'] as const satisfies readonly RankId[];

const GOALS: Goal[] = ['fuerza', 'hipertrofia', 'resistencia', 'grasa'];
const LEVELS: Level[] = ['principiante', 'intermedio', 'avanzado'];
const STEP_TITLES = ['Tu figura', 'Tu entrenador', 'Tu nivel', 'Tu objetivo', 'Tu equipo', 'Tus días', 'Tu punto de partida'] as const;

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
  const [avatar, setAvatar] = useState<AvatarGender>('hombre');
  const [coach, setCoach] = useState<CoachId>('lino');
  const [darioTone, setDarioTone] = useState<DarioTone>('suave');

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

  function changeCount(nextCount: number): void {
    const value = Math.max(1, Math.min(7, nextCount));
    setCount(value);
    if (!touched) setDays(defaultWeekdays(value));
  }

  function toggleDay(day: number): void {
    setTouched(true);
    setDays((current) => (current.includes(day) ? current.filter((item) => item !== day) : [...current, day].sort((a, b) => a - b)));
  }

  async function finish(): Promise<void> {
    const trimmed = name.trim();
    if (trimmed.length < 1 || trimmed.length > 24) {
      setNameError('Escribe tu nombre.');
      return;
    }
    if (!level || !goal || equipment.length === 0) return;
    setNameError('');
    setBusy(true);
    const profile: Profile = {
      name: trimmed,
      level,
      goal,
      equipment,
      daysPerWeek: count,
      weekdays: [...days].sort((a, b) => a - b),
      unit: 'kg',
      increment: 2.5,
      theme: 'media',
      sound: true,
      avatar,
      coach,
      darioTone,
      xpTotal: 0,
      ranksSeen: [],
      createdAt: new Date().toISOString(),
    };
    await createProfile(profile);
    await refresh();
    navigate('/');
  }

  function next(): void {
    if (step === 3 && !level) return;
    if (step === 4 && !goal) return;
    if (step === 5 && equipment.length === 0) {
      setEquipError('Elige un equipo.');
      return;
    }
    if (step === 6 && days.length !== count) return;
    setStep((value) => Math.min(7, value + 1));
  }

  const daysOk = days.length === count;
  const coachName = COACHES.find((item) => item.id === coach)?.name ?? 'Lino Vega';

  return (
    <main className="screen onboard">
      <img className="wordmark-img" src="/design/brand/logo-horizontal.svg" alt="Poder Fitness" />
      <p className="kicker">Paso {step} de 7</p>
      <ol className="step-rail" aria-hidden="true">
        {STEP_TITLES.map((title, index) => (
          <li key={title} className={index + 1 === step ? 'is-on' : index + 1 < step ? 'is-done' : ''} />
        ))}
      </ol>
      {step > 2 ? <Avatar gender={avatar} rank="chispa" className="onboard-avatar" /> : null}
      <h1>{STEP_TITLES[step - 1]}</h1>
      {step === 1 ? (
        <div className="figure-row" role="radiogroup" aria-label="Avatar">
          {(['mujer', 'hombre'] as const).map((option) => (
            <button
              key={option}
              type="button"
              role="radio"
              aria-checked={avatar === option}
              className={avatar === option ? 'figure-card is-on' : 'figure-card'}
              onClick={() => setAvatar(option)}
            >
              <Avatar gender={option} rank="chispa" />
              <span>{option === 'mujer' ? 'Mujer' : 'Hombre'}</span>
            </button>
          ))}
        </div>
      ) : null}
      {step === 1 ? (
        <div className="rank-trio" aria-hidden="true">
          {FACE_RANKS.map((rank) => (
            <figure key={rank} className="rank-card">
              <Avatar gender={avatar} rank={rank} />
              <figcaption>{labelRank(rank)}</figcaption>
            </figure>
          ))}
        </div>
      ) : null}
      {step === 2 ? (
        <div className="coach-choice" role="radiogroup" aria-label="Entrenador">
          {COACHES.map((item) => (
            <div key={item.id} className={coach === item.id ? 'coach-card is-on' : 'coach-card'}>
              <button
                type="button"
                role="radio"
                aria-checked={coach === item.id}
                className="choice coach-pick"
                onClick={() => setCoach(item.id)}
              >
                <img src={coachPortrait(item.id)} alt="" width={64} height={64} />
                <strong>{item.name}</strong>
                <span>{item.blurb}</span>
              </button>
              {item.id === 'dario' ? (
                <div className="tone-row" role="radiogroup" aria-label="Tono de Darío">
                  {(['suave', 'brusco'] as const).map((tone) => (
                    <button
                      key={tone}
                      type="button"
                      role="radio"
                      aria-checked={darioTone === tone}
                      className={darioTone === tone ? 'chip is-on' : 'chip'}
                      onClick={() => {
                        setCoach('dario');
                        setDarioTone(tone);
                      }}
                    >
                      {tone === 'suave' ? 'Suave' : 'Brusco'}
                    </button>
                  ))}
                </div>
              ) : null}
            </div>
          ))}
        </div>
      ) : null}
      {step === 3 ? (
        <div className="choice-grid" role="radiogroup" aria-label="Nivel">
          {LEVELS.map((item) => (
            <button key={item} type="button" role="radio" aria-checked={level === item} className={level === item ? 'choice is-on' : 'choice'} onClick={() => setLevel(item)}>
              <strong>{labelLevel(item)}</strong>
              <span>{LEVEL_HELP[item]}</span>
            </button>
          ))}
        </div>
      ) : null}
      {step === 4 ? (
        <div className="choice-grid" role="radiogroup" aria-label="Objetivo">
          {GOALS.map((item) => (
            <button key={item} type="button" role="radio" aria-checked={goal === item} className={goal === item ? 'choice is-on' : 'choice'} onClick={() => setGoal(item)}>
              {labelGoal(item)}
            </button>
          ))}
        </div>
      ) : null}
      {step === 5 ? (
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
      {step === 6 ? (
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
      {step === 7 ? (
        <label className="field">
          <span>Nombre</span>
          <input value={name} maxLength={24} onChange={(event) => setName(event.target.value)} aria-invalid={nameError ? true : undefined} />
          <small>Cómo quieres que te llamemos</small>
          {nameError ? <strong className="error">{nameError}</strong> : null}
        </label>
      ) : null}
      {step === 7 && level && goal ? (
        <section className="card">
          <p><strong>{name.trim() || 'Tu nombre'}</strong> · {avatar === 'mujer' ? 'Mujer' : 'Hombre'}</p>
          <p>{coachName}{coach === 'dario' ? ` · ${darioTone === 'brusco' ? 'Brusco' : 'Suave'}` : ''}</p>
          <p>{labelLevel(level)}</p>
          <p>{labelGoal(goal)}</p>
          <p>{equipment.map((item) => (item === 'peso-corporal' ? 'Solo peso corporal' : labelEquipment(item))).join(', ')}</p>
          <p>{days.map((day) => labelWeekday(day)).join(', ')}</p>
          <p>{HEALTH_LINE}</p>
        </section>
      ) : null}
      <div className="row">
        {step > 1 ? (
          <button type="button" className="text-link" onClick={() => setStep((value) => value - 1)}>
            Atrás
          </button>
        ) : null}
        {step < 7 ? (
          <button type="button" className="btn btn-primary" onClick={next} disabled={(step === 3 && !level) || (step === 4 && !goal) || (step === 6 && !daysOk)}>
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
