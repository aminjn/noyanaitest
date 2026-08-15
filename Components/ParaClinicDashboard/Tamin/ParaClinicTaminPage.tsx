"use client";

import TabSystem from "@/Components/Admin/UI/TabSystem";
import useLocale from "@/Components/Hooks/useLocale";
import GetParaClinicPrescriptions from "./GetParaClinicPrescriptions";
import WithTitle from "@/Components/Admin/UI/WithTitle";
import RequestByRegisterId from "./RequestByRegisterId";
import RegisterPhysioSession from "./TaminPhysio";

const ParaClinicTaminPage = () => {
  const getContent = useLocale();
  return (
    <WithTitle title={getContent("prescriptions")}>
      <TabSystem
        items={[
          {
            title: getContent("getPrescriptions"),
            content: <GetParaClinicPrescriptions />,
            id: "GetAll",
          },
          {
            title: getContent("getPrescription"),
            content: <RequestByRegisterId />,
            id: "GetOne",
          },
          {
            title: getContent("physio"),
            content: <GetParaClinicPrescriptions physio />,
            id: "Physio",
          },
          {
            title: getContent("registerSession"),
            content: <RegisterPhysioSession />,
            id: "Register",
          },
        ]}
      />
    </WithTitle>
  );
};

export default ParaClinicTaminPage;
