import { Fragment, useContext } from "react";
import classes from "./PatientRenderer.module.css";
import PrescriptionContext from "../PrescriptionContext";
import Ixon from "@/Components/UI/Ixon";
import UserIcon from "@/Components/Icons/UserIcon";
import useLocale from "@/Components/Hooks/useLocale";
import useComplexLocale from "@/Components/Hooks/useComplexLocale";
import { calculateAge } from "@/Components/helpers/lib";
import { WithStyleProps } from "@/Components/Layout/Layout";
import Button from "@/Components/UI/Button";

const PatientRenderer = ({ className = "", style }: WithStyleProps) => {
  const { patient } = useContext(PrescriptionContext);

  const getContent = useLocale();

  const getCompContent = useComplexLocale();

  if (!patient)
    return (
      <div className={`${classes.empty} ${className}`} style={style}>
        <Ixon width="2.5rem" className={classes.emptyIcon}>
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
        <Button style={{ marginInlineEnd: "auto" }} variant="Primary3">
          {getContent("patientDetails")}
        </Button>
        <span
          className={classes.alt}
          style={{ marginInlineEnd: "1rem" }}
        >{`${getContent("insuranceType")} :`}</span>
        <span className={classes.tamin}>تامین اجتماعی</span>
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
