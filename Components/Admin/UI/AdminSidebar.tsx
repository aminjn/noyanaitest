import { useMemo, useState } from "react";
import classes from "./AdminSidebar.module.css";
import Link from "next/link";
import { usePathname } from "next/navigation";
import Ixon from "@/Components/UI/Ixon";
import ChevronIcon from "@/Components/Icons/ChevronIcon";
import useUser from "@/Components/Hooks/useUser";
import LogoLong from "@/Components/UI/LogoLong";
import { adminPath } from "@/Components/helpers/adminPath";
import useAccessLevel from "@/Components/Hooks/useAccessLevel";
import { AccessLevelModel } from "../AccessLevel/AdminManageAccessLevelsPage";

type LinkItem = {
  title: string;
  target: string;
  access?: AccessLevelModel;
  links?: { title: string; target: string }[];
};

type LinkMap = {
  title: string;
  super?: boolean;
  links: LinkItem[];
}[];

const linkMap: LinkMap = [
  {
    title: "منو اصلی",
    links: [
      { target: "", title: "داشبورد" },
      { target: "analytics", title: "آمار بازدید" },
      { target: "ollama", title: "AI" },
      {
        target: "blog",
        title: "مقالات",
        access: "Blog",
      },
      {
        title: "دسته‌بندی مقالات",
        target: "blogcategory",
        access: "BlogCategory",
      },
      {
        title: "تبلیغات خطی",
        target: "inlinead",
        access: "InlineAdvertisement",
      },
      { title: "مولتی مدیا وبلاگ", target: "blogmedia", access: "BlogMedia" },
      { title: "لغت نامه", target: "textcontent", access: "TextContent" },
      { title: "تخصص ها", target: "speciality", access: "Sepciality" },
      {
        title: "درخواست های پزشک شدن",
        target: "becomedoctor",
        access: "BecomeDoctorRequest",
      },
      {
        title: "درخواست کلینیک شدن",
        access: "BecomeClinicRequest",
        target: "becomeclinic",
      },
      {
        title: "درخواست داروخانه شدن",
        access: "BecomePharmacyRequest",
        target: "becomepharmacy",
      },
      {
        title: "درخواست بیمه شدن",
        access: "BecomeInsuranceRequest",
        target: "becomeinsurance",
      },
      { title: "درخواست پاراکلینیک شدن", target: "becomeParaClinic" },
      {
        title: "درخواست بیمارستان شدن",
        target: "becomehospital",
        access: "BecomeHospitalRequest",
      },
      { title: "کاربران", target: "user", access: "User" },
      {
        title: "پروفایل پزشکان",
        target: "doctorprofile",
        access: "DoctorProfile",
      },
      { title: "پزشکان", target: "doctor", access: "Doctor" },
      { title: "کلینیک ها", target: "clinic", access: "Clinic" },
      {
        title: "عضویت پزشکان در کلینیک",
        target: "doctorjoinclinic",
        access: "DoctorJoinClinic",
      },
      {
        title: "درخواست های اضافه شدن کلینیک",
        target: "clinicaddition",
        access: "ClinicAdditionRequest",
      },
      {
        title: "دسترسی پیش فرض منشی دکتر",
        access: "DoctorSeretaryAccessLevel",
        target: "doctorsecretaryaccesslevel",
      },
      { title: "بیمه", access: "Insurance", target: "insurance" },
      { title: "داروخانه و آزمایشگاه", access: "Pharmacy", target: "pharmacy" },
      { title: "پاراکلینیک", target: "paraClinic" },
      { title: "تماس ها", access: "CallRoom", target: "callroom" },
      { title: "تیکت های پشتیبانی", target: "ticket" },
      { title: "اعلان‌ها", target: "notification" },
      { title: "تنظیمات اطلاع‌رسانی کاربران", target: "userAlert" },
      { title: "تست نوتیفیکیشن پوش", target: "pushTest" },
      { title: "تست اسنپ (پیک)", target: "snappTest" },
      { title: "تست درگاه پرداخت (سپ)", target: "sepTest" },
      { title: "لینک کوتاه", access: "ShortLink", target: "shortlink" },
      { title: "انتقالات", access: "Redirection", target: "redirection" },
      { title: "بیماری ها", access: "Disease", target: "disease" },
      { title: "دارو ها", access: "Drug", target: "drug" },
      { title: "علائم", access: "Symptom", target: "symptom" },
      { title: "اعضای بدن", access: "Part", target: "part" },
      {
        title: "سوالات متداول پزشکان",
        access: "DoctorFaq",
        target: "doctorfaq",
      },
      { title: "مثال های بات", target: "aiExample" },
      { title: "معرفی خانه", target: "homeIntroduction" },
      { title: "تبلیغات", target: "advertisement" },
      { title: "خدمات", target: "service" },
      { title: "سوالات متداول", target: "faq" },
      { title: "دسته بندی خدمات", target: "serviceCategory" },
      { title: "استان ها", target: "province" },
      { title: "دسته بندی محصولات", target: "productCategory" },
      { title: "محصولات", target: "product" },
      { title: "دسته بندی کلینیک", target: "clinicCategory" },
      { title: "دسته بندی بیماری ها", target: "diseaseCategory" },
      { title: "تگ بیماری ها", target: "diseaseTag" },
      { title: "تگ دارو ها", target: "drugTag" },
      { title: "دسته بندی تخصص ها", target: "specialityCategory" },
      { title: "تگ کلینیک ها", target: "clinicTag" },
      { title: "بیمارستان ها", target: "hospital", access: "Hospital" },
      {
        title: "عضویت پزشکان در بیمارستان",
        target: "doctorjoinhospital",
        access: "DoctorJoinHospital",
      },
      {
        title: "درخواست های اضافه شدن بیمارستان",
        target: "hospitaladdition",
        access: "HospitalAdditionRequest",
      },
      { title: "دسته بندی بیمارستان ها", target: "hospitalCategory" },
      { title: "تگ بیمارستان", target: "hospitalTag" },
      { title: "دسته بندی تست ها", target: "testCategory" },
      { title: "تست ها", target: "test" },
      { title: "تگ پاراکلینیک", target: "paraClinicTag" },
      { title: "دسته بندی پاراکلینیک", target: "paraClinicCategory" },
      { title: "سرویس پکیج ها", target: "servicePackage" },
      { title: "بسته محصولات", target: "productPackage" },
      { title: "دسته بندی علائم", target: "symptomCategory" },
      { title: "نظرات", target: "comment" },
      { title: "دسته بندی بیمه ها", target: "insuranceCategory" },
      { title: "تگ بیمه", target: "insuranceTag" },
      {
        title: "درخواست های اضافه شدن بیمه",
        target: "insuranceaddition",
      },
      { title: "دسته بندی سوالات متداول", target: "faqCategory" },
      { title: "درخواست تماس ها", target: "contactRequest" },
      { title: "مقررات", target: "privacy" },
      { title: "پلن های مجوز پزشک", target: "baseDoctorLicense" },
      { title: "پلن های مجوز داروخانه", target: "basePharmacyLicense" },
      { title: "پلن های مجوز کلینیک", target: "baseClinicLicense" },
      { title: "پلن های مجوز پاراکلینیک", target: "baseParaClinicLicense" },
      { title: "پلن های مجوز بیمارستان", target: "baseHospitalLicense" },
      { title: "پلن های مجوز بیمه", target: "baseInsuranceLicense" },
      { title: "مدت زمان مجوز", target: "licenseDuration" },
      { title: "درباره همکاران", target: "aboutPartner" },
      { title: "درباره تیم", target: "aboutTeam" },
      { title: "درباره چرا", target: "aboutWhy" },
      { title: "تستیفای", target: "testify" },
      { title: "متادیتای صفحات", target: "pageMeta" },
      { title: "تگ وبلاگ", target: "blogTag" },
      { title: "خبرنامه", target: "blogRrs" },
      { title: "توضیحات رزرو", target: "bookingDescription" },
    ],
  },
  {
    title: "دیتابیس قدیم",
    super: true,
    links: [
      {
        target: "old",
        title: "دیتا",
        links: [
          { title: "پزشکان", target: "doctor" },
          { title: "کاربران", target: "user" },
          { title: "تخصص ها", target: "speciality" },
          { title: "مقالات", target: "blog" },
          { title: "بیماری ها", target: "disease" },
          { title: "دارو ها", target: "drug" },
          { title: "اعضا", target: "part" },
          { title: "علائم", target: "symptom" },
        ],
      },
      {
        target: "cold",
        title: "عملیات",
        links: [{ title: "مهاجرت", target: "migrate" }],
      },
    ],
  },
  {
    title: "سوپر ادمین",
    super: true,
    links: [
      { title: "سطوح دسترسی", target: "accesslevel" },
      { title: "ادمین ها", target: "useraccesslevel" },
      { title: "تنظیمات سیستم", target: "appConfig" },
      { title: "تنظیمات مالی", target: "globalFinanceSettings" },
      { title: "تنظیمات مالیاتی", target: "globalTaxSettings" },
      { title: "پترن‌های پیامک", target: "smsPatterns" },
      { title: "تصاویر ثابت", target: "staticImages" },
      {
        title: "تامین اجتماعی",
        target: "tamin",
        links: [
          { title: "انواع نسخه", target: "prescriptionType" },
          { title: "سرویس تایپ", target: "serviceType" },
          { title: "سرویس", target: "service" },
          { title: "زیر گروه نسخ آزمایش", target: "parTaref" },
          { title: "مقادیر مصرف", target: "drugUsage" },
          { title: "طریقه مصرف", target: "drugAmount" },
          { title: "زمان مصرف", target: "drugInstruction" },
          { title: "طرح درمان", target: "phPlan" },
          { title: "انواع بیماری", target: "phIllness" },
          { title: "icid", target: "Icids" },
          { title: "complaints", target: "complaint" },
          { title: "specs", target: "spec" },
          // Tamin sandbox test consoles (2026-09) - see
          // Controllers/adminTaminController.ts on noyanai-back and
          // Components/Admin/Tamin/AdminTaminTestConsole.tsx. Real end
          // users can no longer reach Tamin at all (see
          // Controllers/featureGateController.ts) so this is now the only
          // way to exercise the sandbox API, same idea as "تست اسنپ (پیک)"
          // below for Snapp.
          { title: "تست پزشک (تامین)", target: "doctorTest" },
          { title: "تست داروخانه (تامین)", target: "pharmacyTest" },
          { title: "تست کلینیک (تامین)", target: "clinicTest" },
          { title: "تست پاراکلینیک (تامین)", target: "paraClinicTest" },
        ],
      },
    ],
  },
];

