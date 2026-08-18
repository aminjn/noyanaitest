import Link from "next/link";
import classes from "./DoctorSidebar.module.css";
import Image from "next/image";
import { imagePath } from "../helpers/imagepath";
import useUser from "../Hooks/useUser";
import Loading from "../Admin/UI/Loading";
import Ixon from "../UI/Ixon";
import ChevronIcon from "../Icons/ChevronIcon";
import { Fragment, ReactNode, useMemo } from "react";
import { ContentKey } from "../Enums/contentKeys";
import useLocale from "../Hooks/useLocale";
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
import CogIcon from "../Icons/CogIcon";
import ClockIcon from "../Icons/ClockIcon";
import CategoriesIcon from "../Icons/CategoriesIcon";
import PackageIcon from "../Icons/PackageIcon";

const DoctorSidebar = () => {
  const { data: balance } = useSWR<number>(`${API}/finance`, (url: string) =>
    fetcher({ url }).then((res) => res.data),
  );

  const getContent = useLocale();

  const hasAccess = useDoctorAcl();

  const links = useMemo<LinkMap>(
    () => [
      { title: "dashboard", icon: <DashboardIcon />, target: "", show: true },
      {
        title: "profile",
        icon: <DashboardIcon />,
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
        title: "financialMangement",
        icon: <WalletIcon />,
        target: "finance",
        side: (
          <span className={classes.balance}>
            <span>{currencize(balance || 0)}</span>
            <span className={classes.toman}>{getContent("toman")}</span>
          </span>
        ),
        show: hasAccess(),
      },
      {
        title: "secrataries",
        icon: <UserEditIcon />,
        target: "secretary",
        show: hasAccess(),
      },
      {
        title: "shifts",
        icon: <CalendarIcon />,
        target: "shift",
        show: hasAccess(),
      },
      {
        title: "schedule",
        icon: <ClockIcon />,
        target: "schedule",
        show: hasAccess(),
      },
      {
        title: "patients",
        icon: <StetoscopeIcon />,
        target: "patient",
        show: hasAccess(),
      },
      {
        title: "licenses",
        icon: <CartIcon />,
        target: "license",
        show: hasAccess(),
      },
      {
        title: "clinics",
        icon: <HospitalIcon />,
        target: "clinic",
        show: hasAccess("readClinics"),
      },
      {
        title: "phrmaciesAndLabs",
        icon: <BuildingIcon />,
        target: "pharmacy",
        show: hasAccess(),
      },
      {
        title: "insurances",
        icon: <ShieldCheckIcon />,
        target: "insurance",
        show: hasAccess(),
      },
      {
        title: "offers",
        icon: <ReceiptIcon />,
        target: "offer",
        show: hasAccess(),
      },
      {
        title: "discounts",
        icon: <DiscountIcon />,
        target: "discount",
        show: hasAccess(),
      },
      {
        title: "articles",
        icon: <FileDuplicateIcon />,
        target: "article",
        show: hasAccess(),
      },
      {
        title: "chatWithPatients",
        icon: <ChatIcon />,
        target: "chat",
        show: hasAccess(),
      },
      {
        title: "drugsAndPrescriptions",
        icon: <PillIcon />,
        target: "drug",
        show: hasAccess(),
      },
      {
        title: "patientDocuments",
        icon: <MedicalRecordIcon />,
        target: "document",
        show: hasAccess(),
      },
      {
        title: "settings",
        icon: <CogIcon />,
        target: "settings",
        show: hasAccess(),
      },
      {
        title: "logout",
        icon: <LogoutIcon />,
        onClick: () => {},
        className: classes.logout,
        show: true,
      },
    ],
    [balance, getContent, hasAccess],
  );

  return <PanelSidebar links={links} panel="doctorpanel" />;
};

export default DoctorSidebar;
