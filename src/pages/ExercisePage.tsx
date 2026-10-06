import type { ReactElement } from 'react';
import { Link, useNavigate, useParams } from 'react-router';
import { PatternDiagram } from '../assets';
import { isReserveId } from '../catalog';
import { imageCaption, imageSrc } from '../catalog/everkinetic';
import { ExerciseThumb } from '../ui/ExerciseThumb';
import { saveExercise } from '../db/db';
import { labelEquipment, labelLevel, labelMuscle, labelPattern } from '../domain/labels';
import { rankForXp } from '../domain/ranks';
import { Avatar } from '../ui/Avatar';
import { readDraft, writeDraft } from '../state/draft';
import { useApp } from '../state/app-state';

export function ExercisePage(): ReactElement {
  const { id } = useParams();
  const navigate = useNavigate();
  const { exercises, profile, refresh } = useApp();
  const exercise = exercises.find((item) => item.id === id);
  if (!exercise) {
    return (
      <main className="screen">
        <p>Ese ejercicio no está en la biblioteca.</p>
        <Link to="/biblioteca">Volver</Link>
      </main>
    );
  }
  const shown = exercise;

  function useInRoutine(): void {
    const draft = readDraft();
    const item = { exerciseId: shown.id, series: 3, repMin: 8, repMax: 12, descansoSegundos: 90, nota: '' };
    if (draft) {
      writeDraft({ ...draft, items: [...draft.items, item] });
      const route = draft.mode === 'day' ? `dia_${draft.id}` : draft.mode === 'new' ? 'nueva' : draft.id;
      navigate(`/plan/rutina/${route}`);
      return;
    }
    writeDraft({ mode: 'new', id: 'nueva', name: shown.nombre, items: [item] });
    navigate('/plan/rutina/nueva');
  }

  async function toggleArchive(): Promise<void> {
    await saveExercise({ ...shown, archivado: !shown.archivado });
    await refresh();
  }

  const images = exercise.imagenes ?? [];
  const gear =
    exercise.equipoTexto && exercise.equipoTexto.length > 0
      ? exercise.equipoTexto.join(', ')
      : exercise.equipo.map((item) => labelEquipment(item)).join(', ');
  const muscles =
    exercise.musculosTexto && exercise.musculosTexto.length > 0
      ? exercise.musculosTexto.join(', ')
      : exercise.musculo
        ? labelMuscle(exercise.musculo)
        : '';

  return (
    <main className="screen narrow">
      <Link to="/biblioteca">Biblioteca</Link>
      <header className="page-hero">
        {profile ? <Avatar gender={profile.avatar} rank={rankForXp(profile.xpTotal).id} pose="entrenando" /> : <span />}
        <h1>{exercise.nombre}</h1>
      </header>
      <p>
        {muscles}
        {gear ? ` · ${gear}` : ''}
      </p>
      {exercise.nivel && exercise.patron ? (
        <p>
          {labelLevel(exercise.nivel)} · {labelPattern(exercise.patron)}
        </p>
      ) : null}
      {exercise.mecanica ? <p>Mecánica: {exercise.mecanica}</p> : null}
      {exercise.archivado ? <p>Archivado. No entra en búsquedas ni en el plan.</p> : null}
      {exercise.resumen ? <p>{exercise.resumen}</p> : null}
      {exercise.patron ? <PatternDiagram patron={exercise.patron} /> : null}
      {images.length > 0 ? (
        <div className="photo-row">
          {images.map((path, index) => (
            <figure key={path}>
              <span className="pf-ek pf-ek--hueso">
                <img src={imageSrc(path)} alt={`${exercise.nombre}, ${imageCaption(path, index)}`} />
              </span>
              <figcaption>{imageCaption(path, index)}</figcaption>
            </figure>
          ))}
        </div>
      ) : (
        <ExerciseThumb images={exercise.imagenes} nombre={exercise.nombre} exerciseId={exercise.id} size="stage" labelled />
      )}
      {exercise.pasos.length > 0 ? (
        <ol>
          {exercise.pasos.map((step) => (
            <li key={step}>{step}</li>
          ))}
        </ol>
      ) : null}
      {exercise.consejos && exercise.consejos.length > 0 ? (
        <section>
          <h2>Consejos</h2>
          <ul>
            {exercise.consejos.map((tip) => (
              <li key={tip}>{tip}</li>
            ))}
          </ul>
        </section>
      ) : null}
      <button type="button" className="btn btn-primary" onClick={useInRoutine}>
        Usar en una rutina
      </button>
      {isReserveId(exercise.id) ? null : (
        <button type="button" className="btn" onClick={() => void toggleArchive()}>
          {exercise.archivado ? 'Recuperar' : 'Archivar'}
        </button>
      )}
    </main>
  );
}
