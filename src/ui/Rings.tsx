import type { ReactElement } from 'react';

export function HeroRings({
  flexiones,
  abdominales,
  sentadillas,
  km,
}: {
  flexiones: number;
  abdominales: number;
  sentadillas: number;
  km: number;
}): ReactElement {
  return (
    <div className="ring-row">
      <Ring label="Flexiones" value={flexiones} goal={100} />
      <Ring label="Abdominales" value={abdominales} goal={100} />
      <Ring label="Sentadillas" value={sentadillas} goal={100} />
      <Ring label="Km" value={km} goal={10} km />
    </div>
  );
}

function Ring({ label, value, goal, km = false }: { label: string; value: number; goal: number; km?: boolean }): ReactElement {
  const radius = 26;
  const length = 2 * Math.PI * radius;
  const ratio = Math.max(0, Math.min(1, goal === 0 ? 0 : value / goal));
  const shown = km ? (Number.isInteger(value) ? String(value) : value.toFixed(1)) : String(Math.round(value));
  const target = km ? String(goal) : String(goal);
  return (
    <div className="ring">
      <svg viewBox="0 0 72 72" aria-hidden="true">
        <circle className="ring-track" cx="36" cy="36" r={radius} />
        <circle
          className="ring-value"
          cx="36"
          cy="36"
          r={radius}
          strokeDasharray={`${length * ratio} ${length}`}
          transform="rotate(-90 36 36)"
        />
      </svg>
      <span className="ring-num">
        {shown}
        <small>/{target}</small>
      </span>
      <span className="ring-label">{label}</span>
    </div>
  );
}
