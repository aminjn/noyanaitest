"use client";

import useSWR from "swr";
import { API } from "@/Components/config";
import { fetcher } from "@/Components/helpers/fetcher";
import { adminPath } from "@/Components/helpers/adminPath";
import Link from "@/Components/i18n/Link";
import HandleLoading from "../UI/HandleLoading";
import { ta } from "@/Components/Admin/i18n/adminText";
import classes from "./AdminHomeOverview.module.css";

type Named = { _id?: string; name?: string; title?: string; firstName?: string; lastName?: string; question?: string };
type HomeData = Record<string, unknown>;

const labelOf = (item: Named) =>
  item.name ||
  item.title ||
  item.question ||
  [item.firstName, item.lastName].filter(Boolean).join(" ") ||
  "—";

const listOf = (data: HomeData | undefined, key: string): Named[] =>
  Array.isArray(data?.[key]) ? (data?.[key] as Named[]) : [];

// What the public home page shows right now, section by section, and where
// each one is managed (2026-09 audit: the home page is fed from about nine
// admin pages and nothing said which). Items appear on the home page when
// their own "show on home" switch is on.
const AdminHomeOverview = () => {
  const { data, error } = useSWR<HomeData>(`${API}/public/home`, (url: string) =>
    fetcher({ url }).then((res) => res?.data || {}),
  );

  const sections: {
    key: string;
    title: string;
    how: string;
    href: string;
  }[] = [
    {
      key: "specialities",
      title: ta("تخصص‌ها"),
      how: ta("تخصص‌هایی که «نمایش در صفحه‌ی خانه» دارند"),
      href: "/speciality",
    },
    {
      key: "popularDoctors",
      title: ta("پزشکان محبوب"),
      how: ta("خودکار: پزشکان فعال با بیشترین امتیاز و نوبت"),
      href: "/doctorprofile",
    },
    {
      key: "services",
      title: ta("خدمات"),
      how: ta("خدماتی که «نمایش در صفحه‌ی خانه» دارند"),
      href: "/service",
    },
    {
      key: "advertisements",
      title: ta("تبلیغات"),
      how: ta("تبلیغ‌های جایگاه‌های خانه ۱ تا ۶"),
      href: "/advertisement",
    },
    {
      key: "faqs",
      title: ta("سوالات متداول"),
      how: ta("سوال‌هایی که «نمایش در خانه» دارند"),
      href: "/faq",
    },
    {
      key: "blogs",
      title: ta("مقاله‌ها"),
      how: ta("مقاله‌های منتشرشده با «نمایش در خانه»"),
      href: "/blog",
    },
  ];

  return (
    <HandleLoading data={!!data} error={error}>
      <div className={classes.grid}>
        {sections.map((section) => {
          const items = listOf(data, section.key);
          return (
            <section key={section.key} className={classes.card}>
              <header className={classes.head}>
                <h3>{section.title}</h3>
                <span className={items.length ? classes.count : classes.empty}>
                  {items.length
                    ? ta("${1} مورد", [String(items.length)])
                    : ta("خالی؛ در صفحه‌ی خانه دیده نمی‌شود")}
                </span>
              </header>
              <p className={classes.how}>{section.how}</p>
              {!!items.length && (
                <ul className={classes.items}>
                  {items.slice(0, 6).map((item, i) => (
                    <li key={item._id || i}>{labelOf(item)}</li>
                  ))}
                </ul>
              )}
              <Link href={adminPath(section.href)} className={classes.link}>
                {ta("مدیریت")}
              </Link>
            </section>
          );
        })}
      </div>
    </HandleLoading>
  );
};

export default AdminHomeOverview;
