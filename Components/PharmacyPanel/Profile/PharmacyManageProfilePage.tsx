"use client";

import WithTitle from "@/Components/Admin/UI/WithTitle";
import TabSystem from "@/Components/Admin/UI/TabSystem";
import useLocale from "@/Components/Hooks/useLocale";
import useBreadCrump from "@/Components/Hooks/useBreadCrump";
import PharmacyManageDetailsTab from "./PharmacyManageDetailsTab";
import PharmacyManageLocationTab from "./PharmacyManageLocationTab";

const PharmacyManageProfilePage = () => {
  const getContent = useLocale();

  useBreadCrump([
    { title: getContent("dashboard"), target: "/pharmacypanel" },
    { title: getContent("profile"), target: "/pharmacypanel/profile" },
  ]);

  return (
    <WithTitle title={getContent("profile")}>
      <TabSystem
        name="PharmacyManageProfile"
        items={[
          {
            id: "Details",
            title: getContent("details"),
            content: <PharmacyManageDetailsTab />,
          },
          {
            id: "Location",
            title: getContent("location"),
            content: <PharmacyManageLocationTab />,
          },
        ]}
      />
    </WithTitle>
  );
};

export default PharmacyManageProfilePage;
