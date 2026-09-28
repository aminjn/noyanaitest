import { useMemo } from "react";
import PanelSidebar, { LinkMap } from "./PanelSidebar";
import classes from "./SecretaryPanelSidebar.module.css";
import StetoscopeIcon from "../Icons/StetoscopeIcon";
import BuildingIcon from "../Icons/BuildingIcon";
import HospitalIcon from "../Icons/HospitalIcon";
import ShieldCheckIcon from "../Icons/ShieldCheckIcon";
import MedicalRecordIcon from "../Icons/MedicalRecordIcon";
import DashboardIcon from "../Icons/DashboardIcon";

const SecretaryPanelSidebar = () => {
  const links = useMemo<LinkMap>(
    () => [
      {
        title: "dashboard",
        icon: <DashboardIcon />,
        target: "",
        show: true,
      },
      {
        title: "doctors",
        icon: <StetoscopeIcon />,
        target: "doctor",
        show: true,
      },
      {
        title: "phrmaciesAndLabs",
        icon: <BuildingIcon />,
        target: "pharmacy",
        show: true,
      },
      {
        title: "clinics",
        icon: <HospitalIcon />,
        target: "clinic",
        show: true,
      },
      {
        title: "hospitals",
        icon: <HospitalIcon />,
        target: "hospital",
        show: true,
      },
      {
        title: "insurances",
        icon: <ShieldCheckIcon />,
        target: "insurance",
        show: true,
      },
      {
        title: "paraClinics",
        icon: <MedicalRecordIcon />,
        target: "paraClinic",
        show: true,
      },
    ],
    []
  );

  return <PanelSidebar panel="secretarypanel" links={links} />;
};

export default SecretaryPanelSidebar;
