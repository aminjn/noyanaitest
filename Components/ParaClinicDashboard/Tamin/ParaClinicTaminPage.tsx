"use client";

import TabSystem from "@/Components/Admin/UI/TabSystem";
import useScopedLocale from "@/Components/Hooks/useScopedLocale";
import { ContentNamespace } from "@/Components/Enums/contentNamespaces";
import GetParaClinicPrescriptions from "./GetParaClinicPrescriptions";
import WithTitle from "@/Components/Admin/UI/WithTitle";
import RequestByRegisterId from "./RequestByRegisterId";
import RegisterPhysioSession from "./TaminPhysio";

const NS: ContentNamespace[] = ["common", "paraClinicPanelTamin"];

const ParaClinicTaminPage = () => {
  const getContent = useScopedLocale(NS);
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
