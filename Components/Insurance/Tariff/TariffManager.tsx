"use client";

import useSWR from "swr";
import { API } from "@/Components/config";
import { fetcher } from "@/Components/helpers/fetcher";
import usePopup from "@/Components/Hooks/usePopup";
import useNotification from "@/Components/Hooks/useNotification";
import HandleLoading from "@/Components/Admin/UI/HandleLoading";
import WithTitle from "@/Components/Admin/UI/WithTitle";
import Table from "@/Components/Admin/UI/Table";
import TableActions from "@/Components/Admin/UI/TableActions";
import IconButton from "@/Components/Admin/UI/IconButton";
import CreateForm, { FormRenderer } from "@/Components/Admin/UI/CreateForm";
import PopupCard from "@/Components/UI/PopupCard";
import BooleanToIcon from "@/Components/UI/BooleanToIcon";
import EditIcon from "@/Components/Icons/EditIcon";
import GarbageIcon from "@/Components/Icons/GarbageIcon";
import {
  InsuranceTariff,
  TariffLevel,
  tariffLevels,
  TariffLimitPeriod,
  tariffLimitPeriods,
  TariffMethod,
  tariffMethods,
  TariffVisitKind,
  tariffVisitKinds,
} from "./tariffTypes";

// One tariff list for both editors (2026-10, «تعرفه‌ها»): the super admin's
// tab in the insurance hub (every insurer) and the insurer's own panel
// (its rules, for its plans). The caller passes its texts - the admin's
// ta() and the panel's message keys - and its API base.

export type TariffTexts = {
  title: string;
  newTariff: string;
  editTariff: string;
  insurer: string;
  plan: string;
  allPlans: string;
  ruleTitle: string;
  visitKind: string;
  visitKinds: Record<TariffVisitKind, string>;
  level: string;
  levels: Record<TariffLevel, string>;
  speciality: string;
  service: string;
  method: string;
  methods: Record<TariffMethod, string>;
  percent: string;
  amount: string;
  govTariff: string;
  ceiling: string;
  copay: string;
  limitPeriod: string;
  limitPeriods: Record<TariffLimitPeriod, string>;
  limitCount: string;
  limitAmount: string;
  validFrom: string;
  validTo: string;
  active: string;
  note: string;
  pays: string;
  appliesTo: string;
  validity: string;
  status: string;
  actions: string;
  edit: string;
  remove: string;
  always: string;
  noLimit: string;
  hintPercent: string;
  hintGovTariff: string;
  hintCeiling: string;
  hintCopay: string;
  hintLimit: string;
  intro: string;
  // "70٪", "70٪ of tariff 450,000", "450,000 toman"
  payPercent: (percent: string) => string;
  payGov: (percent: string, tariff: string) => string;
  payFixed: (amount: string) => string;
  limitText: (period: string, count: string, amount: string) => string;
  range: (from: string, to: string) => string;
  // validation, in the editor's language
  errPercent: string;
  errFixed: string;
  errGov: string;
  errDates: string;
  errLimit: string;
  errInsurer: string;
};

const idOf = (v: unknown) => (v && typeof v === "object" ? String((v as { _id?: unknown })._id || "") : v ? String(v) : "");
const nameOf = (v: unknown) => (v && typeof v === "object" ? String((v as { name?: unknown }).name || "") : "");
const asList = (res: unknown) => {
  const d = (res as { data?: unknown })?.data;
  const inner = Array.isArray(d) ? d : (d as { data?: unknown })?.data;
  return Array.isArray(inner) ? inner : [];
};

