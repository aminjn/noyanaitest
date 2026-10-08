import { adminIntlTag, ta } from "@/Components/Admin/i18n/adminText";
import { fromTehranWallClock, TEHRAN_TZ } from "@/Components/helpers/tehranTime";
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
  get adminAdjustment() {
  return ta("اصلاح دستی کیف پول");
},
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
  get smsCampaign() {
    return ta("کمپین پیامکی");
  },
  get smsAutomation() {
    return ta("پیامک خودکار ارتباط با بیماران");
  },
  get smsMessage() {
    return ta("پیامک تکی به بیمار");
  },
  get proPlan() {
    return ta("اشتراک پرو");
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

// per-line fulfilment state of an order (set by the seller, or by support)
export const lineStatusDict: Record<string, string> = {
  get pending() {
    return ta("در انتظار فروشنده");
  },
  get fulfilled() {
    return ta("تحویل شده");
  },
  get cancelled() {
    return ta("لغو شده");
  },
};

export const lineModelDict: Record<string, string> = {
  get products() {
    return ta("کالا");
  },
  get productPackages() {
    return ta("بسته‌ی کالا");
  },
  get services() {
    return ta("خدمت");
  },
  get servicePackages() {
    return ta("بسته‌ی خدمت");
  },
  get tests() {
    return ta("آزمایش");
  },
};

export const shipmentMethodDict: Record<string, string> = {
  get tapsi() {
    return ta("تپسی (درون‌شهری)");
  },
  get tipax() {
    return ta("تیپاکس (پس‌کرایه)");
  },
};

// Snapp Box ride states (Lib/snappClient.ts snappRideStates)
const snappStateDict: Record<string, string> = {
  get started() {
    return ta("در جستجوی پیک");
  },
  get accepted() {
    return ta("پیک پذیرفت");
  },
  get arrived() {
    return ta("پیک در مبدأ");
  },
  get boarded() {
    return ta("مرسوله تحویل پیک شد");
  },
  get finished() {
    return ta("تحویل شد");
  },
  get cancelledByCustomer() {
    return ta("لغو توسط فرستنده");
  },
  get cancelledByDriver() {
    return ta("لغو توسط پیک");
  },
  get cancelledByBackoffice() {
    return ta("لغو توسط اسنپ");
  },
  get nobodyAccepted() {
    return ta("پیکی پیدا نشد");
  },
};

export const snappStateLabel = (name?: string | null, state?: number | null) =>
  !name && state === null
    ? "—"
    : (name && snappStateDict[name]) || ta("وضعیت ${1}", [String(name ?? state)]);

// a ledger row of one order, from the order's point of view
export const orderLedgerKindDict: Record<string, string> = {
  get charge() {
    return ta("پرداخت خریدار");
  },
  get refund() {
    return ta("بازپرداخت به خریدار");
  },
  get payout() {
    return ta("تسویه با فروشنده");
  },
  get deliveryFee() {
    return ta("هزینه‌ی ارسال به داروخانه");
  },
  get other() {
    return ta("سایر");
  },
};

export const adminNoteActionDict: Record<string, string> = {
  get cancelOrder() {
    return ta("لغو سفارش");
  },
  get cancelLine() {
    return ta("لغو قلم");
  },
  get fulfillLine() {
    return ta("ثبت تحویل قلم");
  },
  get rescheduleSampling() {
    return ta("جابه‌جایی نوبت نمونه‌گیری");
  },
  get cancelSampling() {
    return ta("لغو نوبت نمونه‌گیری");
  },
};

// lab sampling appointments of an order (2026-10, backend Lib/labSampling.ts
// and Lib/labSamplingReschedule.ts)
export const samplingKindDict: Record<string, string> = {
  get lab() {
    return ta("در آزمایشگاه");
  },
  get home() {
    return ta("در منزل");
  },
};

export const samplingActorDict: Record<string, string> = {
  get buyer() {
    return ta("خریدار");
  },
  get lab() {
    return ta("آزمایشگاه");
  },
  get admin() {
    return ta("پشتیبانی");
  },
};

export type SamplingStatusLike = {
  status?: string;
  confirmedAt?: string | null;
  collectedAt?: string | null;
  collected?: boolean;
};

// the appointment's state, the same steps the buyer and the lab see
export const samplingStateOf = (s: SamplingStatusLike) =>
  s.status === "cancelled"
    ? "cancelled"
    : s.status === "done"
      ? "done"
      : s.collectedAt || s.collected
        ? "collected"
        : s.confirmedAt
          ? "confirmed"
          : "awaiting";

export const samplingStateDict: Record<string, string> = {
  get cancelled() {
    return ta("لغو شده");
  },
  get done() {
    return ta("انجام شده");
  },
  get collected() {
    return ta("نمونه گرفته شد");
  },
  get confirmed() {
    return ta("تأیید آزمایشگاه");
  },
  get awaiting() {
    return ta("در انتظار تأیید آزمایشگاه");
  },
};

// "Sat 18 Oct · 08:30–08:45" on Tehran's clock, in the admin's language
export const samplingWhenLabel = (s: { ymd?: string; start?: number; end?: number } | null | undefined) => {
  if (!s?.ymd || !/^\d{4}-\d{2}-\d{2}$/.test(s.ymd)) return "—";
  try {
    const day = new Intl.DateTimeFormat(adminIntlTag(), {
      timeZone: TEHRAN_TZ,
      weekday: "short",
      day: "numeric",
      month: "short",
    }).format(fromTehranWallClock(s.ymd, 12 * 60));
    const time = new Intl.DateTimeFormat(adminIntlTag(), {
      timeZone: TEHRAN_TZ,
      hour: "2-digit",
      minute: "2-digit",
      hourCycle: "h23",
    });
    const from = time.format(fromTehranWallClock(s.ymd, Number(s.start) || 0));
    const to = time.format(fromTehranWallClock(s.ymd, Number(s.end) || 0));
    return `${day} · ${from}–${to}`;
  } catch {
    return "—";
  }
};

// a ledger row's record in the admin panel, when it has a page of its own
export const transactionRefHref = (kind: string, ref?: string | null) =>
  !ref
    ? null
    : kind === "reservation"
      ? `/reservation/${ref}`
      : kind === "order"
        ? `/finance/orders/${ref}`
        : null;

// a prescription-only line's prescription (2026-10, backend
// Lib/rxPrescription.ts): what the buyer gave and the pharmacy's decision
export const rxStatusDict: Record<string, string> = {
  get pending() {
    return ta("در انتظار بررسی داروخانه");
  },
  get approved() {
    return ta("تأیید شده");
  },
  get rejected() {
    return ta("رد شده");
  },
};

export const rxKindDict: Record<string, string> = {
  get erx() {
    return ta("نسخه‌ی الکترونیک");
  },
  get paper() {
    return ta("تصویر نسخه‌ی کاغذی");
  },
};

export const rxInsurerDict: Record<string, string> = {
  get tamin() {
    return ta("تأمین اجتماعی");
  },
  get salamat() {
    return ta("بیمه سلامت");
  },
  get other() {
    return ta("سایر");
  },
};
