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

export function numberToPersianWords(num: number): string {
  if (num === 0) return "صفر";

  const yekan = [
    "",
    "یک",
    "دو",
    "سه",
    "چهار",
    "پنج",
    "شش",
    "هفت",
    "هشت",
    "نه",
    "ده",
    "یازده",
    "دوازده",
    "سیزده",
    "چهارده",
    "پانزده",
    "شانزده",
    "هفده",
    "هجده",
    "نوزده",
  ];

  const dahgan = [
    "",
    "",
    "بیست",
    "سی",
    "چهل",
    "پنجاه",
    "شصت",
    "هفتاد",
    "هشتاد",
    "نود",
  ];

  const sadgan = [
    "",
    "یکصد",
    "دویست",
    "سیصد",
    "چهارصد",
    "پانصد",
    "ششصد",
    "هفتصد",
    "هشتصد",
    "نهصد",
  ];

  const units = ["", "هزار", "میلیون", "میلیارد", "تریلیون"];

  function threeDigitsToWord(n: number): string {
    const res: string[] = [];
    if (n >= 100) {
      res.push(sadgan[Math.floor(n / 100)]);
      n %= 100;
    }
    if (n >= 20) {
      res.push(dahgan[Math.floor(n / 10)]);
      if (n % 10 > 0) res.push(yekan[n % 10]);
    } else if (n > 0) {
      res.push(yekan[n]);
    }
    return res.join(" و ");
  }

  const res: string[] = [];
  let i = 0;

  while (num > 0) {
    const part = num % 1000;
    if (part > 0) {
      let chunk = threeDigitsToWord(part);
      if (units[i]) chunk += " " + units[i];
      res.unshift(chunk);
    }
    num = Math.floor(num / 1000);
    i++;
  }

  return res.join(" و ").trim();
}
