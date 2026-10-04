"use client";

import "swiper/css";

import { CSSProperties, Fragment, ReactNode, useMemo } from "react";
import classes from "./Layout.module.css";
import { usePathname } from "@/Components/i18n/navigation";
import dynamic from "next/dynamic";
import PublicLayout from "./PublicLayout";
import Popup from "../Popup/Popup";
import Notifications from "../Notification/Notifications";
import { adminKey } from "../config";
import CallManager from "../Call/CallManager";

// Each panel's layout is its own chunk (2026-10): they used to be bundled
// into every page of the site, the public ones included, with the admin
// menu and everything the panels import.
const AdminLayout = dynamic(() => import("./AdminLayout"));
const DoctorPanelLayout = dynamic(() => import("./DoctorPanelLayout"));
const SecretaryPanelLayout = dynamic(() => import("./SecretaryPanelLayout"));
const DashboardLayout = dynamic(() => import("./DashboardLayout"));
const ClinicPanelLayout = dynamic(() => import("./ClinicPanelLayout"));
const PharmacyPanelLayout = dynamic(() => import("./PharmacyPanelLayout"));
const InsurancePanelLayout = dynamic(() => import("./InsurancePanelLayout"));
const ParaClinicPanelLayout = dynamic(() => import("./ParaClinicPanelLayout"));
const HospitalPanelLayout = dynamic(() => import("./HospitalPanelLayout"));

export type WithStyleProps<T = Record<never, never>> = T & {
  className?: string;
  style?: CSSProperties;
};

const Layout = ({ children }: { children: ReactNode }) => {
  const pathname = usePathname();

  const content = useMemo<ReactNode>(() => {
    const plain = pathname.replaceAll("/", "");
    if (plain.startsWith(adminKey))
      return <AdminLayout>{children}</AdminLayout>;
    if (plain.startsWith("dashboard"))
      return <DashboardLayout>{children}</DashboardLayout>;
    if (plain.startsWith("doctorpanel"))
      return <DoctorPanelLayout>{children}</DoctorPanelLayout>;
    if (plain.startsWith("secretarypanel"))
      return <SecretaryPanelLayout>{children}</SecretaryPanelLayout>;
    if (plain.startsWith("clinicpanel"))
      return <ClinicPanelLayout>{children}</ClinicPanelLayout>;
    if (plain.startsWith("pharmacypanel"))
      return <PharmacyPanelLayout>{children}</PharmacyPanelLayout>;
    if (plain.startsWith("insurancepanel"))
      return <InsurancePanelLayout>{children}</InsurancePanelLayout>;
    if (plain.startsWith("paraClinicPanel"))
      return <ParaClinicPanelLayout>{children}</ParaClinicPanelLayout>;
    if (plain.startsWith("hospitalpanel"))
      return <HospitalPanelLayout>{children}</HospitalPanelLayout>;
    return <PublicLayout>{children}</PublicLayout>;
  }, [children, pathname]);

  return (
    <Fragment>
      {content}
      <Popup />
      <Notifications />
      <CallManager />
    </Fragment>
  );
};

export default Layout;
