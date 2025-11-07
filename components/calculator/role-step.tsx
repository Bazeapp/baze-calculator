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
        <CardDescription>
          La colf è sempre inclusa. Aggiungi i servizi di cui hai bisogno.
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
              "flex h-full flex-col rounded-lg border p-4 text-left transition focus-visible:ring-2 focus-visible:ring-ring focus-visible:outline-hidden",
              value[key]
                ? "border-primary bg-primary/5"
                : "hover:border-foreground/30",
              key === "colf" &&
                "cursor-not-allowed border-dashed text-muted-foreground",
            )}
          >
            <span className="font-semibold">{ROLE_LABELS[key].title}</span>
            <span className="text-sm text-muted-foreground">
              {ROLE_LABELS[key].description}
            </span>
          </button>
        ))}
      </CardContent>
    </Card>
  )
}
