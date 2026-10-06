"use client";
import Link from "@/Components/i18n/Link";
import classes from "./AdminHubPage.module.css";
import { adminPath } from "@/Components/helpers/adminPath";
import useUser from "@/Components/Hooks/useUser";
import useAccessLevel from "@/Components/Hooks/useAccessLevel";
import Ixon from "@/Components/UI/Ixon";
import ChevronIcon from "@/Components/Icons/ChevronIcon";
import { adminHubs, adminMenu, canNotAdminOpen } from "../UI/adminMenu";

// One page listing the pages behind a hub menu item (see adminHubs), in
// sections, instead of a sidebar entry for each.
const AdminHubPage = ({ hub, intro }: { hub: string; intro: string }) => {
  const { user } = useUser(true);
  const hasAccess = useAccessLevel();
  const isAdmin = user?.role === "admin";
  const title =
    adminMenu
      .flatMap((group) => group.items)
      .find((item) => item.href === hub)?.title || "";
  const sections = (adminHubs.find((el) => el.hub === hub)?.sections || [])
    .filter((section) => isAdmin || !section.super)
    .map((section) => ({
      ...section,
      items: section.items.filter(
        (item) =>
          isAdmin || canNotAdminOpen(item.href, hasAccess),
      ),
    }))
    .filter((section) => section.items.length > 0);

  return (
    <div className={classes.main}>
      <header className={classes.header}>
        <h1 className={classes.pageTitle}>{title}</h1>
        <p className={classes.intro}>{intro}</p>
      </header>
      <div className={classes.grid}>
        {sections.map((section) => (
          <section key={section.id} className={classes.card}>
            <div className={classes.cardHead}>
              <span className={`${classes.icon} glassIcon`}>
                <Ixon width="1.125rem">{section.icon}</Ixon>
              </span>
              <h2 className={classes.cardTitle}>{section.title}</h2>
            </div>
            <ul className={classes.links}>
              {section.items.map((item) => (
                <li key={item.href}>
                  <Link
                    href={adminPath(`/${item.href}`)}
                    className={classes.link}
                  >
                    <span>{item.title}</span>
                    <Ixon width="0.85rem" className={classes.arrow}>
                      <ChevronIcon />
                    </Ixon>
                  </Link>
                </li>
              ))}
            </ul>
          </section>
        ))}
      </div>
    </div>
  );
};

export default AdminHubPage;
