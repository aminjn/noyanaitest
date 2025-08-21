"use client";

import useSWR from "swr";
import classes from "./DoctorManageSecretariesPage.module.css";
import WithBalanceHeader from "../_UI/WithBalanceHeader";
import ClientTabSystem from "@/Components/UI/ClientTabSystem";
import useLocale from "@/Components/Hooks/useLocale";
import DoctorSecretariesTab from "./Secretary/DoctorSecretariesTab";
import DoctorSecretaryAccessLevelsTab from "./AccessLevel/DoctorSecretaryAccessLevelsTab";
import DoctorSecretaryRequestsTab from "./Request/DoctorSecretaryRequestsTab";

const DoctorManageSecretariesPage = () => {
  const getContent = useLocale();

  return (
    <WithBalanceHeader>
      <ClientTabSystem
        items={[
          {
            id: "secretaries",
            title: getContent("secretaries"),
            content: <DoctorSecretariesTab />,
          },
          {
            id: "accessLevels",
            content: <DoctorSecretaryAccessLevelsTab />,
            title: getContent("accessLevels"),
          },
          {
            id: "requests",
            content: <DoctorSecretaryRequestsTab />,
            title: getContent("secretaryRequests"),
          },
        ]}
      />
    </WithBalanceHeader>
  );
};

export default DoctorManageSecretariesPage;
