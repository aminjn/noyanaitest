import { useMemo } from "react";
import PanelSidebar, { LinkMap } from "./PanelSidebar";
import UserEditIcon from "../Icons/UserEditIcon";
import FlaskIcon from "../Icons/FlaskIcon";

const ParaClinicSidebar = () => {
  const links = useMemo<LinkMap>(
    () => [
      {
        title: "secretaries",
        icon: <UserEditIcon />,
        show: true,
        target: "secretary",
      },
      {
        title: "tests",
        icon: <FlaskIcon />,
        show: true,
        target: "test",
      },
      {
        title: "prescriptions",
        icon: <UserEditIcon />,
        show: true,
        target: "prescription",
      },
      { title: "tamin", icon: <UserEditIcon />, show: true, target: "tamin" },
      {
        title: "profile",
        icon: <UserEditIcon />,
        show: true,
        target: "profile",
      },
    ],
    [],
  );

  return <PanelSidebar links={links} panel="paraClinicPanel" />;
};

export default ParaClinicSidebar;
