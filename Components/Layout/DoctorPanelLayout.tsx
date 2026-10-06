import SuspendedProviderBanner, { SuspendableProvider } from "./SuspendedProviderBanner";
import ActingAsBanner from "./ActingAsBanner";
import { ReactNode } from "react";
import HandleLoading from "../Admin/UI/HandleLoading";
import ErrorMessage from "../Admin/UI/ErrorMessage";
import BecomeADoctorPage from "../DoctorPanel/BecomeADoctorPage";
import useUser from "../Hooks/useUser";
import LoginRequired from "../UI/LoginRequired";
import DoctorSidebar from "./DoctorSidebar";
import PanelLayout from "./PanelLayout";
import useDoctor from "../Hooks/useDoctor";
import DoctorLicenseGate from "../DoctorPanel/DoctorLicenseGate";
import useSWR from "swr";
import { API } from "../config";
import { fetcher } from "../helpers/fetcher";
import useDoctorAcl from "../Hooks/useDoctorAcl";
import useScopedLocale from "../Hooks/useScopedLocale";
import { usePathname } from "@/Components/i18n/navigation";
import { TabItem } from "./BottomNav";
import DashboardIcon from "../Icons/DashboardIcon";
import ClockIcon from "../Icons/ClockIcon";
import StetoscopeIcon from "../Icons/StetoscopeIcon";
import ChatIcon from "../Icons/ChatIcon";
import { ContentNamespace } from "../Enums/contentNamespaces";

const LOCALE_NS: ContentNamespace[] = ["common", "layoutPanel"];

// full-screen tools with their own bottom controls
const TABS_OFF = [/^\/doctorpanel\/chat\/[^/]+/, /^\/doctorpanel\/prescription\/[^/]+/];

// The doctor's phone tab bar (Doctolib / Paziresh24 doctor apps): today,
// the schedule, patients, the inbox with its unread count, and the menu.
const useDoctorTabs = (enabled: boolean): { tabs: TabItem[]; off: boolean } => {
  const getContent = useScopedLocale(LOCALE_NS);
  const pathname = usePathname();
  const hasAccess = useDoctorAcl();
  const canChat = enabled && hasAccess("readChat");
  const { data: unread } = useSWR<number>(
    canChat ? `${API}/doctor/chat/unread` : null,
    (url: string) => fetcher({ url }).then((res) => Number(res?.data?.count) || 0),
    { refreshInterval: 30000 },
  );
  const at = (seg: string) => pathname === `/doctorpanel/${seg}` || pathname.startsWith(`/doctorpanel/${seg}/`);
  const tabs: TabItem[] = !enabled
    ? []
    : [
        { key: "today", label: getContent("tabToday"), icon: <DashboardIcon />, href: "/doctorpanel", active: pathname === "/doctorpanel" },
        ...(hasAccess("readSchedule")
          ? [{ key: "schedule", label: getContent("tabSchedule"), icon: <ClockIcon />, href: "/doctorpanel/schedule", active: at("schedule") || at("booking") || at("shift") }]
          : []),
        ...(hasAccess("readPatients")
          ? [{ key: "patients", label: getContent("tabPatients"), icon: <StetoscopeIcon />, href: "/doctorpanel/patient", active: at("patient") }]
          : []),
        ...(canChat
          ? [{ key: "chat", label: getContent("tabChat"), icon: <ChatIcon />, href: "/doctorpanel/chat", active: at("chat"), badge: unread || 0 }]
          : []),
      ];
  return { tabs, off: TABS_OFF.some((re) => re.test(pathname)) };
};

const DoctorPanelLayout = ({ children }: { children: ReactNode }) => {
  const { user, isUserLoading } = useUser();
  const { doctor, isLoading, error } = useDoctor();

  // Only a 403 from GET /doctor means "this user has no doctor profile";
  // other failures show an error instead of the become-a-doctor flow.
  const notADoctor = !doctor && (!error || error.status === 403);
  const { tabs, off } = useDoctorTabs(!!doctor);

  return (
    <HandleLoading data={!isUserLoading && !isLoading}>
      {!user ? (
        <LoginRequired />
      ) : doctor ? (
        <PanelLayout sidebar={<DoctorSidebar />} tabs={tabs} tabsOff={off}>
          <ActingAsBanner kind="doctor" ownerName={[doctor.firstName, doctor.lastName].filter(Boolean).join(" ")} />
          <SuspendedProviderBanner node={doctor as SuspendableProvider} />
          <DoctorLicenseGate>{children}</DoctorLicenseGate>
        </PanelLayout>
      ) : notADoctor ? (
        <BecomeADoctorPage />
      ) : (
        <ErrorMessage message={error?.message} />
      )}
    </HandleLoading>
  );
};

export default DoctorPanelLayout;
