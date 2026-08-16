"use client";

import ClientTabSystem from "@/Components/UI/ClientTabSystem";
import WithBalanceHeader from "../_UI/WithBalanceHeader";
import useLocale from "@/Components/Hooks/useLocale";
import useBreadCrump from "@/Components/Hooks/useBreadCrump";
import DoctorInsurancesTab from "./DoctorInsurancesTab";
import DoctorInsuranceAdditionRequestsTab from "./DoctorInsuranceAdditionRequestsTab";

const DoctorManageInsurancesPage = () => {
  const getContent = useLocale();

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
