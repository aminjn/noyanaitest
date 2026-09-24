import { Fragment, useContext, useState } from "react";
import classes from "./PatientPrivilege.module.css";
import PrescriptionContext from "../PrescriptionContext";
import Button from "@/Components/UI/Button";
import Act from "@/Components/UI/Act";
import { API } from "@/Components/config";
import useScopedLocale from "@/Components/Hooks/useScopedLocale";
import { ContentNamespace } from "@/Components/Enums/contentNamespaces";

const LOCALE_NS: ContentNamespace[] = ["common", "doctorPanelPrescriptionEditor"];

const PatientPrivilege = () => {
  const [isLoading, setIsLoading] = useState<boolean>(false);

  const { patient } = useContext(PrescriptionContext);

  const [hasDeserve, setHasDeserve] = useState<boolean | null>(null);

  const getContent = useScopedLocale(LOCALE_NS);

  if (!patient) return null;
  return (
    <Fragment>
      <Button
        onClick={() => setIsLoading(true)}
        // className={classes.tamin}
        isLoading={isLoading}
        variant={typeof hasDeserve === "boolean" ? "Success" : "Primary"}
      >
        {typeof hasDeserve === "boolean"
          ? hasDeserve
            ? getContent("hasTaminPrivilege")
            : getContent("noTaminPrivilege")
          : getContent("inquiryTaminPrivilege")}
      </Button>
      <Act<{ data: boolean }>
        path={isLoading ? `${API}/doctor/presc/privilege` : null}
        method="POST"
        onDone={(status, result) => {
          setIsLoading(false);
          if (!status || !result) return;
          setHasDeserve(result.data);
        }}
        payload={{ nationalCode: patient?.nationalId }}
      />
    </Fragment>
  );
};

export default PatientPrivilege;
