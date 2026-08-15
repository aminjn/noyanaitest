export const currencize = (number: string | number): string =>
  number?.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
