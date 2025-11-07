import type { ContractType, RoleSelection } from "@/lib/calculator"

export const CONTRACT_OPTIONS: {
  id: ContractType
  title: string
  description: string
}[] = [
  {
    id: "non_convivente",
    title: "Non convivente",
    description: "Fino a 40 ore settimanali distribuite dal lunedì al sabato.",
  },
  {
    id: "convivente",
    title: "Convivente",
    description: "Fino a 54 ore settimanali con supporto in casa.",
  },
]

export const ROLE_LABELS: Record<
  keyof RoleSelection,
  { title: string; description: string }
> = {
  colf: {
    title: "Colf (obbligatoria)",
    description: "Gestione della casa, pulizie e faccende quotidiane.",
  },
  babysitter: {
    title: "Aggiungi Babysitter",
    description: "Supporto ai bambini, compiti e routine giornaliere.",
  },
  badante: {
    title: "Aggiungi Badante",
    description: "Assistenza a persone anziane o fragili.",
  },
}
