"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import type { ContractType } from "@/lib/calculator"
import { CONTRACT_LIMITS } from "@/lib/calculator"

type Props = {
  contractType: ContractType
  dailyHours: number
  daysPerWeek: number
  weeklyHours: number
  overLimit: boolean
  onDailyChange: (value: number) => void
  onDaysChange: (value: number) => void
}

export function HoursStep({
  contractType,
  dailyHours,
  daysPerWeek,
  weeklyHours,
  overLimit,
  onDailyChange,
  onDaysChange,
}: Props) {
  const limits = CONTRACT_LIMITS[contractType]

  return (
    <Card>
      <CardHeader>
        <CardTitle>3. Quante ore servono?</CardTitle>
        <CardDescription>Organizza la settimana (solo lunedì-sabato).</CardDescription>
      </CardHeader>
      <CardContent className="grid gap-6 sm:grid-cols-2">
        <NumberField
          label="Ore al giorno"
          value={dailyHours}
          min={1}
          max={limits.daily}
          onChange={onDailyChange}
        />
        <NumberField
          label="Giorni a settimana (lun-sab)"
          value={daysPerWeek}
          min={1}
          max={6}
          onChange={onDaysChange}
        />
        <div className="sm:col-span-2 rounded-lg border bg-muted/30 p-4 text-sm text-muted-foreground">
          Totale ore settimanali:{" "}
          <span className="font-semibold text-foreground">{weeklyHours}</span> ore / limite{" "}
          {limits.weekly}h per il contratto selezionato.
          {overLimit && (
            <span className="mt-2 block text-destructive">
              Riduci ore o giorni per rientrare nei limiti contrattuali.
            </span>
          )}
        </div>
      </CardContent>
    </Card>
  )
}

function NumberField({
  label,
  value,
  min,
  max,
  onChange,
}: {
  label: string
  value: number
  min: number
  max: number
  onChange: (value: number) => void
}) {
  return (
    <div className="space-y-2">
      <label className="text-sm font-medium text-foreground">{label}</label>
      <input
        type="number"
        min={min}
        max={max}
        value={value}
        onChange={(event) => {
          const next = Number(event.target.value)
          onChange(Number.isNaN(next) ? min : next)
        }}
        className="w-full rounded-lg border px-3 py-2 text-base shadow-sm focus:border-ring focus:outline-hidden"
      />
      <p className="text-xs text-muted-foreground">
        Valore consentito: {min} - {max}
      </p>
    </div>
  )
}
