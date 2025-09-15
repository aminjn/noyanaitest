import { useMemo } from "react";
import PanelSidebar, { LinkMap } from "./PanelSidebar";
import UserEditIcon from "../Icons/UserEditIcon";

const InsurancePanelSidebar = () => {
  const links = useMemo<LinkMap>(
    () => [
      {
        icon: <UserEditIcon />,
        title: "secrataries",
        show: true,
        target: "secretary",
      },
    ],
    []
  );

  return <PanelSidebar links={links} panel="insurancepanel" />;
};

export default InsurancePanelSidebar;
