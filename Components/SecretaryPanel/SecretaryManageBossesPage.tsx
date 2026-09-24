"use client";

import ClientTabSystem from "@/Components/UI/ClientTabSystem";
import useScopedLocale from "@/Components/Hooks/useScopedLocale";
import useBreadCrump from "@/Components/Hooks/useBreadCrump";
import SecretaryRequestsTab from "./SecretaryRequestsTab";
import SecretaryBossesTab from "./SecretaryBossesTab";
import { NodeWithAcl } from "../_Common/SecretaryManager/Request/CreateSecretaryRequestPopup";
import { ContentKey } from "@/Components/Enums/contentKeys";
import { ContentNamespace } from "@/Components/Enums/contentNamespaces";

const NS: ContentNamespace[] = ["common", "secretaryPanelHome"];

const titleKeyByNode: Record<NodeWithAcl, ContentKey> = {
  doctor: "doctors",
  clinic: "clinics",
  insurance: "insurances",
  pharmacy: "phrmaciesAndLabs",
  paraClinic: "paraClinics",
  hospital: "hospitals",
};

const SecretaryManageBossesPage = ({ name }: { name: NodeWithAcl }) => {
  const getContent = useScopedLocale(NS);

  useBreadCrump([
    { title: getContent("dashboard"), target: "/secretarypanel" },
    {
      title: getContent(titleKeyByNode[name]),
      target: `/secretarypanel/${name}`,
    },
  ]);

  return (
    <ClientTabSystem
      items={[
        {
          title: getContent("bosses"),
          content: <SecretaryBossesTab name={name} />,
          id: "Bosses",
        },
        {
          title: getContent("requests"),
          content: <SecretaryRequestsTab name={name} />,
          id: "Requests",
        },
      ]}
    />
  );
};

export default SecretaryManageBossesPage;
