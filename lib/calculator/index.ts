import {
  ACCRUAL_RATES,
  BASE_HOURLY_RATE,
  BAZE_FEE,
  CalculatorInput,
  CalculatorOutput,
  CONTRIBUTION_RATES,
  CONTRACT_LIMITS,
  FIXED_BREAKDOWNS,
  FixedBreakdown,
  WEEKS_PER_MONTH,
} from "./constants";

const roundCurrency = (value: number) =>
  Math.round((value + Number.EPSILON) * 100) / 100;

const clamp = (value: number, min: number, max: number) =>
  Math.min(Math.max(value, min), max);

const ACCRUAL_RATE_SUM =
  ACCRUAL_RATES.tfr + ACCRUAL_RATES.ferie + ACCRUAL_RATES.tredicesima;

const splitAccruals = (total: number) => {
  if (ACCRUAL_RATE_SUM === 0) {
    return {
      indennitaTfr: 0,
      indennitaFerie: 0,
      indennitaTredicesima: 0,
    };
  }

  const ratio = {
    tfr: ACCRUAL_RATES.tfr / ACCRUAL_RATE_SUM,
    ferie: ACCRUAL_RATES.ferie / ACCRUAL_RATE_SUM,
    tredicesima: ACCRUAL_RATES.tredicesima / ACCRUAL_RATE_SUM,
  };

  return {
    indennitaTfr: total * ratio.tfr,
    indennitaFerie: total * ratio.ferie,
    indennitaTredicesima: total * ratio.tredicesima,
  };
};

export function normalizeInput(input: CalculatorInput): CalculatorInput {
  const MIN_DAILY_HOURS = 3;
  const limits = CONTRACT_LIMITS[input.contractType];
  const dailyHours = clamp(input.dailyHours, MIN_DAILY_HOURS, limits.daily);
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
  const roundedWeeklyHours = roundCurrency(effectiveWeeklyHours);

  const fixedBreakdown = FIXED_BREAKDOWNS[safeInput.contractType];
  if (fixedBreakdown) {
    return calculateFixedQuote({
      breakdown: fixedBreakdown,
      monthlyHours,
      roundedMonthlyHours,
      roundedWeeklyHours,
    });
  }

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

  // Il netto riconosciuto alla collaboratrice è fisso a 9 €/h, quindi corrisponde
  // alla paga lorda oraria senza trattenere i contributi a suo carico.
  const pagaNettaLavoratore = pagaLordaLavoratore;

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
    weeklyHours: roundedWeeklyHours,
    monthlyHours: roundedMonthlyHours,
    serviceFeeHourly: roundCurrency(serviceFeeHourly),
    serviceFeeMonthly: roundCurrency(serviceFeeMonthly),
  };
}

function calculateFixedQuote({
  breakdown,
  monthlyHours,
  roundedMonthlyHours,
  roundedWeeklyHours,
}: {
  breakdown: FixedBreakdown;
  monthlyHours: number;
  roundedMonthlyHours: number;
  roundedWeeklyHours: number;
}): CalculatorOutput {
  const pagaNettaLavoratore = breakdown.hourlyNet * monthlyHours;
  const pagaLordaLavoratore = pagaNettaLavoratore;

  const indennitaTot = breakdown.hourlyAccruals * monthlyHours;
  const {
    indennitaFerie,
    indennitaTfr,
    indennitaTredicesima,
  } = splitAccruals(indennitaTot);

  const contributiTotDatore =
    breakdown.hourlyContributionsDatore * monthlyHours;
  const cassaPerHour = Math.min(
    CONTRIBUTION_RATES.cassaColf.employerPerHour,
    breakdown.hourlyContributionsDatore
  );
  const contributiColfDatore = cassaPerHour * monthlyHours;
  const contributiInpsDatore = contributiTotDatore - contributiColfDatore;

  const serviceFeeHourly = breakdown.hourlyServiceFee;
  const serviceFeeMonthly = serviceFeeHourly * monthlyHours;

  const costoTotaleDatore =
    pagaNettaLavoratore +
    contributiTotDatore +
    indennitaTot +
    serviceFeeMonthly;

  return {
    pagaLordaLavoratore: roundCurrency(pagaLordaLavoratore),
    contributiColfLavoratore: 0,
    contributiInpsLavoratore: 0,
    pagaNettaLavoratore: roundCurrency(pagaNettaLavoratore),
    contributiColfDatore: roundCurrency(contributiColfDatore),
    contributiInpsDatore: roundCurrency(contributiInpsDatore),
    indennitaTfr: roundCurrency(indennitaTfr),
    indennitaFerie: roundCurrency(indennitaFerie),
    indennitaTredicesima: roundCurrency(indennitaTredicesima),
    indennitaTot: roundCurrency(indennitaTot),
    costoTotaleDatore: roundCurrency(costoTotaleDatore),
    weeklyHours: roundedWeeklyHours,
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
