import { useMemo } from "react";
import PanelSidebar, { LinkMap } from "./PanelSidebar";
import UserEditIcon from "../Icons/UserEditIcon";
import FileDuplicateIcon from "../Icons/FileDuplicateIcon";
import useAcl from "../Hooks/useAcl";

const InsurancePanelSidebar = () => {
  const hasAccess = useAcl("insurance");

  const links = useMemo<LinkMap>(
    () => [
      {
        icon: <UserEditIcon />,
        title: "secrataries",
        // Managing secretaries/access-levels is never delegable — only the
        // real owner (hasAccess() with no action, true only for "FULL") can
        // see this.
        show: hasAccess(),
        target: "secretary",
      },
      {
        icon: <UserEditIcon />,
        title: "licenses",
        show: hasAccess("readLicenses"),
        target: "license",
      },
      {
        icon: <FileDuplicateIcon />,
        title: "articles",
        show: hasAccess("readArticles"),
        target: "article",
      },
      {
        icon: <UserEditIcon />,
        title: "profile",
        show: true,
        target: "profile",
      },
    ],
    [hasAccess],
  );

  return <PanelSidebar links={links} panel="insurancepanel" />;
};

export default InsurancePanelSidebar;
