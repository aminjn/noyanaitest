"use client";

import { ReactNode, useCallback } from "react";
import { useSearchParams } from "next/navigation";
import { usePathname, useRouter } from "@/Components/i18n/navigation";
import ClientTabSystem from "@/Components/UI/ClientTabSystem";
import WithTitle from "./WithTitle";
import { AdminEmbeddedProvider } from "./AdminEmbedded";
import classes from "./AdminSectionHub.module.css";

export type AdminSectionHubTab = {
  id: string;
  title: string;
  content: ReactNode;
  hint?: string;
  exclude?: boolean;
};

// One admin page for one concern, its parts as tabs (2026-09 audit: e.g. the
// blog, its categories, tags, media and newsletter were five menu items;
// commission, tax, gateway and shipping settings lived in three menu
// groups). Each tab renders the part's existing page, embedded; the open tab
// is kept in ?tab= so links and "back" land on the same tab. A hub inside a
// hub's tab (e.g. System settings -> AI -> its parts) keeps its own in
// another query parameter (`param`) and drops its title (`bare`).
const AdminSectionHub = ({
  title,
  intro,
  tabs,
  param = "tab",
  bare,
}: {
  title: string;
  intro?: string;
  tabs: AdminSectionHubTab[];
  param?: string;
  bare?: boolean;
}) => {
  const params = useSearchParams();
  const pathname = usePathname();
  const { replace } = useRouter();
  const visible = tabs.filter((t) => !t.exclude);
  const requested = params.get(param);
  const current = visible.some((t) => t.id === requested)
    ? (requested as string)
    : visible[0]?.id || "";

  const setCurrent = useCallback(
    (id: string) => {
      const next = new URLSearchParams(params.toString());
      next.set(param, id);
      replace(`${pathname}?${next.toString()}`, { scroll: false });
    },
    [params, pathname, replace, param],
  );

  const active = visible.find((t) => t.id === current);

  const body = (
    <>
      {!!intro && <p className={classes.intro}>{intro}</p>}
      <ClientTabSystem
        viewState={[current, setCurrent]}
        items={visible.map((tab) => ({
          id: tab.id,
          title: tab.title,
          content: (
            <AdminEmbeddedProvider value={true}>
              <div className={classes.panel}>{tab.content}</div>
            </AdminEmbeddedProvider>
          ),
        }))}
      />
      {!!active?.hint && <p className={classes.hint}>{active.hint}</p>}
    </>
  );
  return bare ? <div aria-label={title}>{body}</div> : <WithTitle title={title}>{body}</WithTitle>;
};

export default AdminSectionHub;
