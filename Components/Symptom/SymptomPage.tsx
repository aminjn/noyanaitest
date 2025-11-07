"use client";
import Image from "next/image";
import { ISymptom } from "../Admin/Disease/AdminManageDiseasesPage";
import { ContentKey } from "../Enums/contentKeys";
import useLocale from "../Hooks/useLocale";
import classes from "./SymptomPage.module.css";
import { imagePath } from "../helpers/imagepath";

export type SymptomPageProps = { data: ISymptom };

export const TitleTextSection = ({
  title,
  value,
}: {
  title: ContentKey;
  value?: string;
}) => {
  const getContent = useLocale();

  if (!value) return null;
  return (
    <section className={classes.section}>
      <h2 className={classes.h2}>{getContent(title)}</h2>
      <p className={classes.text}>{value}</p>
    </section>
  );
};

const SymptomPage = ({ data }: SymptomPageProps) => {
  return (
    <div className={classes.main}>
      <div className={classes.header}>
        <h1 className={classes.title}>{data.name}</h1>
        <div className={classes.image}>
          <Image
            alt={data.name || ""}
            src={imagePath(data.image)}
            fill
            style={{ objectFit: "cover" }}
            sizes="30rem"
          />
        </div>
      </div>
      <div className={classes.content}>
        <TitleTextSection title="summary" value={data.summary} />
        <TitleTextSection title="description" value={data.summary} />
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
      </div>
    </div>
  );
};

export default SymptomPage;
