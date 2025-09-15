"use client";

import useSWR from "swr";
import { IBecomeInsuranceRequest } from "../Layout/InsurancePanelLayout";
import { API } from "../config";
import { fetcher } from "../helpers/fetcher";
import HandleLoading from "../Admin/UI/HandleLoading";
import { Fragment } from "react";
import SubmitBecomeInsuranceRequest from "./SubmitBecomeInsuranceRequest";

const BecomeInsurancePage = () => {
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
            <p>در حال پردازش اطلاعات توسط ادمین</p>
          ) : (
            <Fragment>
              {data.status === "Approved" ? (
                <p>
                  درخواست شما تایید شده است در حال ساخت پروفایل برای شما هستیم
                </p>
              ) : (
                <p>درخواست شما رد شده است</p>
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
