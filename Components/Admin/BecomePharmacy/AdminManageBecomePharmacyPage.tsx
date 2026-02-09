"use client";

import { API } from "@/Components/config";
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

  return (
    <HandleLoading data={!!data} error={error}>
      {!!data && (
        <WithTitle title="درخواست داروخانه شذن">
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
                      title
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
                  </List>
                ),
              },
              {
                title: "عملیات",
                id: "actions",
                icon: <InfoIcon />,
                content: (
                  <List>
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
