import { ReactNode } from "react";
import { AccessLevelModel } from "../AccessLevel/AdminManageAccessLevelsPage";
import DashboardIcon from "@/Components/Icons/DashboardIcon";
import TargetIcon from "@/Components/Icons/TargetIcon";
import UserGroupIcon from "@/Components/Icons/UserGroupIcon";
import StetoscopeIcon from "@/Components/Icons/StetoscopeIcon";
import BuildingIcon from "@/Components/Icons/BuildingIcon";
import FlaskIcon from "@/Components/Icons/FlaskIcon";
import PillIcon from "@/Components/Icons/PillIcon";
import PackageIcon from "@/Components/Icons/PackageIcon";
import MedicalRecordIcon from "@/Components/Icons/MedicalRecordIcon";
import BookOpenIcon from "@/Components/Icons/BookOpenIcon";
import WEbsiteIcon from "@/Components/Icons/WEbsiteIcon";
import LinkIcon from "@/Components/Icons/LinkIcon";
import MedalIcon from "@/Components/Icons/MedalIcon";
import AiIcon from "@/Components/Icons/AiIcon";
import CrownIcon from "@/Components/Icons/CrownIcon";
import MedicalReportIcon from "@/Components/Icons/MedicalReportIcon";
import CogIcon from "@/Components/Icons/CogIcon";
import FolderIcon from "@/Components/Icons/FolderIcon";
import Bell01Icon from "@/Components/Icons/Bell01Icon";
import TagIcon from "@/Components/Icons/TagIcon";
import WalletIcon from "@/Components/Icons/WalletIcon";

export type AdminMenuItem = {
  title: string;
  // Path under /<adminKey>/ ("" is the dashboard).
  href: string;
  // AccessLevel a notadmin needs (readAll) to see/open it. Items without one
  // hit admin-only backend routes, so only full admins see them.
  access?: AccessLevelModel;
};

export type AdminMenuGroup = {
  id: string;
  title: string;
  icon: ReactNode;
  // Only full admins see super groups at all.
  super?: boolean;
  items: AdminMenuItem[];
};

// Always visible at the top, outside the collapsible groups. `adminOnly`
// items hit admin-only backend routes (staff only get the dashboard).
export const adminPinnedItems: (AdminMenuItem & {
  icon: ReactNode;
  adminOnly?: boolean;
})[] = [
  { title: "داشبورد", href: "", icon: <DashboardIcon /> },
  {
    title: "صندوق درخواست‌ها",
    href: "inbox",
    icon: <Bell01Icon />,
    adminOnly: true,
  },
  { title: "آمار بازدید", href: "analytics", icon: <TargetIcon />, adminOnly: true },
];