// Which AccessLevel (if any) guards each top-level admin route segment, and
// whether it lives in a super-admin-only group. Used by AdminLayout to block
// notadmin staff from opening pages by URL that the sidebar hides from them.
const targetInfo = new Map<string, { super: boolean; access?: AccessLevelModel }>();
for (const group of linkMap)
  for (const link of group.links)
    if (!targetInfo.has(link.target))
      targetInfo.set(link.target, { super: !!group.super, access: link.access });

export const canNotAdminOpen = (
  target: string,
  hasAccess: (model: AccessLevelModel, op: "readAll" | "readOne") => boolean,
) => {
  if (target === "") return true;
  const info = targetInfo.get(target);
  if (!info || info.super || !info.access) return false;
  return hasAccess(info.access, "readAll") || hasAccess(info.access, "readOne");
};

const Waterfall = ({ item }: { item: LinkItem }) => {
  const pathname = usePathname();
  const [isOpen, setIsOpen] = useState<boolean>(
    pathname.split("/")[2] === item.target,
  );

  const isActive = useMemo<boolean>(() => {
    const splitted = pathname.split("/");
    return (splitted[2] || "") === item.target;
  }, [item.target, pathname]);

  if (!item.links)
    return (
      <Link
        href={adminPath(`/${item.target}`)}
        className={`${classes.link} ${classes.solo} ${
          isActive ? classes.active : ""
        }`}
      >
        <span>{item.title}</span>
      </Link>
    );

  return (
    <div
      className={`${classes.waterfallContainer} ${
        isActive ? classes.active : ""
      }`}
      style={{
        paddingBottom: isOpen ? undefined : 0,
      }}
    >
      <button
        className={`${classes.link} ${isActive ? classes.active : ""}`}
        onClick={() => setIsOpen((prev) => !prev)}
      >
        <span>{item.title}</span>
        <Ixon
          width="1.5rem"
          className={classes.chevron}
          style={{ transform: `rotateZ(${isOpen ? 0 : 180}deg)` }}
        >
          <ChevronIcon />
        </Ixon>
      </button>
      <div
        className={classes.subs}
        style={{
          maxHeight: isOpen ? `${item.links.length * 3}rem` : 0,
          paddingTop: isOpen ? undefined : 0,
        }}
      >
        {item.links.map((link) => (
          <Link
            key={link.title}
            href={adminPath(`/${item.target}/${link.target}`)}
            className={`${classes.sub} ${
              isActive && pathname.split("/")[3] === link.target
                ? classes.activeSub
                : ""
            }`}
          >
            {link.title}
          </Link>
        ))}
      </div>
    </div>
  );
};

