import {
  ACCRUAL_RATES,
  BASE_HOURLY_RATE,
  BAZE_FEE,
  CalculatorInput,
  CalculatorOutput,
  CONTRIBUTION_RATES,
  CONTRACT_LIMITS,
  WEEKS_PER_MONTH,
} from "./constants";

const roundCurrency = (value: number) =>
  Math.round((value + Number.EPSILON) * 100) / 100;

const clamp = (value: number, min: number, max: number) =>
  Math.min(Math.max(value, min), max);

export function normalizeInput(input: CalculatorInput): CalculatorInput {
  const limits = CONTRACT_LIMITS[input.contractType];
  const dailyHours = clamp(input.dailyHours, 1, limits.daily);
  const daysPerWeek = clamp(input.daysPerWeek, 1, 6);
  return { ...input, dailyHours, daysPerWeek };
}

export function calculateQuote(input: CalculatorInput): CalculatorOutput {
  const safeInput = normalizeInput(input);
  const weeklyHours = safeInput.dailyHours * safeInput.daysPerWeek;
  const limits = CONTRACT_LIMITS[safeInput.contractType];
  const effectiveWeeklyHours = Math.min(weeklyHours, limits.weekly);
  const monthlyHours = effectiveWeeklyHours * WEEKS_PER_MONTH;
  const roundedMonthlyHours = roundCurrency(monthlyHours);

  const baseGross = monthlyHours * BASE_HOURLY_RATE;
  const pagaLordaLavoratore = baseGross;

  const contributiColfLavoratore =
    CONTRIBUTION_RATES.cassaColf.workerPerHour * monthlyHours;
  const contributiColfDatore =
    CONTRIBUTION_RATES.cassaColf.employerPerHour * monthlyHours;

  const contributiInpsLavoratore =
    pagaLordaLavoratore * CONTRIBUTION_RATES.inps.worker;
  const contributiInpsDatore =
    pagaLordaLavoratore * CONTRIBUTION_RATES.inps.employer;

  const pagaNettaLavoratore =
    pagaLordaLavoratore -
    contributiColfLavoratore -
    contributiInpsLavoratore;

  const indennitaTfr = pagaLordaLavoratore * ACCRUAL_RATES.tfr;
  const indennitaFerie = pagaLordaLavoratore * ACCRUAL_RATES.ferie;
  const indennitaTredicesima =
    pagaLordaLavoratore * ACCRUAL_RATES.tredicesima;
  const indennitaTot = indennitaTfr + indennitaFerie + indennitaTredicesima;

  const serviceFeeHourly =
    effectiveWeeklyHours < BAZE_FEE.thresholdHours
      ? BAZE_FEE.high
      : BAZE_FEE.low;
  const serviceFeeMonthly = serviceFeeHourly * monthlyHours;

  const costoTotaleDatore =
    pagaNettaLavoratore +
    contributiColfDatore +
    contributiInpsDatore +
    indennitaTot +
    serviceFeeMonthly;

  return {
    pagaLordaLavoratore: roundCurrency(pagaLordaLavoratore),
    contributiColfLavoratore: roundCurrency(contributiColfLavoratore),
    contributiInpsLavoratore: roundCurrency(contributiInpsLavoratore),
    pagaNettaLavoratore: roundCurrency(pagaNettaLavoratore),
    contributiColfDatore: roundCurrency(contributiColfDatore),
    contributiInpsDatore: roundCurrency(contributiInpsDatore),
    indennitaTfr: roundCurrency(indennitaTfr),
    indennitaFerie: roundCurrency(indennitaFerie),
    indennitaTredicesima: roundCurrency(indennitaTredicesima),
    indennitaTot: roundCurrency(indennitaTot),
    costoTotaleDatore: roundCurrency(costoTotaleDatore),
    weeklyHours: roundCurrency(effectiveWeeklyHours),
    monthlyHours: roundedMonthlyHours,
    serviceFeeHourly: roundCurrency(serviceFeeHourly),
    serviceFeeMonthly: roundCurrency(serviceFeeMonthly),
  };
}

export type {
  CalculatorInput,
  CalculatorOutput,
  ContractType,
  RoleSelection,
} from "./constants";
export { CONTRACT_LIMITS } from "./constants";
