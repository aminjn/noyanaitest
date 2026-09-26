import { ReactNode } from "react";
import { AccessLevelModel } from "../AccessLevel/AdminManageAccessLevelsPage";
import DashboardIcon from "@/Components/Icons/DashboardIcon";
import TargetIcon from "@/Components/Icons/TargetIcon";
import UserGroupIcon from "@/Components/Icons/UserGroupIcon";
import StetoscopeIcon from "@/Components/Icons/StetoscopeIcon";
import BuildingIcon from "@/Components/Icons/BuildingIcon";
import HospitalIcon from "@/Components/Icons/HospitalIcon";
import FlaskIcon from "@/Components/Icons/FlaskIcon";
import PillIcon from "@/Components/Icons/PillIcon";
import ShieldCheckIcon from "@/Components/Icons/ShieldCheckIcon";
import PackageIcon from "@/Components/Icons/PackageIcon";
import MedicalRecordIcon from "@/Components/Icons/MedicalRecordIcon";
import BookOpenIcon from "@/Components/Icons/BookOpenIcon";
import WEbsiteIcon from "@/Components/Icons/WEbsiteIcon";
import LinkIcon from "@/Components/Icons/LinkIcon";
import HeadphoneIcon from "@/Components/Icons/HeadphoneIcon";
import MedalIcon from "@/Components/Icons/MedalIcon";
import AiIcon from "@/Components/Icons/AiIcon";
import CrownIcon from "@/Components/Icons/CrownIcon";
import MedicalReportIcon from "@/Components/Icons/MedicalReportIcon";
import CogIcon from "@/Components/Icons/CogIcon";
import FolderIcon from "@/Components/Icons/FolderIcon";

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

// Always visible at the top, outside the collapsible groups.
export const adminPinnedItems: (AdminMenuItem & { icon: ReactNode })[] = [
  { title: "داشبورد", href: "", icon: <DashboardIcon /> },
  { title: "آمار بازدید", href: "analytics", icon: <TargetIcon /> },
];

