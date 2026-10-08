"use client";

import WithTitle from "@/Components/Admin/UI/WithTitle";
import TabSystem from "@/Components/Admin/UI/TabSystem";
import useScopedLocale from "@/Components/Hooks/useScopedLocale";
import { ContentNamespace } from "@/Components/Enums/contentNamespaces";
import useBreadCrump from "@/Components/Hooks/useBreadCrump";
import PharmacyManageDetailsTab from "./PharmacyManageDetailsTab";
import PharmacyManageLocationTab from "./PharmacyManageLocationTab";
import PharmacyManageDeliveryTab from "./PharmacyManageDeliveryTab";

const NS: ContentNamespace[] = ["common", "pharmacyPanelProfile"];

const PharmacyManageProfilePage = () => {
  const getContent = useScopedLocale(NS);

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
          {
            // where it ships cart orders (2026-10)
            id: "Delivery",
            title: getContent("deliveryArea"),
            content: <PharmacyManageDeliveryTab />,
          },
        ]}
      />
    </WithTitle>
  );
};

export default PharmacyManageProfilePage;
