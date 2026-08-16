"use client";

import ClientTabSystem from "@/Components/UI/ClientTabSystem";
import WithBalanceHeader from "../_UI/WithBalanceHeader";
import useLocale from "@/Components/Hooks/useLocale";
import useBreadCrump from "@/Components/Hooks/useBreadCrump";
import DoctorPharmaciesTab from "./DoctorPharmaciesTab";
import DoctorPharmacyRequestsTab from "./DoctorPharmacyRequestsTab";

const DoctorManagePharmaciesPage = () => {
  const getContent = useLocale();

  useBreadCrump([
    { title: getContent("dashboard"), target: "/doctorpanel" },
    { title: getContent("phrmaciesAndLabs"), target: "/doctorpanel/pharmacy" },
  ]);

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
