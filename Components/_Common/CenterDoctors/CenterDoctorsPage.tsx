"use client";

import { useState } from "react";
import classes from "./CenterDoctorsPage.module.css";
import HandleLoading from "@/Components/Admin/UI/HandleLoading";
import useBreadCrump from "@/Components/Hooks/useBreadCrump";
import useScopedLocale from "@/Components/Hooks/useScopedLocale";
import { ContentNamespace } from "@/Components/Enums/contentNamespaces";
import InitialAvatar from "@/Components/UI/InitialAvatar";
import Link from "@/Components/i18n/Link";
import useCenterDoctors, { CenterKind, doctorName, doctorSpec } from "./useCenterDoctors";
import CenterJoinInbox from "./CenterJoinInbox";
import InviteDoctorPopup from "./InviteDoctorPopup";
import usePopup from "@/Components/Hooks/usePopup";

const NS: ContentNamespace[] = ["common", "centerDoctors"];

// The center's doctors on one page: who asked to join (answer inline),
// who's been invited, and the current members.
const CenterDoctorsPage = ({ kind, panel }: { kind: CenterKind; panel: string }) => {
  const getContent = useScopedLocale(NS);
  const { data, error, busy, members, incoming, outgoing, answer, remove, refresh } = useCenterDoctors(kind);
  const { setPopup } = usePopup();
  const [asking, setAsking] = useState<string | null>(null);
  useBreadCrump([
    { title: getContent("dashboard"), target: `/${panel}` },
    { title: getContent("doctors"), target: `/${panel}/doctor` },
  ]);

  return (
    <HandleLoading data={!!data} error={error}>
      {!!data && (
        <div className={classes.main}>
          <div className={classes.headRow}>
            <h1 className={classes.title}>{getContent("doctors")}</h1>
            <button
              type="button"
              className={classes.primary}
              onClick={() =>
                setPopup("CenterInviteDoctor", <InviteDoctorPopup kind={kind} onDone={() => refresh()} />)
              }
            >
              {getContent("cdInvite")}
            </button>
          </div>

          {!!incoming.length && (
            <section className={classes.section}>
              <h2 className={classes.h2}>
                {getContent("cdPendingTitle")} <span className={classes.count}>{incoming.length}</span>
              </h2>
              <CenterJoinInbox requests={incoming} busy={busy} answer={answer} />
            </section>
          )}

          <section className={classes.section}>
            <h2 className={classes.h2}>{getContent("cdMembers")}</h2>
            {!members.length && !outgoing.length ? (
              <p className={classes.empty}>{getContent("cdEmpty")}</p>
            ) : (
              <ul className={classes.grid}>
                {members.map((m) => (
                  <li key={m._id} className={classes.card}>
                    <InitialAvatar name={doctorName(m.doctor)} seed={m.doctor?._id || m._id} size="2.75rem" />
                    <div className={classes.meta}>
                      {m.doctor?.slug ? (
                        <Link href={`/dr/${m.doctor.slug}`} target="_blank">
                          <strong>{doctorName(m.doctor)}</strong>
                        </Link>
                      ) : (
                        <strong>{doctorName(m.doctor)}</strong>
                      )}
                      <span>{doctorSpec(m.doctor)}</span>
                    </div>
                    {asking === m._id ? (
                      <div className={classes.ask}>
                        <span>{getContent("cdRemoveAsk")}</span>
                        <div>
                          <button
                            type="button"
                            className={classes.danger}
                            disabled={busy === m._id}
                            onClick={() => remove(m._id).then(() => setAsking(null))}
                          >
                            {getContent("cdRemove")}
                          </button>
                          <button type="button" className={classes.ghost} onClick={() => setAsking(null)}>
                            {getContent("cancel")}
                          </button>
                        </div>
                      </div>
                    ) : (
                      <button type="button" className={classes.ghost} onClick={() => setAsking(m._id)}>
                        {getContent("cdRemove")}
                      </button>
                    )}
                  </li>
                ))}
                {outgoing.map((r) => (
                  <li key={r._id} className={`${classes.card} ${classes.pending}`}>
                    <InitialAvatar name={doctorName(r.doctor)} seed={r.doctor?._id || r._id} size="2.75rem" />
                    <div className={classes.meta}>
                      <strong>{doctorName(r.doctor)}</strong>
                      <span>{getContent("cdInvited")}</span>
                    </div>
                  </li>
                ))}
              </ul>
            )}
          </section>
        </div>
      )}
    </HandleLoading>
  );
};

export default CenterDoctorsPage;
