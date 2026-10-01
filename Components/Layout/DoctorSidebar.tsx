import Link from "@/Components/i18n/Link";
import classes from "./PanelSidebar.module.css";
import { imagePath } from "../helpers/imagepath";
import { Fragment, ReactNode, useMemo } from "react";
import { ContentKey } from "../Enums/contentKeys";
import useSWR from "swr";
import { API } from "../config";
import { fetcher } from "../helpers/fetcher";
import DashboardIcon from "../Icons/DashboardIcon";
import WalletIcon from "../Icons/WalletIcon";
import UserEditIcon from "../Icons/UserEditIcon";
import CalendarIcon from "../Icons/CalendarIcon";
import StetoscopeIcon from "../Icons/StetoscopeIcon";
import CartIcon from "../Icons/CartIcon";
import HospitalIcon from "../Icons/HospitalIcon";
import BuildingIcon from "../Icons/BuildingIcon";
import FileDuplicateIcon from "../Icons/FileDuplicateIcon";
import ChatIcon from "../Icons/ChatIcon";
import PillIcon from "../Icons/PillIcon";
import LogoutIcon from "../Icons/LogoutIcon";
import { currencize } from "../helpers/currencize";
import PanelSidebar, { LinkMap } from "./PanelSidebar";
import useDoctorAcl from "../Hooks/useDoctorAcl";
import usePopup from "../Hooks/usePopup";
import LogoutPopup from "../Popups/LogoutPopup";
import CogIcon from "../Icons/CogIcon";
import ClockIcon from "../Icons/ClockIcon";
import CategoriesIcon from "../Icons/CategoriesIcon";
import PackageIcon from "../Icons/PackageIcon";
import useScopedLocale from "../Hooks/useScopedLocale";
import { ContentNamespace } from "../Enums/contentNamespaces";

const LOCALE_NS: ContentNamespace[] = ["common", "layoutPanel"];

const DoctorSidebar = () => {
  const getContent = useScopedLocale(LOCALE_NS);

  const hasAccess = useDoctorAcl();

  // the doctor's wallet, also for a secretary allowed to see finance
  const { data: balance } = useSWR<number>(
    hasAccess("readFinance") ? `${API}/doctor/balance` : null,
    (url: string) => fetcher({ url }).then((res) => res.data),
  );

  // paid orders with lines still to fulfil (same SWR key as the orders page)
  const { data: orders } = useSWR<
    { status?: string; services?: { status?: string }[]; servicePackages?: { status?: string }[] }[]
  >(hasAccess("readOrders") ? `${API}/doctor/order` : null, (url: string) =>
    fetcher({ url }).then((res) => res.data),
  );
  const ordersTodo = (Array.isArray(orders) ? orders : []).filter(
    (o) =>
      o?.status === "paid" &&
      [...(Array.isArray(o.services) ? o.services : []), ...(Array.isArray(o.servicePackages) ? o.servicePackages : [])].some(
        (l) => l?.status === "pending",
      ),
  ).length;
  const { setPopup } = usePopup();

  const canNetwork =
    hasAccess("readClinics") || hasAccess("readHospitals") || hasAccess("readPharmacy") || hasAccess("readInsurance");

  // Grouped menu (2026-09): what you do every day first, then running the
  // practice, then network & content. The four network pages (clinics,
  // hospitals, pharmacies & labs, insurers) sit behind one "My network"
  // hub; their own pages stay reachable from it and highlight this item.
  const links = useMemo<LinkMap>(
    () => [
      { title: "dashboard", icon: <DashboardIcon />, target: "", show: true },
      {
        title: "schedule",
        icon: <ClockIcon />,
        target: "schedule",
        group: "groupDaily",
        show: hasAccess("readSchedule"),
      },
      {
        title: "patients",
        icon: <StetoscopeIcon />,
        target: "patient",
        group: "groupDaily",
        show: hasAccess("readPatients"),
      },
      {
        title: "incomingOrders",
        icon: <PackageIcon />,
        target: "order",
        group: "groupDaily",
        badge: ordersTodo,
        show: hasAccess("readOrders"),
      },
      {
        title: "chatWithPatients",
        icon: <ChatIcon />,
        target: "chat",
        group: "groupDaily",
        show: hasAccess("readChat"),
      },
      {
        title: "shifts",
        icon: <CalendarIcon />,
        target: "shift",
        group: "groupDaily",
        show: hasAccess("readShifts"),
      },
      {
        title: "profile",
        icon: <UserEditIcon />,
        target: "profile",
        group: "groupPractice",
        // owner, or a secretary allowed to edit the profile
        show: hasAccess("mutateProfile"),
      },
      {
        title: "office",
        icon: <BuildingIcon />,
        target: "office",
        group: "groupPractice",
        show: hasAccess("readOffices"),
      },
      {
        title: "services",
        icon: <CategoriesIcon />,
        target: "service",
        group: "groupPractice",
        show: hasAccess("readServices"),
      },
      {
        title: "servicePackages",
        icon: <PackageIcon />,
        target: "servicepackage",
        group: "groupPractice",
        show: hasAccess("readServicePackages"),
      },
      {
        title: "financialMangement",
        icon: <WalletIcon />,
        target: "finance",
        group: "groupPractice",
        side: (
          <span className={classes.balance}>
            <span>{currencize(balance || 0)}</span>
            <span className={classes.toman}>{getContent("toman")}</span>
          </span>
        ),
        show: hasAccess("readFinance"),
      },
      {
        title: "teamTitle",
        icon: <UserEditIcon />,
        target: "secretary",
        group: "groupPractice",
        // Managing the team is never delegable — only the real owner
        // (hasAccess() with no action, true only for "FULL") sees this.
        show: hasAccess(),
      },
      {
        title: "licenses",
        icon: <CartIcon />,
        target: "license",
        group: "groupPractice",
        show: hasAccess("readLicenses"),
      },
      {
        title: "settings",
        icon: <CogIcon />,
        target: "settings",
        group: "groupPractice",
        show: hasAccess("readSettings"),
      },
      {
        title: "myNetwork",
        icon: <HospitalIcon />,
        target: "network",
        group: "groupNetwork",
        match: ["clinic", "hospital", "pharmacy", "insurance"],
        show: canNetwork,
      },
      {
        title: "articles",
        icon: <FileDuplicateIcon />,
        target: "article",
        group: "groupNetwork",
        // The doctor blog routes on noyanai-back are owner-only
        // (blogRouter useAcl(true)), so secretaries would only get 403s.
        show: hasAccess(),
      },
      {
        title: "drugsAndPrescriptions",
        icon: <PillIcon />,
        target: "drug",
        // Tamin end-user lockout (2026-09) - hard-hidden regardless of ACL
        // while Tamin only talks to its sandbox API; see
        // Components/DoctorPanel/DoctorLicenseGate.tsx's lockedSegments and
        // Controllers/featureGateController.ts on noyanai-back. Restore
        // `hasAccess("readDrugs")` once Tamin goes live.
        show: false,
      },
      {
        title: "logout",
        icon: <LogoutIcon />,
        onClick: () => setPopup("Logout", <LogoutPopup />),
        className: classes.logout,
        show: true,
      },
    ],
    [balance, canNetwork, getContent, hasAccess, ordersTodo, setPopup],
  );

  return <PanelSidebar links={links} panel="doctorpanel" />;
};

export default DoctorSidebar;
