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
      { title: "تماس ها", access: "CallRoom", target: "callroom" },
      { title: "لینک کوتاه", access: "ShortLink", target: "shortlink" },
      { title: "انتقالات", access: "Redirection", target: "redirection" },
      { title: "بیماری ها", access: "Disease", target: "disease" },
      { title: "دارو ها", access: "Drug", target: "drug" },
      { title: "علائم", access: "Symptom", target: "symptom" },
      { title: "اعضای بدن", access: "Part", target: "part" },
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
    ],
  },
];

const Waterfall = ({ item }: { item: LinkItem }) => {
  const pathname = usePathname();
  const [isOpen, setIsOpen] = useState<boolean>(
    pathname.split("/")[2] === item.target
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

  const readyLinks = useMemo<LinkMap>(() => {
    if (!user) return [];
    if (user.role !== "admin") {
      const result: LinkMap = [];
      for (let i = 0; i < linkMap.length; ++i) {
        if (!linkMap[i].super)
          result.push({
            ...linkMap[i],
            links: linkMap[i].links.filter(
              (link) =>
                link.access === undefined || hasAccess(link.access, "readAll")
            ),
          });
        return result;
      }
    }
    return linkMap;
  }, [hasAccess, user]);

  return (
    <div className={classes.main}>
      <Link className={classes.logo} href={"/"}>
        <LogoLong />
      </Link>
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
