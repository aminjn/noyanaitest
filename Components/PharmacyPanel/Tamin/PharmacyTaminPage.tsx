"use client";

import TabSystem from "@/Components/Admin/UI/TabSystem";
import WithTitle from "@/Components/Admin/UI/WithTitle";
import useScopedLocale from "@/Components/Hooks/useScopedLocale";
import { ContentNamespace } from "@/Components/Enums/contentNamespaces";
import useBreadCrump from "@/Components/Hooks/useBreadCrump";
import GetPharmacyPrescription from "./GetPhamacyPrescription";
import DoctorTaminTokenManager from "@/Components/DoctorPanel/Prescription/DoctorTaminTokenManager";
import GetSubmittedPrescInfo from "./GetSubmittedPrescInfo";
import GetAdditiveDrugs from "./GetAdditiveDrugs";

const NS: ContentNamespace[] = ["common", "pharmacyPanelTamin"];

const PharmacyTaminPage = () => {
  const getContent = useScopedLocale(NS);

  useBreadCrump([
    { title: getContent("dashboard"), target: "/pharmacypanel" },
    { title: getContent("tamin"), target: "/pharmacypanel/tamin" },
  ]);

  return (
    <WithTitle title={getContent("precriptionFiller")}>
      <TabSystem
        items={[
          {
            title: getContent("taminToken"),
            content: <DoctorTaminTokenManager />,
            id: "Token",
          },
          {
            title: getContent("getPrescription"),
            content: <GetPharmacyPrescription />,
            id: "GetPrescrription",
          },
          {
            title: getContent("getSubmittedPrescriptionInfo"),
            id: "Info",
            content: <GetSubmittedPrescInfo />,
          },
          {
            title: getContent("additiveDrugs"),
            id: "Additive",
            content: <GetAdditiveDrugs />,
          },
        ]}
      />
    </WithTitle>
  );
};

export default PharmacyTaminPage;
