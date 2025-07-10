export const convertPersianToEnglishDigits = (str: string) =>
  str.replace(/[۰-۹]/g, (d) => String.fromCharCode(d.charCodeAt(0) - 1728));
