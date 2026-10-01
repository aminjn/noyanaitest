"use client";

import useSWR from "swr";
import { useParams } from "next/navigation";
import classes from "./DashboardManageAddressPage.module.css";
import { IUserAddress } from "./DashboardManageAddressesPage";
import AddressForm from "./AddressForm";
import { API } from "@/Components/config";
import { fetcher } from "@/Components/helpers/fetcher";
import HandleLoading from "@/Components/Admin/UI/HandleLoading";

const DashboardManageAddressPage = () => {
  const { nodeId } = useParams<{ nodeId: string }>();
  const { data, error, mutate } = useSWR<IUserAddress>(
    nodeId ? `${API}/user/address/${nodeId}` : null,
    (url: string) => fetcher({ url }).then((res) => res.data),
  );


  return (
    <div className={classes.main}>
      <HandleLoading data={!!data} error={error}>
        {!!data && <AddressForm address={data} onSaved={() => mutate()} />}
      </HandleLoading>
    </div>
  );
};

export default DashboardManageAddressPage;
