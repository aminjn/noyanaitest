"use client";

import WithTitle from "@/Components/Admin/UI/WithTitle";
import TabSystem from "@/Components/Admin/UI/TabSystem";
import useScopedLocale from "@/Components/Hooks/useScopedLocale";
import useAcl from "@/Components/Hooks/useAcl";
import { API } from "@/Components/config";
import ProviderInsurerContracts from "@/Components/InsuranceContracts/ProviderInsurerContracts";
import useBreadCrump from "@/Components/Hooks/useBreadCrump";
import ClinicManageDetailsTab from "./ClinicManageDetailsTab";
import ClinicManageLocationTab from "./ClinicManageLocationTab";
import { ContentNamespace } from "@/Components/Enums/contentNamespaces";

const NS: ContentNamespace[] = ["common", "clinicPanelProfile"];

const ClinicManageProfilePage = () => {
  const getContent = useScopedLocale(NS);
  const hasAccess = useAcl("clinic");

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
          {
            // its insurers, as contracts the insurer confirms (2026-10)
            id: "Insurers",
            title: getContent("insurances"),
            content: (
              <ProviderInsurerContracts
                base={`${API}/clinic/insurer-contract`}
                canEdit={hasAccess("mutateProfile")}
              />
            ),
          },
        ]}
      />
    </WithTitle>
  );
};

export default ClinicManageProfilePage;
