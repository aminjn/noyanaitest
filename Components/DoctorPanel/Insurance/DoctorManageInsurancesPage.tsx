"use client";

import ClientTabSystem from "@/Components/UI/ClientTabSystem";
import WithBalanceHeader from "../_UI/WithBalanceHeader";
import useScopedLocale from "@/Components/Hooks/useScopedLocale";
import useBreadCrump from "@/Components/Hooks/useBreadCrump";
import DoctorInsurancesTab from "./DoctorInsurancesTab";
import DoctorInsuranceAdditionRequestsTab from "./DoctorInsuranceAdditionRequestsTab";
import { ContentNamespace } from "@/Components/Enums/contentNamespaces";

const NS: ContentNamespace[] = ["common", "doctorPanelInsurance"];

const DoctorManageInsurancesPage = () => {
  const getContent = useScopedLocale(NS);

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
            content: <DoctorInsuranceAdditionRequestsTab />,
            id: "InsuranceAdditions",
          },
        ]}
      />
    </WithBalanceHeader>
  );
};

export default DoctorManageInsurancesPage;
