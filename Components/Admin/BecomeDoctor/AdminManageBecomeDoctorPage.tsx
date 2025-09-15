"use client";
import { useParams } from "next/navigation";
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
import ChangeBecomeDoctorStatusPopup from "./ChangeBecomeDoctorStatusPopup";
import FormActions from "../UI/FormActions";
import BecomeDoctorProfileSelector from "./BecomeDoctorProfileSelector";
import useAccessLevel from "@/Components/Hooks/useAccessLevel";

const AdminManageBecomeDoctorPage = () => {
  const params = useParams<{ nodeId: string }>();
  const { data, error, mutate } = useSWR<
    IBecomeDoctorRequest<{ SpecialitiesPopulated: true; UserPopulated: true }>
  >(
    params ? `${API}/auto/becomedoctor/${params.nodeId}` : null,
    (url: string) => fetcher({ url }).then((res) => res.data.data)
  );

  const { setPopup } = usePopup();

  const push = useProgress();

  const hasAccess = useAccessLevel();

  return (
    <HandleLoading data={!!data} error={error}>
      {!!data && (
        <WithTitle title="درخواست پزشک شدن">
          <TabSystem
            items={[
              {
                id: "Input",
                content: (
                  <List>
                    <DataPair
                      title="تاریخ ثبت"
                      value={<FormatDate value={new Date(data.createdAt)} />}
                    />
                    <DataPair
                      title="کاربر"
                      value={
                        <InlineLink href={adminPath(`/user/${data.user._id}`)}>
                          {data.user.phone}
                        </InlineLink>
                      }
                    />
                    <DataPair title="نام" value={data.firstName} />
                    <DataPair title="نام خانوادگی" value={data.lastName} />
                    <DataPair title="کد ملی" value={data.ssid} />
                    <DataPair title="جنسیت" value={genderDict[data.gender]} />
                    <DataPair
                      title="عنوان نظام پزشکی"
                      value={data.medicalSystemTitle}
                    />
                    <DataPair
                      title="کد نظام پزشکی"
                      value={data.medicalSystemCode}
                    />
                    <DataPair
                      title="استان"
                      value={
                        provinces.find((p) => p.slug === data.province)?.name
                      }
                    />
                    <DataPair
                      title="شهر"
                      value={cities.find((c) => c.slug === data.city)?.name}
                    />
                    <DataPair title="آدرس" value={data.address} />
                    <DataPair title="توضیحات" value={data.description} />
                    <DataPair
                      title="وضعیت"
                      value={becomeNodeStatusesDict[data.status]}
                    />
                    <div>
                      <legend>تخصص ها</legend>
                      <List>
                        {data.specialities.map((speciality) => (
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
                title: "اطلاعات",
                icon: <InfoIcon />,
              },
              ...(hasAccess("DoctorProfile", "readAll")
                ? [
                    {
                      title: "پروفایل",
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
                  <FormActions>
                    {hasAccess("BecomeDoctorRequest", "delete") && (
                      <Button
                        variant="Danger"
                        onClick={() =>
                          setPopup(
                            "DeleteBecomeDoctor",
                            <DeleteBecomeDoctorPopup
                              node={data}
                              mutate={() => push(adminPath("/becomedoctor"))}
                            />
                          )
                        }
                      >
                        حذف
                      </Button>
                    )}
                    {hasAccess("BecomeDoctorRequest", "update") && (
                      <Button
                        variant="Primary"
                        onClick={() =>
                          setPopup(
                            "ChangeBecomeDoctorStatus",
                            <ChangeBecomeDoctorStatusPopup
                              mutate={mutate}
                              node={data}
                            />
                          )
                        }
                      >
                        تغییر وضعیت
                      </Button>
                    )}
                  </FormActions>
                ),
                title: "عملیات",
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
