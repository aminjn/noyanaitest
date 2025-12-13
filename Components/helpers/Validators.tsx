export const isMobile = (val: unknown) =>
  String(val) &&
  Number(val) &&
  !(Number(val) % 1) &&
  String(Number(val)).length === 10 &&
  String(val).startsWith("9");

export const isOTP = (val: unknown) =>
  String(val) &&
  Number(val) &&
  !(Number(val) % 1) &&
  Number(val) >= 0 &&
  String(val).length === 6;

export const isNormalName = (val: unknown) =>
  !!val && String(val).trim().length >= 3;

export const validateNumber = (
  val: unknown,
  {
    min = 0,
    max = Number.MAX_SAFE_INTEGER,
    integer = true,
  }: { min?: number; max?: number; integer?: boolean } = {}
) =>
  val !== undefined &&
  !isNaN(Number(val)) &&
  Number(val) >= min &&
  Number(val) <= max &&
  (!integer || !(Number(val) % 1));

export const isPositiveInt = (value: unknown) =>
  Number.isInteger(value) && Number(value) > 0;

export const isSSID = (val: unknown): boolean => {
  let code = String(val);
  const L = code.length;
  if (L < 8 || parseInt(code, 10) === 0) return false;
  code = ("0000" + code).substr(L + 4 - 10);
  if (parseInt(code.substr(3, 6), 10) === 0) return false;
  const c = parseInt(code.substr(9, 1), 10);
  let s = 0;
  for (let i = 0; i < 9; i++) s += parseInt(code.substr(i, 1), 10) * (10 - i);
  s = s % 11;
  return (s < 2 && c === s) || (s >= 2 && c === 11 - s);
};