// 2026-09 restructure: 17 groups became 8 spaces + 2 super spaces. Every
// pending request now surfaces in the inbox above, the ~20 category/tag and
// reference-data pages live behind one "taxonomy" hub, and developer test
// tools / the legacy database behind one "devtools" hub (see adminHubs).
export const adminMenu: AdminMenuGroup[] = [
  {
    id: "providers",
    title: "ارائه‌دهندگان",
    icon: <StetoscopeIcon />,
    items: [
      // one doctor entity: the old directory ("doctor") was merged into these
      { title: "پزشکان", href: "doctorprofile", access: "DoctorProfile" },
      { title: "کلینیک‌ها", href: "clinic", access: "Clinic" },
      { title: "بیمارستان‌ها", href: "hospital", access: "Hospital" },
      { title: "پاراکلینیک‌ها", href: "paraClinic", access: "ParaClinic" },
      { title: "داروخانه و آزمایشگاه", href: "pharmacy", access: "Pharmacy" },
      { title: "بیمه‌ها", href: "insurance", access: "Insurance" },
      { title: "عضویت پزشکان در کلینیک", href: "doctorjoinclinic", access: "DoctorJoinClinic" },
      { title: "عضویت پزشکان در بیمارستان", href: "doctorjoinhospital", access: "DoctorJoinHospital" },
      { title: "سوالات متداول پزشکان", href: "doctorfaq", access: "DoctorFaq" },
    ],
  },
  {
    id: "requests",
    title: "درخواست‌های ثبت",
    icon: <MedalIcon />,
    items: [
      { title: "درخواست پزشک شدن", href: "becomedoctor", access: "BecomeDoctorRequest" },
      { title: "درخواست کلینیک شدن", href: "becomeclinic", access: "BecomeClinicRequest" },
      { title: "درخواست بیمارستان شدن", href: "becomehospital", access: "BecomeHospitalRequest" },
      { title: "درخواست داروخانه شدن", href: "becomepharmacy", access: "BecomePharmacyRequest" },
      { title: "درخواست پاراکلینیک شدن", href: "becomeParaClinic", access: "BecomeParaClinicRequest" },
      { title: "درخواست بیمه شدن", href: "becomeinsurance", access: "BecomeInsuranceRequest" },
      { title: "اضافه شدن کلینیک", href: "clinicaddition", access: "ClinicAdditionRequest" },
      { title: "اضافه شدن بیمارستان", href: "hospitaladdition", access: "HospitalAdditionRequest" },
      { title: "اضافه شدن بیمه", href: "insuranceaddition", access: "InsuranceAdditionRequest" },
      { title: "اضافه شدن داروخانه", href: "pharmacyaddition", access: "PharmacyAdditionRequest" },
    ],
  },
  {
    id: "users",
    title: "کاربران و پشتیبانی",
    icon: <UserGroupIcon />,
    items: [
      { title: "کاربران", href: "user", access: "User" },
      { title: "تیکت‌های پشتیبانی", href: "ticket" },
      { title: "درخواست‌های تماس", href: "contactRequest" },
      { title: "نظرات کاربران", href: "comment", access: "Comment" },
      { title: "نظرات بیماران درباره‌ی پزشکان", href: "doctorFeedback" },
      { title: "تماس‌ها", href: "callroom", access: "CallRoom" },
      { title: "اعلان‌ها", href: "notification" },
      { title: "تنظیمات اطلاع‌رسانی کاربران", href: "userAlert" },
    ],
  },
  {
    id: "catalog",
    title: "خدمات و کاتالوگ",
    icon: <PackageIcon />,
    items: [
      { title: "تخصص‌ها", href: "speciality", access: "Sepciality" },
      // groups only arrange specialities in the menu / list chips; a doctor
      // is always given specialities, never a group
      { title: "خدمات", href: "service" },
      { title: "پکیج‌های خدمات", href: "servicePackage" },
      { title: "تست‌های آزمایشگاهی", href: "test" },
      { title: "محصولات", href: "product" },
      { title: "بسته‌های محصول", href: "productPackage" },
      { title: "توضیحات رزرو", href: "bookingDescription" },
      { title: "دسته‌بندی‌ها، تگ‌ها و مناطق", href: "taxonomy" },
    ],
  },
  {
    id: "medical",
    title: "دانشنامه پزشکی",
    icon: <MedicalRecordIcon />,
    items: [
      { title: "بیماری‌ها", href: "disease", access: "Disease" },
      { title: "داروها", href: "drug", access: "Drug" },
      { title: "علائم", href: "symptom", access: "Symptom" },
      { title: "اعضای بدن", href: "part", access: "Part" },
    ],
  },
  {
    id: "content",
    title: "محتوا و سئو",
    icon: <WEbsiteIcon />,
    items: [
      { title: "مقالات", href: "blog", access: "Blog" },
      { title: "مولتی‌مدیا وبلاگ", href: "blogmedia", access: "BlogMedia" },
      { title: "خبرنامه", href: "blogRrs" },
      { title: "معرفی صفحه اصلی", href: "homeIntroduction" },
      { title: "تبلیغات", href: "advertisement" },
      { title: "تبلیغات خطی", href: "inlinead", access: "InlineAdvertisement" },
      { title: "سوالات متداول", href: "faq" },
      { title: "درباره همکاران", href: "aboutPartner" },
      { title: "درباره تیم", href: "aboutTeam" },
      { title: "چرا ما", href: "aboutWhy" },
      { title: "نظرات مشتریان", href: "testify" },
      { title: "قوانین و مقررات", href: "privacy" },
      { title: "متن‌های رابط کاربری", href: "textcontent", access: "TextContent" },
      { title: "ترجمه محتوا", href: "translations" },
      { title: "متادیتای صفحات", href: "pageMeta" },
      { title: "لینک‌های کوتاه", href: "shortlink", access: "ShortLink" },
      { title: "ریدایرکت‌ها", href: "redirection", access: "Redirection" },
    ],
  },
  {
    id: "licenses",
    title: "پلن‌ها و مجوزها",
    icon: <CrownIcon />,
    items: [
      { title: "پلن‌های پزشک", href: "baseDoctorLicense" },
      { title: "پلن‌های کلینیک", href: "baseClinicLicense" },
      { title: "پلن‌های بیمارستان", href: "baseHospitalLicense" },
      { title: "پلن‌های داروخانه", href: "basePharmacyLicense" },
      { title: "پلن‌های پاراکلینیک", href: "baseParaClinicLicense" },
      { title: "پلن‌های بیمه", href: "baseInsuranceLicense" },
      { title: "مدت زمان مجوز", href: "licenseDuration" },
    ],
  },
  {
    id: "ai",
    title: "هوش مصنوعی",
    icon: <AiIcon />,
    items: [
      { title: "مدل‌ها و تنظیمات", href: "ollama" },
      { title: "مثال‌های بات", href: "aiExample" },
    ],
  },
  {
    id: "finance",
    title: "مالی",
    icon: <WalletIcon />,
    super: true,
    items: [
      { title: "سفارش‌ها", href: "finance/orders" },
      { title: "تراکنش‌های کیف پول", href: "finance/transactions" },
      { title: "پرداخت‌های درگاه", href: "finance/payments" },
      { title: "درخواست‌های برداشت", href: "finance/withdrawals" },
    ],
  },
  {
    id: "superAdmin",
    title: "مدیریت سیستم",
    icon: <CogIcon />,
    super: true,
    items: [
      { title: "ادمین‌ها", href: "useraccesslevel" },
      { title: "سطوح دسترسی", href: "accesslevel" },
      { title: "تنظیمات سیستم", href: "appConfig" },
      { title: "زبان‌های سایت", href: "languages" },
      { title: "تنظیمات مالی", href: "globalFinanceSettings" },
      { title: "تنظیمات مالیاتی", href: "globalTaxSettings" },
      { title: "تنظیمات درگاه پیامک (API)", href: "smsSettings" },
      { title: "پترن‌های پیامک", href: "smsPatterns" },
      { title: "تنظیمات ارسال (تپسی / تیپاکس)", href: "deliverySettings" },
      { title: "تصاویر ثابت", href: "staticImages" },
      { title: "لاگ عملیات", href: "audit" },
      { title: "ابزار توسعه و دیتابیس قدیم", href: "devtools" },
    ],
  },
  {
    id: "tamin",
    title: "تامین اجتماعی",
    icon: <MedicalReportIcon />,
    super: true,
    items: [
      { title: "انواع نسخه", href: "tamin/prescriptionType" },
      { title: "انواع سرویس", href: "tamin/serviceType" },
      { title: "سرویس‌ها", href: "tamin/service" },
      { title: "زیرگروه نسخ آزمایش", href: "tamin/parTaref" },
      { title: "مقادیر مصرف", href: "tamin/drugUsage" },
      { title: "طریقه مصرف", href: "tamin/drugAmount" },
      { title: "زمان مصرف", href: "tamin/drugInstruction" },
      { title: "طرح درمان", href: "tamin/phPlan" },
      { title: "انواع بیماری", href: "tamin/phIllness" },
      { title: "کدهای ICD", href: "tamin/Icids" },
      { title: "شکایات", href: "tamin/complaint" },
      { title: "تخصص‌ها", href: "tamin/spec" },
    ],
  },
];

