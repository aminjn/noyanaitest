"use client";

import { useEffect, useState } from "react";
import WithTitle from "@/Components/Admin/UI/WithTitle";
import TabSystem from "@/Components/Admin/UI/TabSystem";
import useScopedLocale from "@/Components/Hooks/useScopedLocale";
import useAcl from "@/Components/Hooks/useAcl";
import { API } from "@/Components/config";
import ProviderInsurerContracts from "@/Components/InsuranceContracts/ProviderInsurerContracts";
import { ContentNamespace } from "@/Components/Enums/contentNamespaces";
import useBreadCrump from "@/Components/Hooks/useBreadCrump";
import PharmacyManageDetailsTab from "./PharmacyManageDetailsTab";
import PharmacyManageLocationTab from "./PharmacyManageLocationTab";
import PharmacyManageDeliveryTab from "./PharmacyManageDeliveryTab";
import PharmacyRxCityBanner from "../RxCityBanner/PharmacyRxCityBanner";

const TABS = ["Details", "Location", "Delivery", "Insurers"];
const TAB_STORE = "PharmacyManageProfile";

// the last open tab (TabSystem's own memory)
const savedTab = () => {
  try {
    const saved = localStorage.getItem(TAB_STORE);
    if (saved && TABS.includes(saved)) return saved;
  } catch {
    // storage blocked: the first tab
  }
  return TABS[0];
};

const NS: ContentNamespace[] = ["common", "pharmacyPanelProfile"];

const PharmacyManageProfilePage = () => {
  const getContent = useScopedLocale(NS);
  const hasAccess = useAcl("pharmacy");
  const tabState = useState<string>(savedTab);
  const setTab = tabState[1];
  // ?tab=Location (the "no city" banner on the panel home) opens that tab
  useEffect(() => {
    const asked = new URLSearchParams(window.location.search).get("tab");
    if (asked && TABS.includes(asked)) setTab(asked);
  }, [setTab]);

  useBreadCrump([
    { title: getContent("dashboard"), target: "/pharmacypanel" },
    { title: getContent("profile"), target: "/pharmacypanel/profile" },
  ]);

  return (
    <WithTitle title={getContent("profile")}>
      {tabState[0] !== "Location" && (
        <PharmacyRxCityBanner ns="pharmacyPanelProfile" onLocationTab={() => tabState[1]("Location")} />
      )}
      <TabSystem
        name={TAB_STORE}
        viewState={tabState}
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
          {
            // its insurers, as contracts the insurer confirms (2026-10)
            id: "Insurers",
            title: getContent("insurances"),
            content: (
              <ProviderInsurerContracts
                base={`${API}/pharmacy/insurer-contract`}
                canEdit={hasAccess("mutateProfile")}
              />
            ),
          },
        ]}
      />
    </WithTitle>
  );
};

export default PharmacyManageProfilePage;
