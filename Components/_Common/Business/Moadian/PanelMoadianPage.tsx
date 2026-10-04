"use client";

import { ContentKey } from "@/Components/Enums/contentKeys";
import useAcl from "@/Components/Hooks/useAcl";
import useBreadCrump from "@/Components/Hooks/useBreadCrump";
import { NodeWithAcl } from "@/Components/_Common/SecretaryManager/Request/CreateSecretaryRequestPopup";
import MoadianPage from "./MoadianPage";
import { useMoadianText } from "./moadianShared";

// /<panel>/moadian in every provider panel: the panel's own access levels
// (readMoadian to look, manageMoadian to change) and its breadcrumb.
const PanelMoadianPage = ({ node, panel }: { node: NodeWithAcl; panel: string }) => {
  const t = useMoadianText();
  const hasAccess = useAcl(node);
  useBreadCrump([
    { title: t("dashboard"), target: panel },
    { title: t("financeSectionMenu" as ContentKey), target: `${panel}/finance` },
    { title: t("moaTitle"), target: `${panel}/finance/moadian` },
  ]);
  return <MoadianPage api={`/${node}/moadian`} canWrite={hasAccess("manageMoadian")} />;
};

export default PanelMoadianPage;
