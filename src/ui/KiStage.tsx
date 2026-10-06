import type { ReactElement } from 'react';
import type { RankId } from '../catalog/types';
import { assertNever } from '../domain/assert';

interface KiTone {
  color: string;
  hot: string;
  bolt: string;
  power: number;
}

function toneOf(rank: RankId): KiTone {
  switch (rank) {
    case 'chispa':
      return { color: '#9FD4FF', hot: '#E8F6FF', bolt: '#F4FBFF', power: 0.38 };
    case 'brasa':
      return { color: '#FF6A1A', hot: '#FFC56A', bolt: '#FFF1D2', power: 0.5 };
    case 'llama':
      return { color: '#FF4D00', hot: '#FFB15A', bolt: '#FFF0C8', power: 0.58 };
    case 'incendio':
      return { color: '#FF2D00', hot: '#FF9A3C', bolt: '#FFE7C2', power: 0.66 };
    case 'tormenta':
      return { color: '#7AA2FF', hot: '#C9D8FF', bolt: '#F4F7FF', power: 0.74 };
    case 'relampago':
      return { color: '#5CE1FF', hot: '#D8FBFF', bolt: '#FFFFFF', power: 0.8 };
    case 'nova':
      return { color: '#FFC53D', hot: '#FFE7A3', bolt: '#FFF8E4', power: 0.86 };
    case 'eclipse':
      return { color: '#FFC53D', hot: '#FFE08A', bolt: '#FFF6D8', power: 0.92 };
    case 'mitico':
      return { color: '#FFC53D', hot: '#FFD56A', bolt: '#FFF4CC', power: 0.96 };
    case 'absoluto':
      return { color: '#FFF8E8', hot: '#FFFFFF', bolt: '#FFFFFF', power: 1 };
    default:
      return assertNever(rank, 'rango');
  }
}

function flamePath(index: number, count: number, power: number, reach: number): string {
  const cx = 195;
  const cy = 508;
  const span = Math.PI * (0.92 + power * 0.5);
  const start = Math.PI * 1.5 - span / 2;
  const angle = start + (span * (index + 0.5)) / count;
  const length = reach + ((index * 53) % 70);
  const base = 16 + power * 14;
  const leftX = cx + Math.cos(angle - 0.09) * base;
  const leftY = cy + Math.sin(angle - 0.09) * base;
  const rightX = cx + Math.cos(angle + 0.09) * base;
  const rightY = cy + Math.sin(angle + 0.09) * base;
  const tipX = cx + Math.cos(angle) * length;
  const tipY = cy + Math.sin(angle) * length;
  const bend = (index % 2 === 0 ? 1 : -1) * (12 + power * 10);
  const leftCx = cx + Math.cos(angle) * length * 0.5 + Math.cos(angle + Math.PI / 2) * bend;
  const leftCy = cy + Math.sin(angle) * length * 0.5 + Math.sin(angle + Math.PI / 2) * bend;
  const rightCx = cx + Math.cos(angle) * length * 0.62 + Math.cos(angle - Math.PI / 2) * bend * 0.6;
  const rightCy = cy + Math.sin(angle) * length * 0.62 + Math.sin(angle - Math.PI / 2) * bend * 0.6;
  return `M ${leftX.toFixed(1)} ${leftY.toFixed(1)} Q ${leftCx.toFixed(1)} ${leftCy.toFixed(1)} ${tipX.toFixed(1)} ${tipY.toFixed(1)} Q ${rightCx.toFixed(1)} ${rightCy.toFixed(1)} ${rightX.toFixed(1)} ${rightY.toFixed(1)} Z`;
}

function boltPoints(index: number, count: number, power: number): string {
  const cx = 195;
  const cy = 490;
  const span = Math.PI * (0.9 + power * 0.4);
  const start = Math.PI * 1.5 - span / 2;
  const angle = start + (span * (index + 0.35)) / count;
  const length = 180 + power * 200;
  const parts = [`${cx} ${cy}`];
  const steps = 5;
  for (let step = 1; step <= steps; step += 1) {
    const along = (length * step) / steps;
    const jag = (step % 2 === 0 ? 18 : -16) * (0.6 + power);
    const x = cx + Math.cos(angle) * along + Math.cos(angle + Math.PI / 2) * jag;
    const y = cy + Math.sin(angle) * along + Math.sin(angle + Math.PI / 2) * jag;
    parts.push(`${x.toFixed(1)} ${y.toFixed(1)}`);
  }
  return parts.join(' ');
}

export function KiStage({ rank }: { rank: RankId }): ReactElement {
  const tone = toneOf(rank);
  const flames = Math.round(10 + tone.power * 12);
  const hotFlames = Math.round(6 + tone.power * 6);
  const bolts = Math.round(3 + tone.power * 8);
  const sparks = Math.round(12 + tone.power * 18);
  const rings = tone.power > 0.7 ? 3 : 2;
  const outerReach = 120 + tone.power * 230;
  const innerReach = 70 + tone.power * 120;
  return (
    <div
      className="ki-stage"
      aria-hidden="true"
      style={{
        ['--ki' as string]: tone.color,
        ['--ki-hot' as string]: tone.hot,
        ['--ki-bolt' as string]: tone.bolt,
        ['--ki-power' as string]: String(tone.power),
      }}
    >
      <div className="ki-glow" />
      <div className="ki-rays" />
      <svg className="ki-svg" viewBox="0 0 390 640">
        {Array.from({ length: flames }, (_, index) => (
          <path key={`flame-${index}`} className="ki-flame" d={flamePath(index, flames, tone.power, outerReach)} />
        ))}
        {Array.from({ length: hotFlames }, (_, index) => (
          <path key={`hot-${index}`} className="ki-flame is-hot" d={flamePath(index + 3, hotFlames, tone.power, innerReach)} />
        ))}
        {Array.from({ length: bolts }, (_, index) => (
          <polyline key={`bolt-${index}`} className="ki-bolt" points={boltPoints(index, bolts, tone.power)} />
        ))}
        {Array.from({ length: rings }, (_, index) => (
          <ellipse
            key={`ring-${index}`}
            className="ki-ring"
            cx="195"
            cy={528 + index * 16}
            rx={70 + tone.power * 110 + index * 36}
            ry={10 + tone.power * 6 + index * 5}
          />
        ))}
        {Array.from({ length: sparks }, (_, index) => {
          const angle = Math.PI * (1.05 + (0.9 * index) / sparks);
          const dist = 70 + ((index * 41) % 220) + tone.power * 50;
          const cx = 195 + Math.cos(angle) * dist;
          const cy = 470 + Math.sin(angle) * dist * 0.85;
          return <circle key={`spark-${index}`} className="ki-spark" cx={cx} cy={cy} r={1.2 + (index % 4) * 0.7} />;
        })}
      </svg>
    </div>
  );
}
