import DashboardIcon from "../Icons/DashboardIcon";
import { useMemo } from "react";
import PanelSidebar, { LinkMap } from "./PanelSidebar";
import { crmSection, financeSection } from "./panelSections";
import UserEditIcon from "../Icons/UserEditIcon";
import UserCircleIcon from "../Icons/UserCircleIcon";
import CartIcon from "../Icons/CartIcon";
import FolderIcon from "../Icons/FolderIcon";
import FileDuplicateIcon from "../Icons/FileDuplicateIcon";
import PackageIcon from "../Icons/PackageIcon";
import useAcl from "../Hooks/useAcl";
import useOrdersTodo from "../_Common/ProviderHome/useOrdersTodo";

const PharmacyPanelSidebar = () => {
  const hasAccess = useAcl("pharmacy");

  const orders = useOrdersTodo("pharmacy", hasAccess("readOrders"));

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
        title: "products",
        icon: <CartIcon />,
        group: "groupDaily",
        show: hasAccess("readProducts"),
        target: "product",
      },
      {
        title: "productPackages",
        icon: <FolderIcon />,
        group: "groupDaily",
        show: hasAccess("readProductPackages"),
        target: "productPackage",
      },
      // Tamin end-user lockout (2026-09) - "prescriptions" and "tamin" are
      // hard-hidden regardless of ACL while Tamin only talks to its sandbox
      // API; see Components/PharmacyPanel/PharmacyLicenseGate.tsx's
      // lockedSegments and Controllers/featureGateController.ts on
      // noyanai-back. Restore hasAccess(...) on both once Tamin goes live.
      {
        title: "prescriptions",
        icon: <UserEditIcon />,
        group: "groupDaily",
        show: false,
        target: "prescription",
      },
      {
        title: "tamin",
        show: false,
        icon: <UserEditIcon />,
        group: "groupDaily",
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
        title: "teamTitle",
        icon: <UserEditIcon />,
        group: "groupCenter",
        // Managing secretaries/access-levels is never delegable — only the
        // real owner (hasAccess() with no action, true only for "FULL") can
        // see this.
        show: hasAccess(),
        target: "secretary",
      },
      financeSection({ hasAccess, inventory: true, insurance: true, group: "groupCenter" }),
      crmSection({ hasAccess, group: "groupCenter" }),
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

  return <PanelSidebar links={links} panel="pharmacypanel" />;
};

export default PharmacyPanelSidebar;
