"use client";

import ClientTabSystem from "@/Components/UI/ClientTabSystem";
import WithBalanceHeader from "../_UI/WithBalanceHeader";
import useScopedLocale from "@/Components/Hooks/useScopedLocale";
import useBreadCrump from "@/Components/Hooks/useBreadCrump";
import DoctorPharmaciesTab from "./DoctorPharmaciesTab";
import DoctorPharmacyRequestsTab from "./DoctorPharmacyRequestsTab";
import { ContentNamespace } from "@/Components/Enums/contentNamespaces";

const NS: ContentNamespace[] = ["common", "doctorPanelPharmacy"];

const DoctorManagePharmaciesPage = () => {
  const getContent = useScopedLocale(NS);

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
