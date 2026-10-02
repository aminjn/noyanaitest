import CheckAdminKey from "@/Components/Admin/UI/CheckAdminKey";
import type { Metadata } from "next";
import { ReactNode } from "react";

// the admin shell is never a search result (2026-10).
export const metadata: Metadata = { robots: { index: false, follow: false } };

// F-05 fix: this was previously only enforced by 2 of 165 pages under
// app/[adminKey]/** (the index page and the blog page), which meant the
// other 163 rendered regardless of the URL segment's value. Enforcing it
// once here, in the shared layout for the whole [adminKey] route group,
// makes the check apply uniformly to every admin page instead of relying
// on each page to remember to add it.
//
// Note: this remains a client-bundled value (see Components/config.tsx),
// not a server secret — the real access boundary for admin data is the
// backend's authController.restrictTo("admin") / access-level checks.
// This layer only gates whether the admin UI shell renders.
const AdminKeyLayout = ({
  params: { adminKey },
  children,
}: {
  params: { adminKey: string };
  children: ReactNode;
}) => {
  return <CheckAdminKey providedAdminKey={adminKey}>{children}</CheckAdminKey>;
};

export default AdminKeyLayout;
