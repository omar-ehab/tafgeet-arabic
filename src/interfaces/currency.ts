export interface Currencies {
  SDG: Currency,
  SAR: Currency,
  QAR: Currency,
  AED: Currency,
  EGP: Currency,
  USD: Currency,
  AUD: Currency,
  TND: Currency,
  TRY: Currency,
}
export interface Currency {
  singular: string,
  plural: string,
  fraction: string,
  fractions: string,
  decimals: number,
}