const AdminSidebar = () => {
  const { user } = useUser(true);

  const hasAccess = useAccessLevel();

  const [search, setSearch] = useState<string>("");

  const readyLinks = useMemo<LinkMap>(() => {
    if (!user) return [];
    const isAdmin = user.role === "admin";
    const term = search.toLowerCase();
    // Full admins see everything. Restricted staff (notadmin) only see links
    // backed by an AccessLevel they can readAll - links without `access` hit
    // admin-only backend routes, so they're hidden too (except the dashboard).
    const canSee = (link: LinkItem) =>
      isAdmin ||
      link.target === "" ||
      (link.access !== undefined && hasAccess(link.access, "readAll"));
    return linkMap
      .filter((group) => !group.super || isAdmin)
      .map((group) => ({
        ...group,
        links: group.links
          .filter(canSee)
          .filter(
            (el) =>
              el.title.toLowerCase().includes(term) ||
              el.target.toLowerCase().includes(term),
          ),
      }))
      .filter((group) => group.links.length > 0);
  }, [hasAccess, user, search]);

  return (
    <div className={classes.main}>
      <Link className={classes.logo} href={"/"}>
        <LogoLong />
      </Link>
      <input onChange={(e) => setSearch(e.target.value)} />
      <div className={classes.linksContainer}>
        {readyLinks.map((group) => (
          <div key={group.title} className={classes.group}>
            <legend className={classes.groupTitle}>{group.title}</legend>
            <div className={classes.links}>
              {group.links.map((link) => (
                <Waterfall key={link.target} item={link} />
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default AdminSidebar;
