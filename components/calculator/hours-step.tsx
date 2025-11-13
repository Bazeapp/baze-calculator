"use client"

import { useEffect, useState } from "react"

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
  const MIN_DAILY_HOURS = 3
  const limits = CONTRACT_LIMITS[contractType]

  return (
    <Card>
      <CardHeader>
        <CardTitle>3. Quante ore servono?</CardTitle>
        <CardDescription>
          Organizza la settimana (almeno 3 ore al giorno, solo lunedì-sabato).
        </CardDescription>
      </CardHeader>
      <CardContent className="grid gap-6 sm:grid-cols-2">
        <NumberField
          label="Ore al giorno"
          value={dailyHours}
          min={MIN_DAILY_HOURS}
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
  const [inputValue, setInputValue] = useState<string>(String(value))

  useEffect(() => {
    setInputValue(String(value))
  }, [value])

  const clamp = (next: number) => {
    if (Number.isNaN(next)) return min
    if (next < min) return min
    if (next > max) return max
    return next
  }

  return (
    <div className="space-y-2">
      <label className="text-sm font-medium text-foreground">{label}</label>
      <input
        type="number"
        min={min}
        max={max}
        value={inputValue}
        onChange={(event) => {
          const nextValue = event.target.value
          setInputValue(nextValue)

          if (nextValue === "") {
            return
          }

          const parsed = Number(nextValue)
          if (Number.isNaN(parsed)) {
            return
          }

          const clamped = clamp(parsed)
          if (clamped !== value) {
            onChange(clamped)
          }
        }}
        onBlur={() => {
          const parsed = Number(inputValue)

          if (inputValue === "" || Number.isNaN(parsed)) {
            setInputValue(String(min))
            onChange(min)
            return
          }

          const clamped = clamp(parsed)
          setInputValue(String(clamped))
          if (clamped !== value) {
            onChange(clamped)
          }
        }}
        className="w-full rounded-lg border px-3 py-2 text-base shadow-sm focus:border-ring focus:outline-hidden"
      />
      <p className="text-xs text-muted-foreground">
        Valore consentito: {min} - {max}
      </p>
    </div>
  )
}
