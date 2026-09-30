"use client";

import { API, FilePath } from "@/Components/config";
import { fetcher } from "@/Components/helpers/fetcher";
import { IBecomePharmacyRequest } from "@/Components/PharmacyPanel/BecomePharmacyPage";
import { useParams } from "next/navigation";
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
import ApproveBecomeRequestButton from "../UI/ApproveBecomeRequestButton";
import ChangeBecomePharmacyRequestStatusPopup from "./ChangeBecomePharmacyRequestStatusPopup";
import AssignPharmacyToBecomePharmacyRequestPopup from "./AssignPharmayToBecomePharmacyRequestPopup";
import { ta } from "@/Components/Admin/i18n/adminText";

const AdminManageBecomePharmacyPage = () => {
  const { nodeId } = useParams<{ nodeId: string }>();
  const { data, error, mutate } = useSWR<
    IBecomePharmacyRequest<{ user: true }>
  >(`${API}/auto/becomepharmacy/${nodeId}`, (url: string) =>
    fetcher({ url }).then((res) => res.data.data),
  );

  const { setPopup } = usePopup();
  return (
    <HandleLoading data={!!data} error={error}>
      {!!data && (
        <WithTitle title={ta("درخواست داروخانه شدن")}>
          <TabSystem
            name="AdminManageBecomePharmacy"
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
                    <DataPair
                      title={ta("کاربر")}
                      value={
                        data.user ? (
                          <InlineLink
                            href={adminPath(`/user/${data.user?._id}`)}
                          >
                            {data.user?.phone || data.user?._id}
                          </InlineLink>
                        ) : (
                          ta("حذف شده")
                        )
                      }
                    />
                    <DataPair
                      value={becomeNodeStatusesDict[data.status]}
                      title={ta("وضعیت")}
                    />
                    <DataPair value={data.name} title={ta("نام")} />
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
                id: "actions",
                icon: <InfoIcon />,
                content: (
                  <List>
                    <ApproveBecomeRequestButton
                      requestPath="becomepharmacy"
                      nodeId={nodeId}
                      status={data.status}
                      label={ta("تأیید و ساخت داروخانه")}
                      done={ta("داروخانه ساخته و فعال شد.")}
                      target={(id) => `/pharmacy/${id}`}
                      mutate={mutate}
                    />
                    <Button
                      onClick={() =>
                        setPopup(
                          "ChangeBecomePharmacyRequestStatus",
                          <ChangeBecomePharmacyRequestStatusPopup
                            mutate={mutate}
                            node={data}
                          />,
                        )
                      }
                    >
                      {ta("تغییر وضعیت")}
                    </Button>
                    <Button
                      onClick={() =>
                        setPopup(
                          "AssignPharmacyToBecomePharmacyRequest",
                          <AssignPharmacyToBecomePharmacyRequestPopup
                            mutate={mutate}
                            node={data}
                          />,
                        )
                      }
                    >
                      {ta("تخصیص داروخانه")}
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

export default AdminManageBecomePharmacyPage;
