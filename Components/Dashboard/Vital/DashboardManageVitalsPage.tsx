"use client";

import useSWR from "swr";
import VitalList from "../VitalList";
import { IUserVital } from "@/Components/Hooks/useUser";
import { API } from "@/Components/config";
import { fetcher } from "@/Components/helpers/fetcher";
import HandleLoading from "@/Components/Admin/UI/HandleLoading";

const DashboardManageVitalsPage = () => {
  const { data, error } = useSWR<
    IUserVital<{ Author: Record<never, never> }>[]
  >(`${API}/user/vitals`, (url: string) =>
    fetcher({ url }).then((res) => res.data)
  );

  return (
    <HandleLoading data={!!data} error={error}>
      {!!data && <VitalList vitals={data} />}
    </HandleLoading>
  );
};

export default DashboardManageVitalsPage;
