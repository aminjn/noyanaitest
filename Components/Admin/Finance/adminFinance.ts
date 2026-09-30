import { ta } from "@/Components/Admin/i18n/adminText";
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
  get pending() {
  return ta("در انتظار پرداخت");
},
  get paid() {
  return ta("پرداخت‌شده");
},
  get cancelled() {
  return ta("لغو شده");
},
};

export const paymentMethodDict: Record<string, string> = {
  get wallet() {
  return ta("کیف پول");
},
  get sep() {
  return ta("درگاه سپ");
},
};

export const paymentStatusDict: Record<string, string> = {
  get created() {
  return ta("ایجاد شده");
},
  get verifying() {
  return ta("در حال تأیید");
},
  get paid() {
  return ta("موفق");
},
  get failed() {
  return ta("ناموفق");
},
  get reversed() {
  return ta("برگشت به کارت");
},
  get needsReview() {
  return ta("نیازمند بررسی");
},
};

export const paymentPurposeDict: Record<string, string> = {
  get walletCharge() {
  return ta("شارژ کیف پول");
},
  get order() {
  return ta("پرداخت سفارش");
},
};

export const transactionKindDict: Record<string, string> = {
  get withdrawal() {
  return ta("برداشت به حساب بانکی");
},
  get gatewayPayment() {
  return ta("پرداخت درگاه");
},
  get order() {
  return ta("سفارش فروشگاه");
},
  get reservation() {
  return ta("نوبت");
},
  get license() {
  return ta("اشتراک پزشک");
},
  get pharmacyLicense() {
  return ta("اشتراک داروخانه");
},
  get clinicLicense() {
  return ta("اشتراک کلینیک");
},
  get paraClinicLicense() {
  return ta("اشتراک پاراکلینیک");
},
  get hospitalLicense() {
  return ta("اشتراک بیمارستان");
},
  get insuranceLicense() {
  return ta("اشتراک بیمه");
},
  get checkout() {
  return ta("صورتحساب قدیمی");
},
  get other() {
  return ta("سایر");
},
};

const failureReasonDict: Record<string, string> = {
  get creditFailed() {
  return ta("واریز به کیف پول ناموفق بود");
},
  get amountMismatch() {
  return ta("مبلغ یا ترمینال تأییدشده مغایرت داشت");
},
  get verifyNoResponse() {
  return ta("درگاه به تأیید پاسخ نداد");
},
  get expired() {
  return ta("منقضی شد");
},
  get duplicateRefNum() {
  return ta("رسید تکراری بانک");
},
  get terminalMismatch() {
  return ta("ترمینال پرداخت مغایرت داشت");
},
  get tokenRequestFailed() {
  return ta("دریافت توکن از درگاه ناموفق بود");
},
  get NoState() {
  return ta("درگاه وضعیتی برنگرداند");
},
};

export const failureReasonLabel = (reason?: string) =>
  !reason
    ? "—"
    : failureReasonDict[reason] ||
      (reason.startsWith("verify:")
        ? ta("تأیید ناموفق (کد ${1})", [reason.slice(7)])
        : reason);
