"use client";

import useSWR from "swr";
import { IBecomeInsuranceRequest } from "../Layout/InsurancePanelLayout";
import { API } from "../config";
import { fetcher } from "../helpers/fetcher";
import HandleLoading from "../Admin/UI/HandleLoading";
import { Fragment } from "react";
import SubmitBecomeInsuranceRequest from "./SubmitBecomeInsuranceRequest";
import useScopedLocale from "../Hooks/useScopedLocale";

const BecomeInsurancePage = () => {
  const getContent = useScopedLocale();
  const { data, error, isLoading, mutate } =
    useSWR<IBecomeInsuranceRequest | null>(
      `${API}/insurance/request`,
      (url: string) => fetcher({ url }).then((res) => res.data)
    );

  return (
    <HandleLoading data={!isLoading} error={error}>
      {data ? (
        <Fragment>
          {data.status === "Pending" ? (
            <p>{getContent("insuranceRequestProcessingByAdmin")}</p>
          ) : (
            <Fragment>
              {data.status === "Approved" ? (
                <p>
                  {getContent("insuranceRequestApprovedBuildingProfile")}
                </p>
              ) : (
                <p>{getContent("yourRequestWasRejected")}</p>
              )}
            </Fragment>
          )}
        </Fragment>
      ) : (
        <SubmitBecomeInsuranceRequest mutate={mutate} />
      )}
    </HandleLoading>
  );
};

export default BecomeInsurancePage;
