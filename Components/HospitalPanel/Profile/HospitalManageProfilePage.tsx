"use client";

import WithTitle from "@/Components/Admin/UI/WithTitle";
import TabSystem from "@/Components/Admin/UI/TabSystem";
import useScopedLocale from "@/Components/Hooks/useScopedLocale";
import useAcl from "@/Components/Hooks/useAcl";
import { API } from "@/Components/config";
import ProviderInsurerContracts from "@/Components/InsuranceContracts/ProviderInsurerContracts";
import { ContentNamespace } from "@/Components/Enums/contentNamespaces";
import useBreadCrump from "@/Components/Hooks/useBreadCrump";
import HospitalManageDetailsTab from "./HospitalManageDetailsTab";
import HospitalManageLocationTab from "./HospitalManageLocationTab";

const NS: ContentNamespace[] = ["common", "hospitalPanelProfile"];

const HospitalManageProfilePage = () => {
  const getContent = useScopedLocale(NS);
  const hasAccess = useAcl("hospital");

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
          {
            // its insurers, as contracts the insurer confirms (2026-10)
            id: "Insurers",
            title: getContent("insurances"),
            content: (
              <ProviderInsurerContracts
                base={`${API}/hospital/insurer-contract`}
                canEdit={hasAccess("mutateProfile")}
              />
            ),
          },
        ]}
      />
    </WithTitle>
  );
};

export default HospitalManageProfilePage;
