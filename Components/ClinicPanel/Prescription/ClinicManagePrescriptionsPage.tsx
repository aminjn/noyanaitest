"use client";

import { Fragment, useCallback, useState } from "react";
import classes from "./ClinicManagePrescriptionsPage.module.css";
import useSWR from "swr";
import { API } from "@/Components/config";
import { fetcher } from "@/Components/helpers/fetcher";
import Button from "@/Components/UI/Button";
import Act from "@/Components/UI/Act";
import CreateForm from "@/Components/Admin/UI/CreateForm";
import Input from "@/Components/UI/Input";
import useLocale from "@/Components/Hooks/useLocale";
import Form from "@/Components/UI/Form";
import FormActions from "@/Components/Admin/UI/FormActions";
import useNotification from "@/Components/Hooks/useNotification";
import PrescriptionsList from "./PrescriptionsList";

type RequestPrescriptionsInput = {
  nationalCode: string;
  trackingCode: string;
};

const ClinicManagePrescriptionsPage = () => {
  const { data } = useSWR<Date>(`${API}/clinic/tamin/token`, (url: string) =>
    fetcher({ url }).then((res) => res.data),
  );

  const [input, setInput] = useState<Partial<RequestPrescriptionsInput>>({});

  const [payload, setPayload] = useState<RequestPrescriptionsInput | null>(
    null,
  );

  const pushNotification = useNotification();

  const getContent = useLocale();

  const onSubmit = useCallback(() => {
    if (!!payload) return;
    if (!input.trackingCode || !input.nationalCode)
      return pushNotification(getContent("checkInput"), "Warn");
    setPayload({ ...(input as RequestPrescriptionsInput) });
  }, [getContent, input, payload, pushNotification]);

  const [isGettingToken, setIsGettinngToken] = useState<boolean>(false);

  return (
    <Fragment>
      <Button
        isLoading={isGettingToken}
        onClick={() => setIsGettinngToken(true)}
      >
        {data
          ? new Date(data).toLocaleString("fa-IR", {
              month: "long",
              year: "numeric",
              day: "numeric",
              minute: "numeric",
              second: "numeric",
              hour: "numeric",
            })
          : "Get Token"}
      </Button>
      <Form onSubmit={onSubmit}>
        <Input
          title={getContent("patientNationalCode")}
          onChange={(e) =>
            setInput((prev) => ({ ...prev, nationalCode: e.target.value }))
          }
          readOnly={!!payload}
          inputMode="numeric"
          pattern="[0-9]*"
        />
        <Input
          title={getContent("trackingCode")}
          onChange={(e) =>
            setInput((prev) => ({ ...prev, trackingCode: e.target.value }))
          }
          pattern="[0-9]*"
          inputMode="numeric"
        />
        <FormActions>
          <Button type="submit">{getContent("submit")}</Button>
        </FormActions>
      </Form>
      {!!payload && <PrescriptionsList {...payload} />}
      <Act<{ data: { challenge: string } }>
        path={isGettingToken ? `${API}/clinic/tamin` : null}
        method="GET"
        onDone={(status, result) => {
          setIsGettinngToken(false);
          if (!status || !result) return;
          console.log(result);
          window.location.href = `${process.env.TAMIN_DOMAIN}/auth/server/authorize?redirect_uri=${process.env.DOMAIN}/clinicpanel/tamin&code_challenge=${result.data.challenge}&client_id=portal-js&response_type=code&code_challenge_method=S256`;
        }}
      />
    </Fragment>
  );
};

export default ClinicManagePrescriptionsPage;
