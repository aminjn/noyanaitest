export const convertPersianToEnglishDigits = (str: string) =>
  str.replace(/[۰-۹]/g, (d) => String.fromCharCode(d.charCodeAt(0) - 1728));

export function range(x: number, y: number): number[] {
  const length = y - x + 1;
  return Array.from({ length }, (_, i) => x + i);
}

export const getSessionDateKey = (date: Date): string =>
  new Date(date).toISOString().split("T")[0];

export const calculateAge = (born: Date): number =>
  Math.floor(
    (new Date().getTime() - new Date(born).getTime()) /
      (365 * 24 * 60 * 60 * 1000),
  );

export const clamp = (min: number, val: number, max: number): number =>
  Math.min(max, Math.max(val, min));

export const chunk = <T,>(arr: T[], size = 3): T[][] =>
  Array.from({ length: Math.ceil(arr.length / size) }, (_, i) =>
    arr.slice(i * size, i * size + size),
  );

const rtf = new Intl.RelativeTimeFormat("fa", { numeric: "auto" });

export const getRelativeTime = (date: Date) => {
  const diff = new Date(date).getTime() - new Date().getTime();

  const units = [
    ["year", 1000 * 60 * 60 * 24 * 365],
    ["month", 1000 * 60 * 60 * 24 * 30],
    ["week", 1000 * 60 * 60 * 24 * 7],
    ["day", 1000 * 60 * 60 * 24],
    ["hour", 1000 * 60 * 60],
    ["minute", 1000 * 60],
    ["second", 1000],
  ] as const;

  for (const [unit, ms] of units) {
    if (Math.abs(diff) >= ms || unit === "second") {
      return rtf.format(Math.round(diff / ms), unit);
    }
  }
};
