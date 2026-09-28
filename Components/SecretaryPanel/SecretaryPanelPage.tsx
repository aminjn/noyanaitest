"use client";

import useSWR from "swr";
import { useState } from "react";
import classes from "./SecretaryPanelPage.module.css";
import useBreadCrump from "@/Components/Hooks/useBreadCrump";
import useScopedLocale from "@/Components/Hooks/useScopedLocale";
import useNotification from "@/Components/Hooks/useNotification";
import useProgress from "@/Components/Hooks/useProgress";
import { ContentNamespace } from "@/Components/Enums/contentNamespaces";
import { ContentKey } from "@/Components/Enums/contentKeys";
import { API } from "@/Components/config";
import { fetcher } from "@/Components/helpers/fetcher";
import HandleLoading from "@/Components/Admin/UI/HandleLoading";
import InitialAvatar from "@/Components/UI/InitialAvatar";
import { NodeWithAcl } from "@/Components/_Common/SecretaryManager/Request/CreateSecretaryRequestPopup";
import { nameToPanelPath } from "./MountBossPopup";

const NS: ContentNamespace[] = ["common", "secretaryPanelHome"];

// GET /secretary/overview - every workplace and pending invite, all org
// types together
type Overview = {
  phone: string;
  workplaces: { _id: string; kind: NodeWithAcl; label: string; displayName: string; role: string }[];
  invites: { _id: string; kind: NodeWithAcl; label: string; displayName: string; message: string }[];
};

const kindKey: Record<NodeWithAcl, ContentKey> = {
  doctor: "doctor",
  clinic: "clinic",
  pharmacy: "pharmacy",
  insurance: "insurance",
  paraClinic: "paraClinic",
  hospital: "hospital",
};

// Secretary home: answer invites and open a workplace from one screen
// (before: six per-type pages, each with a separate requests tab)
const SecretaryPanelPage = () => {
  const getContent = useScopedLocale(NS);
  const pushNotification = useNotification();
  const push = useProgress();
  const [busy, setBusy] = useState<string | null>(null);
  useBreadCrump([{ title: getContent("dashboard"), target: "/secretarypanel" }]);

  const { data, error, mutate } = useSWR<Overview>(`${API}/secretary/overview`, (url: string) =>
    fetcher({ url }).then((res) => res.data),
  );
  const invites = Array.isArray(data?.invites) ? data.invites : [];
  const workplaces = Array.isArray(data?.workplaces) ? data.workplaces : [];

  const run = async (id: string, fn: () => Promise<unknown>, after?: () => void) => {
    setBusy(id);
    try {
      await fn();
      after?.();
    } catch (e) {
      pushNotification(e instanceof Error ? e.message : String(e), "Error");
    } finally {
      setBusy(null);
    }
  };

  const answer = (inv: Overview["invites"][number], status: "Approved" | "Rejected") =>
    run(
      inv._id,
      () => fetcher({ url: `${API}/secretary/request/${inv.kind}/${inv._id}`, method: "POST", payload: { status } }),
      () => mutate(),
    );

  const enter = (w: Overview["workplaces"][number]) =>
    run(
      w._id,
      () => fetcher({ url: `${API}/secretary/boss/${w.kind}/${w._id}`, method: "POST" }),
      () => push(`/${nameToPanelPath[w.kind]}`),
    );

  return (
    <HandleLoading data={!!data} error={error}>
      {!!data && (
        <div className={classes.main}>
          {!!invites.length && (
            <section className={classes.section}>
              <h2 className={classes.title}>{getContent("shoInvites")}</h2>
              <ul className={classes.list}>
                {invites.map((inv) => (
                  <li key={inv._id} className={`${classes.card} ${classes.invite}`}>
                    <InitialAvatar name={inv.label || "?"} seed={inv._id} size="2.75rem" />
                    <div className={classes.meta}>
                      <strong>{getContent("shoInviteFrom", [inv.label || getContent(kindKey[inv.kind])])}</strong>
                      <span>
                        {getContent(kindKey[inv.kind])}
                        {!!inv.displayName && ` · ${inv.displayName}`}
                      </span>
                      {!!inv.message && <p className={classes.message}>{inv.message}</p>}
                    </div>
                    <div className={classes.actions}>
                      <button
                        type="button"
                        className={classes.primary}
                        disabled={busy === inv._id}
                        onClick={() => answer(inv, "Approved")}
                      >
                        {getContent("shoAccept")}
                      </button>
                      <button
                        type="button"
                        className={classes.ghost}
                        disabled={busy === inv._id}
                        onClick={() => answer(inv, "Rejected")}
                      >
                        {getContent("reject")}
                      </button>
                    </div>
                  </li>
                ))}
              </ul>
            </section>
          )}

          <section className={classes.section}>
            <h2 className={classes.title}>{getContent("shoWorkplaces")}</h2>
            {!workplaces.length ? (
              <p className={classes.empty}>{getContent("shoEmpty", [data.phone || ""])}</p>
            ) : (
              <ul className={classes.grid}>
                {workplaces.map((w) => (
                  <li key={w._id} className={classes.card}>
                    <InitialAvatar name={w.label || "?"} seed={w._id} size="2.75rem" />
                    <div className={classes.meta}>
                      <strong>{w.label || "—"}</strong>
                      <span>
                        {getContent(kindKey[w.kind])}
                        {!!w.role && ` · ${w.role}`}
                      </span>
                    </div>
                    <button
                      type="button"
                      className={classes.primary}
                      disabled={busy === w._id}
                      onClick={() => enter(w)}
                    >
                      {getContent("shoEnter")}
                    </button>
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

export default SecretaryPanelPage;
