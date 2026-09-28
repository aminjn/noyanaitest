// 1234567 -> "1,234,567". A missing / non-numeric amount (a record without
// the field) shows a dash instead of the text "undefined" / "NaN".
export const currencize = (number?: string | number | null): string => {
  if (number === undefined || number === null || number === "") return "—";
  const text = number.toString();
  if (text === "NaN" || text === "undefined") return "—";
  return text.replace(/\B(?=(\d{3})+(?!\d))/g, ",");
};
