import WalletIcon from "../Icons/WalletIcon";
import DashboardIcon from "../Icons/DashboardIcon";
import { useMemo } from "react";
import PanelSidebar, { LinkMap } from "./PanelSidebar";
import UserEditIcon from "../Icons/UserEditIcon";
import FileDuplicateIcon from "../Icons/FileDuplicateIcon";
import UserCircleIcon from "../Icons/UserCircleIcon";
import CartIcon from "../Icons/CartIcon";
import useAcl from "../Hooks/useAcl";

const InsurancePanelSidebar = () => {
  const hasAccess = useAcl("insurance");

  const links = useMemo<LinkMap>(
    () => [
      { title: "dashboard", icon: <DashboardIcon />, target: "", show: true },
      {
        icon: <UserCircleIcon />,
        title: "profile",
        group: "groupCenter",
        show: hasAccess("mutateProfile"),
        target: "profile",
      },
      {
        icon: <WalletIcon />,
        title: "financialMangement",
        group: "groupCenter",
        show: hasAccess("readFinance"),
        target: "finance",
      },
      {
        icon: <UserEditIcon />,
        title: "teamTitle",
        group: "groupCenter",
        // Managing secretaries/access-levels is never delegable — only the
        // real owner (hasAccess() with no action, true only for "FULL") can
        // see this.
        show: hasAccess(),
        target: "secretary",
      },
      {
        icon: <CartIcon />,
        title: "licenses",
        group: "groupCenter",
        show: hasAccess("readLicenses"),
        target: "license",
      },
      {
        icon: <FileDuplicateIcon />,
        title: "articles",
        group: "groupCenter",
        show: hasAccess("readArticles"),
        target: "article",
      },
    ],
    [hasAccess],
  );

  return <PanelSidebar links={links} panel="insurancepanel" />;
};

export default InsurancePanelSidebar;
