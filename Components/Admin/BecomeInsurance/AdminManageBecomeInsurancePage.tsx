"use client";

import { API, FilePath } from "@/Components/config";
import { fetcher } from "@/Components/helpers/fetcher";
import { IBecomeInsuranceRequest } from "@/Components/Layout/InsurancePanelLayout";
import { useParams } from "next/navigation";
import ApproveBecomeRequestButton from "../UI/ApproveBecomeRequestButton";
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
import Button from "@/Components/UI/Button";
import usePopup from "@/Components/Hooks/usePopup";
import ChangeBecomeInsuranceStatusPopup from "./ChangeBecomeInsuranceStatusPopup";
import AssignInsuranceToBecomeInsuranceRequestPopup from "./AssignInsuranceToBecomeInsuranceRequestPopup";

const AdminManageBecomeInsurancePage = () => {
  const { nodeId } = useParams<{ nodeId: string }>();
  const { data, error, mutate } = useSWR<
    IBecomeInsuranceRequest<{ User: Record<never, never> }>
  >(`${API}/auto/becomeinsurance/${nodeId}`, (url: string) =>
    fetcher({ url }).then((res) => res.data.data),
  );

  const { setPopup } = usePopup();

  return (
    <HandleLoading data={!!data} error={error}>
      {!!data && (
        <WithTitle title="درخواست بیمه شدن">
          <TabSystem
            name="AdminManageBBecomeInsurance"
            items={[
              {
                title: "جزئیات",
                id: "Info",
                icon: <InfoIcon />,
                content: (
                  <List>
                    <DataPair
                      title="تاریخ ایجاد"
                      value={<FormatDate value={data.createdAt} />}
                    />
                    <DataPair title="نام" value={data.name} />
                    <DataPair
                      title="یوزر"
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
                      title="وضعیت"
                      value={becomeNodeStatusesDict[data.status]}
                    />
                    <DataPair title="کد سیام" value={data.siamCode} />
                    <DataPair title="کد ملی" value={data.nationalId} />
                    <DataPair
                      title="تاریخ گواهی"
                      value={<FormatDate value={data.certificateDate} />}
                    />
                    <DataPair
                      title="فایل گواهی"
                      value={
                        data.certificateFile ? (
                          <InlineLink
                            href={`${FilePath}/${data.certificateFile}`}
                          >
                            مشاهده فایل
                          </InlineLink>
                        ) : (
                          "ثبت نشده"
                        )
                      }
                    />
                    <DataPair title="توضیحات" value={data.description} />
                  </List>
                ),
              },
              {
                title: "عملیات",
                id: "Actions",
                icon: <InfoIcon />,
                content: (
                  <List>
                    <ApproveBecomeRequestButton
                      requestPath="becomeinsurance"
                      nodeId={String(nodeId)}
                      status={data.status}
                      label="تأیید و ساخت بیمه"
                      done="بیمه ساخته و فعال شد."
                      target={(id) => `/insurance/${id}`}
                      mutate={mutate}
                    />
                    <Button
                      onClick={() =>
                        setPopup(
                          "ChangeBecomeInsuranceStatus",
                          <ChangeBecomeInsuranceStatusPopup
                            mutate={mutate}
                            node={data}
                          />,
                        )
                      }
                    >
                      تغییر وضعیت
                    </Button>
                    <Button
                      onClick={() =>
                        setPopup(
                          "AssignInsuranceToBecomeInsuranceRequest",
                          <AssignInsuranceToBecomeInsuranceRequestPopup
                            mutate={mutate}
                            node={data}
                          />,
                        )
                      }
                    >
                      تخصیص بیمه
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

export default AdminManageBecomeInsurancePage;
