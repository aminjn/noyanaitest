"use client";

import classes from "./OfflinePage.module.css";
import useScopedLocale from "../Hooks/useScopedLocale";
import { ContentNamespace } from "../Enums/contentNamespaces";
import Button from "../UI/Button";
import RetryIcon from "../Icons/RetryIcon";

const LOCALE_NS: ContentNamespace[] = ["common"];

const OfflinePage = () => {
  const getContent = useScopedLocale(LOCALE_NS);
  return (
    <section className={classes.main}>
      <div className={classes.card}>
        <svg className={classes.art} viewBox="0 0 120 96" fill="none" aria-hidden="true">
          <path
            d="M14 40a66 66 0 0 1 92 0M28 54a46 46 0 0 1 64 0M42 68a26 26 0 0 1 36 0"
            stroke="currentColor"
            strokeWidth="7"
            strokeLinecap="round"
          />
          <circle cx="60" cy="82" r="6" fill="currentColor" />
          <path d="M22 14l76 76" stroke="var(--error)" strokeWidth="7" strokeLinecap="round" />
        </svg>
        <h1 className={classes.title}>{getContent("offlineTitle")}</h1>
        <p className={classes.text}>{getContent("offlineText")}</p>
        <Button
          variant="Primary"
          mode="Fill"
          radius="High"
          size="L"
          leadIcon={<RetryIcon />}
          onClick={() => window.location.reload()}
        >
          {getContent("offlineRetry")}
        </Button>
      </div>
    </section>
  );
};

export default OfflinePage;
