export const RANK_IDS = [
  "chispa",
  "brasa",
  "pulso",
  "forja",
  "impulso",
  "ascenso",
  "vortice",
  "corona",
  "mito",
] as const;

export type RankId = (typeof RANK_IDS)[number];

export type Rank = {
  id: RankId;
  name: string;
  title: string;
  order: number;
  path: string;
  accent: string;
  secondary: string;
};

export const RANKS: readonly Rank[] = [
  {
    id: "chispa",
    name: "Chispa",
    title: "Novato",
    order: 1,
    path: "/art/ranks/chispa.svg",
    accent: "#8e97ab",
    secondary: "#ff6a1a",
  },
  {
    id: "brasa",
    name: "Brasa",
    title: "Encendido",
    order: 2,
    path: "/art/ranks/brasa.svg",
    accent: "#ff6a1a",
    secondary: "#e39b12",
  },
  {
    id: "pulso",
    name: "Pulso",
    title: "Constante",
    order: 3,
    path: "/art/ranks/pulso.svg",
    accent: "#ff6a1a",
    secondary: "#ffc43a",
  },
  {
    id: "forja",
    name: "Forja",
    title: "Templado",
    order: 4,
    path: "/art/ranks/forja.svg",
    accent: "#ffc43a",
    secondary: "#ff6a1a",
  },
  {
    id: "impulso",
    name: "Impulso",
    title: "Impulsor",
    order: 5,
    path: "/art/ranks/impulso.svg",
    accent: "#ff6a1a",
    secondary: "#3b82ff",
  },
  {
    id: "ascenso",
    name: "Ascenso",
    title: "Ascendido",
    order: 6,
    path: "/art/ranks/ascenso.svg",
    accent: "#ffc43a",
    secondary: "#ff6a1a",
  },
  {
    id: "vortice",
    name: "Vórtice",
    title: "Vorticial",
    order: 7,
    path: "/art/ranks/vortice.svg",
    accent: "#3b82ff",
    secondary: "#ff6a1a",
  },
  {
    id: "corona",
    name: "Corona",
    title: "Soberano",
    order: 8,
    path: "/art/ranks/corona.svg",
    accent: "#ffc43a",
    secondary: "#3b82ff",
  },
  {
    id: "mito",
    name: "Mito",
    title: "Mítico",
    order: 9,
    path: "/art/ranks/mito.svg",
    accent: "#fff6e4",
    secondary: "#3b82ff",
  },
];

function normalize(value: string): string {
  return value
    .trim()
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/\s+/g, "-");
}

export function resolveRank(value: string): Rank | undefined {
  const key = normalize(value);
  return RANKS.find((rank) => rank.id === key || normalize(rank.name) === key);
}

export function rankEmblemSrc(value: string): string {
  const trimmed = value.trim();
  if (/\.svg(?:$|\?)/i.test(trimmed) || trimmed.startsWith("/") || trimmed.includes("/")) {
    return trimmed;
  }
  const rank = resolveRank(trimmed);
  if (rank) {
    return rank.path;
  }
  return `/art/ranks/${normalize(trimmed)}.svg`;
}

export function rankLabel(value: string): string {
  const rank = resolveRank(value);
  if (rank) {
    return rank.name;
  }
  const file = value.split("/").pop() ?? value;
  const stem = file.replace(/\.svg(?:\?.*)?$/i, "").replace(/-/g, " ");
  return stem;
}

export function rankUsesMythAura(id: RankId): boolean {
  switch (id) {
    case "chispa":
    case "brasa":
    case "pulso":
    case "forja":
    case "impulso":
    case "ascenso":
    case "vortice":
    case "corona":
      return false;
    case "mito":
      return true;
    default: {
      const unknown: never = id;
      return unknown;
    }
  }
}
