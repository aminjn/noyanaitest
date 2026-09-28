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
