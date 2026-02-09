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
      (365 * 24 * 60 * 60 * 1000)
  );

export const clamp = (min: number, val: number, max: number): number =>
  Math.min(max, Math.max(val, min));
