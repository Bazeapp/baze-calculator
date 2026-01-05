"use client";

import Link from "next/link";
import { FormEvent, useEffect, useMemo, useRef, useState } from "react";

import { ContractStep } from "@/components/calculator/contract-step";
import { DetailedBreakdown } from "@/components/calculator/detailed-breakdown";
import { HoursStep } from "@/components/calculator/hours-step";
import { HourlyCard } from "@/components/calculator/hourly-card";
import { RoleStep } from "@/components/calculator/role-step";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  calculateQuote,
  CONTRACT_LIMITS,
  ContractType,
  RoleSelection,
} from "@/lib/calculator";
import { formatCurrency } from "@/lib/format";
import { cn } from "@/lib/utils";

type PhoneState = "idle" | "loading" | "error";

const MAKE_WEBHOOK_URL = process.env.NEXT_PUBLIC_MAKE_WEBHOOK_URL;
const ONBOARDING_URL =
  "https://app.bazeapp.com/onboarding/iscrizione?source=calculator";

export default function Home() {
  const [contractType, setContractType] =
    useState<ContractType>("non_convivente");
  const [roles, setRoles] = useState<RoleSelection>({
    colf: true,
    babysitter: false,
    badante: false,
  });
  const [dailyHours, setDailyHours] = useState(4);
  const [daysPerWeek, setDaysPerWeek] = useState(5);
  const [detailsUnlocked, setDetailsUnlocked] = useState(false);
  const [showPhoneForm, setShowPhoneForm] = useState(false);
  const [phoneValue, setPhoneValue] = useState("");
  const [phoneError, setPhoneError] = useState("");
  const [phoneState, setPhoneState] = useState<PhoneState>("idle");
  const [isEmbedded, setIsEmbedded] = useState(false);
  const resultRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    if (typeof window === "undefined") {
      return;
    }

    setIsEmbedded(window.self !== window.top);

    const sendHeight = () => {
      const height =
        document.documentElement?.scrollHeight ??
        document.body.scrollHeight ??
        0;

      window.parent?.postMessage(
        { type: "baze-calculator:resize", height },
        "*"
      );
    };

    sendHeight();

    let observer: ResizeObserver | null = null;
    let fallbackListener = false;

    if (typeof ResizeObserver !== "undefined") {
      observer = new ResizeObserver(() => sendHeight());
      observer.observe(document.body);
    } else {
      fallbackListener = true;
      window.addEventListener("resize", sendHeight);
    }

    return () => {
      observer?.disconnect();
      if (fallbackListener) {
        window.removeEventListener("resize", sendHeight);
      }
    };
  }, []);

  const weeklyHours = dailyHours * daysPerWeek;
  const limits = CONTRACT_LIMITS[contractType];
  const overLimit =
    dailyHours > limits.daily ||
    weeklyHours > limits.weekly ||
    weeklyHours <= 0;

  const quote = useMemo(
    () =>
      calculateQuote({
        contractType,
        roleSelections: roles,
        dailyHours,
        daysPerWeek,
        duration: "indeterminato",
      }),
    [contractType, roles, dailyHours, daysPerWeek]
  );

  const chartData = useMemo(() => {
    if (!detailsUnlocked) return [];
    return [
      {
        label: "Paga netta",
        value: quote.pagaNettaLavoratore,
        color: "oklch(0.55 0.14 249)",
      },
      {
        label: "Contributi INPS datore",
        value: quote.contributiInpsDatore,
        color: "oklch(0.67 0.12 145)",
      },
      {
        label: "Cassa Colf",
        value: quote.contributiColfDatore,
        color: "oklch(0.73 0.08 95)",
      },
      {
        label: "Accantonamenti",
        value: quote.indennitaTot,
        color: "oklch(0.78 0.09 35)",
      },
      {
        label: "Service Fee Baze",
        value: quote.serviceFeeMonthly,
        color: "oklch(0.85 0.05 55)",
      },
    ];
  }, [
    detailsUnlocked,
    quote.contributiColfDatore,
    quote.contributiInpsDatore,
    quote.indennitaTot,
    quote.pagaNettaLavoratore,
    quote.serviceFeeMonthly,
  ]);

  const safeMonthlyHours = quote.monthlyHours || 1;
  const contributiTotDatore =
    quote.contributiColfDatore + quote.contributiInpsDatore;
  const hourlyNet = quote.pagaNettaLavoratore / safeMonthlyHours;
  const hourlyContributions = contributiTotDatore / safeMonthlyHours;
  const hourlyAccantonamenti = quote.indennitaTot / safeMonthlyHours;
  const hourlyServiceFee = quote.serviceFeeMonthly / safeMonthlyHours;
  const totalHourlyPrice = quote.costoTotaleDatore / safeMonthlyHours;
  const totalCostDisplay = formatCurrency(quote.costoTotaleDatore);
  const isCostObfuscated = !detailsUnlocked;

  const handleRoleToggle = (key: keyof RoleSelection) => {
    if (key === "colf") return;
    setRoles((prev) => ({ ...prev, [key]: !prev[key] }));
  };

  const handlePhoneSubmit = async (event: FormEvent) => {
    event.preventDefault();
    const normalizedPhone = phoneValue.replace(/\D/g, "");
    if (normalizedPhone.length < 7 || normalizedPhone.length > 15) {
      setPhoneError("Inserisci un numero di telefono valido");
      return;
    }

    if (!MAKE_WEBHOOK_URL) {
      setPhoneError(
        "Configurazione mancante: contatta il team per attivare l'invio."
      );
      return;
    }

    setPhoneState("loading");
    setPhoneError("");

    try {
      const response = await fetch(MAKE_WEBHOOK_URL, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          phone: phoneValue,
          selections: {
            contractType,
            roles,
            dailyHours,
            daysPerWeek,
          },
          quote,
        }),
      });

      if (!response.ok) {
        throw new Error("Impossibile inviare la richiesta");
      }

      setDetailsUnlocked(true);
      setPhoneState("idle");
      setShowPhoneForm(false);
    } catch (error) {
      console.error(error);
      setPhoneState("error");
      setPhoneError("Si è verificato un errore, riprova tra un momento.");
    }
  };

  useEffect(() => {
    if (showPhoneForm && resultRef.current) {
      resultRef.current.scrollIntoView({ behavior: "smooth", block: "start" });
    }
  }, [showPhoneForm]);

  return (
    <div className="min-h-screen bg-background pb-16">
      <main
        className={cn(
          "mx-auto flex w-full flex-col gap-8 py-12",
          isEmbedded ? "max-w-none px-2 sm:px-4 lg:px-8" : "max-w-5xl px-4"
        )}
      >
        <header className="space-y-3 text-center sm:text-left">
          <h1 className="text-balance text-3xl font-semibold sm:text-4xl">
            Calcola il costo di una colf con Baze
          </h1>
        </header>

        <section className="grid gap-6">
          <ContractStep value={contractType} onChange={setContractType} />
          <RoleStep value={roles} onToggle={handleRoleToggle} />
          <HoursStep
            contractType={contractType}
            dailyHours={dailyHours}
            daysPerWeek={daysPerWeek}
            weeklyHours={weeklyHours}
            overLimit={overLimit}
            onDailyChange={setDailyHours}
            onDaysChange={setDaysPerWeek}
          />
        </section>

        <Card id="risultato" ref={resultRef}>
          <CardHeader>
            <CardDescription>
              Quanto pagheresti con Baze al mese (tutto incluso){" "}
            </CardDescription>
            <CardTitle className="text-4xl font-extrabold">
              <span
                className={cn(
                  "inline-block transition-[filter] duration-200",
                  isCostObfuscated && "select-none blur-sm"
                )}
                aria-hidden={isCostObfuscated}
              >
                {totalCostDisplay}
              </span>
              {isCostObfuscated && (
                <span className="sr-only">
                  Costo nascosto finché non inserisci la mail
                </span>
              )}
            </CardTitle>
          </CardHeader>
          <CardFooter className="flex flex-col gap-3 sm:flex-row">
            {!detailsUnlocked && !showPhoneForm && (
              <>
                <Button
                  className="w-full sm:w-auto"
                  disabled={overLimit}
                  aria-disabled={overLimit}
                  onClick={() => {
                    if (overLimit) return;
                    setShowPhoneForm(true);
                    setPhoneError("");
                  }}
                >
                  Consulta i dettagli del costo
                </Button>
              </>
            )}

            {!detailsUnlocked && showPhoneForm && (
              <form className="w-full space-y-4" onSubmit={handlePhoneSubmit}>
                <div className="space-y-2">
                  <p className="text-sm font-medium text-foreground">
                    Inserisci il tuo telefono per sbloccare il dettaglio dei costi.
                  </p>
                  <input
                    id="phone"
                    type="tel"
                    inputMode="tel"
                    autoComplete="tel"
                    value={phoneValue}
                    onChange={(event) => setPhoneValue(event.target.value)}
                    className={cn(
                      "w-full rounded-md border px-3 py-2 text-sm shadow-sm",
                      phoneError && "border-destructive"
                    )}
                    placeholder="+39 333 123 4567"
                  />
                  {phoneError && (
                    <p className="text-xs text-destructive">{phoneError}</p>
                  )}
                </div>
                <Button
                  type="submit"
                  className="w-full sm:w-auto"
                  disabled={phoneState === "loading"}
                >
                  {phoneState === "loading"
                    ? "Invio in corso..."
                    : "Sblocca i dettagli"}
                </Button>
              </form>
            )}

          </CardFooter>
          <CardFooter className="flex items-start text-left flex-col gap-1 pt-0 text-xs text-muted-foreground">
            {overLimit && (
              <p className="text-destructive">
                Riduci ore o giorni per rientrare nei limiti contrattuali e
                procedere con il calcolo.
              </p>
            )}
            <p>
              * Con Baze, se stai cercando, puoi trovare una colf a Milano. La
              ricerca iniziale è gratuita, inizi a pagare solo se decidi di
              assumere uno dei profili conosciuti
            </p>
          </CardFooter>

          {detailsUnlocked && (
            <CardContent className="border-t pt-6 space-y-4">
              <div className="space-y-2 text-sm text-muted-foreground"></div>
              <div className="grid gap-6 lg:grid-cols-2">
                <DetailedBreakdown chartData={chartData} quote={quote} />
                <HourlyCard
                  hourlyPrice={totalHourlyPrice}
                  weeklyHours={quote.weeklyHours}
                  breakdown={{
                    net: hourlyNet,
                    service: hourlyServiceFee,
                    contributions: hourlyContributions,
                    accruals: hourlyAccantonamenti,
                  }}
                  monthlyCost={quote.costoTotaleDatore}
                />
              </div>
              <div className="space-y-2 text-sm text-muted-foreground">
                <p>
                  * La nostra service fee ci permette di organizzare
                  gratuitamente i colloqui iniziali, garantirti un assicurazione
                  fino a 2 milioni di euro, sostenere tutti i costi delle
                  pratiche burocratiche e continuare a migliorare il nostro
                  servizio.
                </p>
              </div>
            </CardContent>
          )}
        </Card>
      </main>
    </div>
  );
}
