"use client";
import useLocale from "@/Components/Hooks/useLocale";
import classes from "./PharmacyFillPrescriptionPage.module.css";
import Form from "@/Components/UI/Form";
import useForm from "@/Components/Hooks/useForm";
import { API } from "@/Components/config";
import Button from "@/Components/UI/Button";
import Input from "@/Components/UI/Input";
import { useState } from "react";
import PrescriptionList from "./PrescriptionList";
import useNotification from "@/Components/Hooks/useNotification";

export type IncomingTaminPharmacyResponse = {
  list: {
    headeprscid: number;
    prescdate: string;
    docid: string;
    docspec: string;
    doctorFullName: string;
    patientfirstname: string;
    patientlastname: string;
    custname: null;
    comments: null;
    refeR_REASON: null;
    electronicflag: string;
    clinicdoc: string;
    presctime: string;
    speccode: string;
    finalDetailsPresc: {
      detailId: number;
      drugCode: string;
      drugName: string;
      drugForm: string;
      insuranceStatus: "0" | "1";
      requiresBarcodeInquiry: "2";
      hospitalDrug: "0" | "1";
      maxAge: "";
      prescribedCount: string;
      remainingCount: string;
      drugInstruction: string;
    }[];
  }[];
  status: number; //200
};

const PharmacyFillPrescriptionPage = () => {
  const getContent = useLocale();

  const [data, setData] = useState<IncomingTaminPharmacyResponse | null>(null);

  const pushNotification = useNotification();

  const { setInput, submit, isLoading, input } = useForm<
    { tracking: string },
    { data: IncomingTaminPharmacyResponse }
  >({
    path: `${API}/pharmacy/prescription`,
    method: "POST",
    successCb: (res) => {
      if (res.data?.status !== 200)
        return pushNotification(getContent("unknownErrorOccured"));
      setData(res.data);
    },
  });

  if (!data)
    return (
      <div className={classes.main}>
        <div className={classes.title}>
          <h1>{getContent("fillingPrescription")}</h1>
        </div>
        <div className={classes.finder}>
          <legend>{getContent("fillPrescriptionLegend")}</legend>
          <Form onSubmit={submit}>
            <Input
              defaultValue={input.tracking}
              onChange={(e) =>
                setInput((prev) => ({ ...prev, tracking: e.target.value }))
              }
            />
            <Button isLoading={!!isLoading} type="submit">
              {getContent("searchForPrescription")}
            </Button>
          </Form>
        </div>
      </div>
    );

  return <PrescriptionList data={data} onCancel={() => setData(null)} />;
};

export default PharmacyFillPrescriptionPage;
