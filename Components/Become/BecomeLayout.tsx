"use client";

import classes from "./BecomeLayout.module.css";

import { ReactNode } from "react";
import Link from "next/link";
import useUser from "../Hooks/useUser";
import useLocale from "../Hooks/useLocale";
import Loading from "../Admin/UI/Loading";
import LoginRequired from "../UI/LoginRequired";
import ListPageLayout from "../UI/ListPage/ListPageLayout";
import ListPageHeader from "../UI/ListPage/ListPageHeader";
import { becomeOrgList } from "./becomeOrgs";
import BreadCrump from "../UI/BreadCrump";
import useScopedLocale from "../Hooks/useScopedLocale";
import Ixon from "../UI/Ixon";
import CheckIcon from "../Icons/CheckIcon";
import { usePathname } from "next/navigation";
import useProgress from "../Hooks/useProgress";
import { tbaseMedium, tmdMedium, tsmRegular } from "../UI/Typography";

// Shared shell for every /become/[org] route (app/become/layout.tsx) plus
// the /become index page itself. Just the useUser()+LoginRequired gate this
// whole subtree was missing (the 2026-09 LoginRequired gate audit fixed this
// same bug class in every *PanelLayout - fetching an auth-only org endpoint
// without checking useUser() first - but /become itself was out of scope
// back then), plus the breadcrumb/header/nav.
//
// Note: deliberately does NOT redirect a user who already has an org
// profile away from /become/* - removed per request (2026-09). If that
// behavior is wanted back, Components/Become/useBecomeOrgProfiles.ts still
// has the "does this user already have a node?" check to reuse.
// JSX below is intentionally bare (no styling) - CSS/markup is meant to be
// redone by hand.
const BecomeLayout = ({ children }: { children: ReactNode }) => {
  const getContent = useScopedLocale(["becomeSomething"]);
  const { user, isUserLoading } = useUser();

  const pathname = usePathname();

  const push = useProgress();

  if (isUserLoading) return <Loading />;
  if (!user) return <LoginRequired />;
  return (
    <div className={classes.main}>
      <BreadCrump
        trail={[
          { title: getContent("home"), target: "/" },
          {
            title: getContent("becomeSomethingPageTitle"),
            target: "/become",
          },
        ]}
      />
      <div className={classes.content}>
        <h1 className={`${classes.title} ${tmdMedium}`}>
          {getContent("becomeOrgTitle")}
        </h1>
        <div className={classes.navBox}>
          <span className={`${classes.legend} ${tsmRegular}`}>
            {getContent("requestPanel")}
          </span>
          <div className={`${classes.toggleBox} ${tsmRegular}`}>
            <Link
              className={`${classes.toggle} ${pathname.endsWith("doctor") ? classes.activeToggle : ""}`}
              href={"/become/doctor"}
            >
              <span className={classes.toggleIcon}>
                <Ixon width=".75rem">
                  <CheckIcon />
                </Ixon>
              </span>
              <span className={classes.toggleLabel}>
                {getContent("doctor")}
              </span>
            </Link>
            <Link
              className={`${classes.toggle} ${pathname.endsWith("doctor") ? "" : classes.activeToggle}`}
              href={"/become/hospital"}
            >
              <span className={classes.toggleIcon}>
                <Ixon width=".75rem">
                  <CheckIcon />
                </Ixon>
              </span>
              <span className={classes.toggleLabel}>
                {getContent("otherOrganizations")}
              </span>
            </Link>
          </div>
        </div>
      </div>
      {!pathname.endsWith("doctor") && (
        <nav className={classes.nav}>
          {becomeOrgList
            .filter((el) => el.slug !== "doctor")
            .map((org) => (
              <Link
                key={org.slug}
                href={org.path}
                className={`${classes.navItem} ${pathname.endsWith(org.slug) ? classes.activeNavItem : ""}`}
              >
                {getContent(org.nameKey)}
              </Link>
            ))}
        </nav>
      )}
      {children}
      <p className={`${classes.support} ${tbaseMedium}`}>
        <span>{getContent("becomeSupportPre")}</span>{" "}
        <Link href={`/dashboard/support`} className={classes.link}>
          {getContent("becomeSupportLink")}
        </Link>{" "}
        <span>{getContent("becomeSupprtPost")}</span>
      </p>
    </div>
  );
};

export default BecomeLayout;
