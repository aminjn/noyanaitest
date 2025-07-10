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
