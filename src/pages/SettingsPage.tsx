import { useState, type ReactElement } from 'react';
import { useNavigate } from 'react-router';
import { EQUIPMENT, GOALS, LEVELS, PROFILE_GOALS, SESSION_MINUTES, type Equipment, type Goal, type Level } from '../catalog/types';
import licenseText from '../../data/exercises/LEGAL-NOTICES.txt?raw';
import {
  exportBackup,
  parseBackup,
  regenerateActivePlan,
  replaceWithBackup,
  resetDatabase,
  saveProfile,
} from '../db/db';
import { localDateISO } from '../domain/dates';
import { HEALTH_LINE, labelEquipment, labelGoal, labelLevel } from '../domain/labels';
import { COACHES, coachPortrait, type CoachId, type DarioTone } from '../domain/coach';
import type { AvatarGender, Profile, ThemeIntensity } from '../domain/model';
import { rankForXp } from '../domain/ranks';
import { useApp } from '../state/app-state';
import { Avatar } from '../ui/Avatar';
import { Dialog } from '../ui/Dialog';

const THEMES: ThemeIntensity[] = ['suave', 'media', 'plena'];

function downloadJson(data: unknown, name: string): void {
  const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
  const link = document.createElement('a');
  link.href = URL.createObjectURL(blob);
  link.download = name;
  link.click();
  URL.revokeObjectURL(link.href);
}

