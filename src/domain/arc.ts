const ARC_NAMES = [
  'Arco del Cimiento',
  'Arco de la Ascensión',
  'Arco de la Forja',
  'Arco del Umbral',
  'Arco de la Corona',
] as const;

const ROMAN: readonly [number, string][] = [
  [10, 'X'],
  [9, 'IX'],
  [5, 'V'],
  [4, 'IV'],
  [1, 'I'],
];

export function toRoman(value: number): string {
  let rest = Math.max(0, Math.floor(value));
  let out = '';
  for (const [amount, glyph] of ROMAN) {
    while (rest >= amount) {
      out += glyph;
      rest -= amount;
    }
  }
  return out;
}

export function arcTitle(number: number): string {
  const name = ARC_NAMES[(Math.max(1, number) - 1) % ARC_NAMES.length] ?? ARC_NAMES[0];
  return `${name} ${toRoman(number)}`;
}