// Pages that aren't in the sidebar but are one click away on a hub page
// (and in Ctrl+K). `hub` is the href of the menu item that lists them; the
// sidebar marks that item active while one of these pages is open.
export type AdminHub = {
  hub: string;
  sections: AdminMenuGroup[];
};

export const adminHubs: AdminHub[] = [
  {
    hub: "taxonomy",
    sections: [
      {
        id: "taxProviders",
        title: "مراکز درمانی",
        icon: <BuildingIcon />,
        items: [
          { title: "دسته‌بندی کلینیک‌ها", href: "clinicCategory" },
          { title: "تگ کلینیک‌ها", href: "clinicTag" },
          { title: "دسته‌بندی بیمارستان‌ها", href: "hospitalCategory" },
          { title: "تگ بیمارستان‌ها", href: "hospitalTag" },
          { title: "دسته‌بندی پاراکلینیک", href: "paraClinicCategory" },
          { title: "تگ پاراکلینیک", href: "paraClinicTag" },
          { title: "دسته‌بندی بیمه‌ها", href: "insuranceCategory" },
          { title: "تگ بیمه", href: "insuranceTag" },
        ],
      },
      {
        id: "taxCatalog",
        title: "خدمات و محصولات",
        icon: <PillIcon />,
        items: [
          { title: "دسته‌بندی خدمات", href: "serviceCategory" },
          { title: "دسته‌بندی تست‌ها", href: "testCategory" },
          { title: "دسته‌بندی محصولات", href: "productCategory" },
        ],
      },
      {
        id: "taxMedical",
        title: "دانشنامه پزشکی",
        icon: <FlaskIcon />,
        items: [
          { title: "دسته‌بندی بیماری‌ها", href: "diseaseCategory" },
          { title: "تگ بیماری‌ها", href: "diseaseTag" },
          { title: "تگ داروها", href: "drugTag" },
          { title: "دسته‌بندی علائم", href: "symptomCategory" },
        ],
      },
      {
        id: "taxContent",
        title: "محتوا",
        icon: <BookOpenIcon />,
        items: [
          { title: "دسته‌بندی مقالات", href: "blogcategory", access: "BlogCategory" },
          { title: "تگ‌های وبلاگ", href: "blogTag" },
          { title: "دسته‌بندی سوالات متداول", href: "faqCategory" },
        ],
      },
      {
        id: "taxPlaces",
        title: "مناطق",
        icon: <TagIcon />,
        items: [{ title: "استان‌ها و شهرها", href: "province" }],
      },
    ],
  },
  {
    hub: "devtools",
    sections: [
      {
        id: "tests",
        title: "تست سرویس‌ها",
        icon: <LinkIcon />,
        super: true,
        items: [
          { title: "تست نوتیفیکیشن پوش", href: "pushTest" },
          { title: "تست پیک اسنپ", href: "snappTest" },
          { title: "تست درگاه پرداخت سپ", href: "sepTest" },
          { title: "تست تامین: پزشک", href: "tamin/doctorTest" },
          { title: "تست تامین: داروخانه", href: "tamin/pharmacyTest" },
          { title: "تست تامین: کلینیک", href: "tamin/clinicTest" },
          { title: "تست تامین: پاراکلینیک", href: "tamin/paraClinicTest" },
        ],
      },
      {
        id: "old",
        title: "دیتابیس قدیم",
        icon: <FolderIcon />,
        super: true,
        items: [
          { title: "پزشکان", href: "old/doctor" },
          { title: "کاربران", href: "old/user" },
          { title: "تخصص‌ها", href: "old/speciality" },
          { title: "مقالات", href: "old/blog" },
          { title: "بیماری‌ها", href: "old/disease" },
          { title: "داروها", href: "old/drug" },
          { title: "اعضا", href: "old/part" },
          { title: "علائم", href: "old/symptom" },
          { title: "مهاجرت داده‌ها", href: "cold/migrate" },
        ],
      },
    ],
  },
];

