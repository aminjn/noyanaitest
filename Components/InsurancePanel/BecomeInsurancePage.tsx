"use client";

import useSWR from "swr";
import { IBecomeInsuranceRequest } from "../Layout/InsurancePanelLayout";
import { API } from "../config";
import { fetcher } from "../helpers/fetcher";
import BecomeRequestStatus from "@/Components/_Common/BecomeStatus/BecomeRequestStatus";
import HandleLoading from "../Admin/UI/HandleLoading";
import SubmitBecomeInsuranceRequest from "./SubmitBecomeInsuranceRequest";

const BecomeInsurancePage = () => {
  const { data, error, isLoading, mutate } =
    useSWR<IBecomeInsuranceRequest | null>(
      `${API}/insurance/request`,
      (url: string) => fetcher({ url }).then((res) => res.data)
    );

  return (
    <HandleLoading data={!isLoading} error={error}>
      <BecomeRequestStatus
        request={data}
        form={
            <SubmitBecomeInsuranceRequest mutate={mutate} />
        }
      />
    </HandleLoading>
  );
};

export default BecomeInsurancePage;
