export type ContractType = "convivente" | "non_convivente";

export type RoleSelection = {
  colf: true;
  babysitter: boolean;
  badante: boolean;
};

export interface CalculatorInput {
  contractType: ContractType;
  roleSelections: RoleSelection;
  dailyHours: number;
  daysPerWeek: number;
  duration: "indeterminato";
}

export interface CalculatorOutput {
  pagaLordaLavoratore: number;
  contributiColfLavoratore: number;
  contributiInpsLavoratore: number;
  pagaNettaLavoratore: number;
  contributiColfDatore: number;
  contributiInpsDatore: number;
  indennitaTfr: number;
  indennitaFerie: number;
  indennitaTredicesima: number;
  indennitaTot: number;
  costoTotaleDatore: number;
  weeklyHours: number;
  monthlyHours: number;
  serviceFeeHourly: number;
  serviceFeeMonthly: number;
}

export const BASE_HOURLY_RATE = 9; // € / ora
export const WEEKS_PER_MONTH = 4.33;

export const CONTRACT_LIMITS: Record<
  ContractType,
  { daily: number; weekly: number }
> = {
  convivente: { daily: 10, weekly: 54 },
  non_convivente: { daily: 8, weekly: 40 },
};

export const BAZE_FEE = {
  high: 1,
  low: 0.7,
  thresholdHours: 25,
} as const;

export type FixedBreakdown = {
  hourlyNet: number;
  hourlyContributionsDatore: number;
  hourlyAccruals: number;
  hourlyServiceFee: number;
};

export const FIXED_BREAKDOWNS: Partial<Record<ContractType, FixedBreakdown>> = {
  non_convivente: {
    hourlyNet: 9,
    hourlyContributionsDatore: 1.22,
    hourlyAccruals: 2.31,
    hourlyServiceFee: 1,
  },
  convivente: {
    hourlyNet: 5.98,
    hourlyContributionsDatore: 1.27,
    hourlyAccruals: 1.75,
    hourlyServiceFee: 1,
  },
};

export const CONTRIBUTION_RATES = {
  inps: {
    worker: 0.073,
    employer: 0.13,
  },
  cassaColf: {
    workerPerHour: 0.02,
    employerPerHour: 0.04,
  },
};

export const ACCRUAL_RATES = {
  tfr: 0.072,
  ferie: 0.083,
  tredicesima: 0.083,
};
