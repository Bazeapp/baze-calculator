"use client"

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
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
              "flex h-full flex-row items-start gap-4 rounded-lg border p-4 text-left transition focus-visible:outline-hidden focus-visible:ring-2 focus-visible:ring-ring sm:gap-6",
              value === option.id
                ? "border-primary bg-primary/5"
                : "hover:border-foreground/30",
            )}
          >
            <img
              src={option.imageSrc}
              alt={option.imageAlt}
              className="h-20 w-20 flex-shrink-0 object-contain"
              loading="lazy"
              decoding="async"
            />
            <div className="flex flex-1 flex-col gap-1">
              <p className="font-semibold">{option.title}</p>
              <p className="text-sm text-muted-foreground">{option.description}</p>
            </div>
          </button>
        ))}
      </CardContent>
    </Card>
  )
}
