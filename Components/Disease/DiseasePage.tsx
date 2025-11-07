"use client";
import Image from "next/image";
import { IDisease } from "../Admin/Disease/AdminManageDiseasesPage";
import useLocale from "../Hooks/useLocale";
import classes from "./DiseasePage.module.css";
import { imagePath } from "../helpers/imagepath";
import { TitleTextSection } from "../Symptom/SymptomPage";
import SymptomCard from "../Symptom/SymptomCard";
import { ReactNode } from "react";
import { ContentKey } from "../Enums/contentKeys";
import SpecialityCard from "../Speciality/SpecialityCard";
import DrugCard from "../Drug/DrugCard";

export type DiseasePageProps = {
  data: IDisease<{
    Speciality: Record<never, never>;
    Symptom: Record<never, never>;
    Drugs: Record<never, never>;
  }>;
};

const NodeList = ({
  children,
  length,
  title,
}: {
  children?: ReactNode;
  length: number;
  title: ContentKey;
}) => {
  const getContent = useLocale();

  if (!length) return null;
  return (
    <section className={classes.listBox}>
      <legend className={classes.listTitle}>{getContent(title)}</legend>
      <ul className={classes.list}>{children}</ul>
    </section>
  );
};

const DiseasePage = ({ data }: DiseasePageProps) => {
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
            sizes="20rem"
          />
        </div>
      </div>
      <div className={classes.content}>
        <TitleTextSection title="summary" value={data.summary} />
        <TitleTextSection title="description" value={data.description} />
        <TitleTextSection
          title="expectedPrognosis"
          value={data.expectedPrognosis}
        />
        <TitleTextSection
          title="naturalProgeression"
          value={data.naturalProgression}
        />
        <TitleTextSection
          title="pathophysiology"
          value={data.pathophysiology}
        />
        <TitleTextSection
          title="possibleComplications"
          value={data.possibleComplication}
        />
        <NodeList length={data.symptoms.length} title="diseaseSymptoms">
          {data.symptoms.map((node) => (
            <SymptomCard node={node} key={node._id} />
          ))}
        </NodeList>
        <NodeList title="diseaseSpecilaities" length={data.specialities.length}>
          {data.specialities.map((node) => (
            <SpecialityCard key={node._id} node={node} />
          ))}
        </NodeList>
        <NodeList title="diseaseDrugs" length={data.drugs.length}>
          {data.drugs.map((node) => (
            <DrugCard key={node._id} node={node} />
          ))}
        </NodeList>
      </div>
    </div>
  );
};

export default DiseasePage;
