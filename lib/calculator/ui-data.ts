import type { ContractType, RoleSelection } from "@/lib/calculator";

export const CONTRACT_OPTIONS: {
  id: ContractType;
  title: string;
  description: string;
  imageSrc: string;
  imageAlt: string;
}[] = [
  {
    id: "non_convivente",
    title: "Non convivente",
    description: "Fino a 40 ore settimanali distribuite dal lunedì al sabato.",
    imageSrc:
      "https://cdn.prod.website-files.com/66bb1f64155ab1a17627a602/67138d458dd2fe866f66a8e5_Illustrazioni%20Onboarding_Ad%20ore%20copia.svg",
    imageAlt: "Illustrazione collaboratore domestico non convivente",
  },
  {
    id: "convivente",
    title: "Convivente",
    description:
      "Fino a 54 ore settimanali con supporto in casa dal lunedì al sabato.",
    imageSrc:
      "https://cdn.prod.website-files.com/66bb1f64155ab1a17627a602/67138d712f98d2b03a5ac376_Illustrazioni%20Onboarding_Convivente%20copia.svg",
    imageAlt: "Illustrazione collaboratore convivente che vive in casa",
  },
];

export const ROLE_LABELS: Record<
  keyof RoleSelection,
  { title: string; description: string; imageSrc: string; imageAlt: string }
> = {
  colf: {
    title: "Colf (obbligatoria)",
    description: "Gestione della casa, pulizie e faccende quotidiane.",
    imageSrc:
      "https://cdn.prod.website-files.com/66bb1f64155ab1a17627a602/67138c61be0e2345e3ffb420_Illustrazioni%20Onboarding_Colf%202%20copia.svg",
    imageAlt: "Illustrazione di una colf che si occupa della casa",
  },
  babysitter: {
    title: "Aggiungi Babysitter",
    description: "Supporto ai bambini, compiti e routine giornaliere.",
    imageSrc:
      "https://cdn.prod.website-files.com/66bb1f64155ab1a17627a602/6714f479af32c8a7c4644523_Illustrazioni%20Onboarding_Babysitter%201%20copia%20(1).svg",
    imageAlt: "Illustrazione babysitter con bambini",
  },
  badante: {
    title: "Aggiungi Badante",
    description: "Assistenza a persone anziane o fragili.",
    imageSrc:
      "https://cdn.prod.website-files.com/66bb1f64155ab1a17627a602/6717aa2cb2aa5cb8f8216a73_Badante%20V2.svg",
    imageAlt: "Illustrazione badante che assiste una persona anziana",
  },
};
