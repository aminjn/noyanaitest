"use client";

import { CSSProperties, Fragment, ReactNode, useMemo } from "react";
import classes from "./Layout.module.css";
import { usePathname } from "next/navigation";
import AdminLayout from "./AdminLayout";
import PublicLayout from "./PublicLayout";
import Popup from "../Popup/Popup";
import Notifications from "../Notification/Notifications";
import { adminKey } from "../config";
import DoctorPanelLayout from "./DoctorPanelLayout";
import SecretaryPanelLayout from "./SecretaryPanelLayout";
import DashboardLayout from "./DashboardLayout";
import ClinicPanelLayout from "./ClinicPanelLayout";
import PharmacyPanelLayout from "./PharmacyPanelLayout";
import InsurancePanelLayout from "./InsurancePanelLayout";
import CallManager from "../Call/CallManager";

export type WithStyleProps<T = Record<string, never>> = T & {
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
