import DashboardIcon from "../Icons/DashboardIcon";
import { useMemo } from "react";
import PanelSidebar, { LinkMap } from "./PanelSidebar";
import UserEditIcon from "../Icons/UserEditIcon";
import FlaskIcon from "../Icons/FlaskIcon";
import FileDuplicateIcon from "../Icons/FileDuplicateIcon";
import PackageIcon from "../Icons/PackageIcon";
import CartIcon from "../Icons/CartIcon";
import useAcl from "../Hooks/useAcl";

const ParaClinicSidebar = () => {
  const hasAccess = useAcl("paraClinic");

  const links = useMemo<LinkMap>(
    () => [
      { title: "dashboard", icon: <DashboardIcon />, target: "", show: true },
      {
        title: "secretaries",
        icon: <UserEditIcon />,
        // Managing secretaries/access-levels is never delegable — only the
        // real owner (hasAccess() with no action, true only for "FULL") can
        // see this.
        show: hasAccess(),
        target: "secretary",
      },
      {
        title: "tests",
        icon: <FlaskIcon />,
        show: hasAccess("readTests"),
        target: "test",
      },
      {
        title: "incomingOrders",
        icon: <PackageIcon />,
        show: hasAccess("readOrders"),
        target: "order",
      },
      // Tamin end-user lockout (2026-09) - "prescriptions" (already an
      // orphan route with no page.tsx) and "tamin" are hard-hidden
      // regardless of ACL while Tamin only talks to its sandbox API; see
      // Components/ParaClinicDashboard/ParaClinicLicenseGate.tsx's
      // lockedSegments and Controllers/featureGateController.ts on
      // noyanai-back. Restore hasAccess(...) on both once Tamin goes live.
      {
        title: "prescriptions",
        icon: <UserEditIcon />,
        show: false,
        target: "prescription",
      },
      {
        title: "articles",
        icon: <FileDuplicateIcon />,
        show: hasAccess("readArticles"),
        target: "article",
      },
      {
        title: "tamin",
        icon: <UserEditIcon />,
        show: false,
        target: "tamin",
      },
      {
        title: "licenses",
        icon: <CartIcon />,
        show: hasAccess("readLicenses"),
        target: "license",
      },
      {
        title: "profile",
        icon: <UserEditIcon />,
        show: true,
        target: "profile",
      },
    ],
    [hasAccess],
  );

  return <PanelSidebar links={links} panel="paraClinicPanel" />;
};

export default ParaClinicSidebar;
