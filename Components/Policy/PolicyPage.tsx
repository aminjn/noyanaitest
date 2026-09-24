"use client";
import { IPrivacySection } from "../Admin/PrivacySection/AdminManagePrivacySectionsPage";
import StickyNav from "../Clinic/StickyNav";
import { ContentKey } from "../Enums/contentKeys";
import useScopedLocale from "../Hooks/useScopedLocale";
import { ContentNamespace } from "../Enums/contentNamespaces";
import {
  t5xlExtraBold,
  tbaseRegular,
  tlgRegular,
  txlBold,
} from "../UI/Typography";
import classes from "./PolicyPage.module.css";
import BreadCrump from "../UI/BreadCrump";

const NS: ContentNamespace[] = ["common", "policyPage"];

export type PolicyPageProps = { data: IPrivacySection[] };

const PolicyPage = ({
  data,
  legend,
  title,
  path,
}: PolicyPageProps & {
  title: ContentKey;
  legend: ContentKey;
  path: string;
}) => {
  const getContent = useScopedLocale(NS);

  return (
    <div className={classes.main}>
      <BreadCrump
        trail={[
          { title: "صفحه اصلی", target: "/" },
          { title: getContent(title), target: path },
        ]}
      />
      <div className={classes.header}>
        <h1 className={`${classes.title} ${t5xlExtraBold}`}>
          {getContent(title)}
        </h1>
        <legend className={`${classes.legend} ${tlgRegular}`}>
          {getContent(legend)}
        </legend>
      </div>
      <StickyNav
        map={data.map((section) => ({
          target: section._id,
          absTitle: section.title || "",
        }))}
      />
      <div className={classes.content}>
        {data.map((section) => (
          <div key={section._id} className={classes.section} id={section._id}>
            <h2 className={`${classes.sectionTitle} ${txlBold}`}>
              {section.title}
            </h2>
            <p className={`${classes.sectionContent} ${tbaseRegular}`}>
              {section.content}
            </p>
          </div>
        ))}
      </div>
    </div>
  );
};

export default PolicyPage;
