"use client";
import { useParams } from "next/navigation";
import classes from "./AdminManageUserPage.module.css";
import useSWR from "swr";
import { IUser } from "@/Components/Hooks/useUser";
import { API } from "@/Components/config";
import { fetcher } from "@/Components/helpers/fetcher";
import HandleLoading from "../UI/HandleLoading";
import TabSystem from "../UI/TabSystem";
import WithTitle from "../UI/WithTitle";
import List from "../UI/List";
import DataPair from "../UI/DataPair";
import InfoIcon from "@/Components/Icons/InfoIcon";

const AdminManageUserPage = () => {
  const params = useParams<{ nodeId: string }>();
  const { data, error } = useSWR<IUser>(
    params ? `${API}/auto/user/${params.nodeId}` : null,
    (url: string) => fetcher({ url }).then((res) => res.data.data)
  );

  return (
    <HandleLoading data={!!data} error={error}>
      {!!data && (
        <WithTitle title={data.phone}>
          <TabSystem
            name="AdminManageUser"
            items={[
              {
                content: (
                  <List>
                    <DataPair title="موبایل" value={data.phone} />
                  </List>
                ),
                id: "Info",
                icon: <InfoIcon />,
                title: "جزئیات",
              },
            ]}
          />
        </WithTitle>
      )}
    </HandleLoading>
  );
};

export default AdminManageUserPage;
