import { useMemo, useState } from "react";
import classes from "./AdminSidebar.module.css";
import Link from "next/link";
import { usePathname } from "next/navigation";
import Ixon from "@/Components/UI/Ixon";
import ChevronIcon from "@/Components/Icons/ChevronIcon";
import useUser from "@/Components/Hooks/useUser";
import LogoLong from "@/Components/UI/LogoLong";
import { adminPath } from "@/Components/helpers/adminPath";

type LinkItem = {
  title: string;
  target: string;
  links?: { title: string; target: string }[];
};

const linkMap: {
  title: string;
  links: LinkItem[];
}[] = [
  {
    title: "منو اصلی",
    links: [
      { target: "", title: "داشبورد" },
      {
        target: "blog",
        title: "مقالات",
      },
      { title: "دسته‌بندی مقالات", target: "blogcategory" },
      { title: "تبلیغات خطی", target: "inlinead" },
      { title: "مولتی مدیا وبلاگ", target: "blogmedia" },
      { title: "لغت نامه", target: "textcontent" },
      { title: "تخصص ها", target: "speciality" },
      { title: "درخواست های پزشک شدن", target: "becomedoctor" },
      { title: "کاربران", target: "user" },
      { title: "پروفایل پزشکان", target: "doctorprofile" },
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
  useUser(true);
  return (
    <div className={classes.main}>
      <Link className={classes.logo} href={"/"}>
        <LogoLong />
      </Link>
      <div className={classes.linksContainer}>
        {linkMap.map((group) => (
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
