"use client";

import { IBecomeHospitalRequest } from "@/Components/HospitalPanel/BecomeHospitalPage";
import { API, FilePath } from "@/Components/config";
import { fetcher } from "@/Components/helpers/fetcher";
import { useParams } from "next/navigation";
import ApproveBecomeRequestButton from "../UI/ApproveBecomeRequestButton";
import RequestDecisionActions from "../Requests/RequestDecisionActions";
import { requestUserId } from "../Requests/requestMeta";
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
import { ta } from "@/Components/Admin/i18n/adminText";

const AdminManageBecomeHospitalPage = () => {
  const { nodeId } = useParams();
  const { data, error, mutate } = useSWR<IBecomeHospitalRequest<{ user: true }>>(
    `${API}/auto/becomehospital/${nodeId}`,
    (url: string) => fetcher({ url }).then((res) => res.data.data),
  );


  return (
    <HandleLoading data={!!data} error={error}>
      {!!data && (
        <WithTitle title={ta("درخواست تبدیل به بیمارستان")}>
          <TabSystem
            name="AdminManageBecomeHospital"
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
                      title={ta("کاربر")}
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
                    {!!data.rejectReason && (
                      <DataPair title={ta("دلیل رد")} value={data.rejectReason} />
                    )}
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
                    <RequestDecisionActions
                      group="become"
                      kind="hospital"
                      nodeId={String(nodeId)}
                      status={data.status}
                      rejectReason={data.rejectReason}
                      mutate={mutate}
                      approve={
                        <ApproveBecomeRequestButton
                          requestPath="becomehospital"
                          nodeId={String(nodeId)}
                          status={data.status}
                          label={ta("تأیید و ساخت بیمارستان")}
                          done={ta("بیمارستان ساخته و فعال شد.")}
                          target={(id) => `/hospital/${id}`}
                          mutate={mutate}
                        />
                      }
                      linkExisting={{
                        requestPath: "becomehospital",
                        orgPath: `${API}/auto/hospital`,
                        label: ta("انتخاب بیمارستان"),
                        target: (id) => `/hospital/${id}`,
                        applicantUser: requestUserId(data.user),
                      }}
                    />
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

export default AdminManageBecomeHospitalPage;
