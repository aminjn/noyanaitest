import StarIcon from "../Icons/StarIcon";
import PackageIcon from "../Icons/PackageIcon";
import StetoscopeIcon from "../Icons/StetoscopeIcon";
import DashboardIcon from "../Icons/DashboardIcon";
import { useMemo } from "react";
import PanelSidebar, { LinkMap } from "./PanelSidebar";
import { crmSection, financeSection, kartablItem } from "./panelSections";
import useKartablCount from "../_Common/Business/Kartabl/useKartablCount";
import UserEditIcon from "../Icons/UserEditIcon";
import FileDuplicateIcon from "../Icons/FileDuplicateIcon";
import UserCircleIcon from "../Icons/UserCircleIcon";
import CartIcon from "../Icons/CartIcon";
import useAcl from "../Hooks/useAcl";

const InsurancePanelSidebar = () => {
  const hasAccess = useAcl("insurance");
  const kartabl = useKartablCount("insurance");

  const links = useMemo<LinkMap>(
    () => [
      { title: "dashboard", icon: <DashboardIcon />, target: "", show: true },
      {
        icon: <PackageIcon />,
        title: "insPlans",
        group: "groupDaily",
        show: hasAccess("managePlans"),
        target: "plan",
      },
      {
        icon: <StetoscopeIcon />,
        title: "insNetwork",
        group: "groupDaily",
        show: hasAccess("readNetwork"),
        target: "network",
      },
      {
        title: "orgReviewsTitle",
        group: "groupCenter",
        icon: <StarIcon />,
        show: hasAccess("readReviews"),
        target: "review",
      },
      {
        icon: <UserCircleIcon />,
        title: "profile",
        group: "groupCenter",
        show: hasAccess("mutateProfile"),
        target: "profile",
      },
      financeSection({ hasAccess, inventory: false, insurance: false, group: "groupCenter", profile: "insurance" }),
      crmSection({ hasAccess, group: "groupCenter", profile: "insurance" }),
      kartablItem({ show: hasAccess() || hasAccess("readFinance") || hasAccess("readCrm") || kartabl > 0, group: "groupCenter", badge: kartabl }),
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
    [hasAccess, kartabl],
  );

  return <PanelSidebar links={links} panel="insurancepanel" />;
};

export default InsurancePanelSidebar;
