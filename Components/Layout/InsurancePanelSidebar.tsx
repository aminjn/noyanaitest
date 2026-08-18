import { useMemo } from "react";
import PanelSidebar, { LinkMap } from "./PanelSidebar";
import UserEditIcon from "../Icons/UserEditIcon";
import FileDuplicateIcon from "../Icons/FileDuplicateIcon";

const InsurancePanelSidebar = () => {
  const links = useMemo<LinkMap>(
    () => [
      {
        icon: <UserEditIcon />,
        title: "secrataries",
        show: true,
        target: "secretary",
      },
      {
        icon: <FileDuplicateIcon />,
        title: "articles",
        show: true,
        target: "article",
      },
    ],
    []
  );

  return <PanelSidebar links={links} panel="insurancepanel" />;
};

export default InsurancePanelSidebar;
