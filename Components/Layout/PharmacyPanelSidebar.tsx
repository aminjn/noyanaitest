import DashboardIcon from "../Icons/DashboardIcon";
import { useMemo } from "react";
import PanelSidebar, { LinkMap } from "./PanelSidebar";
import UserEditIcon from "../Icons/UserEditIcon";
import UserCircleIcon from "../Icons/UserCircleIcon";
import CartIcon from "../Icons/CartIcon";
import FolderIcon from "../Icons/FolderIcon";
import FileDuplicateIcon from "../Icons/FileDuplicateIcon";
import PackageIcon from "../Icons/PackageIcon";
import useAcl from "../Hooks/useAcl";

const PharmacyPanelSidebar = () => {
  const hasAccess = useAcl("pharmacy");

  const links = useMemo<LinkMap>(
    () => [
      { title: "dashboard", icon: <DashboardIcon />, target: "", show: true },
      {
        title: "profile",
        icon: <UserCircleIcon />,
        // Baseline page, same as every other panel's profile nav item —
        // always visible, not gated behind an ACL action.
        show: true,
        target: "profile",
      },
      {
        title: "secrataries",
        icon: <UserEditIcon />,
        // Managing secretaries/access-levels is never delegable — only the
        // real owner (hasAccess() with no action, true only for "FULL") can
        // see this.
        show: hasAccess(),
        target: "secretary",
      },
      {
        title: "products",
        icon: <CartIcon />,
        show: hasAccess("readProducts"),
        target: "product",
      },
      {
        title: "productPackages",
        icon: <FolderIcon />,
        show: hasAccess("readProductPackages"),
        target: "productPackage",
      },
      {
        title: "incomingOrders",
        icon: <PackageIcon />,
        show: hasAccess("readOrders"),
        target: "order",
      },
      {
        title: "licenses",
        icon: <CartIcon />,
        show: hasAccess("readLicenses"),
        target: "license",
      },
      // Tamin end-user lockout (2026-09) - "prescriptions" and "tamin" are
      // hard-hidden regardless of ACL while Tamin only talks to its sandbox
      // API; see Components/PharmacyPanel/PharmacyLicenseGate.tsx's
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
        show: false,
        icon: <UserEditIcon />,
        target: "tamin",
      },
    ],
    [hasAccess],
  );

  return <PanelSidebar links={links} panel="pharmacypanel" />;
};

export default PharmacyPanelSidebar;
