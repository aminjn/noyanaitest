"use client";
import { ReactNode } from "react";
import useLocale from "../Hooks/useLocale";
import ListPageHeader from "../UI/ListPage/ListPageHeader";
import ListPageLayout from "../UI/ListPage/ListPageLayout";
import ContactInfoBox from "./ContactInfoBox";
import classes from "./ContactPage.module.css";
import Ixon from "../UI/Ixon";
import CheckCircleIcon from "../Icons/CheckCircleIcon";
import ContactForm from "./ContactForm";
import { tbaseMedium } from "../UI/Typography";

const Feature = ({ children }: { children?: ReactNode }) => {
  return (
    <div className={classes.feature}>
      <Ixon width="1.5rem" className={classes.featureIcon}>
        <CheckCircleIcon />
      </Ixon>
      <span className={`${classes.featureValue} ${tbaseMedium}`}>
        {children}
      </span>
    </div>
  );
};

const ContactPage = () => {
  const getContent = useLocale();

  return (
    <ListPageLayout>
      <ListPageHeader
        title={getContent("contactPageTitle")}
        legend={getContent("contactPageLegend")}
      />
      <ContactInfoBox />
      <ListPageHeader
        title={getContent("submitContactRequestTitle")}
        legend={getContent("submitContactRequestLegend")}
      />
      <div className={classes.features}>
        <Feature>{getContent("contactFeature1")}</Feature>
        <Feature>{getContent("contactFeature2")}</Feature>
        <Feature>{getContent("contactFeature3")}</Feature>
      </div>
      <ContactForm />
    </ListPageLayout>
  );
};

export default ContactPage;
