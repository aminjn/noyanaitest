"use client";

import ClientTabSystem from "@/Components/UI/ClientTabSystem";
import WithBalanceHeader from "../_UI/WithBalanceHeader";
import useScopedLocale from "@/Components/Hooks/useScopedLocale";
import useBreadCrump from "@/Components/Hooks/useBreadCrump";
import DoctorInsurancesTab from "./DoctorInsurancesTab";
import DoctorInsuranceAdditionRequestsTab from "./DoctorInsuranceAdditionRequestsTab";
import { ContentNamespace } from "@/Components/Enums/contentNamespaces";
import useDoctorLicenseModules from "@/Components/Hooks/useDoctorLicenseModules";
import LicenseNotCoveredNotice from "../LicenseNotCoveredNotice";

const NS: ContentNamespace[] = ["common", "doctorPanelInsurance"];

const DoctorManageInsurancesPage = () => {
  const getContent = useScopedLocale(NS);
  // insurer contracts are open to every doctor; suggesting a new insurer
  // is the plan's "insurances" module (fails open while loading, like
  // DoctorLicenseGate)
  const { modules } = useDoctorLicenseModules();
  const canSuggest = !Array.isArray(modules) || modules.includes("insurances");

  useBreadCrump([
    { title: getContent("dashboard"), target: "/doctorpanel" },
    { title: getContent("insurances"), target: "/doctorpanel/insurance" },
  ]);

  return (
    <WithBalanceHeader>
      <ClientTabSystem
        items={[
          {
            title: getContent("insurances"),
            content: <DoctorInsurancesTab />,
            id: "Insurances",
          },
          {
            title: getContent("insuranceAdditionRequests"),
            content: canSuggest ? <DoctorInsuranceAdditionRequestsTab /> : <LicenseNotCoveredNotice mod="insurances" />,
            id: "InsuranceAdditions",
          },
        ]}
      />
    </WithBalanceHeader>
  );
};

export default DoctorManageInsurancesPage;
