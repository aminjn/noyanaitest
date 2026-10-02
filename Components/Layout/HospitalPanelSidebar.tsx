import BookOpenIcon from "@/Components/Icons/BookOpenIcon";
import StarIcon from "../Icons/StarIcon";
import WalletIcon from "../Icons/WalletIcon";
import ClockIcon from "../Icons/ClockIcon";
import DashboardIcon from "../Icons/DashboardIcon";
import useSWR from "swr";
import { API } from "../config";
import { fetcher } from "../helpers/fetcher";
import StetoscopeIcon from "../Icons/StetoscopeIcon";
import { useMemo } from "react";
import PanelSidebar, { LinkMap } from "./PanelSidebar";
import UserEditIcon from "../Icons/UserEditIcon";
import FileDuplicateIcon from "../Icons/FileDuplicateIcon";
import UserCircleIcon from "../Icons/UserCircleIcon";
import CartIcon from "../Icons/CartIcon";
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
      {
        title: "financialMangement",
        icon: <WalletIcon />,
        group: "groupCenter",
        show: hasAccess("readFinance"),
        target: "finance",
      },
      {
        title: "accounting",
        icon: <BookOpenIcon />,
        group: "groupCenter",
        show: hasAccess("readFinance"),
        target: "accounting",
      },
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
    [hasAccess, joinRequests],
  );

  return <PanelSidebar links={links} panel="hospitalpanel" />;
};

export default HospitalPanelSidebar;
