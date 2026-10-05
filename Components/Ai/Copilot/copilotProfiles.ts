import { AiProfile, T, Txt } from "../aiShared";

// «دستیار نویان» per profile (2026-10): its name, the empty-state intro and
// the quick-action chips. A chip is sent as the user's request; it shows
// only when the server lists its tool for this user (plan + access). The
// tools and the instructions live on the server (Lib/ai/copilot).

export type CopilotChip = { text: Txt; tool: string };
export type CopilotProfileUi = { title: Txt; intro: Txt; chips: CopilotChip[] };

const c = (k: string, fa: string, tool: string): CopilotChip => ({ text: T(k, fa), tool });

const CRM_CHIPS = [
  c("copChipPlan", "برنامه‌ی ارتباط با بیماران امروز", "crm_action_plan"),
  c("copChipFollowUps", "پیگیری‌های این هفته", "crm_followups_due"),
  c("copChipTemplate", "یک پیامک یادآوری چکاپ بنویس", "crm_draft_template"),
];
const FINANCE_CHIPS = [
  c("copChipFinance", "وضعیت مالی این ماه چطور است؟", "finance_overview"),
  c("copChipExpense", "یک هزینه ثبت کن", "finance_draft_expense"),
];
const STOCK_CHIPS = [
  c("copChipStock", "کدام کالاها کم یا نزدیک انقضا هستند؟", "inventory_alerts"),
  c("copChipPurchase", "سفارش خرید از پخش را آماده کن", "purchase_draft"),
];
const CALL = c("copChipCall", "تحلیل یک تماس تلفنی", "call_analyze");