export const adminMenu: AdminMenuGroup[] = [
  {
    id: "users",
    title: "کاربران و درخواست‌ها",
    icon: <UserGroupIcon />,
    items: [
      { title: "کاربران", href: "user", access: "User" },
      { title: "درخواست پزشک شدن", href: "becomedoctor", access: "BecomeDoctorRequest" },
      { title: "درخواست کلینیک شدن", href: "becomeclinic", access: "BecomeClinicRequest" },
      { title: "درخواست داروخانه شدن", href: "becomepharmacy", access: "BecomePharmacyRequest" },
      { title: "درخواست بیمه شدن", href: "becomeinsurance", access: "BecomeInsuranceRequest" },
      { title: "درخواست پاراکلینیک شدن", href: "becomeParaClinic" },
      { title: "درخواست بیمارستان شدن", href: "becomehospital", access: "BecomeHospitalRequest" },
    ],
  },
  {
    id: "doctors",
    title: "پزشکان",
    icon: <StetoscopeIcon />,
    items: [
      { title: "پزشکان", href: "doctor", access: "Doctor" },
      { title: "پروفایل پزشکان", href: "doctorprofile", access: "DoctorProfile" },
      { title: "تخصص‌ها", href: "speciality", access: "Sepciality" },
      { title: "دسته‌بندی تخصص‌ها", href: "specialityCategory" },
      { title: "سوالات متداول پزشکان", href: "doctorfaq", access: "DoctorFaq" },
      { title: "دسترسی پیش‌فرض منشی", href: "doctorsecretaryaccesslevel", access: "DoctorSeretaryAccessLevel" },
    ],
  },
  {
    id: "clinics",
    title: "کلینیک‌ها",
    icon: <BuildingIcon />,
    items: [
      { title: "کلینیک‌ها", href: "clinic", access: "Clinic" },
      { title: "عضویت پزشکان در کلینیک", href: "doctorjoinclinic", access: "DoctorJoinClinic" },
      { title: "درخواست‌های اضافه شدن کلینیک", href: "clinicaddition", access: "ClinicAdditionRequest" },
      { title: "دسته‌بندی کلینیک‌ها", href: "clinicCategory" },
      { title: "تگ کلینیک‌ها", href: "clinicTag" },
    ],
  },
  {
    id: "hospitals",
    title: "بیمارستان‌ها",
    icon: <HospitalIcon />,
    items: [
      { title: "بیمارستان‌ها", href: "hospital", access: "Hospital" },
      { title: "عضویت پزشکان در بیمارستان", href: "doctorjoinhospital", access: "DoctorJoinHospital" },
      { title: "درخواست‌های اضافه شدن بیمارستان", href: "hospitaladdition", access: "HospitalAdditionRequest" },
      { title: "دسته‌بندی بیمارستان‌ها", href: "hospitalCategory" },
      { title: "تگ بیمارستان‌ها", href: "hospitalTag" },
    ],
  },
  {
    id: "paraclinic",
    title: "پاراکلینیک و آزمایش",
    icon: <FlaskIcon />,
    items: [
      { title: "پاراکلینیک‌ها", href: "paraClinic" },
      { title: "دسته‌بندی پاراکلینیک", href: "paraClinicCategory" },
      { title: "تگ پاراکلینیک", href: "paraClinicTag" },
      { title: "تست‌ها", href: "test" },
      { title: "دسته‌بندی تست‌ها", href: "testCategory" },
    ],
  },
  {
    id: "pharmacy",
    title: "داروخانه و فروشگاه",
    icon: <PillIcon />,
    items: [
      { title: "داروخانه و آزمایشگاه", href: "pharmacy", access: "Pharmacy" },
      { title: "محصولات", href: "product" },
      { title: "دسته‌بندی محصولات", href: "productCategory" },
      { title: "بسته‌های محصول", href: "productPackage" },
    ],
  },
  {
    id: "insurance",
    title: "بیمه",
    icon: <ShieldCheckIcon />,
    items: [
      { title: "بیمه‌ها", href: "insurance", access: "Insurance" },
      { title: "درخواست‌های اضافه شدن بیمه", href: "insuranceaddition" },
      { title: "دسته‌بندی بیمه‌ها", href: "insuranceCategory" },
      { title: "تگ بیمه", href: "insuranceTag" },
    ],
  },
  {
    id: "services",
    title: "خدمات و رزرو",
    icon: <PackageIcon />,
    items: [
      { title: "خدمات", href: "service" },
      { title: "دسته‌بندی خدمات", href: "serviceCategory" },
      { title: "پکیج‌های خدمات", href: "servicePackage" },
      { title: "توضیحات رزرو", href: "bookingDescription" },
    ],
  },
  {
    id: "medical",
    title: "دانشنامه پزشکی",
    icon: <MedicalRecordIcon />,
    items: [
      { title: "بیماری‌ها", href: "disease", access: "Disease" },
      { title: "دسته‌بندی بیماری‌ها", href: "diseaseCategory" },
      { title: "تگ بیماری‌ها", href: "diseaseTag" },
      { title: "داروها", href: "drug", access: "Drug" },
      { title: "تگ داروها", href: "drugTag" },
      { title: "علائم", href: "symptom", access: "Symptom" },
      { title: "دسته‌بندی علائم", href: "symptomCategory" },
      { title: "اعضای بدن", href: "part", access: "Part" },
    ],
  },
  {
    id: "blog",
    title: "وبلاگ",
    icon: <BookOpenIcon />,
    items: [
      { title: "مقالات", href: "blog", access: "Blog" },
      { title: "دسته‌بندی مقالات", href: "blogcategory", access: "BlogCategory" },
      { title: "تگ‌های وبلاگ", href: "blogTag" },
      { title: "مولتی‌مدیا وبلاگ", href: "blogmedia", access: "BlogMedia" },
      { title: "خبرنامه", href: "blogRrs" },
    ],
  },
  {
    id: "site",
    title: "محتوای سایت",
    icon: <WEbsiteIcon />,
    items: [
      { title: "معرفی صفحه اصلی", href: "homeIntroduction" },
      { title: "تبلیغات", href: "advertisement" },
      { title: "تبلیغات خطی", href: "inlinead", access: "InlineAdvertisement" },
      { title: "سوالات متداول", href: "faq" },
      { title: "دسته‌بندی سوالات متداول", href: "faqCategory" },
      { title: "درباره همکاران", href: "aboutPartner" },
      { title: "درباره تیم", href: "aboutTeam" },
      { title: "چرا ما", href: "aboutWhy" },
      { title: "نظرات مشتریان", href: "testify" },
      { title: "قوانین و مقررات", href: "privacy" },
      { title: "لغت‌نامه", href: "textcontent", access: "TextContent" },
      { title: "استان‌ها و شهرها", href: "province" },
    ],
  },
  {
    id: "seo",
    title: "سئو و لینک‌ها",
    icon: <LinkIcon />,
    items: [
      { title: "متادیتای صفحات", href: "pageMeta" },
      { title: "لینک‌های کوتاه", href: "shortlink", access: "ShortLink" },
      { title: "ریدایرکت‌ها", href: "redirection", access: "Redirection" },
    ],
  },
  {
    id: "support",
    title: "پشتیبانی و ارتباطات",
    icon: <HeadphoneIcon />,
    items: [
      { title: "تیکت‌های پشتیبانی", href: "ticket" },
      { title: "درخواست‌های تماس", href: "contactRequest" },
      { title: "نظرات کاربران", href: "comment" },
      { title: "تماس‌ها", href: "callroom", access: "CallRoom" },
      { title: "اعلان‌ها", href: "notification" },
      { title: "تنظیمات اطلاع‌رسانی کاربران", href: "userAlert" },
    ],
  },
  {
    id: "licenses",
    title: "مجوزها و پلن‌ها",
    icon: <MedalIcon />,
    items: [
      { title: "پلن‌های پزشک", href: "baseDoctorLicense" },
      { title: "پلن‌های داروخانه", href: "basePharmacyLicense" },
      { title: "پلن‌های کلینیک", href: "baseClinicLicense" },
      { title: "پلن‌های پاراکلینیک", href: "baseParaClinicLicense" },
      { title: "پلن‌های بیمارستان", href: "baseHospitalLicense" },
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
    id: "superAdmin",
    title: "مدیریت سیستم",
    icon: <CrownIcon />,
    super: true,
    items: [
      { title: "ادمین‌ها", href: "useraccesslevel" },
      { title: "سطوح دسترسی", href: "accesslevel" },
      { title: "تنظیمات سیستم", href: "appConfig" },
      { title: "تنظیمات مالی", href: "globalFinanceSettings" },
      { title: "تنظیمات مالیاتی", href: "globalTaxSettings" },
      { title: "پترن‌های پیامک", href: "smsPatterns" },
      { title: "تصاویر ثابت", href: "staticImages" },
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
  {
    id: "tests",
    title: "ابزارهای تست",
    icon: <CogIcon />,
    super: true,
    items: [
      { title: "تست نوتیفیکیشن پوش", href: "pushTest" },
      { title: "تست پیک اسنپ", href: "snappTest" },
      { title: "تست درگاه پرداخت سپ", href: "sepTest" },
      // Tamin sandbox consoles - see Components/Admin/Tamin/AdminTaminTestConsole.tsx.
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
];

// First URL segment -> what guards it, for AdminLayout's page guard.
const segmentInfo = new Map<string, { super: boolean; access?: AccessLevelModel }>();
for (const group of adminMenu)
  for (const item of group.items) {
    const segment = item.href.split("/")[0];
    if (!segmentInfo.has(segment))
      segmentInfo.set(segment, { super: !!group.super, access: item.access });
  }

export const canNotAdminOpen = (
  segment: string,
  hasAccess: (model: AccessLevelModel, op: "readAll" | "readOne") => boolean,
) => {
  if (segment === "") return true;
  const info = segmentInfo.get(segment);
  if (!info || info.super || !info.access) return false;
  return hasAccess(info.access, "readAll") || hasAccess(info.access, "readOne");
};
