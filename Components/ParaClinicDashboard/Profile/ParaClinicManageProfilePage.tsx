"use client";

import WithTitle from "@/Components/Admin/UI/WithTitle";
import TabSystem from "@/Components/Admin/UI/TabSystem";
import useLocale from "@/Components/Hooks/useLocale";
import ParaClinicManageDetailsTab from "./ParaClinicManageDetailsTab";
import ParaClinicManageLocationTab from "./ParaClinicManageLocationTab";

const ParaClinicManageProfilePage = () => {
  const getContent = useLocale();

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
