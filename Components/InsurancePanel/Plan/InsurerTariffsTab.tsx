"use client";

import { useMemo } from "react";
import { API } from "@/Components/config";
import useScopedLocale from "@/Components/Hooks/useScopedLocale";
import { useIntlLocale } from "@/Components/i18n/navigation";
import { ContentNamespace } from "@/Components/Enums/contentNamespaces";
import { TEHRAN_TZ } from "@/Components/helpers/tehranTime";
import TariffManager, { TariffTexts } from "@/Components/Insurance/Tariff/TariffManager";

const NS: ContentNamespace[] = ["common", "insurerPanel"];

// The insurer's own tariffs (2026-10, «تعرفه‌ها»): its coverage rules per
// plan and visit; every booking quote on Noyan reads them.
const InsurerTariffsTab = () => {
  const getContent = useScopedLocale(NS);
  const intlTag = useIntlLocale();
  const nf = useMemo(() => new Intl.NumberFormat(intlTag), [intlTag]);
  const df = useMemo(() => new Intl.DateTimeFormat(intlTag, { timeZone: TEHRAN_TZ, year: "numeric", month: "short", day: "numeric" }), [intlTag]);
  const text: TariffTexts = {
    title: getContent("insTariffs"),
    newTariff: getContent("insTariffNew"),
    editTariff: getContent("insTariffEdit"),
    insurer: "",
    plan: getContent("insTariffPlan"),
    allPlans: getContent("insTariffAllPlans"),
    ruleTitle: getContent("insTariffRuleTitle"),
    target: getContent("insTariffTarget"),
    targets: { visit: getContent("insTariffTargetVisit"), drug: getContent("insTariffTargetDrug"), lab: getContent("insTariffTargetLab") },
    hintTarget: getContent("insTariffTargetHint"),
    productCategory: getContent("insTariffProductCategory"),
    testCategory: getContent("insTariffTestCategory"),
    rxOnly: getContent("insTariffRxOnly"),
    visitKind: getContent("insTariffVisitKind"),
    visitKinds: { any: getContent("insTariffVisitAny"), inPerson: getContent("insTariffVisitInPerson"), online: getContent("insTariffVisitOnline") },
    level: getContent("insTariffLevel"),
    levels: {
      any: getContent("insTariffLevelAny"),
      general: getContent("insTariffLevelGeneral"),
      specialist: getContent("insTariffLevelSpecialist"),
      subspecialist: getContent("insTariffLevelSub"),
    },
    speciality: getContent("insTariffSpeciality"),
    service: getContent("insTariffService"),
    servicePackage: getContent("insTariffPackage"),
    catalogHint: getContent("insTariffCatalogHint"),
    method: getContent("insTariffMethod"),
    methods: { percent: getContent("insTariffMethodPercent"), govTariff: getContent("insTariffMethodGov"), fixed: getContent("insTariffMethodFixed") },
    percent: getContent("insTariffPercent"),
    amount: getContent("insTariffAmount"),
    govTariff: getContent("insTariffGov"),
    ceiling: getContent("insTariffCeiling"),
    copay: getContent("insTariffCopay"),
    limitPeriod: getContent("insTariffLimitPeriod"),
    limitPeriods: { none: getContent("insTariffLimitNone"), month: getContent("insTariffLimitMonth"), year: getContent("insTariffLimitYear") },
    limitCount: getContent("insTariffLimitCount"),
    limitAmount: getContent("insTariffLimitAmount"),
    validFrom: getContent("insTariffValidFrom"),
    validTo: getContent("insTariffValidTo"),
    active: getContent("insTariffActive"),
    note: getContent("insTariffNote"),
    pays: getContent("insTariffPays"),
    appliesTo: getContent("insTariffAppliesTo"),
    validity: getContent("insTariffValidity"),
    status: getContent("insTariffStatus"),
    actions: getContent("actions"),
    edit: getContent("insTariffEdit"),
    remove: getContent("delete"),
    always: getContent("insTariffAlways"),
    noLimit: getContent("insTariffNoLimit"),
    hintPercent: getContent("insTariffHintPercent"),
    hintGovTariff: getContent("insTariffHintGov"),
    hintCeiling: getContent("insTariffHintCeiling"),
    hintCopay: getContent("insTariffHintCopay"),
    hintLimit: getContent("insTariffHintLimit"),
    intro: getContent("insTariffIntro"),
    payPercent: (p) => getContent("insTariffPayPercent", [p]),
    payGov: (p, t) => getContent("insTariffPayGov", [p, t]),
    payFixed: (a) => getContent("insTariffPayFixed", [a]),
    limitText: (period, count, amount) => getContent("insTariffLimitText", [period, count, amount]),
    range: (from, to) => getContent("insTariffRange", [from, to]),
    errPercent: getContent("insTariffErrPercent"),
    errFixed: getContent("insTariffErrFixed"),
    errGov: getContent("insTariffErrGov"),
    errDates: getContent("insTariffErrDates"),
    errLimit: getContent("insTariffErrLimit"),
    errInsurer: "",
  };
  return (
    <TariffManager
      api={`${API}/insurance/tariff`}
      text={text}
      money={(n) => nf.format(n)}
      date={(d) => df.format(new Date(d))}
    />
  );
};

export default InsurerTariffsTab;
