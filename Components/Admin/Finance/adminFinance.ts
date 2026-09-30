export interface IFinanceUser {
  _id: string;
  phone?: string;
  username?: string;
  firstName?: string;
  lastName?: string;
}

export const userLabel = (u?: IFinanceUser | null) =>
  !u
    ? "—"
    : [u.firstName, u.lastName].filter(Boolean).join(" ") ||
      u.username ||
      u.phone ||
      u._id;

export const orderStatusDict: Record<string, string> = {
  pending: "در انتظار پرداخت",
  paid: "پرداخت‌شده",
  cancelled: "لغو شده",
};

export const paymentMethodDict: Record<string, string> = {
  wallet: "کیف پول",
  sep: "درگاه سپ",
};

export const paymentStatusDict: Record<string, string> = {
  created: "ایجاد شده",
  verifying: "در حال تأیید",
  paid: "موفق",
  failed: "ناموفق",
  reversed: "برگشت به کارت",
  needsReview: "نیازمند بررسی",
};

export const paymentPurposeDict: Record<string, string> = {
  walletCharge: "شارژ کیف پول",
  order: "پرداخت سفارش",
};

export const transactionKindDict: Record<string, string> = {
  withdrawal: "برداشت به حساب بانکی",
  gatewayPayment: "پرداخت درگاه",
  order: "سفارش فروشگاه",
  reservation: "نوبت",
  license: "اشتراک پزشک",
  pharmacyLicense: "اشتراک داروخانه",
  clinicLicense: "اشتراک کلینیک",
  paraClinicLicense: "اشتراک پاراکلینیک",
  hospitalLicense: "اشتراک بیمارستان",
  insuranceLicense: "اشتراک بیمه",
  checkout: "صورتحساب قدیمی",
  other: "سایر",
};

const failureReasonDict: Record<string, string> = {
  creditFailed: "واریز به کیف پول ناموفق بود",
  amountMismatch: "مبلغ یا ترمینال تأییدشده مغایرت داشت",
  verifyNoResponse: "درگاه به تأیید پاسخ نداد",
  expired: "منقضی شد",
  duplicateRefNum: "رسید تکراری بانک",
  terminalMismatch: "ترمینال پرداخت مغایرت داشت",
  tokenRequestFailed: "دریافت توکن از درگاه ناموفق بود",
  NoState: "درگاه وضعیتی برنگرداند",
};

export const failureReasonLabel = (reason?: string) =>
  !reason
    ? "—"
    : failureReasonDict[reason] ||
      (reason.startsWith("verify:")
        ? `تأیید ناموفق (کد ${reason.slice(7)})`
        : reason);
