"use client";

import ClientTabSystem from "@/Components/UI/ClientTabSystem";
import useLocale from "@/Components/Hooks/useLocale";
import SecretaryRequestsTab from "./SecretaryRequestsTab";
import SecretaryBossesTab from "./SecretaryBossesTab";
import { NodeWithAcl } from "../_Common/SecretaryManager/Request/CreateSecretaryRequestPopup";

const SecretaryManageBossesPage = ({ name }: { name: NodeWithAcl }) => {
  const getContent = useLocale();
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
