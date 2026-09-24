"use client";

import ClientTabSystem from "@/Components/UI/ClientTabSystem";
import useBreadCrump from "@/Components/Hooks/useBreadCrump";
import WithBalanceHeader from "@/Components/DoctorPanel/_UI/WithBalanceHeader";
import SecretaryRequestsTab from "./Request/SecretaryRequestsTab";
import SecretariesTab from "./Secretary/SecretariesTab";
import { NodeWithAcl } from "./Request/CreateSecretaryRequestPopup";
import SecretaryAccessLevelsTab from "./AccessLevel/SecretaryAccessLevelsTab";
import useScopedLocale from "@/Components/Hooks/useScopedLocale";
import { ContentNamespace } from "@/Components/Enums/contentNamespaces";

const LOCALE_NS: ContentNamespace[] = ["common", "secretaryManager"];

const panelRootByNode: Record<NodeWithAcl, string> = {
  doctor: "/doctorpanel",
  clinic: "/clinicpanel",
  insurance: "/insurancepanel",
  pharmacy: "/pharmacypanel",
  paraClinic: "/paraClinicPanel",
  hospital: "/hospitalpanel",
};

const SecretaryManager = ({ name }: { name: NodeWithAcl }) => {
  const getContent = useScopedLocale(LOCALE_NS);

  const root = panelRootByNode[name];

  useBreadCrump([
    { title: getContent("dashboard"), target: root },
    { title: getContent("secretaries"), target: `${root}/secretary` },
  ]);

  return (
    <WithBalanceHeader>
      <ClientTabSystem
        items={[
          {
            id: "secretaries",
            title: getContent("secretaries"),
            content: <SecretariesTab name={name} />,
          },
          {
            id: "accessLevels",
            content: <SecretaryAccessLevelsTab name={name} />,
            title: getContent("accessLevels"),
          },
          {
            id: "requests",
            content: <SecretaryRequestsTab name={name} />,
            title: getContent("secretaryRequests"),
          },
        ]}
      />
    </WithBalanceHeader>
  );
};

export default SecretaryManager;
