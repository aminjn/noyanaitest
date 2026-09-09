"use client";

import { IBecomeHospitalRequest } from "@/Components/HospitalPanel/BecomeHospitalPage";
import { API, FilePath } from "@/Components/config";
import { fetcher } from "@/Components/helpers/fetcher";
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
import ChangeBecomeHospitalRequestPopup from "./ChangeBecomeHospitalRequestStatusPopup";
import AssignHospitalToHospitalRequestPopup from "./AssignHospitalToHospitalRequestPopup";

const AdminManageBecomeHospitalPage = () => {
  const { nodeId } = useParams();
  const { data, error, mutate } = useSWR<IBecomeHospitalRequest<{ user: true }>>(
    `${API}/auto/becomehospital/${nodeId}`,
    (url: string) => fetcher({ url }).then((res) => res.data.data),
  );

  const { setPopup } = usePopup();

  return (
    <HandleLoading data={!!data} error={error}>
      {!!data && (
        <WithTitle title="درخواست تبدیل به بیمارستان">
          <TabSystem
            name="AdminManageBecomeHospital"
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
                        <InlineLink href={adminPath(`/user/${data.user?._id}`)}>
                          {data.user?.phone}
                        </InlineLink>
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
                          "ChangeBecomeHospitalRequest",
                          <ChangeBecomeHospitalRequestPopup
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
                          "AssignHospitalToHospitalRequest",
                          <AssignHospitalToHospitalRequestPopup
                            node={data}
                            mutate={mutate}
                          />,
                        )
                      }
                    >
                      تخصیص بیمارستان
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

export default AdminManageBecomeHospitalPage;