export function SettingsPage(): ReactElement {
  const { profile, refresh } = useApp();
  const navigate = useNavigate();
  const [draft, setDraft] = useState<Profile | null>(profile);
  const [importFile, setImportFile] = useState<ReturnType<typeof parseBackup>>(null);
  const [importError, setImportError] = useState('');
  const [resetText, setResetText] = useState('');
  const [resetAsk, setResetAsk] = useState(false);
  const [regenAsk, setRegenAsk] = useState(false);
  const [showLicense, setShowLicense] = useState(false);

  if (!profile || !draft) return <main className="screen"><p>Cargando ajustes…</p></main>;
  const currentProfile = profile;
  const currentDraft = draft;

  const increments = profile.unit === 'lb' ? [1, 2.5, 5, 10] : [0.5, 1, 2.5, 5];

  async function saveSimple(next: Profile): Promise<void> {
    await saveProfile(next);
    setDraft(next);
    await refresh();
  }

  async function saveProfileEdit(regenerate: boolean): Promise<void> {
    await saveProfile(currentDraft);
    if (regenerate) await regenerateActivePlan({ futureOnly: true });
    setRegenAsk(false);
    await refresh();
  }

  function requestProfileSave(): void {
    const changed =
      currentDraft.level !== currentProfile.level ||
      currentDraft.goal !== currentProfile.goal ||
      currentDraft.daysPerWeek !== currentProfile.daysPerWeek ||
      currentDraft.equipment.join() !== currentProfile.equipment.join() ||
      currentDraft.weekdays.join() !== currentProfile.weekdays.join() ||
      currentDraft.sessionMinutes !== currentProfile.sessionMinutes ||
      currentDraft.exclusiones.trim() !== currentProfile.exclusiones.trim();
    if (changed) setRegenAsk(true);
    else void saveProfileEdit(false);
  }

  return (
    <main className="screen">
      <h1>Ajustes</h1>
      <section className="card">
        <h2>Avatar</h2>
        <div className="avatar-choice" role="radiogroup" aria-label="Avatar">
          {(['hombre', 'mujer'] as const satisfies readonly AvatarGender[]).map((option) => (
            <button
              key={option}
              type="button"
              role="radio"
              aria-checked={profile.avatar === option}
              className={profile.avatar === option ? 'choice is-on' : 'choice'}
              onClick={() => void saveSimple({ ...profile, avatar: option })}
            >
              <Avatar gender={option} rank={rankForXp(profile.xpTotal).id} />
              <strong>{option === 'hombre' ? 'Hombre' : 'Mujer'}</strong>
            </button>
          ))}
        </div>
      </section>
      <section className="card">
        <h2>Entrenador</h2>
        <div className="coach-choice" role="radiogroup" aria-label="Entrenador">
          {COACHES.map((item) => (
            <div key={item.id} className={profile.coach === item.id ? 'coach-card is-on' : 'coach-card'}>
              <button
                type="button"
                role="radio"
                aria-checked={profile.coach === item.id}
                className="choice coach-pick"
                onClick={() => void saveSimple({ ...profile, coach: item.id satisfies CoachId })}
              >
                <img src={coachPortrait(item.id)} alt="" width={64} height={64} />
                <strong>{item.name}</strong>
                <span>{item.blurb}</span>
              </button>
              {item.id === 'dario' ? (
                <div className="tone-row" role="radiogroup" aria-label="Tono de Darío">
                  {(['suave', 'brusco'] as const satisfies readonly DarioTone[]).map((tone) => (
                    <button
                      key={tone}
                      type="button"
                      role="radio"
                      aria-checked={profile.darioTone === tone}
                      className={profile.darioTone === tone ? 'chip is-on' : 'chip'}
                      onClick={() => void saveSimple({ ...profile, coach: 'dario', darioTone: tone })}
                    >
                      {tone === 'suave' ? 'Suave' : 'Brusco'}
                    </button>
                  ))}
                </div>
              ) : null}
            </div>
          ))}
        </div>
      </section>
      <section className="card">
        <h2>Unidad</h2>
        <div className="row">
          {(['kg', 'lb'] as const).map((unit) => (
            <button key={unit} type="button" className={profile.unit === unit ? 'chip is-on' : 'chip'} onClick={() => void saveSimple({ ...profile, unit, increment: unit === 'lb' ? 5 : 2.5 })}>
              {unit}
            </button>
          ))}
        </div>
        <h2>Incremento</h2>
        <div className="row">
          {increments.map((increment) => (
            <button key={increment} type="button" className={profile.increment === increment ? 'chip is-on' : 'chip'} onClick={() => void saveSimple({ ...profile, increment })}>
              {increment}
            </button>
          ))}
        </div>
        <h2>Intensidad del tema</h2>
        <div className="row">
          {THEMES.map((theme) => (
            <button key={theme} type="button" className={profile.theme === theme ? 'chip is-on' : 'chip'} onClick={() => void saveSimple({ ...profile, theme })}>
              {theme === 'suave' ? 'Suave' : theme === 'media' ? 'Media' : 'Plena'}
            </button>
          ))}
        </div>
        <label className="field">
          <span>Sonido del descanso</span>
          <input type="checkbox" checked={profile.sound} onChange={(event) => void saveSimple({ ...profile, sound: event.target.checked })} />
        </label>
      </section>
      <section className="card">
        <h2>Editar perfil</h2>
        <label className="field"><span>Nombre</span><input value={draft.name} maxLength={24} onChange={(event) => setDraft({ ...draft, name: event.target.value })} /></label>
        <label className="field">
          <span>Nivel</span>
          <select value={draft.level} onChange={(event) => setDraft({ ...draft, level: event.target.value as Level })}>
            {LEVELS.map((level) => <option key={level} value={level}>{labelLevel(level)}</option>)}
          </select>
        </label>
        <label className="field">
          <span>Objetivo</span>
          <select value={draft.goal} onChange={(event) => setDraft({ ...draft, goal: event.target.value as Goal })}>
            {profileGoals(draft.goal).map((goal) => <option key={goal} value={goal}>{labelGoal(goal)}</option>)}
          </select>
        </label>
        <div className="chips" role="radiogroup" aria-label="Duración">
          {SESSION_MINUTES.map((minutes) => (
            <button
              key={minutes}
              type="button"
              role="radio"
              aria-checked={draft.sessionMinutes === minutes}
              className={draft.sessionMinutes === minutes ? 'chip is-on' : 'chip'}
              onClick={() => setDraft({ ...draft, sessionMinutes: minutes })}
            >
              {minutes} min
            </button>
          ))}
        </div>
        <div className="chips" role="group" aria-label="Exclusiones">
          {EXCLUSION_CHIPS.map((chip) => {
            const on = hasExclusion(draft.exclusiones, chip);
            return (
              <button
                key={chip}
                type="button"
                aria-pressed={on}
                className={on ? 'chip is-on' : 'chip'}
                onClick={() => setDraft({ ...draft, exclusiones: toggleExclusion(draft.exclusiones, chip) })}
              >
                {chip}
              </button>
            );
          })}
        </div>
        <label className="field">
          <span>Exclusiones o lesiones</span>
          <input value={draft.exclusiones} maxLength={160} onChange={(event) => setDraft({ ...draft, exclusiones: event.target.value })} />
        </label>
        <div className="chips" role="group" aria-label="Equipo">
          {EQUIPMENT.map((item) => (
            <button
              key={item}
              type="button"
              aria-pressed={draft.equipment.includes(item)}
              className={draft.equipment.includes(item) ? 'chip is-on' : 'chip'}
              onClick={() => {
                const equipment = toggleEquipment(draft.equipment, item);
                setDraft({ ...draft, equipment });
              }}
            >
              {labelEquipment(item)}
            </button>
          ))}
        </div>
        <label className="field">
          <span>Días por semana</span>
          <input inputMode="numeric" value={draft.daysPerWeek} onChange={(event) => setDraft({ ...draft, daysPerWeek: Math.max(1, Math.min(7, Number(event.target.value) || 1)) })} />
        </label>
        <p>{HEALTH_LINE}</p>
        <button type="button" className="btn btn-primary" onClick={requestProfileSave}>Guardar perfil</button>
      </section>
      <section className="card">
        <h2>Copia</h2>
        <div className="row">
          <button type="button" className="btn" onClick={() => void exportBackup().then((file) => downloadJson(file, `poder-fitness-${localDateISO()}.json`))}>Exportar copia</button>
          <label className="btn">
            Importar copia
            <input
              className="sr"
              type="file"
              accept="application/json"
              onChange={(event) => {
                const file = event.target.files?.[0];
                if (!file) return;
                void file.text().then((text) => {
                  try {
                    const parsed = parseBackup(JSON.parse(text) as unknown);
                    if (!parsed) {
                      setImportError('Ese archivo no es una copia de Poder Fitness.');
                      setImportFile(null);
                      return;
                    }
                    setImportError('');
                    setImportFile(parsed);
                  } catch {
                    setImportError('Ese archivo no es una copia de Poder Fitness.');
                    setImportFile(null);
                  }
                });
              }}
            />
          </label>
        </div>
        {importError ? <strong className="error">{importError}</strong> : null}
      </section>
      <section className="card">
        <h2>Borrar todo</h2>
        <p>Se borra el entreno, el reto y el perfil. Exporta antes si lo quieres conservar.</p>
        <button type="button" className="btn btn-danger" onClick={() => setResetAsk(true)}>Borrar todo</button>
      </section>
      <section className="card" id="acerca">
        <h2>Acerca de</h2>
        <p>Animaciones e imágenes de ejercicios: © Gym visual — https://gymvisual.com/</p>
        <p>Datos de ejercicios (nombres, categorías, instrucciones): MIT License — https://github.com/hasaneyldrm/exercises-dataset</p>
        <p>Poder Fitness tradujo al español los nombres y empaquetó medios e instrucciones para uso offline. Cada ficha de ejercicio del catálogo Gym visual lleva la atribución © Gym visual.</p>
        <p>Ilustraciones Everkinetic (Greg Priday, CC BY-SA 4.0) se conservan solo como respaldo cuando un ejercicio no tiene medio Gym visual.</p>
        <p>Sentadilla, Zancada y Curl femoral deslizante son ejercicios propios de la semilla. No llevan animación Gym visual.</p>
        <button type="button" className="btn" onClick={() => setShowLicense((value) => !value)}>
          {showLicense ? 'Ocultar avisos legales' : 'Ver avisos legales'}
        </button>
        {showLicense ? <pre className="license">{licenseText}</pre> : null}
      </section>
      {importFile ? (
        <Dialog title="Importar copia" onClose={() => setImportFile(null)}>
          <p>{importFile.sessions.length} sesiones, {importFile.heroLogs.length} días de reto y {importFile.bodyWeights.length} pesadas.</p>
          <p>Esto sustituye lo que hay ahora en este aparato.</p>
          <div className="row">
            <button
              type="button"
              className="btn btn-primary"
              onClick={() => {
                void (async () => {
                  const safety = await exportBackup();
                  downloadJson(safety, `poder-fitness-${localDateISO()}-seguridad.json`);
                  await replaceWithBackup(importFile);
                  setImportFile(null);
                  await refresh();
                  navigate('/');
                })();
              }}
            >
              Sustituir
            </button>
            <button type="button" className="btn" onClick={() => setImportFile(null)}>Cancelar</button>
          </div>
        </Dialog>
      ) : null}
      {regenAsk ? (
        <Dialog title="Regenerar la semana" onClose={() => setRegenAsk(false)}>
          <p>El perfil cambia el plan. Se regeneran los días que faltan y se quedan los clavados.</p>
          <div className="row">
            <button type="button" className="btn btn-primary" onClick={() => void saveProfileEdit(true)}>Regenerar</button>
            <button type="button" className="btn" onClick={() => void saveProfileEdit(false)}>Guardar sin regenerar</button>
          </div>
        </Dialog>
      ) : null}
      {resetAsk ? (
        <Dialog title="Borrar todo" onClose={() => setResetAsk(false)}>
          <p>Se borra el entreno, el reto y el perfil. Exporta antes si lo quieres conservar.</p>
          <label className="field">
            <span>Escribe REINICIAR</span>
            <input value={resetText} onChange={(event) => setResetText(event.target.value)} />
          </label>
          <button
            type="button"
            className="btn btn-danger"
            onClick={() => {
              if (resetText !== 'REINICIAR') return;
              void resetDatabase().then(() => refresh()).then(() => navigate('/onboarding'));
            }}
          >
            Confirmar
          </button>
        </Dialog>
      ) : null}
    </main>
  );
}

