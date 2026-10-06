import { useMemo, useState, type ReactElement } from 'react';
import { Link } from 'react-router';
import { emptyFilters, filterExercises, nameKey, type CatalogFilters } from '../catalog';
import { ExerciseThumb } from '../ui/ExerciseThumb';
import { EQUIPMENT, LEVELS, MUSCLES, PATTERNS, type Equipment, type Exercise, type Level, type Muscle, type Pattern } from '../catalog/types';
import { saveExercise } from '../db/db';
import { labelEquipment, labelLevel, labelMuscle, labelPattern } from '../domain/labels';
import { uid } from '../domain/model';
import { useApp } from '../state/app-state';
import { Dialog } from '../ui/Dialog';

export function LibraryPage(): ReactElement {
  const { exercises, refresh } = useApp();
  const [filters, setFilters] = useState<CatalogFilters>(emptyFilters());
  const [creating, setCreating] = useState(false);
  const visible = useMemo(() => filterExercises(exercises, filters), [exercises, filters]);

  function toggle<T extends string>(key: 'musculos' | 'equipos' | 'patrones' | 'niveles', value: T): void {
    setFilters((current) => {
      const list = current[key] as T[];
      const next = list.includes(value) ? list.filter((item) => item !== value) : [...list, value];
      return { ...current, [key]: next };
    });
  }

  return (
    <main className="screen">
      <header className="lib-head">
        <h1>Biblioteca</h1>
        <button type="button" className="text-link" onClick={() => setCreating(true)}>Crear ejercicio</button>
      </header>
      <label className="field">
        <span>Buscar ejercicio</span>
        <input value={filters.query} onChange={(event) => setFilters({ ...filters, query: event.target.value })} />
      </label>
      <FilterRow label="Músculo" options={MUSCLES} selected={filters.musculos} nameOf={labelMuscle} onToggle={(value) => toggle('musculos', value)} />
      <FilterRow label="Equipo" options={EQUIPMENT} selected={filters.equipos} nameOf={labelEquipment} onToggle={(value) => toggle('equipos', value)} />
      <FilterRow label="Patrón" options={PATTERNS} selected={filters.patrones} nameOf={labelPattern} onToggle={(value) => toggle('patrones', value)} />
      <FilterRow label="Nivel" options={LEVELS} selected={filters.niveles} nameOf={labelLevel} onToggle={(value) => toggle('niveles', value)} />
      <button type="button" className="btn" onClick={() => setFilters(emptyFilters())}>Limpiar</button>
      {visible.length === 0 ? (
        <div className="card empty-card">
          <img src="/design/illustrations/empty-biblioteca.svg" alt="" width="160" height="120" />
          <p>Ningún ejercicio con esos filtros.</p>
          <button type="button" className="btn" onClick={() => setFilters(emptyFilters())}>Limpiar</button>
        </div>
      ) : (
        <ul className="plain">
          {visible.map((exercise) => (
            <li key={exercise.id}>
              <Link className="exercise-row" to={`/biblioteca/${exercise.id}`}>
                <ExerciseThumb images={exercise.imagenes} nombre={exercise.nombre} exerciseId={exercise.id} />
                <span className="exercise-copy">
                  <strong>{exercise.nombre}</strong>
                  <span>{exerciseMeta(exercise)}</span>
                </span>
              </Link>
            </li>
          ))}
        </ul>
      )}
      {creating ? <CreateExercise existing={exercises} onClose={() => setCreating(false)} onSaved={() => void refresh()} /> : null}
    </main>
  );
}

function exerciseMeta(exercise: Exercise): string {
  const pattern = exercise.patron ? labelPattern(exercise.patron) : '';
  const gear = exercise.equipo.map((item) => labelEquipment(item)).join(', ') || exercise.equipoTexto?.join(', ') || '';
  return [pattern, gear].filter(Boolean).join(' · ');
}

function FilterRow<T extends string>({
  label,
  options,
  selected,
  nameOf,
  onToggle,
}: {
  label: string;
  options: readonly T[];
  selected: readonly T[];
  nameOf: (value: T) => string;
  onToggle: (value: T) => void;
}): ReactElement {
  return (
    <div className="filter-row">
      <p>{label}</p>
      <div className="chips" role="group" aria-label={label}>
        {options.map((option) => (
          <button key={option} type="button" aria-pressed={selected.includes(option)} className={selected.includes(option) ? 'chip is-on' : 'chip'} onClick={() => onToggle(option)}>
            {nameOf(option)}
          </button>
        ))}
      </div>
    </div>
  );
}

