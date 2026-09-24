"use client";

import WithTitle from "@/Components/Admin/UI/WithTitle";
import TabSystem from "@/Components/Admin/UI/TabSystem";
import useScopedLocale from "@/Components/Hooks/useScopedLocale";
import { ContentNamespace } from "@/Components/Enums/contentNamespaces";
import ParaClinicManageDetailsTab from "./ParaClinicManageDetailsTab";
import ParaClinicManageLocationTab from "./ParaClinicManageLocationTab";

const NS: ContentNamespace[] = ["common", "paraClinicPanelProfile"];

const ParaClinicManageProfilePage = () => {
  const getContent = useScopedLocale(NS);

  return (
    <WithTitle title={getContent("profile")}>
      <TabSystem
        name="ParaClinicManageProfile"
        items={[
          {
            id: "Details",
            title: getContent("details"),
            content: <ParaClinicManageDetailsTab />,
          },
          {
            id: "Location",
            title: getContent("location"),
            content: <ParaClinicManageLocationTab />,
          },
        ]}
      />
    </WithTitle>
  );
};

export default ParaClinicManageProfilePage;
