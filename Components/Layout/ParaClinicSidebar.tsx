import { useMemo } from "react";
import PanelSidebar, { LinkMap } from "./PanelSidebar";
import UserEditIcon from "../Icons/UserEditIcon";

const ParaClinicSidebar = () => {
  const links = useMemo<LinkMap>(
    () => [
      {
        title: "prescriptions",
        icon: <UserEditIcon />,
        show: true,
        target: "prescription",
      },
      { title: "tamin", icon: <UserEditIcon />, show: true, target: "tamin" },
    ],
    [],
  );

  return <PanelSidebar links={links} panel="paraClinicPanel" />;
};

export default ParaClinicSidebar;
