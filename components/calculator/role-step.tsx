"use client"

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import type { RoleSelection } from "@/lib/calculator"
import { ROLE_LABELS } from "@/lib/calculator/ui-data"
import { cn } from "@/lib/utils"

type Props = {
  value: RoleSelection
  onToggle: (role: keyof RoleSelection) => void
}

export function RoleStep({ value, onToggle }: Props) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>2. Chi stai cercando?</CardTitle>
        <CardDescription className="space-y-2">
          <p>La colf è sempre inclusa. Aggiungi i servizi di cui hai bisogno.</p>
          <p className="text-xs text-muted-foreground">
            * Con Baze trovi colf che possono anche occuparsi di cure leggere o
            babysitting, ma non forniamo badanti o babysitter dedicate.
          </p>
        </CardDescription>
      </CardHeader>
      <CardContent className="grid gap-3 sm:grid-cols-3">
        {(Object.keys(ROLE_LABELS) as (keyof RoleSelection)[]).map((key) => (
          <button
            key={key}
            type="button"
            onClick={() => onToggle(key)}
            disabled={key === "colf"}
            className={cn(
              "flex h-full flex-row items-start gap-4 rounded-lg border p-4 text-left transition focus-visible:outline-hidden focus-visible:ring-2 focus-visible:ring-ring sm:gap-6",
              value[key]
                ? "border-primary bg-primary/5"
                : "hover:border-foreground/30",
              key === "colf" &&
                "cursor-not-allowed border-dashed text-muted-foreground",
            )}
          >
            <img
              src={ROLE_LABELS[key].imageSrc}
              alt={ROLE_LABELS[key].imageAlt}
              className="h-20 w-20 flex-shrink-0 object-contain"
              loading="lazy"
              decoding="async"
            />
            <div className="flex flex-1 flex-col gap-1">
              <p className="font-semibold">{ROLE_LABELS[key].title}</p>
              <p className="text-sm text-muted-foreground">
                {ROLE_LABELS[key].description}
              </p>
            </div>
          </button>
        ))}
      </CardContent>
    </Card>
  )
}
