import { ReactNode } from "react";
import classes from "./WithBalanceHeader.module.css";
import { WithStyleProps } from "@/Components/Layout/Layout";
import DoctorPanelLicenseBalanceHeader from "@/Components/Layout/DoctorPanelLicenseBalanceHeader";

const WithBalanceHeader = ({
  children,
  className = "",
  style,
}: WithStyleProps<{ children?: ReactNode }>) => {
  return (
    <div className={`${classes.main} ${className}`} style={style}>
      {/* <DoctorPanelLicenseBalanceHeader /> */}
      {children}
    </div>
  );
};

export default WithBalanceHeader;
