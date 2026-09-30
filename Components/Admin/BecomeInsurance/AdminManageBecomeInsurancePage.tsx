"use client";

import { API, FilePath } from "@/Components/config";
import { fetcher } from "@/Components/helpers/fetcher";
import { IBecomeInsuranceRequest } from "@/Components/Layout/InsurancePanelLayout";
import { useParams } from "next/navigation";
import ApproveBecomeRequestButton from "../UI/ApproveBecomeRequestButton";
import RequestDecisionActions from "../Requests/RequestDecisionActions";
import { requestUserId } from "../Requests/requestMeta";
import useSWR from "swr";
import HandleLoading from "../UI/HandleLoading";
import WithTitle from "../UI/WithTitle";
import TabSystem from "../UI/TabSystem";
import InfoIcon from "@/Components/Icons/InfoIcon";
import List from "../UI/List";
import DataPair from "../UI/DataPair";
import FormatDate from "@/Components/UI/FormatDate";
import InlineLink from "../UI/InlineLink";
import { adminPath } from "@/Components/helpers/adminPath";
import { becomeNodeStatusesDict } from "@/Components/DoctorPanel/DoctorPanelPage";
import { ta } from "@/Components/Admin/i18n/adminText";

const AdminManageBecomeInsurancePage = () => {
  const { nodeId } = useParams<{ nodeId: string }>();
  const { data, error, mutate } = useSWR<
    IBecomeInsuranceRequest<{ User: Record<never, never> }>
  >(`${API}/auto/becomeinsurance/${nodeId}`, (url: string) =>
    fetcher({ url }).then((res) => res.data.data),
  );


  return (
    <HandleLoading data={!!data} error={error}>
      {!!data && (
        <WithTitle title={ta("درخواست بیمه شدن")}>
          <TabSystem
            name="AdminManageBBecomeInsurance"
            items={[
              {
                title: ta("جزئیات"),
                id: "Info",
                icon: <InfoIcon />,
                content: (
                  <List>
                    <DataPair
                      title={ta("تاریخ ایجاد")}
                      value={<FormatDate value={data.createdAt} />}
                    />
                    <DataPair title={ta("نام")} value={data.name} />
                    <DataPair
                      title={ta("کاربر")}
                      value={
                        data.user ? (
                          <InlineLink
                            href={adminPath(`/user/${data.user._id}`)}
                          >
                            {data.user.phone || data.user._id}
                          </InlineLink>
                        ) : (
                          ""
                        )
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
                      kind="insurance"
                      nodeId={String(nodeId)}
                      status={data.status}
                      rejectReason={data.rejectReason}
                      mutate={mutate}
                      approve={
                        <ApproveBecomeRequestButton
                          requestPath="becomeinsurance"
                          nodeId={String(nodeId)}
                          status={data.status}
                          label={ta("تأیید و ساخت بیمه")}
                          done={ta("بیمه ساخته و فعال شد.")}
                          target={(id) => `/insurance/${id}`}
                          mutate={mutate}
                        />
                      }
                      linkExisting={{
                        requestPath: "becomeinsurance",
                        orgPath: `${API}/auto/insurance`,
                        label: ta("انتخاب بیمه"),
                        target: (id) => `/insurance/${id}`,
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

export default AdminManageBecomeInsurancePage;
