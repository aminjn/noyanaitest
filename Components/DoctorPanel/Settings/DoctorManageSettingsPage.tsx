"use client";

import TabSystem from "@/Components/Admin/UI/TabSystem";
import classes from "./DoctorManageSettingsPage.module.css";
import WithBalanceHeader from "../_UI/WithBalanceHeader";
import ClientTabSystem from "@/Components/UI/ClientTabSystem";
import { doctorSessionTypes } from "../Calendar/DoctorCalendarDay";
import SettingsTab from "./SettingsTab";
import useScopedLocale from "@/Components/Hooks/useScopedLocale";
import useBreadCrump from "@/Components/Hooks/useBreadCrump";
import { ContentNamespace } from "@/Components/Enums/contentNamespaces";
import useSWR from "swr";
import { API } from "@/Components/config";
import { fetcher } from "@/Components/helpers/fetcher";
import { DoctorSessionType } from "../Calendar/DoctorCalendarDay";
import { ISessionSettings } from "./SettingsTab";

const NS: ContentNamespace[] = ["common", "doctorPanelSettings"];

// In-person first: it's the visit type most doctors offer (and the one the
// setup checklist and patients look for), not the last tab.
const tabOrder: DoctorSessionType[] = [
  "inPerson",
  ...doctorSessionTypes.filter((kind) => kind !== "inPerson"),
];

// Tab label with a dot when that visit type is on - same SWR key as the
// tab's own form, so it's no extra request and updates when saved.
const TabTitle = ({ kind, title }: { kind: DoctorSessionType; title: string }) => {
  const { data } = useSWR<ISessionSettings>(
    `${API}/doctor/settings/${kind}`,
    (url: string) => fetcher({ url }).then((res) => res.data),
  );
  return (
    <span className={classes.tabTitle}>
      {!!data?.active && <span className={classes.onDot} aria-hidden />}
      {title}
    </span>
  );
};

const DoctorManageSettingsPage = () => {
  const getContent = useScopedLocale(NS);

  useBreadCrump([
    { title: getContent("dashboard"), target: "/doctorpanel" },
    { title: getContent("settings"), target: "/doctorpanel/settings" },
  ]);

  return (
    <WithBalanceHeader>
      <ClientTabSystem
        items={tabOrder.map((kind) => ({
          id: kind,
          content: <SettingsTab key={kind} kind={kind} />,
          title: <TabTitle kind={kind} title={getContent(kind)} />,
        }))}
      />
    </WithBalanceHeader>
  );
};

export default DoctorManageSettingsPage;
