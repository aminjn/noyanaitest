"use client";

import { ContentKey } from "@/Components/Enums/contentKeys";
import useAcl from "@/Components/Hooks/useAcl";
import useBreadCrump from "@/Components/Hooks/useBreadCrump";
import { NodeWithAcl } from "@/Components/_Common/SecretaryManager/Request/CreateSecretaryRequestPopup";
import AccountingPage from "./AccountingPage";
import { useBizText } from "./bizShared";

// The accounting page of a provider panel (2026-10): the panel's own books
// under /<panel>/biz; writing needs the owner or a team member with
// "manageAccounting".
const PanelAccountingPage = ({
  node,
  panel,
}: {
  node: NodeWithAcl;
  // "/pharmacypanel", "/doctorpanel", ...
  panel: string;
}) => {
  const t = useBizText();
  const hasAccess = useAcl(node);
  useBreadCrump([
    { title: t("dashboard"), target: panel },
    { title: t("financeSectionMenu" as ContentKey), target: `${panel}/finance` },
    { title: t("bizTitle"), target: `${panel}/finance/accounting` },
  ]);
  return (
    <AccountingPage
      api={`/${node}/biz`}
      canWrite={hasAccess("manageAccounting")}
    />
  );
};

export default PanelAccountingPage;
