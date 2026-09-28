import Link from "@/Components/i18n/Link";
import classes from "./PanelSidebar.module.css";
import Image from "next/image";
import { imagePath } from "../helpers/imagepath";
import useUser from "../Hooks/useUser";
import Loading from "../Admin/UI/Loading";
import Ixon from "../UI/Ixon";
import ChevronIcon from "../Icons/ChevronIcon";
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
import ShieldCheckIcon from "../Icons/ShieldCheckIcon";
import ReceiptIcon from "../Icons/ReceiptIcon";
import DiscountIcon from "../Icons/DicountIcon";
import FileDuplicateIcon from "../Icons/FileDuplicateIcon";
import ChatIcon from "../Icons/ChatIcon";
import PillIcon from "../Icons/PillIcon";
import MedicalRecordIcon from "../Icons/MedicalRecordIcon";
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
  const { data: balance } = useSWR<number>(`${API}/finance`, (url: string) =>
    fetcher({ url }).then((res) => res.data),
  );

  const getContent = useScopedLocale(LOCALE_NS);

  const hasAccess = useDoctorAcl();

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

  const links = useMemo<LinkMap>(
    () => [
      { title: "dashboard", icon: <DashboardIcon />, target: "", show: true },
      {
        title: "profile",
        icon: <UserEditIcon />,
        target: "profile",
        show: true,
      },
      { title: "office", icon: <BuildingIcon />, target: "office", show: true },
      {
        title: "services",
        icon: <CategoriesIcon />,
        target: "service",
        show: true,
      },
      {
        title: "servicePackages",
        icon: <PackageIcon />,
        target: "servicepackage",
        show: true,
      },
      {
        title: "incomingOrders",
        icon: <PackageIcon />,
        target: "order",
        badge: ordersTodo,
        show: hasAccess("readOrders"),
      },
      {
        title: "financialMangement",
        icon: <WalletIcon />,
        target: "finance",
        side: (
          <span className={classes.balance}>
            <span>{currencize(balance || 0)}</span>
            <span className={classes.toman}>{getContent("toman")}</span>
          </span>
        ),
        show: hasAccess("readFinance"),
      },
      {
        title: "secrataries",
        icon: <UserEditIcon />,
        target: "secretary",
        // Managing secretaries/access-levels is never delegable — only the
        // real owner (hasAccess() with no action, true only for "FULL") can
        // see this, same as every panel's secretary-management nav item.
        show: hasAccess(),
      },
      {
        title: "shifts",
        icon: <CalendarIcon />,
        target: "shift",
        show: hasAccess("readShifts"),
      },
      {
        title: "schedule",
        icon: <ClockIcon />,
        target: "schedule",
        show: hasAccess("readSchedule"),
      },
      {
        title: "patients",
        icon: <StetoscopeIcon />,
        target: "patient",
        show: hasAccess("readPatients"),
      },
      {
        title: "licenses",
        icon: <CartIcon />,
        target: "license",
        show: hasAccess("readLicenses"),
      },
      {
        title: "clinics",
        icon: <HospitalIcon />,
        target: "clinic",
        show: hasAccess("readClinics"),
      },
      {
        title: "hospitals",
        icon: <BuildingIcon />,
        target: "hospital",
        show: hasAccess("readHospitals"),
      },
      {
        title: "phrmaciesAndLabs",
        icon: <BuildingIcon />,
        target: "pharmacy",
        show: hasAccess("readPharmacy"),
      },
      {
        title: "insurances",
        icon: <ShieldCheckIcon />,
        target: "insurance",
        show: hasAccess("readInsurance"),
      },
      {
        title: "offers",
        icon: <ReceiptIcon />,
        target: "offer",
        // Not built yet (placeholder page) - hidden until it is. Restore
        // hasAccess("readOffers") then.
        show: false,
      },
      {
        title: "discounts",
        icon: <DiscountIcon />,
        target: "discount",
        // Not built yet (placeholder page) - hidden until it is. Restore
        // hasAccess("readDiscounts") then.
        show: false,
      },
      {
        title: "articles",
        icon: <FileDuplicateIcon />,
        target: "article",
        // The doctor blog routes on noyanai-back are owner-only
        // (blogRouter useAcl(true)), so secretaries would only get 403s.
        show: hasAccess(),
      },
      {
        title: "chatWithPatients",
        icon: <ChatIcon />,
        target: "chat",
        // Not built yet (placeholder page) - hidden until it is. Restore
        // hasAccess("readChat") then.
        show: false,
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
        title: "patientDocuments",
        icon: <MedicalRecordIcon />,
        target: "document",
        // Not built yet (placeholder page) - hidden until it is. Restore
        // hasAccess("readDocuments") then.
        show: false,
      },
      {
        title: "settings",
        icon: <CogIcon />,
        target: "settings",
        show: hasAccess("readSettings"),
      },
      {
        title: "logout",
        icon: <LogoutIcon />,
        onClick: () => setPopup("Logout", <LogoutPopup />),
        className: classes.logout,
        show: true,
      },
    ],
    [balance, getContent, hasAccess, ordersTodo, setPopup],
  );

  return <PanelSidebar links={links} panel="doctorpanel" />;
};

export default DoctorSidebar;
