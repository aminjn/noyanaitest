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

const HospitalPanelSidebar = () => {
  const hasAccess = useAcl("hospital");

  // doctors waiting for an answer (same SWR key as the doctors page)
  const { data: doctors } = useSWR<{ incoming?: unknown[] }>(
    hasAccess() ? `${API}/hospital/doctor` : null,
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

  return <PanelSidebar links={links} panel="hospitalpanel" />;
};

export default HospitalPanelSidebar;
