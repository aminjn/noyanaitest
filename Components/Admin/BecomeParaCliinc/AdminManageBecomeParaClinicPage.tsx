"use client";

import { API, FilePath } from "@/Components/config";
import { fetcher } from "@/Components/helpers/fetcher";
import { IBecomeParaClinicRequest } from "@/Components/Layout/BecomeParaClinicPage";
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
import ChangeBecomeParaClinicRequestStatusPopup from "./ChangeBecomeParaClinicRequestStatusPopup";
import AssignParaClinicToBecomeParaClinicRequestPopup from "./AssignParaClinicToBecomeParaClinicRequestPopup";
import { ta } from "@/Components/Admin/i18n/adminText";

const AdminManageBecomeParaClinicPage = () => {
  const { nodeId } = useParams<{ nodeId: string }>();
  const { data, error, mutate } = useSWR<
    IBecomeParaClinicRequest<{ User: Record<never, never> }>
  >(`${API}/auto/becomeParaClinic/${nodeId}`, (url: string) =>
    fetcher({ url }).then((res) => res.data.data),
  );

  const { setPopup } = usePopup();

  return (
    <HandleLoading data={!!data} error={error}>
      {!!data && (
        <WithTitle title={ta("درخواست تبدیل به پاراکلینیک")}>
          <TabSystem
            name="AdminManageBecomeParaClinic"
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
                        data.user ? (
                          <InlineLink href={adminPath(`/user/${data.user._id}`)}>
                            {data.user.phone}
                          </InlineLink>
                        ) : (
                          ta("حذف شده")
                        )
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
                      requestPath="becomeParaClinic"
                      nodeId={String(nodeId)}
                      status={data.status}
                      label={ta("تأیید و ساخت مرکز پاراکلینیک")}
                      done={ta("مرکز پاراکلینیک ساخته و فعال شد.")}
                      target={(id) => `/paraClinic/${id}`}
                      mutate={mutate}
                    />
                    <Button
                      onClick={() =>
                        setPopup(
                          "ChangeBecomeParaClinicRequestStatus",
                          <ChangeBecomeParaClinicRequestStatusPopup
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
                          "AssignParaClinicToBecomeParaClinicRequest",
                          <AssignParaClinicToBecomeParaClinicRequestPopup
                            node={data}
                            mutate={mutate}
                          />,
                        )
                      }
                    >
                      {ta("تخصیص پاراکلینیک")}
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

export default AdminManageBecomeParaClinicPage;