export const COPILOT_PROFILES: Record<AiProfile, CopilotProfileUi> = {
  doctor: {
    title: T("copTitleDoctor", "دستیار نویان · مطب"),
    intro: T(
      "copIntroDoctor",
      "برنامه‌ی امروز، پرونده‌ی بیماران، نوبت‌دادن و جابه‌جایی، نسخه با صدا، مالی و ارتباط با بیماران. بنویسید یا بگویید؛ هر تغییری پیش از ثبت به تأیید شما می‌رسد.",
    ),
    chips: [
      c("copChipToday", "نوبت‌های امروز", "today_schedule"),
      c("copChipRx", "نسخه بنویس", "write_prescription"),
      c("copChipBook", "برای فردا ساعت ۱۷ نوبت بده", "book_appointment"),
      c("copChipFindPatient", "پرونده‌ی یک بیمار را باز کن", "find_patient"),
      ...FINANCE_CHIPS,
      ...CRM_CHIPS,
    ],
  },
  clinic: {
    title: T("copTitleClinic", "دستیار نویان · درمانگاه"),
    intro: T(
      "copIntroClinic",
      "پزشکان و بخش‌ها، نوبت‌های همه‌ی پزشکان و میزان اشغال، مالی، حقوق، انبار، لیست‌های بیمه و ارتباط با بیماران.",
    ),
    chips: [
      c("copChipAgenda", "نوبت‌های امروز همه‌ی پزشکان", "center_agenda"),
      c("copChipOccupancy", "روند نوبت‌ها و اشغال ۳۰ روز اخیر", "center_occupancy"),
      c("copChipDoctors", "پزشکان مرکز", "center_doctors"),
      c("copChipClaims", "لیست‌های بیمه‌ی باز", "insurance_claims"),
      c("copChipPayroll", "وضعیت حقوق این ماه", "payroll_status"),
      ...STOCK_CHIPS,
      ...FINANCE_CHIPS,
      ...CRM_CHIPS,
      CALL,
    ],
  },
  hospital: {
    title: T("copTitleHospital", "دستیار نویان · بیمارستان"),
    intro: T(
      "copIntroHospital",
      "پزشکان و بخش‌ها، نوبت‌های همه‌ی پزشکان و میزان اشغال، مالی، حقوق، انبار، لیست‌های بیمه و ارتباط با بیماران.",
    ),
    chips: [
      c("copChipAgenda", "نوبت‌های امروز همه‌ی پزشکان", "center_agenda"),
      c("copChipOccupancy", "روند نوبت‌ها و اشغال ۳۰ روز اخیر", "center_occupancy"),
      c("copChipDoctors", "پزشکان مرکز", "center_doctors"),
      c("copChipClaims", "لیست‌های بیمه‌ی باز", "insurance_claims"),
      c("copChipPayroll", "وضعیت حقوق این ماه", "payroll_status"),
      ...STOCK_CHIPS,
      ...FINANCE_CHIPS,
      ...CRM_CHIPS,
    ],
  },
  pharmacy: {
    title: T("copTitlePharmacy", "دستیار نویان · داروخانه"),
    intro: T(
      "copIntroPharmacy",
      "صف سفارش و نسخه، موجودی و تاریخ انقضا، پیشنهاد سفارش دوباره و خرید از پخش، مالی و مشتریان.",
    ),
    chips: [c("copChipQueue", "صف سفارش‌ها و نسخه‌ها", "pharmacy_queue"), ...STOCK_CHIPS, ...FINANCE_CHIPS, ...CRM_CHIPS],
  },
  paraClinic: {
    title: T("copTitleLab", "دستیار نویان · آزمایشگاه و تصویربرداری"),
    intro: T("copIntroLab", "سفارش‌های آزمایش و جواب‌ها، موجودی کیت و مواد مصرفی، مالی و ارتباط با بیماران."),
    chips: [c("copChipLabOrders", "سفارش‌هایی که جوابشان آماده نیست", "lab_orders"), ...STOCK_CHIPS, ...FINANCE_CHIPS, ...CRM_CHIPS],
  },
  insurance: {
    title: T("copTitleInsurer", "دستیار نویان · بیمه"),
    intro: T("copIntroInsurer", "طرح‌ها و قراردادها، شبکه‌ی ارائه‌دهندگان، پرسش‌های بیمه‌شدگان از طریق ارتباط با مشتریان، و مالی."),
    chips: [
      c("copChipPlans", "طرح‌های بیمه", "insurer_plans"),
      c("copChipNetwork", "شبکه‌ی ارائه‌دهندگان در تهران", "insurer_network"),
      ...FINANCE_CHIPS,
      c("copChipMembers", "یک بیمه‌شده را پیدا کن", "crm_find_contact"),
    ],
  },
  user: {
    title: T("copTitleUser", "دستیار نویان"),
    intro: T(
      "copIntroUser",
      "نوبت‌ها، توصیه‌های پزشک، سفارش‌ها، کیف پول و عضویت پرو. برای پرسش درباره‌ی علائم، دستیار سلامت را باز می‌کنم. در شرایط اورژانسی با ۱۱۵ تماس بگیرید.",
    ),
    chips: [
      c("copChipMyBookings", "نوبت بعدی من کی است؟", "my_bookings"),
      c("copChipMyInstructions", "پزشکم بعد از ویزیت چه گفت؟", "my_instructions"),
      c("copChipMyOrders", "سفارش‌های من", "my_orders"),
      c("copChipMyWallet", "موجودی کیف پول", "my_wallet"),
      c("copChipMyPro", "وضعیت عضویت پرو", "my_pro"),
      c("copChipHealth", "سؤال درباره‌ی علائم دارم", "health_question"),
    ],
  },
  admin: {
    title: T("copTitleAdmin", "دستیار نویان · مدیریت"),
    intro: T("copIntroAdmin", "آمار پلتفرم، صف درخواست‌ها، کاربران و مالی پلتفرم. بپرسید یا بگویید کدام صفحه را باز کنم."),
    chips: [
      c("copChipAdminStats", "آمار امروز پلتفرم", "admin_stats"),
      c("copChipAdminRequests", "درخواست‌های در انتظار", "admin_requests"),
      c("copChipAdminUser", "کاربر ۰۹۱۲ را پیدا کن", "admin_find_user"),
      c("copChipAdminFinance", "وضعیت مالی پلتفرم", "admin_finance"),
    ],
  },
};

// the chips the page is about come first (2026-10): on /crm pages the CRM
// chips, under finance/inventory the stock ones, and so on; the rest keep
// their order. Only the first CHIP_LIMIT show until "more" is pressed, so
// every chip stays reachable without crowding a phone screen.
export const CHIP_LIMIT = 6;
const AREAS: [RegExp, RegExp][] = [
  [/\/crm(\/|$)/, /^(crm_|call_)/],
  [/\/finance\/inventory(\/|$)/, /^(inventory_|purchase_)/],
  [/\/finance\/payroll(\/|$)/, /^payroll_/],
  [/\/finance(\/|$)/, /^finance_/],
  [/\/(tamin|insurance|claims)(\/|$)/, /^insurance_/],
  [/\/booking(\/|$)/, /^(center_agenda|center_occupancy|today_schedule|book_appointment)$/],
  [/\/doctor(\/|$)/, /^center_doctors$/],
  [/\/prescription(\/|$)/, /^write_prescription$/],
];
export const chipsFor = (chips: CopilotChip[], path: string | null | undefined) => {
  const area = AREAS.find(([page]) => page.test(path || ""));
  if (!area) return chips;
  const [, tool] = area;
  return [...chips.filter((ch) => tool.test(ch.tool)), ...chips.filter((ch) => !tool.test(ch.tool))];
};
