import WalletIcon from "../Icons/WalletIcon";
import DashboardIcon from "../Icons/DashboardIcon";
import { useMemo } from "react";
import PanelSidebar, { LinkMap } from "./PanelSidebar";
import UserEditIcon from "../Icons/UserEditIcon";
import FlaskIcon from "../Icons/FlaskIcon";
import FileDuplicateIcon from "../Icons/FileDuplicateIcon";
import PackageIcon from "../Icons/PackageIcon";
import CartIcon from "../Icons/CartIcon";
import UserCircleIcon from "../Icons/UserCircleIcon";
import useAcl from "../Hooks/useAcl";
import useOrdersTodo from "../_Common/ProviderHome/useOrdersTodo";

const ParaClinicSidebar = () => {
  const hasAccess = useAcl("paraClinic");

  const orders = useOrdersTodo("paraClinic", hasAccess("readOrders"));

  const links = useMemo<LinkMap>(
    () => [
      { title: "dashboard", icon: <DashboardIcon />, target: "", show: true },
      {
        title: "incomingOrders",
        icon: <PackageIcon />,
        group: "groupDaily",
        badge: orders.count,
        show: hasAccess("readOrders"),
        target: "order",
      },
      {
        title: "tests",
        icon: <FlaskIcon />,
        group: "groupDaily",
        show: hasAccess("readTests"),
        target: "test",
      },
      // Tamin end-user lockout (2026-09) - "tamin" is hard-hidden
      // regardless of ACL while Tamin only talks to its sandbox API; see
      // Components/ParaClinicDashboard/ParaClinicLicenseGate.tsx's
      // lockedSegments and Controllers/featureGateController.ts on
      // noyanai-back. Restore hasAccess(...) once Tamin goes live.
      {
        title: "tamin",
        icon: <UserEditIcon />,
        group: "groupDaily",
        show: false,
        target: "tamin",
      },
      {
        title: "profile",
        icon: <UserCircleIcon />,
        group: "groupCenter",
        show: hasAccess("mutateProfile"),
        target: "profile",
      },
      {
        title: "financialMangement",
        icon: <WalletIcon />,
        group: "groupCenter",
        show: hasAccess("readFinance"),
        target: "finance",
      },
      {
        title: "teamTitle",
        icon: <UserEditIcon />,
        group: "groupCenter",
        // Managing secretaries/access-levels is never delegable — only the
        // real owner (hasAccess() with no action, true only for "FULL") can
        // see this.
        show: hasAccess(),
        target: "secretary",
      },
      {
        title: "licenses",
        icon: <CartIcon />,
        group: "groupCenter",
        show: hasAccess("readLicenses"),
        target: "license",
      },
      {
        title: "articles",
        icon: <FileDuplicateIcon />,
        group: "groupCenter",
        show: hasAccess("readArticles"),
        target: "article",
      },
    ],
    [hasAccess, orders.count],
  );

  return <PanelSidebar links={links} panel="paraClinicPanel" />;
};

export default ParaClinicSidebar;
