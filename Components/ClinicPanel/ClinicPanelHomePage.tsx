"use client";

import useBreadCrump from "@/Components/Hooks/useBreadCrump";
import useScopedLocale from "@/Components/Hooks/useScopedLocale";
import CurrentLicenseWidget from "./CurrentLicenseWidget";
import CenterHomeInbox from "@/Components/_Common/CenterDoctors/CenterHomeInbox";
import useAcl from "@/Components/Hooks/useAcl";
import { ContentNamespace } from "@/Components/Enums/contentNamespaces";

const NS: ContentNamespace[] = ["common", "clinicPanelHome"];

const ClinicPanelHomePage = () => {
  const getContent = useScopedLocale(NS);
  useBreadCrump([{ title: getContent("dashboard"), target: "/clinicpanel" }]);
  // the owner answers join requests here; secretaries only see the license
  const hasAccess = useAcl("clinic");
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "1.5rem" }}>
      {hasAccess() && <CenterHomeInbox kind="clinic" />}
      <CurrentLicenseWidget />
    </div>
  );
};

export default ClinicPanelHomePage;
