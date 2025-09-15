"use client";

import { IBecomeClinicRequest } from "@/Components/ClinicPanel/BecomeClinicPage";
import { API } from "@/Components/config";
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
import ChangeBecomeClinicRequestPopup from "./ChangeBecomeClinicRequestStatusPopup";
import AssignClinicToClinicRequestPopup from "./AssignClinicToClinicRequestPopup";

const AdminManageBecomeClinicPage = () => {
  const { nodeId } = useParams();
  const { data, error, mutate } = useSWR<IBecomeClinicRequest<{ user: true }>>(
    `${API}/auto/becomeclinic/${nodeId}`,
    (url: string) => fetcher({ url }).then((res) => res.data.data)
  );

  const { setPopup } = usePopup();

  return (
    <HandleLoading data={!!data} error={error}>
      {!!data && (
        <WithTitle title="درخواست تبدیل به کلینیک">
          <TabSystem
            name="AdminManageBecomeClinic"
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
                        <InlineLink href={adminPath(`/user/${data.user._id}`)}>
                          {data.user.phone}
                        </InlineLink>
                      }
                    />
                    <DataPair
                      title="وضعیت"
                      value={becomeNodeStatusesDict[data.status]}
                    />
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
                          "ChangeBecomeClinicRequest",
                          <ChangeBecomeClinicRequestPopup
                            node={data}
                            mutate={mutate}
                          />
                        )
                      }
                    >
                      تغییر وضعیت
                    </Button>
                    <Button
                      onClick={() =>
                        setPopup(
                          "AssignClinicToClinicRequest",
                          <AssignClinicToClinicRequestPopup
                            node={data}
                            mutate={mutate}
                          />
                        )
                      }
                    >
                      تخصیص کلینیک
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
