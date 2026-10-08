"use client";

import { useState } from "react";
import { useSearchParams } from "next/navigation";
import TabSystem from "@/Components/Admin/UI/TabSystem";
import useBreadCrump from "@/Components/Hooks/useBreadCrump";
import useScopedLocale from "@/Components/Hooks/useScopedLocale";
import { ContentNamespace } from "@/Components/Enums/contentNamespaces";
import SamplingAgendaTab from "./SamplingAgendaTab";
import SamplingSettingsTab from "./SamplingSettingsTab";

const NS: ContentNamespace[] = ["common", "labSampling"];

// «نمونه‌گیری» of the lab panel (2026-10, backend Lib/labSampling.ts): the
// day agenda of sampling appointments and the schedule behind them. One page,
// its parts as tabs.
const ParaClinicSamplingPage = () => {
  const getContent = useScopedLocale(NS);
  const params = useSearchParams();
  const date = params?.get("date") || undefined;
  const view = useState<string>("Agenda");

  useBreadCrump([
    { title: getContent("dashboard"), target: "/paraClinicPanel" },
    { title: getContent("labSamplingNav"), target: "/paraClinicPanel/sampling" },
  ]);

  return (
    <TabSystem
      viewState={view}
      items={[
        {
          id: "Agenda",
          title: getContent("lsAgenda"),
          content: <SamplingAgendaTab initialDate={date} onOpenSettings={() => view[1]("Settings")} />,
        },
        {
          id: "Settings",
          title: getContent("lsSettings"),
          content: <SamplingSettingsTab />,
        },
      ]}
    />
  );
};

export default ParaClinicSamplingPage;
