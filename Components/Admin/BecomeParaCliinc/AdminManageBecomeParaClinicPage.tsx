"use client";

import { API, FilePath } from "@/Components/config";
import { fetcher } from "@/Components/helpers/fetcher";
import { IBecomeParaClinicRequest } from "@/Components/Layout/BecomeParaClinicPage";
import { useParams } from "next/navigation";
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
        <WithTitle title="درخواست تبدیل به پاراکلینیک">
          <TabSystem
            name="AdminManageBecomeParaClinic"
            items={[
              {
                title: "اطلاعات",
                id: "Info",
                icon: <InfoIcon />,
                content: (
                  <List>
                    <DataPair title="نام" value={data.name} />
                    <DataPair
                      title="تاریخ ثبت"
                      value={<FormatDate value={data.createdAt} />}
                    />
                    <DataPair
                      title="یوزر"
                      value={
                        data.user ? (
                          <InlineLink href={adminPath(`/user/${data.user._id}`)}>
                            {data.user.phone}
                          </InlineLink>
                        ) : (
                          "حذف شده"
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
                      تغییر وضعیت
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
                      تخصیص پاراکلینیک
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