function CreateExercise({ existing, onClose, onSaved }: { existing: Exercise[]; onClose: () => void; onSaved: () => void }): ReactElement {
  const [nombre, setNombre] = useState('');
  const [alias, setAlias] = useState('');
  const [musculo, setMusculo] = useState<Muscle>('pecho');
  const [patron, setPatron] = useState<Pattern>('empuje-horizontal');
  const [equipo, setEquipo] = useState<Equipment[]>(['peso-corporal']);
  const [nivel, setNivel] = useState<Level>('principiante');
  const [pasos, setPasos] = useState(['', '', '']);
  const [error, setError] = useState('');

  async function save(): Promise<void> {
    const trimmed = nombre.trim();
    if (trimmed.length < 2) {
      setError('Escribe un nombre.');
      return;
    }
    if (existing.some((item) => nameKey(item.nombre) === nameKey(trimmed))) {
      setError('Ese nombre ya existe.');
      return;
    }
    if (equipo.length === 0) {
      setError('Elige al menos un equipo.');
      return;
    }
    if (pasos.some((step) => step.trim().length < 10 || step.trim().length > 160)) {
      setError('Cada paso necesita entre 10 y 160 caracteres.');
      return;
    }
    const compounds: Pattern[] = ['rodilla', 'rodilla-unilateral', 'cadera', 'empuje-horizontal', 'empuje-vertical', 'traccion-horizontal', 'traccion-vertical'];
    const exercise: Exercise = {
      id: uid(),
      nombre: trimmed,
      alias: alias.split(',').map((item) => item.trim()).filter(Boolean),
      patron,
      musculo,
      equipo,
      nivel,
      prioridad: 25,
      compuesto: compounds.includes(patron),
      pasos: [pasos[0]!.trim(), pasos[1]!.trim(), pasos[2]!.trim()],
      origen: 'usuario',
      archivado: false,
      medida: 'reps',
      cuentaEnVolumen: patron !== 'movilidad',
    };
    await saveExercise(exercise);
    onSaved();
    onClose();
  }

  return (
    <Dialog title="Crear ejercicio" onClose={onClose}>
      <label className="field"><span>Nombre</span><input value={nombre} onChange={(event) => setNombre(event.target.value)} /></label>
      <label className="field"><span>Alias</span><input value={alias} onChange={(event) => setAlias(event.target.value)} /><small>Opcional, separados por comas</small></label>
      <label className="field"><span>Músculo principal</span>
        <select value={musculo} onChange={(event) => setMusculo(event.target.value as Muscle)}>{MUSCLES.map((item) => <option key={item} value={item}>{labelMuscle(item)}</option>)}</select>
      </label>
      <label className="field"><span>Patrón</span>
        <select value={patron} onChange={(event) => setPatron(event.target.value as Pattern)}>{PATTERNS.map((item) => <option key={item} value={item}>{labelPattern(item)}</option>)}</select>
      </label>
      <div className="chips" role="group" aria-label="Equipo del ejercicio">
        {EQUIPMENT.map((item) => (
          <button key={item} type="button" aria-pressed={equipo.includes(item)} className={equipo.includes(item) ? 'chip is-on' : 'chip'} onClick={() => setEquipo((current) => current.includes(item) ? current.filter((entry) => entry !== item) : [...current, item])}>
            {labelEquipment(item)}
          </button>
        ))}
      </div>
      <label className="field"><span>Nivel</span>
        <select value={nivel} onChange={(event) => setNivel(event.target.value as Level)}>{LEVELS.map((item) => <option key={item} value={item}>{labelLevel(item)}</option>)}</select>
      </label>
      {pasos.map((step, index) => (
        <label key={index} className="field">
          <span>Paso {index + 1}</span>
          <textarea value={step} onChange={(event) => setPasos(pasos.map((item, itemIndex) => (itemIndex === index ? event.target.value : item)))} />
        </label>
      ))}
      {error ? <strong className="error">{error}</strong> : null}
      <button type="button" className="btn btn-primary" onClick={() => void save()}>Guardar ejercicio</button>
    </Dialog>
  );
}
