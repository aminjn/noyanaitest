import { useCallback, useMemo } from "react";
import useScopedLocale from "@/Components/Hooks/useScopedLocale";
import { ContentNamespace } from "@/Components/Enums/contentNamespaces";
import { useIntlLocale } from "@/Components/i18n/navigation";

const LOCALE_NS: ContentNamespace[] = ["sharedLicense"];

// "1 month", "3 months", "1 year", "45 days" from a period in days - whole
// years and 30-day months read as such, anything else in days
export const periodParts = (days: number) =>
  days % 365 === 0
    ? { unit: "years" as const, count: days / 365 }
    : days % 30 === 0
      ? { unit: "months" as const, count: days / 30 }
      : { unit: "days" as const, count: days };

const useLicensePeriodLabel = () => {
  const getContent = useScopedLocale(LOCALE_NS);
  const intlTag = useIntlLocale();
  const num = useMemo(() => new Intl.NumberFormat(intlTag), [intlTag]);
  return useCallback(
    (days?: number | null) => {
      if (!days || days <= 0) return "";
      const { unit, count } = periodParts(days);
      const key =
        unit === "years"
          ? "licensePeriodYears"
          : unit === "months"
            ? "licensePeriodMonths"
            : "licensePeriodDays";
      return getContent(key, [num.format(count)]);
    },
    [getContent, num],
  );
};

export default useLicensePeriodLabel;
