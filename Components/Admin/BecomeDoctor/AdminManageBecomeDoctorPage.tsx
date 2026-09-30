"use client";
import { useParams } from "next/navigation";
import ApproveBecomeRequestButton from "../UI/ApproveBecomeRequestButton";
import RequestDecisionActions from "../Requests/RequestDecisionActions";
import classes from "./AdminManageBecomeDoctorPage.module.css";
import useSWR from "swr";
import {
  becomeNodeStatusesDict,
  genderDict,
  IBecomeDoctorRequest,
} from "@/Components/DoctorPanel/DoctorPanelPage";
import { API } from "@/Components/config";
import { fetcher } from "@/Components/helpers/fetcher";
import HandleLoading from "../UI/HandleLoading";
import TabSystem from "../UI/TabSystem";
import WithTitle from "../UI/WithTitle";
import InfoIcon from "@/Components/Icons/InfoIcon";
import DataPair from "../UI/DataPair";
import InlineLink from "../UI/InlineLink";
import FormatDate from "@/Components/UI/FormatDate";
import { adminPath } from "@/Components/helpers/adminPath";
import { provinces } from "@/Components/Enums/Provinces";
import { cities } from "@/Components/Enums/Cities";
import List from "../UI/List";
import Button from "@/Components/UI/Button";
import usePopup from "@/Components/Hooks/usePopup";
import useProgress from "@/Components/Hooks/useProgress";
import DeleteBecomeDoctorPopup from "./DeleteBecomeDoctorPopup";
import FormActions from "../UI/FormActions";
import BecomeDoctorProfileSelector from "./BecomeDoctorProfileSelector";
import useAccessLevel from "@/Components/Hooks/useAccessLevel";
import { ta } from "@/Components/Admin/i18n/adminText";

const AdminManageBecomeDoctorPage = () => {
  const params = useParams<{ nodeId: string }>();
  const { data, error, mutate } = useSWR<
    IBecomeDoctorRequest<{ SpecialitiesPopulated: true; UserPopulated: true }>
  >(
    params ? `${API}/auto/becomedoctor/${params.nodeId}` : null,
    (url: string) => fetcher({ url }).then((res) => res.data.data),
  );

  const { setPopup } = usePopup();

  const push = useProgress();

  const hasAccess = useAccessLevel();

  return (
    <HandleLoading data={!!data} error={error}>
      {!!data && (
        <WithTitle title={ta("درخواست پزشک شدن")}>
          <TabSystem
            items={[
              {
                id: "Input",
                content: (
                  <List>
                    <DataPair
                      title={ta("تاریخ ثبت")}
                      value={<FormatDate value={new Date(data.createdAt)} />}
                    />
                    <DataPair
                      title={ta("کاربر")}
                      value={
                        <InlineLink href={adminPath(`/user/${data.user?._id}`)}>
                          {data.user?.phone || "—"}
                        </InlineLink>
                      }
                    />
                    <DataPair title={ta("نام")} value={data.firstName} />
                    <DataPair title={ta("نام خانوادگی")} value={data.lastName} />
                    <DataPair title={ta("کد ملی")} value={data.ssid} />
                    <DataPair title={ta("جنسیت")} value={genderDict[data.gender]} />
                    <DataPair
                      title={ta("عنوان نظام پزشکی")}
                      value={data.medicalSystemTitle && ta(data.medicalSystemTitle)}
                    />
                    <DataPair
                      title={ta("کد نظام پزشکی")}
                      value={data.medicalSystemCode}
                    />
                    <DataPair
                      title={ta("استان")}
                      value={
                        provinces.find((p) => p.slug === data.province)?.name
                      }
                    />
                    <DataPair
                      title={ta("شهر")}
                      value={cities.find((c) => c.slug === data.city)?.name}
                    />
                    <DataPair title={ta("آدرس")} value={data.address} />
                    <DataPair title={ta("توضیحات")} value={data.description} />
                    <DataPair
                      title={ta("وضعیت")}
                      value={becomeNodeStatusesDict[data.status]}
                    />
                    {!!data.rejectReason && (
                      <DataPair title={ta("دلیل رد")} value={data.rejectReason} />
                    )}
                    <div>
                      <legend>{ta("تخصص ها")}</legend>
                      <List>
                        {(Array.isArray(data.specialities) ? data.specialities : []).map((speciality) => (
                          <InlineLink
                            key={speciality._id}
                            href={adminPath(`/speciality/${speciality._id}`)}
                          >
                            {speciality.name}
                          </InlineLink>
                        ))}
                      </List>
                    </div>
                  </List>
                ),
                title: ta("اطلاعات"),
                icon: <InfoIcon />,
              },
              ...(hasAccess("DoctorProfile", "readAll")
                ? [
                    {
                      title: ta("پروفایل"),
                      icon: <InfoIcon />,
                      id: "Profile",
                      content: <BecomeDoctorProfileSelector req={data} />,
                    },
                  ]
                : []),
              {
                id: "Actions",
                icon: <InfoIcon />,
                content: (
                  <List>
                    <RequestDecisionActions
                      group="become"
                      kind="doctor"
                      nodeId={data._id}
                      status={data.status}
                      rejectReason={data.rejectReason}
                      mutate={mutate}
                      approve={
                        <ApproveBecomeRequestButton
                          requestPath="becomedoctor"
                          nodeId={data._id}
                          status={data.status}
                          label={ta("تأیید و ساخت پروفایل پزشک")}
                          done={ta("پروفایل پزشک با تخصص‌های اعلام‌شده ساخته و فعال شد.")}
                          target={(id) => `/doctorprofile/${id}`}
                          mutate={mutate}
                        />
                      }
                    />
                    {hasAccess("BecomeDoctorRequest", "delete") && (
                      <FormActions>
                        <Button
                          variant="Error"
                          mode="Outline"
                          onClick={() =>
                            setPopup(
                              "DeleteBecomeDoctor",
                              <DeleteBecomeDoctorPopup
                                node={data}
                                mutate={() => push(adminPath("/requests?group=become&kind=doctor"))}
                              />,
                            )
                          }
                        >
                          {ta("حذف")}
                        </Button>
                      </FormActions>
                    )}
                  </List>
                ),
                title: ta("عملیات"),
              },
            ]}
            name="AdminManageBecomeDoctor"
          />
        </WithTitle>
      )}
    </HandleLoading>
  );
};

export default AdminManageBecomeDoctorPage;