const TariffPopup = ({
  api,
  admin,
  text,
  node,
  onDone,
}: {
  api: string;
  admin: boolean;
  text: TariffTexts;
  node?: InsuranceTariff;
  onDone: () => unknown;
}) => {
  const { closePopup } = usePopup();
  const options = <T extends string>(keys: readonly T[], labels: Record<T, string>) =>
    Object.fromEntries(keys.map((k) => [k, labels[k]])) as Record<string, string>;
  const pick = (getLabel = nameOf) => ({
    getOptionLabel: (n: unknown) => getLabel(n) || "—",
    getOptionValue: (n: unknown) => idOf(n),
    clearable: true,
  });
  const renderer: FormRenderer<InsuranceTariff> = {
    ...(admin
      ? {
          insurance: {
            type: "nodes" as const,
            title: text.insurer,
            required: true,
            path: `${API}/public/insurance`,
            ...pick(),
            getDefaultValue: (n: InsuranceTariff) => idOf(n.insurance),
          },
        }
      : {}),
    plan: {
      type: "nodes",
      title: text.plan,
      hint: text.allPlans,
      // the plans of the insurer picked (the panel: its own)
      path: (v: Partial<InsuranceTariff>) => `${api}/plans${admin ? `?insurance=${idOf(v.insurance)}` : ""}`,
      dataParser: asList,
      ...pick(),
      getDefaultValue: (n: InsuranceTariff) => idOf(n.plan) || undefined,
    },
    title: { type: "text", title: text.ruleTitle },
    visitKind: { type: "select", title: text.visitKind, options: options(tariffVisitKinds, text.visitKinds) },
    level: { type: "select", title: text.level, options: options(tariffLevels, text.levels) },
    speciality: {
      type: "nodes",
      title: text.speciality,
      path: `${API}/public/speciality`,
      dataParser: asList,
      ...pick(),
      getDefaultValue: (n: InsuranceTariff) => idOf(n.speciality) || undefined,
    },
    service: {
      type: "nodes",
      title: text.service,
      path: `${API}/public/service`,
      dataParser: asList,
      ...pick(),
      getDefaultValue: (n: InsuranceTariff) => idOf(n.service) || undefined,
    },
    method: { type: "select", title: text.method, required: true, options: options(tariffMethods, text.methods) },
    percent: { type: "number", title: text.percent, hint: text.hintPercent },
    govTariff: { type: "number", price: true, title: text.govTariff, hint: text.hintGovTariff },
    amount: { type: "number", price: true, title: text.amount },
    ceiling: { type: "number", price: true, title: text.ceiling, hint: text.hintCeiling },
    copay: { type: "number", price: true, title: text.copay, hint: text.hintCopay },
    limitPeriod: { type: "select", title: text.limitPeriod, options: options(tariffLimitPeriods, text.limitPeriods), hint: text.hintLimit },
    limitCount: { type: "number", title: text.limitCount },
    limitAmount: { type: "number", price: true, title: text.limitAmount },
    validFrom: { type: "date", title: text.validFrom },
    validTo: { type: "date", title: text.validTo },
    active: { type: "bool", title: text.active },
    note: { type: "area", title: text.note },
  } as FormRenderer<InsuranceTariff>;
  const value = <K extends keyof InsuranceTariff>(input: Partial<InsuranceTariff>, k: K) =>
    input[k] !== undefined ? input[k] : node?.[k];
  return (
    <PopupCard title={node ? text.editTariff : text.newTariff}>
      <CreateForm<InsuranceTariff>
        defaultValue={
          (node || { method: "percent", visitKind: "any", level: "any", limitPeriod: "none", active: true }) as InsuranceTariff
        }
        renderer={renderer}
        onCancel={() => closePopup()}
        hookProps={{
          path: node ? `${api}/${node._id}` : api,
          method: node ? "PATCH" : "POST",
          parser: "JSON",
          hasProblem: (input) => {
            const method = (value(input, "method") || "percent") as TariffMethod;
            const pct = Number(value(input, "percent")) || 0;
            if (admin && !idOf(value(input, "insurance"))) return text.errInsurer;
            if (method === "percent" && (pct <= 0 || pct > 100)) return text.errPercent;
            if (method === "fixed" && !(Number(value(input, "amount")) > 0)) return text.errFixed;
            if (method === "govTariff" && (!(Number(value(input, "govTariff")) > 0) || pct <= 0 || pct > 100)) return text.errGov;
            const from = value(input, "validFrom");
            const to = value(input, "validTo");
            if (from && to && new Date(String(to)).getTime() < new Date(String(from)).getTime()) return text.errDates;
            const period = (value(input, "limitPeriod") || "none") as TariffLimitPeriod;
            if (period !== "none" && !(Number(value(input, "limitCount")) > 0) && !(Number(value(input, "limitAmount")) > 0)) return text.errLimit;
            return false;
          },
          successCb: () => {
            closePopup();
            onDone();
          },
        }}
      />
    </PopupCard>
  );
};

