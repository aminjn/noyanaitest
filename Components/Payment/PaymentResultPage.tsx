"use client";

import { useEffect, useState } from "react";
import classes from "./PaymentResultPage.module.css";
import { useParams, useSearchParams } from "next/navigation";
import Loading from "../Admin/UI/Loading";
import useSWR from "swr";
import { API } from "../config";
import { fetcher } from "../helpers/fetcher";
import SuccessPayment from "./SuccessPayment";
import FailPayment from "./FailPayment";

export const paymentStatuses = ["Fail", "Success"] as const;

export type PaymentStatus = (typeof paymentStatuses)[number];

const PaymentResultPage = () => {
  const [status, setStatus] = useState<PaymentStatus | null>(null);
  const searchParams = useSearchParams();

  useEffect(() => {
    if (!status) {
      setStatus(
        paymentStatuses.find((el) => el === searchParams.get("status")) ||
          "Fail"
      );
    }
  }, [searchParams, status]);

  if (!status) return <Loading />;
  if (status === "Success") return <SuccessPayment />;
  return <FailPayment />;
};

export default PaymentResultPage;
