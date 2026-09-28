"use client";

import classes from "./CenterDoctorsPage.module.css";
import useScopedLocale from "@/Components/Hooks/useScopedLocale";
import { ContentNamespace } from "@/Components/Enums/contentNamespaces";
import useCenterDoctors, { CenterKind } from "./useCenterDoctors";
import CenterJoinInbox from "./CenterJoinInbox";

const NS: ContentNamespace[] = ["common", "centerDoctors"];

// "Waiting for you" block for the clinic / hospital home page
const CenterHomeInbox = ({ kind }: { kind: CenterKind }) => {
  const getContent = useScopedLocale(NS);
  const { data, busy, incoming, answer } = useCenterDoctors(kind);
  if (!data) return null;
  return (
    <section className={classes.section}>
      <h2 className={classes.h2}>
        {getContent("cdTodo")}
        {!!incoming.length && <span className={classes.count}>{incoming.length}</span>}
      </h2>
      {incoming.length ? (
        <CenterJoinInbox requests={incoming} busy={busy} answer={answer} />
      ) : (
        <p className={classes.empty}>{getContent("cdAllDone")}</p>
      )}
    </section>
  );
};

export default CenterHomeInbox;
