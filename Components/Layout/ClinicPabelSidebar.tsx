import { useMemo } from "react";
import PanelSidebar, { LinkMap } from "./PanelSidebar";
import UserEditIcon from "../Icons/UserEditIcon";
import FileDuplicateIcon from "../Icons/FileDuplicateIcon";
import useAcl from "../Hooks/useAcl";

const ClinicPanelSidebar = () => {
  const hasAccess = useAcl("clinic");

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
      // Tamin end-user lockout (2026-09) - hard-hidden regardless of ACL
      // while Tamin only talks to its sandbox API; see
      // Components/ClinicPanel/ClinicLicenseGate.tsx's lockedSegments and
      // Controllers/featureGateController.ts on noyanai-back. Restore
      // `hasAccess("readPrescriptions")` once Tamin goes live.
      {
        title: "prescriptions",
        icon: <UserEditIcon />,
        show: false,
        target: "prescription",
      },
      {
        title: "licenses",
        icon: <UserEditIcon />,
        show: hasAccess("readLicenses"),
        target: "license",
      },
      {
        title: "articles",
        icon: <FileDuplicateIcon />,
        show: hasAccess("readArticles"),
        target: "article",
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

  return <PanelSidebar links={links} panel="clinicpanel" />;
};

export default ClinicPanelSidebar;
