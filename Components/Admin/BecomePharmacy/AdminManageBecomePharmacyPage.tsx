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
import useNotification from "@/Components/Hooks/useNotification";
import useProgress from "@/Components/Hooks/useProgress";
import { useState } from "react";
import ChangeBecomePharmacyRequestStatusPopup from "./ChangeBecomePharmacyRequestStatusPopup";
import AssignPharmacyToBecomePharmacyRequestPopup from "./AssignPharmayToBecomePharmacyRequestPopup";

const AdminManageBecomePharmacyPage = () => {
  const { nodeId } = useParams<{ nodeId: string }>();
  const { data, error, mutate } = useSWR<
    IBecomePharmacyRequest<{ user: true }>
  >(`${API}/auto/becomepharmacy/${nodeId}`, (url: string) =>
    fetcher({ url }).then((res) => res.data.data),
  );

  const { setPopup } = usePopup();
  const pushNotification = useNotification();
  const push = useProgress();
  const [approving, setApproving] = useState(false);

  // one step: create the pharmacy from this request, link the applicant,
  // activate it and mark the request approved (it used to take three
  // manual steps, and "approved" alone created nothing)
  const approve = async () => {
    if (approving) return;
    setApproving(true);
    try {
      const res = await fetcher({
        url: `${API}/admin/becomepharmacy/${nodeId}/approve`,
        method: "POST",
      });
      pushNotification("داروخانه ساخته و فعال شد.", "Success");
      await mutate();
      const id = res?.data?.pharmacy?._id;
      if (id) push(adminPath(`/pharmacy/${id}`));
    } catch (e) {
      pushNotification(e instanceof Error ? e.message : String(e), "Error");
    } finally {
      setApproving(false);
    }
  };

  return (
    <HandleLoading data={!!data} error={error}>
      {!!data && (
        <WithTitle title="درخواست داروخانه شدن">
          <TabSystem
            name="AdminManageBecomePharmacy"
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
                    <DataPair
                      title="کاربر"
                      value={
                        data.user ? (
                          <InlineLink
                            href={adminPath(`/user/${data.user?._id}`)}
                          >
                            {data.user?.phone || data.user?._id}
                          </InlineLink>
                        ) : (
                          "حذف شده"
                        )
                      }
                    />
                    <DataPair
                      value={becomeNodeStatusesDict[data.status]}
                      title="وضعیت"
                    />
                    <DataPair value={data.name} title="نام" />
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
                id: "actions",
                icon: <InfoIcon />,
                content: (
                  <List>
                    {data.status !== "Approved" && (
                      <Button
                        isLoading={approving}
                        onClick={approve}
                      >
                        تأیید و ساخت داروخانه
                      </Button>
                    )}
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
                      تغییر وضعیت
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
                      تخصیص داروخانه
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
