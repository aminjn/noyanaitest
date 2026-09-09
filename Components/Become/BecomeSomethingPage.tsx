"use client";

import Link from "next/link";
import useLocale from "../Hooks/useLocale";
import { becomeOrgList } from "./becomeOrgs";

// app/become/page.tsx - the /become index itself. Login gate, the "already
// have a node" redirect, breadcrumb, page header, and the org nav all live
// in the shared BecomeLayout (app/become/layout.tsx) now, so this is just
// the picker content: one card per organization type, linking to its own
// /become/[org] page. JSX is intentionally bare - CSS/markup is meant to be
// redone by hand.
const BecomeSomethingPage = () => {
  const getContent = useLocale();

  return (
    <div>
      {becomeOrgList.map((org) => (
        <Link key={org.slug} href={org.path}>
          {getContent(org.nameKey)}
        </Link>
      ))}
    </div>
  );
};

export default BecomeSomethingPage;
