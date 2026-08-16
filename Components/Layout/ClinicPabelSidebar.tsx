import { useMemo } from "react";
import PanelSidebar, { LinkMap } from "./PanelSidebar";
import UserEditIcon from "../Icons/UserEditIcon";

const ClinicPanelSidebar = () => {
  const links = useMemo<LinkMap>(
    () => [
      {
        title: "secretaries",
        icon: <UserEditIcon />,
        show: true,
        target: "secretary",
      },
      {
        title: "prescriptions",
        icon: <UserEditIcon />,
        show: true,
        target: "prescription",
      },
      {
        title: "profile",
        icon: <UserEditIcon />,
        show: true,
        target: "profile",
      },
    ],
    [],
  );

  return <PanelSidebar links={links} panel="clinicpanel" />;
};

export default ClinicPanelSidebar;