const EXCLUSION_CHIPS = ['Rodilla', 'Hombro', 'Espalda', 'Muñeca', 'Lumbar'] as const;

function profileGoals(current: Goal): readonly Goal[] {
  if (current === 'resistencia') return GOALS;
  return PROFILE_GOALS;
}

function exclusionParts(text: string): string[] {
  return text.split(/[,;\n]/).map((part) => part.trim()).filter((part) => part.length > 0);
}

function hasExclusion(text: string, word: string): boolean {
  const needle = word.toLocaleLowerCase('es');
  return exclusionParts(text).some((part) => part.toLocaleLowerCase('es') === needle);
}

function toggleExclusion(text: string, word: string): string {
  const parts = exclusionParts(text);
  const needle = word.toLocaleLowerCase('es');
  const next = parts.some((part) => part.toLocaleLowerCase('es') === needle)
    ? parts.filter((part) => part.toLocaleLowerCase('es') !== needle)
    : [...parts, word];
  return next.join(', ');
}

function toggleEquipment(current: Equipment[], item: Equipment): Equipment[] {
  if (item === 'peso-corporal') return ['peso-corporal'];
  const without = current.filter((entry) => entry !== 'peso-corporal' && entry !== item);
  return current.includes(item) ? without : [...without, item];
}
