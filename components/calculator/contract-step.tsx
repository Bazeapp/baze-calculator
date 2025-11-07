"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { CONTRACT_OPTIONS } from "@/lib/calculator/ui-data"
import type { ContractType } from "@/lib/calculator"
import { cn } from "@/lib/utils"

type Props = {
  value: ContractType
  onChange: (value: ContractType) => void
}

export function ContractStep({ value, onChange }: Props) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>1. Tipologia di contratto</CardTitle>
        <CardDescription>
          Scegli tra collaboratore convivente o non convivente.
        </CardDescription>
      </CardHeader>
      <CardContent className="grid gap-3 sm:grid-cols-2">
        {CONTRACT_OPTIONS.map((option) => (
          <button
            key={option.id}
            type="button"
            onClick={() => onChange(option.id)}
            className={cn(
              "flex flex-col rounded-lg border p-4 text-left transition focus-visible:ring-2 focus-visible:ring-ring focus-visible:outline-hidden",
              value === option.id
                ? "border-primary bg-primary/5"
                : "hover:border-foreground/30",
            )}
          >
            <span className="font-semibold">{option.title}</span>
            <span className="text-sm text-muted-foreground">{option.description}</span>
          </button>
        ))}
      </CardContent>
    </Card>
  )
}
