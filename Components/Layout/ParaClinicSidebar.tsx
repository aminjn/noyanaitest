import { useMemo } from "react";
import PanelSidebar, { LinkMap } from "./PanelSidebar";
import UserEditIcon from "../Icons/UserEditIcon";
import FlaskIcon from "../Icons/FlaskIcon";
import FileDuplicateIcon from "../Icons/FileDuplicateIcon";
import PackageIcon from "../Icons/PackageIcon";
import useAcl from "../Hooks/useAcl";

const ParaClinicSidebar = () => {
  const hasAccess = useAcl("paraClinic");

  const links = useMemo<LinkMap>(
    () => [
      {
        title: "secretaries",
        icon: <UserEditIcon />,
        // Managing secretaries/access-levels is never delegable — only the
        // real owner (hasAccess() with no action, true only for "FULL") can
        // see this.
        show: hasAccess(),
        target: "secretary",
      },
      {
        title: "tests",
        icon: <FlaskIcon />,
        show: hasAccess("readTests"),
        target: "test",
      },
      {
        title: "incomingOrders",
        icon: <PackageIcon />,
        show: hasAccess("readOrders"),
        target: "order",
      },
      {
        title: "prescriptions",
        icon: <UserEditIcon />,
        show: hasAccess("readPrescriptions"),
        target: "prescription",
      },
      {
        title: "articles",
        icon: <FileDuplicateIcon />,
        show: hasAccess("readArticles"),
        target: "article",
      },
      {
        title: "tamin",
        icon: <UserEditIcon />,
        show: hasAccess("readTamin"),
        target: "tamin",
      },
      {
        title: "profile",
        icon: <UserEditIcon />,
        show: true,
        target: "profile",
      },
    ],
    [hasAccess],
  );

  return <PanelSidebar links={links} panel="paraClinicPanel" />;
};

export default ParaClinicSidebar;
