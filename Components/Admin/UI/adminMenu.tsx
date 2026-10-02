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
import CalendarIcon from "@/Components/Icons/CalendarIcon";
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
  return ta("کارهای در انتظار");
},
    href: "inbox",
    icon: <Bell01Icon />,
    adminOnly: true,
  },
  {
    // every provider request (join, suggested centres, doctor memberships)
    // in one queue; staff see the kinds their access level allows
    get title() {
      return ta("صف درخواست‌ها");
    },
    href: "requests",
    icon: <MedalIcon />,
  },
  { get title() {
  return ta("آمار بازدید");
}, href: "analytics", icon: <TargetIcon />, adminOnly: true },
];

// 2026-09 audit restructure: one page per concern. Each page's parts
// (categories, tags, packages, settings split across models) are tabs of
// that page (AdminSectionHub); every provider request is in one queue
// (/requests, pinned above); pages whose content was dead (home intro, bot
// examples) are gone. The tab pages stay reachable for links, the page
// guard and Ctrl+K through adminHubs below.
//
// Second pass (2026-10 audit, "duplicates / misplaced"): one reviews page,
// one ads page, one languages page, one SEO page; doctor FAQs are a tab of
// the FAQ page; booking texts sit with content, places with the system,
// staff alerts with the team. Day-to-day operations (appointments, visit
// calls, orders) get their own group, as in the Doctolib Pro / Practo Ray
// back offices, where the schedule is what support opens first and money
// (transactions, payouts, invoices) is a separate concern.
export const adminMenu: AdminMenuGroup[] = [
  {
    id: "providers",
    get title() { return ta("ارائه‌دهندگان"); },
    icon: <StetoscopeIcon />,
    items: [
      { get title() { return ta("پزشکان"); }, href: "doctorprofile", access: "DoctorProfile" },
      { get title() { return ta("کلینیک‌ها"); }, href: "clinic", access: "Clinic" },
      { get title() { return ta("بیمارستان‌ها"); }, href: "hospital", access: "Hospital" },
      { get title() { return ta("پاراکلینیک‌ها"); }, href: "paraClinic", access: "ParaClinic" },
      { get title() { return ta("داروخانه‌ها"); }, href: "pharmacy", access: "Pharmacy" },
      { get title() { return ta("بیمه‌ها"); }, href: "insurance", access: "Insurance" },
    ],
  },
  {
    id: "operations",
    get title() { return ta("نوبت‌ها و سفارش‌ها"); },
    icon: <CalendarIcon />,
    items: [
      { get title() { return ta("نوبت‌ها"); }, href: "reservation", access: "Reservation" },
      { get title() { return ta("تماس‌ها"); }, href: "callroom", access: "CallRoom" },
      { get title() { return ta("سفارش‌ها"); }, href: "finance/orders", access: "Order" },
    ],
  },
  {
    id: "users",
    get title() { return ta("کاربران و پشتیبانی"); },
    icon: <UserGroupIcon />,
    items: [
      { get title() { return ta("کاربران"); }, href: "user", access: "User" },
      { get title() { return ta("تیکت‌های پشتیبانی"); }, href: "ticket", access: "Ticket" },
      { get title() { return ta("درخواست‌های تماس"); }, href: "contactRequest", access: "ContactRequest" },
      { get title() { return ta("نظرات و امتیازها"); }, href: "reviews" },
      { get title() { return ta("پیامک و اعلان‌ها"); }, href: "messaging" },
    ],
  },
  {
    id: "catalog",
    get title() { return ta("کاتالوگ"); },
    icon: <PackageIcon />,
    items: [
      { get title() { return ta("تخصص‌ها"); }, href: "speciality", access: "Sepciality" },
      { get title() { return ta("خدمات"); }, href: "service", access: "Service" },
      { get title() { return ta("محصولات"); }, href: "product", access: "Product" },
      { get title() { return ta("آزمایش‌ها"); }, href: "test", access: "Test" },
    ],
  },
  {
    id: "medical",
    get title() { return ta("دانشنامه پزشکی"); },
    icon: <MedicalRecordIcon />,
    items: [
      { get title() { return ta("بیماری‌ها"); }, href: "disease", access: "Disease" },
      { get title() { return ta("داروها"); }, href: "drug", access: "Drug" },
      { get title() { return ta("علائم"); }, href: "symptom", access: "Symptom" },
    ],
  },
  {
    id: "content",
    get title() { return ta("محتوا و سایت"); },
    icon: <WEbsiteIcon />,
    items: [
      { get title() { return ta("مجله"); }, href: "blog", access: "Blog" },
      { get title() { return ta("سوالات متداول"); }, href: "faq", access: "Faq" },
      { get title() { return ta("صفحه‌ی خانه"); }, href: "homePage" },
      { get title() { return ta("صفحه‌ی درباره ما"); }, href: "aboutPage" },
      { get title() { return ta("صفحه‌ی همکاری پزشکان"); }, href: "doctorsPage" },
      { get title() { return ta("توضیحات رزرو"); }, href: "bookingDescription", access: "BookingDescription" },
      { get title() { return ta("قوانین و مقررات"); }, href: "privacy" },
      { get title() { return ta("تبلیغات"); }, href: "ads" },
      { get title() { return ta("زبان و ترجمه"); }, href: "localization" },
      { get title() { return ta("سئو و لینک‌ها"); }, href: "seo" },
    ],
  },
  {
    id: "finance",
    get title() { return ta("مالی"); },
    icon: <WalletIcon />,
    items: [
      { get title() { return ta("تراکنش‌های کیف پول"); }, href: "finance/transactions", access: "Finance" },
      { get title() { return ta("پرداخت‌های درگاه"); }, href: "finance/payments", access: "Finance" },
      { get title() { return ta("درخواست‌های برداشت"); }, href: "finance/withdrawals", access: "Finance" },
      { get title() { return ta("فاکتورها"); }, href: "finance/invoices", access: "Finance" },
      // the platform's own books (2026-10, Noyan Business)
      { get title() { return ta("حسابداری پلتفرم"); }, href: "finance/accounting", access: "Finance" },
      { get title() { return ta("پلن‌ها و مجوزها"); }, href: "licensePlans" },
      { get title() { return ta("تنظیمات مالی"); }, href: "financeSettings" },
    ],
  },
  {
    id: "system",
    get title() { return ta("مدیریت سیستم"); },
    icon: <CogIcon />,
    super: true,
    items: [
      { get title() { return ta("تیم و دسترسی‌ها"); }, href: "team" },
      { get title() { return ta("تنظیمات سیستم"); }, href: "appConfig" },
      { get title() { return ta("استان، شهر و محله"); }, href: "province" },
      { get title() { return ta("مدل‌های هوش مصنوعی"); }, href: "ollama" },
      { get title() { return ta("لاگ عملیات"); }, href: "audit" },
      { get title() { return ta("ابزار توسعه و دیتابیس قدیم"); }, href: "devtools" },
    ],
  },
  {
    id: "tamin",
    get title() { return ta("تامین اجتماعی"); },
    icon: <MedicalReportIcon />,
    super: true,
    items: [
      { get title() { return ta("انواع نسخه"); }, href: "tamin/prescriptionType" },
      { get title() { return ta("انواع سرویس"); }, href: "tamin/serviceType" },
      { get title() { return ta("سرویس‌ها"); }, href: "tamin/service" },
      { get title() { return ta("زیرگروه نسخ آزمایش"); }, href: "tamin/parTaref" },
      { get title() { return ta("مقادیر مصرف"); }, href: "tamin/drugUsage" },
      { get title() { return ta("طریقه مصرف"); }, href: "tamin/drugAmount" },
      { get title() { return ta("زمان مصرف"); }, href: "tamin/drugInstruction" },
      { get title() { return ta("طرح درمان"); }, href: "tamin/phPlan" },
      { get title() { return ta("انواع بیماری"); }, href: "tamin/phIllness" },
      { get title() { return ta("کدهای ICD"); }, href: "tamin/Icids" },
      { get title() { return ta("شکایات"); }, href: "tamin/complaint" },
      { get title() { return ta("تخصص‌های تامین"); }, href: "tamin/spec" },
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
    hub: "reservation",
    sections: [
      {
        id: "reservationParts",
        get title() { return ta("نوبت‌ها"); },
        icon: <FolderIcon />,
        items: [
      { get title() { return ta("فهرست نوبت‌ها"); }, href: "reservation?tab=list", access: "Reservation" },
      { get title() { return ta("تنظیمات نوبت‌دهی"); }, href: "reservation?tab=settings" },
        ],
      },
    ],
  },
  {
    hub: "reviews",
    sections: [
      {
        id: "reviewsParts",
        get title() { return ta("نظرات و امتیازها"); },
        icon: <FolderIcon />,
        items: [
      { get title() { return ta("نظرات تاییدشده‌ی ویزیت"); }, href: "doctorFeedback", access: "DoctorFeedback" },
      { get title() { return ta("نظرات صفحات و مراکز"); }, href: "comment", access: "Comment" },
        ],
      },
    ],
  },
  {
    hub: "ads",
    sections: [
      {
        id: "adsParts",
        get title() { return ta("تبلیغات"); },
        icon: <FolderIcon />,
        items: [
      { get title() { return ta("بنرهای تبلیغاتی"); }, href: "advertisement", access: "Advertisement" },
      { get title() { return ta("تبلیغات خطی"); }, href: "inlinead", access: "InlineAdvertisement" },
        ],
      },
    ],
  },
  {
    hub: "localization",
    sections: [
      {
        id: "localizationParts",
        get title() { return ta("زبان و ترجمه"); },
        icon: <FolderIcon />,
        items: [
      { get title() { return ta("متن‌های رابط کاربری"); }, href: "textcontent", access: "TextContent" },
      { get title() { return ta("ترجمه محتوا"); }, href: "translations" },
      { get title() { return ta("زبان‌های سایت"); }, href: "languages" },
        ],
      },
    ],
  },
  {
    hub: "seo",
    sections: [
      {
        id: "seoParts",
        get title() { return ta("سئو و لینک‌ها"); },
        icon: <FolderIcon />,
        items: [
      { get title() { return ta("متادیتای صفحات"); }, href: "pageMeta", access: "PageMeta" },
      { get title() { return ta("لینک‌های کوتاه"); }, href: "shortlink", access: "ShortLink" },
      { get title() { return ta("ریدایرکت‌ها"); }, href: "redirection", access: "Redirection" },
        ],
      },
    ],
  },
  {
    hub: "requests",
    sections: [
      {
        id: "requestsParts",
        get title() { return ta("درخواست‌ها"); },
        icon: <FolderIcon />,
        items: [
      { get title() { return ta("درخواست پزشک شدن"); }, href: "becomedoctor", access: "BecomeDoctorRequest" },
      { get title() { return ta("درخواست کلینیک شدن"); }, href: "becomeclinic", access: "BecomeClinicRequest" },
      { get title() { return ta("درخواست بیمارستان شدن"); }, href: "becomehospital", access: "BecomeHospitalRequest" },
      { get title() { return ta("درخواست داروخانه شدن"); }, href: "becomepharmacy", access: "BecomePharmacyRequest" },
      { get title() { return ta("درخواست پاراکلینیک شدن"); }, href: "becomeParaClinic", access: "BecomeParaClinicRequest" },
      { get title() { return ta("درخواست بیمه شدن"); }, href: "becomeinsurance", access: "BecomeInsuranceRequest" },
      { get title() { return ta("اضافه شدن کلینیک"); }, href: "clinicaddition", access: "ClinicAdditionRequest" },
      { get title() { return ta("اضافه شدن بیمارستان"); }, href: "hospitaladdition", access: "HospitalAdditionRequest" },
      { get title() { return ta("اضافه شدن بیمه"); }, href: "insuranceaddition", access: "InsuranceAdditionRequest" },
      { get title() { return ta("اضافه شدن داروخانه"); }, href: "pharmacyaddition", access: "PharmacyAdditionRequest" },
      { get title() { return ta("عضویت پزشکان در کلینیک"); }, href: "doctorjoinclinic", access: "DoctorJoinClinic" },
      { get title() { return ta("عضویت پزشکان در بیمارستان"); }, href: "doctorjoinhospital", access: "DoctorJoinHospital" },
        ],
      },
    ],
  },
  {
    hub: "blog",
    sections: [
      {
        id: "blogParts",
        get title() { return ta("مجله"); },
        icon: <FolderIcon />,
        items: [
      { get title() { return ta("دسته‌بندی مقالات"); }, href: "blogcategory", access: "BlogCategory" },
      { get title() { return ta("تگ‌های مجله"); }, href: "blogTag", access: "Blog" },
      { get title() { return ta("رسانه‌ی مجله"); }, href: "blogmedia", access: "BlogMedia" },
      { get title() { return ta("خبرنامه"); }, href: "blogRrs" },
        ],
      },
    ],
  },
  {
    hub: "faq",
    sections: [
      {
        id: "faqParts",
        get title() { return ta("سوالات متداول"); },
        icon: <FolderIcon />,
        items: [
      { get title() { return ta("سوال‌ها"); }, href: "faq?tab=questions", access: "Faq" },
      { get title() { return ta("دسته‌بندی سوالات متداول"); }, href: "faqCategory", access: "Faq" },
      { get title() { return ta("سوالات مشترک صفحه‌ی پزشکان"); }, href: "doctorfaq", access: "DoctorFaq" },
        ],
      },
    ],
  },
  {
    hub: "disease",
    sections: [
      {
        id: "diseaseParts",
        get title() { return ta("بیماری‌ها"); },
        icon: <FolderIcon />,
        items: [
      { get title() { return ta("دسته‌بندی بیماری‌ها"); }, href: "diseaseCategory", access: "Disease" },
      { get title() { return ta("تگ بیماری‌ها"); }, href: "diseaseTag", access: "Disease" },
        ],
      },
    ],
  },
  {
    hub: "symptom",
    sections: [
      {
        id: "symptomParts",
        get title() { return ta("علائم"); },
        icon: <FolderIcon />,
        items: [
      { get title() { return ta("دسته‌بندی علائم"); }, href: "symptomCategory", access: "Symptom" },
      { get title() { return ta("اعضای بدن"); }, href: "part", access: "Part" },
        ],
      },
    ],
  },
  {
    hub: "drug",
    sections: [
      {
        id: "drugParts",
        get title() { return ta("داروها"); },
        icon: <FolderIcon />,
        items: [
      { get title() { return ta("برچسب داروها"); }, href: "drugTag", access: "Drug" },
        ],
      },
    ],
  },
  {
    hub: "clinic",
    sections: [
      {
        id: "clinicParts",
        get title() { return ta("کلینیک‌ها"); },
        icon: <FolderIcon />,
        items: [
      { get title() { return ta("دسته‌بندی کلینیک‌ها"); }, href: "clinicCategory", access: "Clinic" },
      { get title() { return ta("تگ کلینیک‌ها"); }, href: "clinicTag", access: "Clinic" },
        ],
      },
    ],
  },
  {
    hub: "hospital",
    sections: [
      {
        id: "hospitalParts",
        get title() { return ta("بیمارستان‌ها"); },
        icon: <FolderIcon />,
        items: [
      { get title() { return ta("دسته‌بندی بیمارستان‌ها"); }, href: "hospitalCategory", access: "Hospital" },
      { get title() { return ta("تگ بیمارستان‌ها"); }, href: "hospitalTag", access: "Hospital" },
        ],
      },
    ],
  },
  {
    hub: "paraClinic",
    sections: [
      {
        id: "paraClinicParts",
        get title() { return ta("پاراکلینیک‌ها"); },
        icon: <FolderIcon />,
        items: [
      { get title() { return ta("دسته‌بندی پاراکلینیک"); }, href: "paraClinicCategory", access: "ParaClinic" },
      { get title() { return ta("تگ پاراکلینیک"); }, href: "paraClinicTag", access: "ParaClinic" },
        ],
      },
    ],
  },
  {
    hub: "insurance",
    sections: [
      {
        id: "insuranceParts",
        get title() { return ta("بیمه‌ها"); },
        icon: <FolderIcon />,
        items: [
      { get title() { return ta("دسته‌بندی بیمه‌ها"); }, href: "insuranceCategory", access: "Insurance" },
      { get title() { return ta("تگ بیمه"); }, href: "insuranceTag", access: "Insurance" },
        ],
      },
    ],
  },
  {
    hub: "service",
    sections: [
      {
        id: "serviceParts",
        get title() { return ta("خدمات"); },
        icon: <FolderIcon />,
        items: [
      { get title() { return ta("پکیج‌های خدمات"); }, href: "servicePackage", access: "Service" },
      { get title() { return ta("دسته‌بندی خدمات"); }, href: "serviceCategory", access: "Service" },
        ],
      },
    ],
  },
  {
    hub: "product",
    sections: [
      {
        id: "productParts",
        get title() { return ta("محصولات"); },
        icon: <FolderIcon />,
        items: [
      { get title() { return ta("بسته‌های محصول"); }, href: "productPackage", access: "Product" },
      { get title() { return ta("دسته‌بندی محصولات"); }, href: "productCategory", access: "Product" },
        ],
      },
    ],
  },
  {
    hub: "test",
    sections: [
      {
        id: "testParts",
        get title() { return ta("آزمایش‌ها"); },
        icon: <FolderIcon />,
        items: [
      { get title() { return ta("دسته‌بندی تست‌ها"); }, href: "testCategory", access: "Test" },
        ],
      },
    ],
  },
  {
    hub: "province",
    sections: [
      {
        id: "provinceParts",
        get title() { return ta("استان، شهر و محله"); },
        icon: <FolderIcon />,
        items: [
      { get title() { return ta("شهرها"); }, href: "city" },
      { get title() { return ta("محله‌ها"); }, href: "district" },
        ],
      },
    ],
  },
  {
    hub: "licensePlans",
    sections: [
      {
        id: "licensePlansParts",
        get title() { return ta("پلن‌ها و مجوزها"); },
        icon: <FolderIcon />,
        items: [
      { get title() { return ta("پلن‌های پزشک"); }, href: "baseDoctorLicense" },
      { get title() { return ta("پلن‌های کلینیک"); }, href: "baseClinicLicense" },
      { get title() { return ta("پلن‌های بیمارستان"); }, href: "baseHospitalLicense" },
      { get title() { return ta("پلن‌های داروخانه"); }, href: "basePharmacyLicense" },
      { get title() { return ta("پلن‌های پاراکلینیک"); }, href: "baseParaClinicLicense" },
      { get title() { return ta("پلن‌های بیمه"); }, href: "baseInsuranceLicense" },
      { get title() { return ta("اشتراک‌ها"); }, href: "licensePlans?tab=subscriptions", access: "Finance" },
        ],
      },
    ],
  },
  {
    hub: "financeSettings",
    sections: [
      {
        id: "financeSettingsParts",
        get title() { return ta("تنظیمات مالی"); },
        icon: <FolderIcon />,
        items: [
      { get title() { return ta("کمیسیون"); }, href: "globalFinanceSettings" },
      { get title() { return ta("مالیات"); }, href: "globalTaxSettings" },
      { get title() { return ta("تنظیمات ارسال"); }, href: "deliverySettings" },
        ],
      },
    ],
  },
  {
    hub: "messaging",
    sections: [
      {
        id: "messagingParts",
        get title() { return ta("پیامک و اعلان‌ها"); },
        icon: <FolderIcon />,
        items: [
      { get title() { return ta("درگاه پیامک"); }, href: "smsSettings" },
      { get title() { return ta("پترن‌های پیامک"); }, href: "smsPatterns" },
      { get title() { return ta("اعلان همگانی"); }, href: "notification", access: "Notification" },
      { get title() { return ta("گزارش پیامک‌ها"); }, href: "messaging?tab=smsLog" },
        ],
      },
    ],
  },
  {
    hub: "team",
    sections: [
      {
        id: "teamParts",
        get title() { return ta("تیم و دسترسی‌ها"); },
        icon: <FolderIcon />,
        items: [
      { get title() { return ta("کارکنان"); }, href: "useraccesslevel" },
      { get title() { return ta("نقش‌ها (سطح دسترسی)"); }, href: "accesslevel" },
      { get title() { return ta("هشدارهای کارکنان"); }, href: "userAlert" },
        ],
      },
    ],
  },
  {
    hub: "aboutPage",
    sections: [
      {
        id: "aboutPageParts",
        get title() { return ta("صفحه‌ی درباره ما"); },
        icon: <FolderIcon />,
        items: [
      { get title() { return ta("چرا ما و اصول"); }, href: "aboutWhy" },
      { get title() { return ta("تیم"); }, href: "aboutTeam" },
      { get title() { return ta("همکاران"); }, href: "aboutPartner" },
        ],
      },
    ],
  },
  {
    hub: "doctorsPage",
    sections: [
      {
        id: "doctorsPageParts",
        get title() { return ta("صفحه‌ی همکاری پزشکان"); },
        icon: <FolderIcon />,
        items: [
      { get title() { return ta("توصیه‌نامه‌ی پزشکان"); }, href: "testify" },
        ],
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

// A menu href without its query ("faq?tab=questions" -> "faq").
const pathOf = (href: string) => href.split("?")[0];

// Hub item href a (hub-listed) page belongs to, e.g. "clinicTag" -> "clinic".
export const hubOfPage = (href: string) =>
  adminHubs.find((hub) =>
    hub.sections.some((section) =>
      section.items.some((item) => pathOf(item.href) === pathOf(href)),
    ),
  )?.hub;

// Hub sections under a super-only menu item (see adminAllGroups).
const superSectionIds = new Set(
  adminAllGroups.filter((group) => group.super).map((group) => group.id),
);

// Page path (e.g. "finance/orders") -> what guards it, for AdminLayout's
// page guard. A tab entry of a hub ("licensePlans?tab=subscriptions") is
// not a page of its own; the hub check in canNotAdminOpen covers it.
const pageInfo = new Map<string, { super: boolean; access?: AccessLevelModel }>();
for (const group of adminAllGroups)
  for (const item of group.items) {
    const path = pathOf(item.href);
    if (path !== item.href) continue;
    if (!pageInfo.has(path))
      pageInfo.set(path, { super: !!group.super, access: item.access });
  }

// The longest listed page a path is under: "finance/orders/123" ->
// "finance/orders", "doctorprofile/123" -> "doctorprofile".
const infoOf = (path: string) => {
  const parts = path.split("/").filter(Boolean);
  for (let i = parts.length; i > 0; i--) {
    const info = pageInfo.get(parts.slice(0, i).join("/"));
    if (info) return info;
  }
  return undefined;
};

type HasAccess = (
  model: AccessLevelModel,
  op: "readAll" | "readOne",
) => boolean;

const accessOpens = (hasAccess: HasAccess, access?: AccessLevelModel) =>
  !!access && (hasAccess(access, "readAll") || hasAccess(access, "readOne"));

// Whether restricted staff (role notadmin) may open an admin path: the part
// after /<adminKey>/, e.g. "finance/orders/123" (a query is ignored).
export const canNotAdminOpen = (
  rawPath: string,
  hasAccess: HasAccess,
): boolean => {
  const path = pathOf(rawPath).replace(/^\/+|\/+$/g, "");
  if (path === "") return true;
  // A hub page opens for staff who can open at least one page on it.
  const hub = adminHubs.find((el) => el.hub === path);
  // its own list (e.g. "clinic" is the clinics list and the hub of their
  // categories and tags)
  const own = pageInfo.get(path);
  if (hub && own && !own.super && accessOpens(hasAccess, own.access))
    return true;
  if (hub)
    return hub.sections.some(
      (section) =>
        !section.super &&
        !superSectionIds.has(section.id) &&
        section.items.some((item) =>
          pathOf(item.href) === path
            ? accessOpens(hasAccess, item.access)
            : canNotAdminOpen(item.href, hasAccess),
        ),
    );
  const info = infoOf(path);
  if (!info || info.super) return false;
  return accessOpens(hasAccess, info.access);
};
