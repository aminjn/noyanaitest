"use client";

import WithTitle from "@/Components/Admin/UI/WithTitle";
import TabSystem from "@/Components/Admin/UI/TabSystem";
import useScopedLocale from "@/Components/Hooks/useScopedLocale";
import useBreadCrump from "@/Components/Hooks/useBreadCrump";
import ClinicManageDetailsTab from "./ClinicManageDetailsTab";
import ClinicManageLocationTab from "./ClinicManageLocationTab";
import { ContentNamespace } from "@/Components/Enums/contentNamespaces";

const NS: ContentNamespace[] = ["common", "clinicPanelProfile"];

const ClinicManageProfilePage = () => {
  const getContent = useScopedLocale(NS);

  useBreadCrump([
    { title: getContent("dashboard"), target: "/clinicpanel" },
    { title: getContent("profile"), target: "/clinicpanel/profile" },
  ]);

  return (
    <WithTitle title={getContent("profile")}>
      <TabSystem
        name="ClinicManageProfile"
        items={[
          {
            id: "Details",
            title: getContent("details"),
            content: <ClinicManageDetailsTab />,
          },
          {
            id: "Location",
            title: getContent("location"),
            content: <ClinicManageLocationTab />,
          },
        ]}
      />
    </WithTitle>
  );
};

export default ClinicManageProfilePage;
