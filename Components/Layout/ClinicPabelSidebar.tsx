import StarIcon from "../Icons/StarIcon";
import ClockIcon from "../Icons/ClockIcon";
import DashboardIcon from "../Icons/DashboardIcon";
import useSWR from "swr";
import { API } from "../config";
import { fetcher } from "../helpers/fetcher";
import StetoscopeIcon from "../Icons/StetoscopeIcon";
import { useMemo } from "react";
import PanelSidebar, { LinkMap } from "./PanelSidebar";
import { crmSection, financeSection, kartablItem } from "./panelSections";
import useKartablCount from "../_Common/Business/Kartabl/useKartablCount";
import UserEditIcon from "../Icons/UserEditIcon";
import FileDuplicateIcon from "../Icons/FileDuplicateIcon";
import UserCircleIcon from "../Icons/UserCircleIcon";
import CartIcon from "../Icons/CartIcon";
import useAcl from "../Hooks/useAcl";
import CentreSwitcher from "./CentreSwitcher";

const ClinicPanelSidebar = () => {
  const hasAccess = useAcl("clinic");
  const kartabl = useKartablCount("clinic");

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
        group: "groupDaily",
        icon: <StetoscopeIcon />,
        badge: joinRequests,
        show: hasAccess(),
        target: "doctor",
      },
      {
        title: "schedule",
        group: "groupDaily",
        icon: <ClockIcon />,
        show: hasAccess("readReservations"),
        target: "booking",
      },
      // Tamin end-user lockout (2026-09) - hard-hidden regardless of ACL
      // while Tamin only talks to its sandbox API; see
      // Components/ClinicPanel/ClinicLicenseGate.tsx's lockedSegments and
      // Controllers/featureGateController.ts on noyanai-back. Restore
      // `hasAccess("readPrescriptions")` once Tamin goes live.
      {
        title: "prescriptions",
        group: "groupDaily",
        icon: <UserEditIcon />,
        show: false,
        target: "prescription",
      },
      {
        title: "orgReviewsTitle",
        group: "groupCenter",
        icon: <StarIcon />,
        show: hasAccess("readReviews"),
        target: "review",
      },
      {
        title: "profile",
        group: "groupCenter",
        icon: <UserCircleIcon />,
        show: hasAccess("mutateProfile"),
        target: "profile",
      },
      financeSection({ hasAccess, inventory: true, insurance: true, group: "groupCenter", profile: "clinic" }),
      crmSection({ hasAccess, group: "groupCenter", profile: "clinic" }),
      kartablItem({ show: hasAccess() || hasAccess("readFinance") || hasAccess("readCrm") || kartabl > 0, group: "groupCenter", badge: kartabl }),
      {
        title: "teamTitle",
        group: "groupCenter",
        icon: <UserEditIcon />,
        // Managing secretaries/access-levels is never delegable — only the
        // real owner (hasAccess() with no action, true only for "FULL") can
        // see this.
        show: hasAccess(),
        target: "secretary",
      },
      {
        title: "licenses",
        group: "groupCenter",
        icon: <CartIcon />,
        show: hasAccess("readLicenses"),
        target: "license",
      },
      {
        title: "articles",
        group: "groupCenter",
        icon: <FileDuplicateIcon />,
        show: hasAccess("readArticles"),
        target: "article",
      },
    ],
    [hasAccess, joinRequests, kartabl],
  );

  return <PanelSidebar links={links} panel="clinicpanel" header={<CentreSwitcher kind="clinic" />} />;
};

export default ClinicPanelSidebar;
