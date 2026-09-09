"use client";

import WithTitle from "@/Components/Admin/UI/WithTitle";
import TabSystem from "@/Components/Admin/UI/TabSystem";
import useLocale from "@/Components/Hooks/useLocale";
import useBreadCrump from "@/Components/Hooks/useBreadCrump";
import InsuranceManageDetailsTab from "./InsuranceManageDetailsTab";
import InsuranceManageLocationTab from "./InsuranceManageLocationTab";

const InsuranceManageProfilePage = () => {
  const getContent = useLocale();

  useBreadCrump([
    { title: getContent("dashboard"), target: "/insurancepanel" },
    { title: getContent("profile"), target: "/insurancepanel/profile" },
  ]);

  return (
    <WithTitle title={getContent("profile")}>
      <TabSystem
        name="InsuranceManageProfile"
        items={[
          {
            id: "Details",
            title: getContent("details"),
            content: <InsuranceManageDetailsTab />,
          },
          {
            id: "Location",
            title: getContent("location"),
            content: <InsuranceManageLocationTab />,
          },
        ]}
      />
    </WithTitle>
  );
};

export default InsuranceManageProfilePage;
