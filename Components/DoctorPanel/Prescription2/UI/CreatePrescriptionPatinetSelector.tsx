import classes from "./CreatePrescriptionPatinetSelector.module.css";
import useLocale from "@/Components/Hooks/useLocale";
import usePrescription from "../Store/usePrescription";
import { useState } from "react";
import useNotification from "@/Components/Hooks/useNotification";
import { WithStyleProps } from "@/Components/Layout/Layout";
import Form from "@/Components/UI/Form";
import { isSSID } from "@/Components/helpers/Validators";
import Input from "@/Components/UI/Input";
import Button from "@/Components/UI/Button";
import CheckIcon from "@/Components/Icons/CheckIcon";
import Act from "@/Components/UI/Act";
import { IUserIdentity } from "@/Components/Dashboard/DashboardPage";
import { API } from "@/Components/config";
import VisitPrescription from "./VisitPrescription";
import ReferralPrescription from "./ReferralPrescription";

const CreatePrescriptionPatinetSelector = ({
  className = "",
  style,
}: WithStyleProps) => {
  const { setPatient, readOnly, defaultValue, patient } = usePrescription();
  const getContent = useLocale();

  const [isLoading, setIsLoading] = useState<{ nationalId: string } | null>(
    null,
  );

  const [input, setInput] = useState<Partial<{ nationalId: string }>>({});

  const pushNotification = useNotification();

  if (readOnly || !!defaultValue) return;
  return (
    <div className={classes.container}>
      <div className={`${classes.main} ${className}`} style={style}>
        <legend className={classes.legend}>
          {getContent("selectPatientLegend")}
        </legend>
        <Form
          className={classes.bot}
          onSubmit={() => {
            if (!!isLoading) return;
            if (!isSSID(input.nationalId))
              return pushNotification(
                getContent("badNationalIdErrorMessage"),
                "Warn",
              );
            setIsLoading({ nationalId: input.nationalId! });
          }}
        >
          <Input
            title={getContent("patientNationalId")}
            onChange={(e) => {
              if (
                isNaN(Number(e.target.value)) ||
                e.target.value.includes(" ") ||
                e.target.value.includes("-") ||
                e.target.value.includes(".")
              ) {
                e.target.value = e.target.getAttribute("prev") || "";
                return;
              } else {
                e.target.setAttribute("prev", e.target.value);
                setInput((prev) => ({ ...prev, nationalId: e.target.value }));
                return;
              }
            }}
            pattern="[0-9]*"
            inputMode="numeric"
            className={classes.input}
          />
          <Button
            isLoading={!!isLoading}
            type="submit"
            tailIcon={<CheckIcon />}
          >
            {getContent("inquiryPatient")}
          </Button>
          <Act<{
            data: { identity: (IUserIdentity & { phone: string }) | null };
          }>
            path={isLoading ? `${API}/doctor/presc/patient` : null}
            method="POST"
            onDone={(status, result) => {
              setIsLoading(null);
              if (!status || !result) return;
              if (!result.data.identity)
                return pushNotification(
                  getContent("patientNotFoundErrorMessage"),
                  "Error",
                );
              setPatient(result.data.identity);
            }}
            payload={isLoading || undefined}
          />
        </Form>
      </div>
      {patient && (
        <div className={classes.extras}>
          <VisitPrescription />
          <ReferralPrescription />
        </div>
      )}
    </div>
  );
};

export default CreatePrescriptionPatinetSelector;
