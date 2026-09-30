"use client";

import { IBecomeClinicRequest } from "@/Components/ClinicPanel/BecomeClinicPage";
import { API, FilePath } from "@/Components/config";
import { fetcher } from "@/Components/helpers/fetcher";
import { useParams } from "next/navigation";
import ApproveBecomeRequestButton from "../UI/ApproveBecomeRequestButton";
import useSWR from "swr";
import HandleLoading from "../UI/HandleLoading";
import WithTitle from "../UI/WithTitle";
import TabSystem from "../UI/TabSystem";
import List from "../UI/List";
import InfoIcon from "@/Components/Icons/InfoIcon";
import DataPair from "../UI/DataPair";
import FormatDate from "@/Components/UI/FormatDate";
import InlineLink from "../UI/InlineLink";
import { adminPath } from "@/Components/helpers/adminPath";
import { becomeNodeStatusesDict } from "@/Components/DoctorPanel/DoctorPanelPage";
import Button from "@/Components/UI/Button";
import usePopup from "@/Components/Hooks/usePopup";
import ChangeBecomeClinicRequestPopup from "./ChangeBecomeClinicRequestStatusPopup";
import AssignClinicToClinicRequestPopup from "./AssignClinicToClinicRequestPopup";
import { ta } from "@/Components/Admin/i18n/adminText";

const AdminManageBecomeClinicPage = () => {
  const { nodeId } = useParams();
  const { data, error, mutate } = useSWR<IBecomeClinicRequest<{ user: true }>>(
    `${API}/auto/becomeclinic/${nodeId}`,
    (url: string) => fetcher({ url }).then((res) => res.data.data),
  );

  const { setPopup } = usePopup();

  return (
    <HandleLoading data={!!data} error={error}>
      {!!data && (
        <WithTitle title={ta("درخواست تبدیل به کلینیک")}>
          <TabSystem
            name="AdminManageBecomeClinic"
            items={[
              {
                title: ta("اطلاعات"),
                id: "Info",
                icon: <InfoIcon />,
                content: (
                  <List>
                    <DataPair title={ta("نام")} value={data.name} />
                    <DataPair
                      title={ta("تاریخ ثبت")}
                      value={<FormatDate value={data.createdAt} />}
                    />
                    <DataPair
                      title={ta("یوزر")}
                      value={
                        <InlineLink href={adminPath(`/user/${data.user?._id}`)}>
                          {data.user?.phone}
                        </InlineLink>
                      }
                    />
                    <DataPair
                      title={ta("وضعیت")}
                      value={becomeNodeStatusesDict[data.status]}
                    />
                    <DataPair title={ta("کد سیام")} value={data.siamCode} />
                    <DataPair title={ta("کد ملی")} value={data.nationalId} />
                    <DataPair
                      title={ta("تاریخ گواهی")}
                      value={<FormatDate value={data.certificateDate} />}
                    />
                    <DataPair
                      title={ta("فایل گواهی")}
                      value={
                        data.certificateFile ? (
                          <InlineLink
                            href={`${FilePath}/${data.certificateFile}`}
                          >
                            {ta("مشاهده فایل")}
                          </InlineLink>
                        ) : (
                          ta("ثبت نشده")
                        )
                      }
                    />
                    <DataPair title={ta("توضیحات")} value={data.description} />
                  </List>
                ),
              },
              {
                title: ta("عملیات"),
                id: "Actions",
                icon: <InfoIcon />,
                content: (
                  <List>
                    <ApproveBecomeRequestButton
                      requestPath="becomeclinic"
                      nodeId={String(nodeId)}
                      status={data.status}
                      label={ta("تأیید و ساخت کلینیک")}
                      done={ta("کلینیک ساخته و فعال شد.")}
                      target={(id) => `/clinic/${id}`}
                      mutate={mutate}
                    />
                    <Button
                      onClick={() =>
                        setPopup(
                          "ChangeBecomeClinicRequest",
                          <ChangeBecomeClinicRequestPopup
                            node={data}
                            mutate={mutate}
                          />,
                        )
                      }
                    >
                      {ta("تغییر وضعیت")}
                    </Button>
                    <Button
                      onClick={() =>
                        setPopup(
                          "AssignClinicToClinicRequest",
                          <AssignClinicToClinicRequestPopup
                            node={data}
                            mutate={mutate}
                          />,
                        )
                      }
                    >
                      {ta("تخصیص کلینیک")}
                    </Button>
                  </List>
                ),
              },
            ]}
          />
        </WithTitle>
      )}
    </HandleLoading>
  );
};

export default AdminManageBecomeClinicPage;
