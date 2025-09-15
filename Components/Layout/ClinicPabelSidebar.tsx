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
    ],
    []
  );

  return <PanelSidebar links={links} panel="clinicpanel" />;
};

export default ClinicPanelSidebar;
