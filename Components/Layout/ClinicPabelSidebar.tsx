import DashboardIcon from "../Icons/DashboardIcon";
import useSWR from "swr";
import { API } from "../config";
import { fetcher } from "../helpers/fetcher";
import StetoscopeIcon from "../Icons/StetoscopeIcon";
import { useMemo } from "react";
import PanelSidebar, { LinkMap } from "./PanelSidebar";
import UserEditIcon from "../Icons/UserEditIcon";
import FileDuplicateIcon from "../Icons/FileDuplicateIcon";
import useAcl from "../Hooks/useAcl";

const ClinicPanelSidebar = () => {
  const hasAccess = useAcl("clinic");

  // doctors waiting for an answer (same SWR key as the doctors page)
  const { data: doctors } = useSWR<{ incoming?: unknown[] }>(
    hasAccess() ? `${API}/clinic/doctor` : null,
    (url: string) => fetcher({ url }).then((res) => res.data),
  );
  const joinRequests = Array.isArray(doctors?.incoming) ? doctors.incoming.length : 0;

  const links = useMemo<LinkMap>(
    () => [
      { title: "dashboard", icon: <DashboardIcon />, target: "", show: true },
      {
        title: "doctors",
        icon: <StetoscopeIcon />,
        badge: joinRequests,
        show: hasAccess(),
        target: "doctor",
      },
      {
        title: "teamTitle",
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
    [hasAccess, joinRequests],
  );

  return <PanelSidebar links={links} panel="clinicpanel" />;
};

export default ClinicPanelSidebar;
