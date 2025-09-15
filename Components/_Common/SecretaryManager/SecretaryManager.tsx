"use client";

import ClientTabSystem from "@/Components/UI/ClientTabSystem";
import useLocale from "@/Components/Hooks/useLocale";
import WithBalanceHeader from "@/Components/DoctorPanel/_UI/WithBalanceHeader";
import SecretaryRequestsTab from "./Request/SecretaryRequestsTab";
import SecretariesTab from "./Secretary/SecretariesTab";
import { NodeWithAcl } from "./Request/CreateSecretaryRequestPopup";
import SecretaryAccessLevelsTab from "./AccessLevel/SecretaryAccessLevelsTab";

const SecretaryManager = ({ name }: { name: NodeWithAcl }) => {
  const getContent = useLocale();

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