// Every group, sidebar and hub alike - for lookups by page (audit log,
// page guard, Ctrl+K).
export const adminAllGroups: AdminMenuGroup[] = [
  ...adminMenu,
  ...adminHubs.flatMap((hub) =>
    hub.sections.map((section) => ({
      ...section,
      // A hub under a super-only menu item is super-only too.
      super:
        section.super ||
        adminMenu.some(
          (group) =>
            group.super && group.items.some((item) => item.href === hub.hub),
        ),
    })),
  ),
];

// Hub item href a (hub-listed) page belongs to, e.g. "clinicTag" -> "taxonomy".
export const hubOfPage = (href: string) =>
  adminHubs.find((hub) =>
    hub.sections.some((section) =>
      section.items.some((item) => item.href === href),
    ),
  )?.hub;

// First URL segment -> what guards it, for AdminLayout's page guard.
const segmentInfo = new Map<string, { super: boolean; access?: AccessLevelModel }>();
for (const group of adminAllGroups)
  for (const item of group.items) {
    const segment = item.href.split("/")[0];
    if (!segmentInfo.has(segment))
      segmentInfo.set(segment, { super: !!group.super, access: item.access });
  }

export const canNotAdminOpen = (
  segment: string,
  hasAccess: (model: AccessLevelModel, op: "readAll" | "readOne") => boolean,
): boolean => {
  if (segment === "") return true;
  // A hub page opens for staff who can open at least one page on it.
  const hub = adminHubs.find((el) => el.hub === segment);
  if (hub)
    return hub.sections.some(
      (section) =>
        !section.super &&
        section.items.some((item) =>
          canNotAdminOpen(item.href.split("/")[0], hasAccess),
        ),
    );
  const info = segmentInfo.get(segment);
  if (!info || info.super || !info.access) return false;
  return hasAccess(info.access, "readAll") || hasAccess(info.access, "readOne");
};
