"use client";
import Image from "next/image";
import { IDrug } from "../Admin/Disease/AdminManageDiseasesPage";
import classes from "./DrugPage.module.css";
import { imagePath } from "../helpers/imagepath";
import { TitleTextSection } from "../Symptom/SymptomPage";

export type DrugPageProps = { data: IDrug };
const DrugPage = ({ data }: DrugPageProps) => {
  return (
    <div className={classes.main}>
      <div className={classes.header}>
        <h1 className={classes.title}>{data.name}</h1>
        <div className={classes.image}>
          <Image
            alt={data.name || ""}
            src={imagePath(data.image)}
            style={{ objectFit: "cover" }}
            fill
            sizes="40rem"
          />
        </div>
      </div>
      <div className={classes.content}>
        <TitleTextSection title="summary" value={data.summary} />
        <TitleTextSection title="description" value={data.description} />
        <TitleTextSection title="sideEffects" value={data.sideEffects} />
        <TitleTextSection
          title="activeIngridients"
          value={data.activeIngridient}
        />
        <TitleTextSection
          title="adminstrationRoute"
          value={data.adminstrationRoute}
        />
        <TitleTextSection title="alcoholWarning" value={data.alcoholWarning} />
        <TitleTextSection title="alternateName" value={data.alternateName} />
        <TitleTextSection
          title="breastfeedingWarning"
          value={data.breastfeedingWarning}
        />
        <TitleTextSection
          title="clinicalPharmacology"
          value={data.clinicalPharmacology}
        />
        <TitleTextSection title="dosageForm" value={data.dosageForm} />
        <TitleTextSection title="drugUnit" value={data.drugUnit} />
        <TitleTextSection title="foodWarning" value={data.foodWarning} />
        <TitleTextSection title="identifier" value={data.identifier} />
        <TitleTextSection title="overdosage" value={data.overdosage} />
        <TitleTextSection
          title="pregnancyWarning"
          value={data.pregnancyWarning}
        />
        <TitleTextSection
          title="prescribingInfo"
          value={data.prescribingInfo}
        />
        <TitleTextSection
          title="prescribingStatus"
          value={data.prescriptionStatus}
        />
        <TitleTextSection title="warning" value={data.warning} />
      </div>
    </div>
  );
};

export default DrugPage;
