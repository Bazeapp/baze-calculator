"use client";

import { CheckCircle2 } from "lucide-react";

import { Card } from "@/components/ui/card";
import { formatCurrency, formatNumber } from "@/lib/format";
import { cn } from "@/lib/utils";

const CHECKLIST = [
  "Paga della collaboratrice",
  "Cedolini e versamento contributi",
  "Sostituzioni garantite",
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
          <p className="text-6xl font-extrabold text-foreground">
            {formatCurrency(hourlyPrice, 2)}
          </p>
          <p className="text-xl font-semibold text-foreground">
            all&apos;ora, inclusa ogni voce di costo
          </p>
        </div>
        <ul className="space-y-2 text-sm">
          {CHECKLIST.map((item) => (
            <li key={item} className="flex items-center gap-2">
              <CheckCircle2 className="size-4 text-primary" />
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
              label="+ Accantonamenti"
              value={`${formatCurrency(
                breakdown.accruals,
                2
              )} (13ª, ferie, TFR)`}
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
        "flex items-center justify-between text-sm",
        emphasis && "text-lg font-semibold text-foreground"
      )}
    >
      <span className="text-muted-foreground">{label}</span>
      <span className="text-foreground">{value}</span>
    </div>
  );
}
