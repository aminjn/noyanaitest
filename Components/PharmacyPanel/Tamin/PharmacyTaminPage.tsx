"use client";

import TabSystem from "@/Components/Admin/UI/TabSystem";
import WithTitle from "@/Components/Admin/UI/WithTitle";
import useLocale from "@/Components/Hooks/useLocale";
import GetPharmacyPrescription from "./GetPhamacyPrescription";
import DoctorTaminTokenManager from "@/Components/DoctorPanel/Prescription/DoctorTaminTokenManager";
import GetSubmittedPrescInfo from "./GetSubmittedPrescInfo";
import GetAdditiveDrugs from "./GetAdditiveDrugs";

const PharmacyTaminPage = () => {
  const getContent = useLocale();
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
