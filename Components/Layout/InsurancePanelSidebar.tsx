import ReceiptIcon from "@/Components/Icons/ReceiptIcon";
import PeopleIcon from "@/Components/Icons/PeopleIcon";
import UserGroupIcon from "@/Components/Icons/UserGroupIcon";
import BookOpenIcon from "@/Components/Icons/BookOpenIcon";
import StarIcon from "../Icons/StarIcon";
import PackageIcon from "../Icons/PackageIcon";
import StetoscopeIcon from "../Icons/StetoscopeIcon";
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
      {
        icon: <WalletIcon />,
        title: "financialMangement",
        group: "groupCenter",
        show: hasAccess("readFinance"),
        target: "finance",
      },
      {
        title: "accounting",
        icon: <BookOpenIcon />,
        group: "groupCenter",
        show: hasAccess("readFinance"),
        target: "accounting",
      },
      {
        title: "payMenu",
        icon: <UserGroupIcon />,
        group: "groupCenter",
        show: hasAccess("readPayroll"),
        target: "payroll",
      },
      {
        title: "crmMenu",
        icon: <PeopleIcon />,
        group: "groupCenter",
        show: hasAccess("readCrm"),
        target: "crm",
      },
      {
        title: "moadianMenu",
        icon: <ReceiptIcon />,
        group: "groupCenter",
        show: hasAccess("readMoadian"),
        target: "moadian",
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
