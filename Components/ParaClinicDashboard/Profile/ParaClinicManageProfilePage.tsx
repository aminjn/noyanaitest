"use client";

import WithTitle from "@/Components/Admin/UI/WithTitle";
import TabSystem from "@/Components/Admin/UI/TabSystem";
import useScopedLocale from "@/Components/Hooks/useScopedLocale";
import useAcl from "@/Components/Hooks/useAcl";
import { API } from "@/Components/config";
import ProviderInsurerContracts from "@/Components/InsuranceContracts/ProviderInsurerContracts";
import { ContentNamespace } from "@/Components/Enums/contentNamespaces";
import ParaClinicManageDetailsTab from "./ParaClinicManageDetailsTab";
import ParaClinicManageLocationTab from "./ParaClinicManageLocationTab";

const NS: ContentNamespace[] = ["common", "paraClinicPanelProfile"];

const ParaClinicManageProfilePage = () => {
  const getContent = useScopedLocale(NS);
  const hasAccess = useAcl("paraClinic");

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
          {
            // its insurers, as contracts the insurer confirms (2026-10)
            id: "Insurers",
            title: getContent("insurances"),
            content: (
              <ProviderInsurerContracts
                base={`${API}/paraClinic/insurer-contract`}
                canEdit={hasAccess("mutateProfile")}
              />
            ),
          },
        ]}
      />
    </WithTitle>
  );
};

export default ParaClinicManageProfilePage;
