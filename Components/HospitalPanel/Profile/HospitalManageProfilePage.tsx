"use client";

import WithTitle from "@/Components/Admin/UI/WithTitle";
import TabSystem from "@/Components/Admin/UI/TabSystem";
import useLocale from "@/Components/Hooks/useLocale";
import useBreadCrump from "@/Components/Hooks/useBreadCrump";
import HospitalManageDetailsTab from "./HospitalManageDetailsTab";
import HospitalManageLocationTab from "./HospitalManageLocationTab";

const HospitalManageProfilePage = () => {
  const getContent = useLocale();

  useBreadCrump([
    { title: getContent("dashboard"), target: "/hospitalpanel" },
    { title: getContent("profile"), target: "/hospitalpanel/profile" },
  ]);

  return (
    <WithTitle title={getContent("profile")}>
      <TabSystem
        name="HospitalManageProfile"
        items={[
          {
            id: "Details",
            title: getContent("details"),
            content: <HospitalManageDetailsTab />,
          },
          {
            id: "Location",
            title: getContent("location"),
            content: <HospitalManageLocationTab />,
          },
        ]}
      />
    </WithTitle>
  );
};

export default HospitalManageProfilePage;
