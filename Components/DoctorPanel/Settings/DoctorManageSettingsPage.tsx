"use client";

import TabSystem from "@/Components/Admin/UI/TabSystem";
import classes from "./DoctorManageSettingsPage.module.css";
import WithBalanceHeader from "../_UI/WithBalanceHeader";
import ClientTabSystem from "@/Components/UI/ClientTabSystem";
import { doctorSessionTypes } from "../Calendar/DoctorCalendarDay";
import SettingsTab from "./SettingsTab";
import useLocale from "@/Components/Hooks/useLocale";
import useBreadCrump from "@/Components/Hooks/useBreadCrump";

const DoctorManageSettingsPage = () => {
  const getContent = useLocale();

  useBreadCrump([
    { title: getContent("dashboard"), target: "/doctorpanel" },
    { title: getContent("settings"), target: "/doctorpanel/settings" },
  ]);

  return (
    <WithBalanceHeader>
      <ClientTabSystem
        items={doctorSessionTypes.map((kind) => ({
          id: kind,
          content: <SettingsTab key={kind} kind={kind} />,
          title: getContent(kind),
        }))}
      />
    </WithBalanceHeader>
  );
};

export default DoctorManageSettingsPage;