const TariffManager = ({
  api,
  admin = false,
  text,
  money,
  date,
}: {
  // ".../admin/insurance-tariffs" or ".../insurance/tariff"
  api: string;
  admin?: boolean;
  text: TariffTexts;
  money: (n: number) => string;
  date: (d: string) => string;
}) => {
  const { setPopup } = usePopup();
  const pushNotification = useNotification();
  const { data, error, mutate } = useSWR<InsuranceTariff[]>(api, (url: string) =>
    fetcher({ url }).then((res) => (Array.isArray(res?.data) ? res.data : [])),
  );
  const open = (node?: InsuranceTariff) =>
    setPopup("InsuranceTariff", <TariffPopup api={api} admin={admin} text={text} node={node} onDone={() => mutate()} />);
  const remove = async (id: string) => {
    try {
      await fetcher({ url: `${api}/${id}`, method: "DELETE" });
      mutate();
    } catch (err) {
      pushNotification((err as Error)?.message || "", "Error");
    }
  };
  const pays = (n: InsuranceTariff) => {
    const pct = `${Number(n.percent) || 0}`;
    const main =
      n.method === "fixed"
        ? text.payFixed(money(Number(n.amount) || 0))
        : n.method === "govTariff"
          ? text.payGov(pct, money(Number(n.govTariff) || 0))
          : text.payPercent(pct);
    return main;
  };
  const applies = (n: InsuranceTariff) =>
    [
      nameOf(n.plan) || text.allPlans,
      text.visitKinds[(n.visitKind || "any") as TariffVisitKind],
      nameOf(n.speciality) || (n.level && n.level !== "any" ? text.levels[n.level as TariffLevel] : ""),
      nameOf(n.service),
    ]
      .filter(Boolean)
      .join(" · ");
  const limit = (n: InsuranceTariff) =>
    !n.limitPeriod || n.limitPeriod === "none"
      ? text.noLimit
      : text.limitText(
          text.limitPeriods[n.limitPeriod as TariffLimitPeriod],
          n.limitCount ? String(n.limitCount) : "—",
          n.limitAmount ? money(n.limitAmount) : "—",
        );
  return (
    <HandleLoading data={!!data} error={error}>
      {!!data && (
        <WithTitle title={text.title} description={text.intro} actions={[{ title: text.newTariff, action: () => open() }]}>
          <Table
            name={admin ? "AdminInsuranceTariffs" : "InsurerTariffs"}
            data={data}
            renderer={{
              ...(admin
                ? {
                    insurance: { name: text.insurer, value: (n: InsuranceTariff) => nameOf(n.insurance) || "—", filter: "Set" },
                  }
                : {}),
              title: { name: text.ruleTitle, value: (n: InsuranceTariff) => n.title || "—", filter: "Text" },
              appliesTo: { name: text.appliesTo, value: applies, filter: "Text" },
              pays: { name: text.pays, value: pays, filter: "Text" },
              ceiling: {
                name: text.ceiling,
                value: (n: InsuranceTariff) => Number(n.ceiling) || 0,
                component: (n: InsuranceTariff) => (n.ceiling ? money(n.ceiling) : "—"),
                filter: "Number",
              },
              copay: {
                name: text.copay,
                value: (n: InsuranceTariff) => Number(n.copay) || 0,
                component: (n: InsuranceTariff) => (n.copay ? money(n.copay) : "—"),
                filter: "Number",
              },
              limit: { name: text.limitPeriod, value: limit, filter: "Text" },
              validity: {
                name: text.validity,
                value: (n: InsuranceTariff) =>
                  n.validFrom || n.validTo ? text.range(n.validFrom ? date(n.validFrom) : "…", n.validTo ? date(n.validTo) : "…") : text.always,
                filter: "Text",
              },
              active: {
                name: text.status,
                value: (n: InsuranceTariff) => (n.active ? text.active : "—"),
                component: (n: InsuranceTariff) => <BooleanToIcon value={!!n.active} />,
                filter: "Set",
              },
              actions: {
                name: text.actions,
                component: (n: InsuranceTariff) => (
                  <TableActions>
                    <IconButton title={text.edit} onClick={() => open(n)}>
                      <EditIcon />
                    </IconButton>
                    <IconButton title={text.remove} variant="Danger" onClick={() => remove(n._id)}>
                      <GarbageIcon />
                    </IconButton>
                  </TableActions>
                ),
              },
            }}
          />
        </WithTitle>
      )}
    </HandleLoading>
  );
};

export default TariffManager;
