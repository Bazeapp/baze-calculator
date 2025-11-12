"use client";

import { CheckCircle2 } from "lucide-react";

import { Card } from "@/components/ui/card";
import { formatCurrency, formatNumber } from "@/lib/format";
import { cn } from "@/lib/utils";

const CHECKLIST = [
  "Paga della collaboratrice",
  "Contributi INPS",
  "TFR, ferie e 13esima",
  "Tutte le pratiche burocratiche",
  "Assicurazione danni fino a € 2 milioni",
];

type Props = {
  hourlyPrice: number;
  weeklyHours: number;
  breakdown: {
    net: number;
    service: number;
    contributions: number;
    accruals: number;
  };
  monthlyCost: number;
};

export function HourlyCard({
  hourlyPrice,
  weeklyHours,
  breakdown,
  monthlyCost,
}: Props) {
  const weeklyHoursDisplay = formatNumber(
    weeklyHours,
    Number.isInteger(weeklyHours) ? 0 : 1
  );

  return (
    <Card className="border-white shadow-none">
      <div className="flex flex-col gap-6 px-6">
        <div className="space-y-3">
          <p className="text-5xl font-extrabold text-foreground sm:text-6xl">
            {formatCurrency(hourlyPrice, 2)}
          </p>
          <p className="text-lg font-semibold text-foreground sm:text-xl">
            all&apos;ora, inclusa ogni voce di costo
          </p>
        </div>
        <ul className="space-y-2 text-sm sm:text-base">
          {CHECKLIST.map((item) => (
            <li key={item} className="flex items-start gap-2">
              <CheckCircle2 className="h-3.5 w-3.5 flex-shrink-0 text-primary sm:h-4 sm:w-4" />
              <span>{item}</span>
            </li>
          ))}
        </ul>
        <div className="space-y-3 rounded-lg border p-4 text-sm">
          <Row label="Ore settimanali" value={`${weeklyHoursDisplay} h`} />
          <Row label="Prezzo orario" value={formatCurrency(hourlyPrice, 2)} />
          <div className="space-y-1 border-y py-3 text-muted-foreground">
            <Row
              label="+ Paga netta collaboratrice"
              value={formatCurrency(breakdown.net, 2)}
            />
            <Row
              label="+ Service Fee Baze *"
              value={formatCurrency(breakdown.service, 2)}
            />
            <Row
              label="+ Contributi e Cassa Colf"
              value={formatCurrency(breakdown.contributions, 2)}
            />
            <Row
              label="+ Accantonamenti (13ª, ferie, TFR)"
              value={formatCurrency(breakdown.accruals, 2)}
            />
          </div>
          <div className="space-y-1">
            <Row
              label="Costo mensile"
              value={formatCurrency(monthlyCost)}
              emphasis
            />
          </div>
        </div>
      </div>
    </Card>
  );
}

function Row({
  label,
  value,
  emphasis = false,
}: {
  label: string;
  value: string;
  emphasis?: boolean;
}) {
  return (
    <div
      className={cn(
        "flex gap-3 text-sm sm:gap-4",
        emphasis && "text-base font-semibold text-foreground sm:text-lg"
      )}
    >
      <span className="flex-1 text-muted-foreground leading-snug">{label}</span>
      <span className="text-foreground text-right whitespace-nowrap">
        {value}
      </span>
    </div>
  );
}
