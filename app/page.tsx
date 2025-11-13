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
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  calculateQuote,
  CONTRACT_LIMITS,
  ContractType,
  RoleSelection,
} from "@/lib/calculator";
import { formatCurrency } from "@/lib/format";
import { cn } from "@/lib/utils";

type EmailState = "idle" | "loading" | "error";

const MAKE_WEBHOOK_URL = process.env.NEXT_PUBLIC_MAKE_WEBHOOK_URL;

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
  const [emailDialogOpen, setEmailDialogOpen] = useState(false);
  const [emailValue, setEmailValue] = useState("");
  const [emailError, setEmailError] = useState("");
  const [emailState, setEmailState] = useState<EmailState>("idle");
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

  const handleRoleToggle = (key: keyof RoleSelection) => {
    if (key === "colf") return;
    setRoles((prev) => ({ ...prev, [key]: !prev[key] }));
  };

  const handleEmailSubmit = async (event: FormEvent) => {
    event.preventDefault();
    if (!emailValue || !/^\S+@\S+\.\S+$/.test(emailValue)) {
      setEmailError("Inserisci un indirizzo email valido");
      return;
    }

    if (!MAKE_WEBHOOK_URL) {
      setEmailError(
        "Configurazione mancante: contatta il team per attivare l'invio."
      );
      return;
    }

    setEmailState("loading");
    setEmailError("");

    try {
      const response = await fetch(MAKE_WEBHOOK_URL, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: emailValue,
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
      setEmailState("idle");
      setEmailDialogOpen(false);
    } catch (error) {
      console.error(error);
      setEmailState("error");
      setEmailError("Si è verificato un errore, riprova tra un momento.");
    }
  };

  useEffect(() => {
    if (emailDialogOpen && resultRef.current) {
      resultRef.current.scrollIntoView({ behavior: "smooth", block: "start" });
    }
  }, [emailDialogOpen]);

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
              {formatCurrency(quote.costoTotaleDatore)}
            </CardTitle>
          </CardHeader>
          <CardFooter className="flex flex-col gap-3 sm:flex-row">
            <Dialog open={emailDialogOpen} onOpenChange={setEmailDialogOpen}>
              <DialogTrigger asChild>
                <Button
                  className="w-full sm:w-auto"
                  disabled={overLimit}
                  aria-disabled={overLimit}
                >
                  Consulta i dettagli del costo
                </Button>
              </DialogTrigger>
              <DialogContent position="top-mobile">
                <DialogHeader>
                  <DialogTitle>Consulta il resoconto completo</DialogTitle>
                  <DialogDescription>
                    Inserisci la tua email per sbloccare il dettaglio dei costi.
                  </DialogDescription>
                </DialogHeader>
                <form className="space-y-4" onSubmit={handleEmailSubmit}>
                  <div className="space-y-2">
                    <label
                      className="text-sm font-medium text-foreground"
                      htmlFor="email"
                    >
                      Email
                    </label>
                    <input
                      id="email"
                      type="email"
                      value={emailValue}
                      onChange={(event) => setEmailValue(event.target.value)}
                      className={cn(
                        "w-full rounded-md border px-3 py-2 text-sm shadow-sm",
                        emailError && "border-destructive"
                      )}
                      placeholder="nome@azienda.it"
                    />
                    {emailError && (
                      <p className="text-xs text-destructive">{emailError}</p>
                    )}
                  </div>
                  <DialogFooter>
                    <Button
                      type="submit"
                      className="w-full sm:w-auto"
                      disabled={emailState === "loading"}
                    >
                      {emailState === "loading"
                        ? "Invio in corso..."
                        : "Sblocca i dettagli"}
                    </Button>
                  </DialogFooter>
                </form>
              </DialogContent>
            </Dialog>

            <Button asChild variant="outline" className="w-full sm:w-auto">
              <Link
                href="https://app.bazeapp.com/onboarding/iscrizione"
                target="_blank"
              >
                Trova una colf con Baze
              </Link>
            </Button>
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
