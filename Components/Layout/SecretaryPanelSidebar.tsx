import useSWR from "swr";
import { API } from "../config";
import { fetcher } from "../helpers/fetcher";
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
  // pending invites (same SWR key as the secretary home)
  const { data } = useSWR<{ invites?: unknown[] }>(`${API}/secretary/overview`, (url: string) =>
    fetcher({ url }).then((res) => res.data),
  );
  const invites = Array.isArray(data?.invites) ? data.invites.length : 0;

  const links = useMemo<LinkMap>(
    () => [
      {
        title: "dashboard",
        icon: <DashboardIcon />,
        target: "",
        badge: invites,
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
    [invites]
  );

  return <PanelSidebar panel="secretarypanel" links={links} />;
};

export default SecretaryPanelSidebar;
