"use client";
import AdminContentTranslationPage from "@/Components/Admin/ContentTranslation/AdminContentTranslationPage";
import EntityOverview from "../UI/EntityOverview";
import useUser from "@/Components/Hooks/useUser";
import { useParams } from "next/navigation";
import useSWR from "swr";
import { IDoctorProfile } from "@/Components/DoctorPanel/DoctorPanelPage";
import { API } from "@/Components/config";
import { fetcher } from "@/Components/helpers/fetcher";
import HandleLoading from "../UI/HandleLoading";
import WithTitle from "../UI/WithTitle";
import TabSystem from "../UI/TabSystem";
import InfoIcon from "@/Components/Icons/InfoIcon";
import DoctorProfileInfoTab from "./DoctorProfileInfoTab";
import DoctorProfileUserTab from "./DoctorProfileUserTab";
import usePopup from "@/Components/Hooks/usePopup";
import useProgress from "@/Components/Hooks/useProgress";
import DeleteDoctorProfilePopup from "./DeleteDoctorProfilePopup";
import { adminPath } from "@/Components/helpers/adminPath";
import useAccessLevel from "@/Components/Hooks/useAccessLevel";
import DashboardIcon from "@/Components/Icons/DashboardIcon";
import DoctorProfileLocationTab from "./DoctorProfileLocationTab";
import WalletIcon from "@/Components/Icons/WalletIcon";
import DoctorFinanceTab from "./DoctorFinanceTab";
import DoctorProfileLicenseTab from "./DoctorProfileLicenseTab";
import CartIcon from "@/Components/Icons/CartIcon";
import { ta } from "@/Components/Admin/i18n/adminText";

// One record page per doctor, a short set of tabs as in the Doctolib Pro /
// Docplanner back-offices: overview, the record itself (identity,
// speciality, contact, introduction, visibility as sections), location,
// money (commission + tax), license, panel owner, translations. Delete is
// a header action behind a confirmation. Removed (2026-09): the «مشاور
// تلفنی» tab (a stub printing its own component name - PhoneConsultSettings
// has no admin endpoint and the doctor panel does not offer the "phone"
// kind), the separate «تخصص», «کمیسیون», «مالیات» and «عملیات» tabs.
const AdminManageDoctorProfilePage = () => {
  const params = useParams<{ nodeId: string }>();
  // Overview, finance and license read admin-only endpoints (their
  // autoRouter entries have no accessLevel) - a "notadmin" role would only
  // see an error there
  const isAdmin = useUser(true).user?.role === "admin";
  const { data, error, mutate } = useSWR<IDoctorProfile>(
    params ? `${API}/auto/doctorprofile/${params.nodeId}` : null,
    (url: string) => fetcher({ url }).then((res) => res.data.data),
  );

  const { setPopup } = usePopup();

  const push = useProgress();

  const hasAccess = useAccessLevel();

  return (
    <HandleLoading data={!!data} error={error}>
      {!!data && (
        <WithTitle
          title={
            `${data.firstName || ""} ${data.lastName || ""}`.trim() ||
            ta("بدون نام")
          }
          actions={
            hasAccess("DoctorProfile", "delete")
              ? [
                  {
                    title: ta("حذف"),
                    danger: true,
                    action: () =>
                      setPopup(
                        "DeleteDoctorProfile",
                        <DeleteDoctorProfilePopup
                          node={data}
                          mutate={() => push(adminPath(`/doctorprofile`))}
                        />,
                      ),
                  },
                ]
              : undefined
          }
        >
          <TabSystem
            items={[
              ...(isAdmin
                ? [
                    {
                      id: "Overview",
                      title: ta("نمای کلی"),
                      content: (
                        <EntityOverview
                          kind="doctorprofile"
                          nodeId={params?.nodeId || ""}
                        />
                      ),
                      icon: <DashboardIcon />,
                    },
                  ]
                : []),
              {
                id: "Info",
                title: ta("اطلاعات"),
                content: <DoctorProfileInfoTab node={data} mutate={mutate} />,
                icon: <InfoIcon />,
              },
              {
                id: "Location",
                title: ta("موقعیت"),
                content: (
                  <DoctorProfileLocationTab mutate={mutate} node={data} />
                ),
                icon: <DashboardIcon />,
              },
              ...(isAdmin
                ? [
                    {
                      id: "Finance",
                      content: <DoctorFinanceTab node={data} />,
                      icon: <WalletIcon />,
                      title: ta("مالی"),
                    },
                    {
                      id: "License",
                      content: <DoctorProfileLicenseTab node={data} />,
                      icon: <CartIcon />,
                      title: ta("مجوز"),
                    },
                  ]
                : []),
              {
                id: "User",
                content: <DoctorProfileUserTab node={data} mutate={mutate} />,
                icon: <InfoIcon />,
                title: ta("مالک پنل"),
              },
              {
                id: "translations",
                title: ta("ترجمه‌ها"),
                content: <AdminContentTranslationPage segment="doctorprofile" />,
              },
            ]}
            name="AdminManageDoctorProfile"
          />
        </WithTitle>
      )}
    </HandleLoading>
  );
};

export default AdminManageDoctorProfilePage;
