"use client";

import { createContext, useContext, useMemo } from "react";
import useSWR from "swr";
import { API } from "@/Components/config";
import { fetcher } from "@/Components/helpers/fetcher";
import useScopedLocale from "@/Components/Hooks/useScopedLocale";
import { useIntlLocale } from "@/Components/i18n/navigation";
import { ContentNamespace } from "@/Components/Enums/contentNamespaces";
import { asArray } from "../bizShared";

// Shared bits of the Noyan Business payroll page (2026-10): which API it
// talks to (/<panel>/payroll), whether the viewer may write, the texts and
// the Jalali month label (Iranian payroll runs by the Jalali month, whatever
// language the page is read in).

export const PAY_NS: ContentNamespace[] = ["common", "bizAccounting", "bizPayroll"];
export const usePayText = () => useScopedLocale(PAY_NS);

export type PayEmployee = {
  _id: string;
  name: string;
  nationalId?: string;
  mobile?: string;
  position?: string;
  hireDate?: string;
  endDate?: string;
  baseSalary: number;
  housing: boolean;
  food: boolean;
  children: number;
  insured: boolean;
  insuranceNo?: string;
  taxable: boolean;
  iban?: string;
  isActive: boolean;
  note?: string;
  // for the Tamin list disk
  firstName?: string;
  lastName?: string;
  fatherName?: string;
  idNumber?: string;
  idPlace?: string;
  birthDate?: string;
  gender?: "male" | "female";
  nationality?: string;
  jobCode?: string;
};

export type PayBonusSlip = {
  employee: string;
  name: string;
  days: number;
  baseSalary: number;
  eid: number;
  severance: number;
  tax: number;
  deductions: number;
  net: number;
};

export type PayBonusRun = {
  _id: string;
  year: number;
  yearDays: number;
  status: "draft" | "posted";
  slips: PayBonusSlip[];
  totals: { eid: number; severance: number; tax: number; deductions: number; net: number };
  date?: string;
  postedAt?: string;
  salariesPaidAt?: string;
  liabilitiesPaidAt?: string;
  createdAt?: string;
};

export type PaySlip = {
  employee: string;
  name: string;
  nationalId?: string;
  insuranceNo?: string;
  position?: string;
  workedDays: number;
  overtimeHours: number;
  otherEarnings: number;
  deductions: number;
  baseSalary: number;
  base: number;
  housing: number;
  food: number;
  child: number;
  overtime: number;
  gross: number;
  insuranceBase: number;
  insuranceEmployee: number;
  insuranceEmployer: number;
  taxableBase: number;
  tax: number;
  net: number;
};

type Acc = { _id: string; code: string; name: string } | null;

export type PayRun = {
  _id: string;
  year: number;
  month: number;
  periodStart: string;
  periodEnd: string;
  status: "draft" | "posted";
  slips?: PaySlip[];
  totals: { gross: number; insuranceEmployee: number; insuranceEmployer: number; tax: number; deductions: number; net: number };
  postedAt?: string;
  salariesPaidAt?: string;
  salariesVia?: Acc;
  liabilitiesPaidAt?: string;
  liabilitiesVia?: Acc;
};

export type PayYear = {
  year: number;
  minWage: number;
  housing: number;
  food: number;
  childAllowance: number;
  employeeInsuranceRate: number;
  employerInsuranceRate: number;
  insuranceCeilingMultiplier: number;
  overtimeMultiplier: number;
  monthHours: number;
  taxExemption: number;
  brackets: { upTo: number | null; rate: number }[];
};

type Ctx = { api: string; canWrite: boolean };
export const PayContext = createContext<Ctx>({ api: "", canWrite: false });
export const usePay = () => useContext(PayContext);

export const usePayEmployees = () => {
  const { api } = usePay();
  return useSWR<PayEmployee[]>(`${API}${api}/employees`, (url: string) =>
    fetcher({ url }).then((res) => asArray<PayEmployee>(res.data)),
  );
};

export const usePayAccounts = () => {
  const { api } = usePay();
  return useSWR<{ _id: string; code: string; name: string }[]>(`${API}${api}/pay-accounts`, (url: string) =>
    fetcher({ url }).then((res) => asArray<{ _id: string; code: string; name: string }>(res.data)),
  );
};

// "Mehr 1405" in the reader's language. A run carries its first day; a
// month not made yet is found from the year's Nowruz (about 21 March).
export const useJalaliMonth = () => {
  const tag = useIntlLocale();
  return useMemo(() => {
    const fmt = new Intl.DateTimeFormat(`${tag}-u-ca-persian`, { month: "long", year: "numeric" });
    const monthOnly = new Intl.DateTimeFormat(`${tag}-u-ca-persian`, { month: "long" });
    const approx = (year: number, month: number) =>
      new Date(Date.UTC(year + 621, 2, 21 + Math.round((month - 1) * 30.6) + 14));
    return {
      label: (run: { periodStart?: string; year: number; month: number }) => {
        const d = run.periodStart ? new Date(new Date(run.periodStart).getTime() + 10 * 864e5) : approx(run.year, run.month);
        return Number.isNaN(d.getTime()) ? `${run.year}/${run.month}` : fmt.format(d);
      },
      monthName: (year: number, month: number) => monthOnly.format(approx(year, month)),
    };
  }, [tag]);
};

export const toNum = (s: string | number) => Number(String(s).replace(/[^\d.]/g, "")) || 0;
