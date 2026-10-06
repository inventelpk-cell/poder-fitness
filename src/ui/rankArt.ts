/** Emblema existente cuando el id de la spec no tiene archivo propio. */
const ART_ID: Record<string, string> = {
  chispa: 'chispa',
  brasa: 'brasa',
  llama: 'forja',
  hoguera: 'forja',
  nucleo: 'impulso',
  pulso: 'pulso',
  onda: 'pulso',
  cresta: 'ascenso',
  vortice: 'vortice',
  eclipse: 'corona',
  singularidad: 'mito',
}

export function rankArtId(id: string): string {
  return ART_ID[id] ?? 'chispa'
}
