import { Fragment, useContext } from "react";
import classes from "./PatientRenderer.module.css";
import PrescriptionContext from "../PrescriptionContext";
import Ixon from "@/Components/UI/Ixon";
import UserIcon from "@/Components/Icons/UserIcon";
import useScopedLocale from "@/Components/Hooks/useScopedLocale";
import { ContentNamespace } from "@/Components/Enums/contentNamespaces";
import { calculateAge } from "@/Components/helpers/lib";
import { WithStyleProps } from "@/Components/Layout/Layout";
import Button from "@/Components/UI/Button";
import PatientPrivilege from "./PatientPrivilege";

const LOCALE_NS: ContentNamespace[] = ["common", "doctorPanelPrescriptionEditor"];

const PatientRenderer = ({ className = "", style }: WithStyleProps) => {
  const { patient } = useContext(PrescriptionContext);

  const getContent = useScopedLocale(LOCALE_NS);

  const getCompContent = useScopedLocale(LOCALE_NS);

  if (!patient)
    return (
      <div className={`${classes.empty} ${className}`} style={style}>
        <Ixon width="2.5rem" className={`${classes.emptyIcon} glassIcon`}>
          <UserIcon />
        </Ixon>
        <legend className={classes.emptyLegend}>
          {getContent("noUserSelectedLegend")}
        </legend>
      </div>
    );
  return (
    <div className={`${classes.main} ${className}`} style={style}>
      <div className={classes.part}>
        <span
          className={classes.name}
          style={{ marginInlineEnd: "1rem" }}
        >{`${patient.givenName} ${patient.lastName}`}</span>
        <span className={classes.alt} style={{ marginInlineEnd: ".75rem" }}>
          {getContent(patient.gender)}
        </span>
        <span className={classes.alt} style={{ marginInlineEnd: ".75rem" }}>
          |
        </span>
        <span className={classes.alt} style={{ marginInlineEnd: "1.5rem" }}>
          {getCompContent("xYearsOld", [
            calculateAge(patient.dateOfbirth).toString(),
          ])}
        </span>
        <Button style={{ marginInlineEnd: "auto" }}>
          {getContent("patientDetails")}
        </Button>
        <span
          className={classes.alt}
          style={{ marginInlineEnd: "1rem" }}
        >{`${getContent("insuranceType")} :`}</span>
        <PatientPrivilege />
      </div>
      <div className={classes.part}>
        <span
          className={classes.sub}
          style={{ marginInlineEnd: "1rem" }}
        >{`${getContent("nationalCode")} :`}</span>
        <span className={classes.sub} style={{ marginInlineEnd: "1.5rem" }}>
          {patient.nationalId}
        </span>
        {patient.phone && (
          <Fragment>
            <span
              className={classes.sub}
              style={{ marginInlineEnd: "1rem" }}
            >{`${getContent("moblieNumber")} :`}</span>
            <span className={classes.sub}>{patient.phone}</span>
          </Fragment>
        )}
      </div>
    </div>
  );
};

export default PatientRenderer;
