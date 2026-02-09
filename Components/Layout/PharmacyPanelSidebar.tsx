import { useMemo } from "react";
import PanelSidebar, { LinkMap } from "./PanelSidebar";
import UserEditIcon from "../Icons/UserEditIcon";

const PharmacyPanelSidebar = () => {
  const links = useMemo<LinkMap>(
    () => [
      {
        title: "secrataries",
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
    ],
    [],
  );

  return <PanelSidebar links={links} panel="pharmacypanel" />;
};

export default PharmacyPanelSidebar;
