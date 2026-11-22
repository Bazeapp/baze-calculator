"use client";

import { CheckCircle2, XCircle } from "lucide-react";

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { NERO_HOURLY_RANGE } from "@/lib/calculator/constants";
import { formatCurrency } from "@/lib/format";

const NERO_RISKS = [
  "Rischi sanzioni e una vertenza, che può chiedere anni di contributi, tredicesime, ferie e TFR arretrati",
  "La colf non ha tutele in caso di malattia o infortunio",
  "Nessuna assicurazione se succede un danno in casa",
  "Niente detrazioni e pagamenti senza traccia",
];

const BAZE_INCLUDED = [
  "Contratto, contributi INPS, buste paga e pratiche",
  "13ª, ferie e TFR già compresi nel prezzo",
  "Assicurazione danni fino a € 2 milioni",
  "Colf selezionata di persona e sostituzioni",
];

type Props = {
  /** Prezzo orario Baze; se assente (dettagli non sbloccati) non viene mostrato. */
  bazeHourlyPrice?: number;
};

export function NeroComparison({ bazeHourlyPrice }: Props) {
  const neroRange = `${NERO_HOURLY_RANGE.min}–${NERO_HOURLY_RANGE.max} €`;

  return (
    <Card>
      <CardHeader>
        <CardDescription>Il confronto con il nero</CardDescription>
        <CardTitle className="text-2xl font-semibold">
          In nero una colf a Milano costa {neroRange} l&apos;ora in contanti
        </CardTitle>
        <p className="text-sm text-muted-foreground">
          {bazeHourlyPrice !== undefined
            ? `Con Baze paghi ${formatCurrency(bazeHourlyPrice, 2)} l'ora, quasi lo stesso, e dentro c'è tutto.`
            : "In regola con Baze costa quasi lo stesso, e dentro c'è tutto."}
        </p>
      </CardHeader>
      <CardContent className="grid gap-4 sm:grid-cols-2">
        <div className="space-y-3 rounded-lg border p-4">
          <p className="font-semibold text-foreground">In nero</p>
          <ul className="space-y-2 text-sm">
            {NERO_RISKS.map((item) => (
              <li key={item} className="flex items-start gap-2">
                <XCircle className="mt-0.5 h-4 w-4 flex-shrink-0 text-destructive" />
                <span className="text-muted-foreground">{item}</span>
              </li>
            ))}
          </ul>
        </div>
        <div className="space-y-3 rounded-lg border border-primary/30 bg-primary/5 p-4">
          <p className="font-semibold text-primary">Con Baze, tutto incluso</p>
          <ul className="space-y-2 text-sm">
            {BAZE_INCLUDED.map((item) => (
              <li key={item} className="flex items-start gap-2">
                <CheckCircle2 className="mt-0.5 h-4 w-4 flex-shrink-0 text-primary" />
                <span>{item}</span>
              </li>
            ))}
          </ul>
        </div>
      </CardContent>
    </Card>
  );
}
