import { useContext, useState } from "react";
import classes from "./PatientSelector.module.css";
import PrescriptionContext from "../PrescriptionContext";
import useScopedLocale from "@/Components/Hooks/useScopedLocale";
import { ContentNamespace } from "@/Components/Enums/contentNamespaces";
import Input from "@/Components/UI/Input";
import Button from "@/Components/UI/Button";
import { isSSID } from "@/Components/helpers/Validators";
import useNotification from "@/Components/Hooks/useNotification";
import Act from "@/Components/UI/Act";
import { API } from "@/Components/config";
import { IUserIdentity } from "@/Components/Dashboard/DashboardPage";
import CheckIcon from "@/Components/Icons/CheckIcon";
import { WithStyleProps } from "@/Components/Layout/Layout";
import Form from "@/Components/UI/Form";

const LOCALE_NS: ContentNamespace[] = ["common", "doctorPanelPrescriptionEditor"];
const PatientSelector = ({ className = "", style }: WithStyleProps) => {
  const { setPatient, canMutatePatient } = useContext(PrescriptionContext);
  const getContent = useScopedLocale(LOCALE_NS);

  const [isLoading, setIsLoading] = useState<{ nationalId: string } | null>(
    null,
  );

  const [input, setInput] = useState<Partial<{ nationalId: string }>>({});

  const pushNotification = useNotification();

  if (!canMutatePatient) return null;
  return (
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
        <Button isLoading={!!isLoading} type="submit" tailIcon={<CheckIcon />}>
          {getContent("inquiryPatient")}
        </Button>
        <Act<{ data: { identity: (IUserIdentity & { phone: string }) | null } }>
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
  );
};

export default PatientSelector;
