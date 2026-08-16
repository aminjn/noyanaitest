"use client";

import ClientTabSystem from "@/Components/UI/ClientTabSystem";
import useLocale from "@/Components/Hooks/useLocale";
import useBreadCrump from "@/Components/Hooks/useBreadCrump";
import SecretaryRequestsTab from "./SecretaryRequestsTab";
import SecretaryBossesTab from "./SecretaryBossesTab";
import { NodeWithAcl } from "../_Common/SecretaryManager/Request/CreateSecretaryRequestPopup";
import { ContentKey } from "@/Components/Enums/contentKeys";

const titleKeyByNode: Record<NodeWithAcl, ContentKey> = {
  doctor: "doctors",
  clinic: "clinics",
  insurance: "insurances",
  pharmacy: "phrmaciesAndLabs",
};

const SecretaryManageBossesPage = ({ name }: { name: NodeWithAcl }) => {
  const getContent = useLocale();

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
