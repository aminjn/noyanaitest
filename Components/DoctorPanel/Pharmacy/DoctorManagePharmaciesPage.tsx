"use client";

import ClientTabSystem from "@/Components/UI/ClientTabSystem";
import WithBalanceHeader from "../_UI/WithBalanceHeader";
import useLocale from "@/Components/Hooks/useLocale";
import DoctorPharmaciesTab from "./DoctorPharmaciesTab";
import DoctorPharmacyRequestsTab from "./DoctorPharmacyRequestsTab";

const DoctorManagePharmaciesPage = () => {
  const getContent = useLocale();

  return (
    <WithBalanceHeader>
      <ClientTabSystem
        items={[
          {
            title: getContent("pharmacies"),
            id: "Pharmacies",
            content: <DoctorPharmaciesTab />,
          },
          {
            title: getContent("pharmacyAdditionRequests"),
            id: "PharmacyAdditionRequests",
            content: <DoctorPharmacyRequestsTab />,
          },
        ]}
      />
    </WithBalanceHeader>
  );
};

export default DoctorManagePharmaciesPage;
