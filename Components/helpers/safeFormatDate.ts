// Intl.DateTimeFormat#format throws a RangeError on an invalid date, which
// takes the whole page down when one record has a missing or malformed date
// field. This formats what it can and falls back to a dash otherwise.
export const safeFormatDate = (
  format: Intl.DateTimeFormat,
  value: unknown,
  fallback = "—",
) => {
  if (value === null || value === undefined || value === "") return fallback;
  const date =
    value instanceof Date ? value : new Date(value as string | number);
  return isNaN(date.getTime()) ? fallback : format.format(date);
};

// "Month year" in reading order. ICU gives fa-IR "۱۴۰۵ مهر" (year first);
// Persian, Arabic and Urdu readers say "مهر ۱۴۰۵". Other languages keep
// ICU's own order.
export const formatMonthYear = (intlTag: string, value: unknown, fallback = "—") => {
  if (value === null || value === undefined || value === "") return fallback;
  const date = value instanceof Date ? value : new Date(value as string | number);
  if (isNaN(date.getTime())) return fallback;
  const fmt = new Intl.DateTimeFormat(intlTag, { year: "numeric", month: "long" });
  if (!/^(fa|ar|ur)\b/.test(intlTag)) return fmt.format(date);
  const parts = fmt.formatToParts(date);
  const month = parts.find((p) => p.type === "month")?.value || "";
  const year = parts.find((p) => p.type === "year")?.value || "";
  return `${month} ${year}`.trim();
};
