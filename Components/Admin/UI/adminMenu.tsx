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
import { ta } from "@/Components/Admin/i18n/adminText";

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
  { get title() {
  return ta("داشبورد");
}, href: "", icon: <DashboardIcon /> },
  {
    get title() {
  return ta("صندوق درخواست‌ها");
},
    href: "inbox",
    icon: <Bell01Icon />,
    adminOnly: true,
  },
  { get title() {
  return ta("آمار بازدید");
}, href: "analytics", icon: <TargetIcon />, adminOnly: true },
];

// 2026-09 restructure: 17 groups became 8 spaces + 2 super spaces. Every
// pending request now surfaces in the inbox above, the ~20 category/tag and
// reference-data pages live behind one "taxonomy" hub, and developer test
// tools / the legacy database behind one "devtools" hub (see adminHubs).
export const adminMenu: AdminMenuGroup[] = [
  {
    id: "providers",
    get title() {
  return ta("ارائه‌دهندگان");
},
    icon: <StetoscopeIcon />,
    items: [
      // one doctor entity: the old directory ("doctor") was merged into these
      { get title() {
  return ta("پزشکان");
}, href: "doctorprofile", access: "DoctorProfile" },
      { get title() {
  return ta("کلینیک‌ها");
}, href: "clinic", access: "Clinic" },
      { get title() {
  return ta("بیمارستان‌ها");
}, href: "hospital", access: "Hospital" },
      { get title() {
  return ta("پاراکلینیک‌ها");
}, href: "paraClinic", access: "ParaClinic" },
      { get title() {
  return ta("داروخانه و آزمایشگاه");
}, href: "pharmacy", access: "Pharmacy" },
      { get title() {
  return ta("بیمه‌ها");
}, href: "insurance", access: "Insurance" },
      { get title() {
  return ta("عضویت پزشکان در کلینیک");
}, href: "doctorjoinclinic", access: "DoctorJoinClinic" },
      { get title() {
  return ta("عضویت پزشکان در بیمارستان");
}, href: "doctorjoinhospital", access: "DoctorJoinHospital" },
      { get title() {
  return ta("سوالات متداول پزشکان");
}, href: "doctorfaq", access: "DoctorFaq" },
    ],
  },
  {
    id: "requests",
    get title() {
  return ta("درخواست‌های ثبت");
},
    icon: <MedalIcon />,
    items: [
      { get title() {
  return ta("درخواست پزشک شدن");
}, href: "becomedoctor", access: "BecomeDoctorRequest" },
      { get title() {
  return ta("درخواست کلینیک شدن");
}, href: "becomeclinic", access: "BecomeClinicRequest" },
      { get title() {
  return ta("درخواست بیمارستان شدن");
}, href: "becomehospital", access: "BecomeHospitalRequest" },
      { get title() {
  return ta("درخواست داروخانه شدن");
}, href: "becomepharmacy", access: "BecomePharmacyRequest" },
      { get title() {
  return ta("درخواست پاراکلینیک شدن");
}, href: "becomeParaClinic", access: "BecomeParaClinicRequest" },
      { get title() {
  return ta("درخواست بیمه شدن");
}, href: "becomeinsurance", access: "BecomeInsuranceRequest" },
      { get title() {
  return ta("اضافه شدن کلینیک");
}, href: "clinicaddition", access: "ClinicAdditionRequest" },
      { get title() {
  return ta("اضافه شدن بیمارستان");
}, href: "hospitaladdition", access: "HospitalAdditionRequest" },
      { get title() {
  return ta("اضافه شدن بیمه");
}, href: "insuranceaddition", access: "InsuranceAdditionRequest" },
      { get title() {
  return ta("اضافه شدن داروخانه");
}, href: "pharmacyaddition", access: "PharmacyAdditionRequest" },
    ],
  },
  {
    id: "users",
    get title() {
  return ta("کاربران و پشتیبانی");
},
    icon: <UserGroupIcon />,
    items: [
      { get title() {
  return ta("کاربران");
}, href: "user", access: "User" },
      { get title() {
  return ta("تیکت‌های پشتیبانی");
}, href: "ticket" },
      { get title() {
  return ta("درخواست‌های تماس");
}, href: "contactRequest" },
      { get title() {
  return ta("نظرات کاربران");
}, href: "comment", access: "Comment" },
      { get title() {
  return ta("نظرات بیماران درباره‌ی پزشکان");
}, href: "doctorFeedback" },
      { get title() {
  return ta("تماس‌ها");
}, href: "callroom", access: "CallRoom" },
      { get title() {
  return ta("اعلان‌ها");
}, href: "notification" },
      { get title() {
  return ta("تنظیمات اطلاع‌رسانی کاربران");
}, href: "userAlert" },
    ],
  },
  {
    id: "catalog",
    get title() {
  return ta("خدمات و کاتالوگ");
},
    icon: <PackageIcon />,
    items: [
      { get title() {
  return ta("تخصص‌ها");
}, href: "speciality", access: "Sepciality" },
      // groups only arrange specialities in the menu / list chips; a doctor
      // is always given specialities, never a group
      { get title() {
  return ta("خدمات");
}, href: "service" },
      { get title() {
  return ta("پکیج‌های خدمات");
}, href: "servicePackage" },
      { get title() {
  return ta("تست‌های آزمایشگاهی");
}, href: "test" },
      { get title() {
  return ta("محصولات");
}, href: "product" },
      { get title() {
  return ta("بسته‌های محصول");
}, href: "productPackage" },
      { get title() {
  return ta("توضیحات رزرو");
}, href: "bookingDescription" },
      { get title() {
  return ta("دسته‌بندی‌ها، تگ‌ها و مناطق");
}, href: "taxonomy" },
    ],
  },
  {
    id: "medical",
    get title() {
  return ta("دانشنامه پزشکی");
},
    icon: <MedicalRecordIcon />,
    items: [
      { get title() {
  return ta("بیماری‌ها");
}, href: "disease", access: "Disease" },
      { get title() {
  return ta("داروها");
}, href: "drug", access: "Drug" },
      { get title() {
  return ta("علائم");
}, href: "symptom", access: "Symptom" },
      { get title() {
  return ta("اعضای بدن");
}, href: "part", access: "Part" },
    ],
  },
  {
    id: "content",
    get title() {
  return ta("محتوا و سئو");
},
    icon: <WEbsiteIcon />,
    items: [
      { get title() {
  return ta("مقالات");
}, href: "blog", access: "Blog" },
      { get title() {
  return ta("مولتی‌مدیا وبلاگ");
}, href: "blogmedia", access: "BlogMedia" },
      { get title() {
  return ta("خبرنامه");
}, href: "blogRrs" },
      { get title() {
  return ta("معرفی صفحه اصلی");
}, href: "homeIntroduction" },
      { get title() {
  return ta("تبلیغات");
}, href: "advertisement" },
      { get title() {
  return ta("تبلیغات خطی");
}, href: "inlinead", access: "InlineAdvertisement" },
      { get title() {
  return ta("سوالات متداول");
}, href: "faq" },
      { get title() {
  return ta("درباره همکاران");
}, href: "aboutPartner" },
      { get title() {
  return ta("درباره تیم");
}, href: "aboutTeam" },
      { get title() {
  return ta("چرا ما");
}, href: "aboutWhy" },
      { get title() {
  return ta("نظرات مشتریان");
}, href: "testify" },
      { get title() {
  return ta("قوانین و مقررات");
}, href: "privacy" },
      { get title() {
  return ta("متن‌های رابط کاربری");
}, href: "textcontent", access: "TextContent" },
      { get title() {
  return ta("ترجمه محتوا");
}, href: "translations" },
      { get title() {
  return ta("متادیتای صفحات");
}, href: "pageMeta" },
      { get title() {
  return ta("لینک‌های کوتاه");
}, href: "shortlink", access: "ShortLink" },
      { get title() {
  return ta("ریدایرکت‌ها");
}, href: "redirection", access: "Redirection" },
    ],
  },
  {
    id: "licenses",
    get title() {
  return ta("پلن‌ها و مجوزها");
},
    icon: <CrownIcon />,
    items: [
      { get title() {
  return ta("پلن‌های پزشک");
}, href: "baseDoctorLicense" },
      { get title() {
  return ta("پلن‌های کلینیک");
}, href: "baseClinicLicense" },
      { get title() {
  return ta("پلن‌های بیمارستان");
}, href: "baseHospitalLicense" },
      { get title() {
  return ta("پلن‌های داروخانه");
}, href: "basePharmacyLicense" },
      { get title() {
  return ta("پلن‌های پاراکلینیک");
}, href: "baseParaClinicLicense" },
      { get title() {
  return ta("پلن‌های بیمه");
}, href: "baseInsuranceLicense" },
    ],
  },
  {
    id: "ai",
    get title() {
  return ta("هوش مصنوعی");
},
    icon: <AiIcon />,
    items: [
      { get title() {
  return ta("مدل‌ها و تنظیمات");
}, href: "ollama" },
      { get title() {
  return ta("مثال‌های بات");
}, href: "aiExample" },
    ],
  },
  {
    id: "finance",
    get title() {
  return ta("مالی");
},
    icon: <WalletIcon />,
    super: true,
    items: [
      { get title() {
  return ta("سفارش‌ها");
}, href: "finance/orders" },
      { get title() {
  return ta("تراکنش‌های کیف پول");
}, href: "finance/transactions" },
      { get title() {
  return ta("پرداخت‌های درگاه");
}, href: "finance/payments" },
      { get title() {
  return ta("درخواست‌های برداشت");
}, href: "finance/withdrawals" },
    ],
  },
  {
    id: "superAdmin",
    get title() {
  return ta("مدیریت سیستم");
},
    icon: <CogIcon />,
    super: true,
    items: [
      { get title() {
  return ta("ادمین‌ها");
}, href: "useraccesslevel" },
      { get title() {
  return ta("سطوح دسترسی");
}, href: "accesslevel" },
      { get title() {
  return ta("تنظیمات سیستم");
}, href: "appConfig" },
      { get title() {
  return ta("زبان‌های سایت");
}, href: "languages" },
      { get title() {
  return ta("تنظیمات مالی");
}, href: "globalFinanceSettings" },
      { get title() {
  return ta("تنظیمات مالیاتی");
}, href: "globalTaxSettings" },
      { get title() {
  return ta("تنظیمات درگاه پیامک (API)");
}, href: "smsSettings" },
      { get title() {
  return ta("پترن‌های پیامک");
}, href: "smsPatterns" },
      { get title() {
  return ta("تنظیمات ارسال (تپسی / تیپاکس)");
}, href: "deliverySettings" },
      { get title() {
  return ta("تصاویر ثابت");
}, href: "staticImages" },
      { get title() {
  return ta("لاگ عملیات");
}, href: "audit" },
      { get title() {
  return ta("ابزار توسعه و دیتابیس قدیم");
}, href: "devtools" },
    ],
  },
  {
    id: "tamin",
    get title() {
  return ta("تامین اجتماعی");
},
    icon: <MedicalReportIcon />,
    super: true,
    items: [
      { get title() {
  return ta("انواع نسخه");
}, href: "tamin/prescriptionType" },
      { get title() {
  return ta("انواع سرویس");
}, href: "tamin/serviceType" },
      { get title() {
  return ta("سرویس‌ها");
}, href: "tamin/service" },
      { get title() {
  return ta("زیرگروه نسخ آزمایش");
}, href: "tamin/parTaref" },
      { get title() {
  return ta("مقادیر مصرف");
}, href: "tamin/drugUsage" },
      { get title() {
  return ta("طریقه مصرف");
}, href: "tamin/drugAmount" },
      { get title() {
  return ta("زمان مصرف");
}, href: "tamin/drugInstruction" },
      { get title() {
  return ta("طرح درمان");
}, href: "tamin/phPlan" },
      { get title() {
  return ta("انواع بیماری");
}, href: "tamin/phIllness" },
      { get title() {
  return ta("کدهای ICD");
}, href: "tamin/Icids" },
      { get title() {
  return ta("شکایات");
}, href: "tamin/complaint" },
      { get title() {
  return ta("تخصص‌ها");
}, href: "tamin/spec" },
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
        get title() {
  return ta("مراکز درمانی");
},
        icon: <BuildingIcon />,
        items: [
          { get title() {
  return ta("دسته‌بندی کلینیک‌ها");
}, href: "clinicCategory" },
          { get title() {
  return ta("تگ کلینیک‌ها");
}, href: "clinicTag" },
          { get title() {
  return ta("دسته‌بندی بیمارستان‌ها");
}, href: "hospitalCategory" },
          { get title() {
  return ta("تگ بیمارستان‌ها");
}, href: "hospitalTag" },
          { get title() {
  return ta("دسته‌بندی پاراکلینیک");
}, href: "paraClinicCategory" },
          { get title() {
  return ta("تگ پاراکلینیک");
}, href: "paraClinicTag" },
          { get title() {
  return ta("دسته‌بندی بیمه‌ها");
}, href: "insuranceCategory" },
          { get title() {
  return ta("تگ بیمه");
}, href: "insuranceTag" },
        ],
      },
      {
        id: "taxCatalog",
        get title() {
  return ta("خدمات و محصولات");
},
        icon: <PillIcon />,
        items: [
          { get title() {
  return ta("دسته‌بندی خدمات");
}, href: "serviceCategory" },
          { get title() {
  return ta("دسته‌بندی تست‌ها");
}, href: "testCategory" },
          { get title() {
  return ta("دسته‌بندی محصولات");
}, href: "productCategory" },
        ],
      },
      {
        id: "taxMedical",
        get title() {
  return ta("دانشنامه پزشکی");
},
        icon: <FlaskIcon />,
        items: [
          { get title() {
  return ta("دسته‌بندی بیماری‌ها");
}, href: "diseaseCategory" },
          { get title() {
  return ta("تگ بیماری‌ها");
}, href: "diseaseTag" },
          { get title() {
  return ta("تگ داروها");
}, href: "drugTag" },
          { get title() {
  return ta("دسته‌بندی علائم");
}, href: "symptomCategory" },
        ],
      },
      {
        id: "taxContent",
        get title() {
  return ta("محتوا");
},
        icon: <BookOpenIcon />,
        items: [
          { get title() {
  return ta("دسته‌بندی مقالات");
}, href: "blogcategory", access: "BlogCategory" },
          { get title() {
  return ta("تگ‌های وبلاگ");
}, href: "blogTag" },
          { get title() {
  return ta("دسته‌بندی سوالات متداول");
}, href: "faqCategory" },
        ],
      },
      {
        id: "taxPlaces",
        get title() {
  return ta("مناطق");
},
        icon: <TagIcon />,
        items: [{ get title() {
  return ta("استان‌ها و شهرها");
}, href: "province" }],
      },
    ],
  },
  {
    hub: "devtools",
    sections: [
      {
        id: "tests",
        get title() {
  return ta("تست سرویس‌ها");
},
        icon: <LinkIcon />,
        super: true,
        items: [
          { get title() {
  return ta("تست نوتیفیکیشن پوش");
}, href: "pushTest" },
          { get title() {
  return ta("تست پیک اسنپ");
}, href: "snappTest" },
          { get title() {
  return ta("تست درگاه پرداخت سپ");
}, href: "sepTest" },
          { get title() {
  return ta("تست تامین: پزشک");
}, href: "tamin/doctorTest" },
          { get title() {
  return ta("تست تامین: داروخانه");
}, href: "tamin/pharmacyTest" },
          { get title() {
  return ta("تست تامین: کلینیک");
}, href: "tamin/clinicTest" },
          { get title() {
  return ta("تست تامین: پاراکلینیک");
}, href: "tamin/paraClinicTest" },
        ],
      },
      {
        id: "old",
        get title() {
  return ta("دیتابیس قدیم");
},
        icon: <FolderIcon />,
        super: true,
        items: [
          { get title() {
  return ta("پزشکان");
}, href: "old/doctor" },
          { get title() {
  return ta("کاربران");
}, href: "old/user" },
          { get title() {
  return ta("تخصص‌ها");
}, href: "old/speciality" },
          { get title() {
  return ta("مقالات");
}, href: "old/blog" },
          { get title() {
  return ta("بیماری‌ها");
}, href: "old/disease" },
          { get title() {
  return ta("داروها");
}, href: "old/drug" },
          { get title() {
  return ta("اعضا");
}, href: "old/part" },
          { get title() {
  return ta("علائم");
}, href: "old/symptom" },
          { get title() {
  return ta("مهاجرت داده‌ها");
}, href: "cold/migrate" },
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
