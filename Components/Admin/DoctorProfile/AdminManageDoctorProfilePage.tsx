"use client";
import { useParams } from "next/navigation";
import classes from "./AdminManageDoctorProfilePage.module.css";
import useSWR from "swr";
import { IDoctorProfile } from "@/Components/DoctorPanel/DoctorPanelPage";
import { API } from "@/Components/config";
import { fetcher } from "@/Components/helpers/fetcher";
import HandleLoading from "../UI/HandleLoading";
import WithTitle from "../UI/WithTitle";
import TabSystem from "../UI/TabSystem";
import InfoIcon from "@/Components/Icons/InfoIcon";
import DoctorProfileInfoTab from "./DoctorProfileInfoTab";
import DoctorSpecialityTab from "./DoctorSpecialityTab";
import DoctorProfileUserTab from "./DoctorProfileUserTab";
import Button from "@/Components/UI/Button";
import usePopup from "@/Components/Hooks/usePopup";
import useProgress from "@/Components/Hooks/useProgress";
import DeleteDoctorProfilePopup from "./DeleteDoctorProfilePopup";
import { adminPath } from "@/Components/helpers/adminPath";
import DoctorProfilePhoneConsultTab from "./DoctorProfilePhoneConsultTab";
import useAccessLevel from "@/Components/Hooks/useAccessLevel";
import List from "../UI/List";
import DashboardIcon from "@/Components/Icons/DashboardIcon";
import DoctorProfileLocationTab from "./DoctorProfileLocationTab";

const AdminManageDoctorProfilePage = () => {
  const params = useParams<{ nodeId: string }>();
  const { data, error, mutate } = useSWR<
    IDoctorProfile<{
      PhoneConsultSettingsPopulated: Record<never, never>;
    }>
  >(
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
            "پروفایل پزشک"
          }
        >
          <TabSystem
            items={[
              {
                id: "Info",
                title: "جزئیات",
                content: <DoctorProfileInfoTab node={data} mutate={mutate} />,
                icon: <InfoIcon />,
              },
              {
                id: "Laoction",
                title: "لوکیشن",
                content: (
                  <DoctorProfileLocationTab mutate={mutate} node={data} />
                ),
                icon: <DashboardIcon />,
              },
              ...(hasAccess("Sepciality", "readAll")
                ? [
                    {
                      id: "Speciality",
                      title: "تخصص",
                      content: (
                        <DoctorSpecialityTab node={data} mutate={mutate} />
                      ),
                      icon: <InfoIcon />,
                    },
                  ]
                : []),
              {
                id: "User",
                content: <DoctorProfileUserTab node={data} mutate={mutate} />,
                icon: <InfoIcon />,
                title: "کاربر",
              },
              {
                id: "PhoneConsult",
                content: (
                  <DoctorProfilePhoneConsultTab node={data} mutate={mutate} />
                ),
                icon: <InfoIcon />,
                title: "مشاور تلفنی",
              },
              {
                id: "Actions",
                content: (
                  <List>
                    {hasAccess("DoctorProfile", "delete") && (
                      <Button
                        variant="Danger"
                        onClick={() =>
                          setPopup(
                            "DeleteDoctorProfile",
                            <DeleteDoctorProfilePopup
                              node={data}
                              mutate={() => push(adminPath(`/doctorprofile`))}
                            />,
                          )
                        }
                      >
                        حذف
                      </Button>
                    )}
                  </List>
                ),
                icon: <InfoIcon />,
                title: "عملیات",
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
