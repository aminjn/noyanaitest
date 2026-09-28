"use client";

import useSWR from "swr";
import { useState } from "react";
import classes from "./SecretaryManager.module.css";
import useBreadCrump from "@/Components/Hooks/useBreadCrump";
import usePopup from "@/Components/Hooks/usePopup";
import useNotification from "@/Components/Hooks/useNotification";
import useScopedLocale from "@/Components/Hooks/useScopedLocale";
import { ContentNamespace } from "@/Components/Enums/contentNamespaces";
import { API } from "@/Components/config";
import { fetcher } from "@/Components/helpers/fetcher";
import HandleLoading from "@/Components/Admin/UI/HandleLoading";
import InitialAvatar from "@/Components/UI/InitialAvatar";
import Ixon from "@/Components/UI/Ixon";
import PlusIcon from "@/Components/Icons/PlusIcon";
import { Acl, ISecretary, NodeWithAcl, SecretaryNodePath } from "./Request/CreateSecretaryRequestPopup";
import { ISecretaryRequest } from "./Request/SecretaryRequestsTab";
import SecretaryAccessLevelsTab from "./AccessLevel/SecretaryAccessLevelsTab";
import InviteMemberPopup from "./InviteMemberPopup";

const LOCALE_NS: ContentNamespace[] = ["common", "secretaryManager"];

const panelRootByNode: Record<NodeWithAcl, string> = {
  doctor: "/doctorpanel",
  clinic: "/clinicpanel",
  insurance: "/insurancepanel",
  pharmacy: "/pharmacypanel",
  paraClinic: "/paraClinicPanel",
  hospital: "/hospitalpanel",
};

type Member = ISecretary<SecretaryNodePath, { Acl: true; Secretary: true }>;
type Invite = ISecretaryRequest<SecretaryNodePath, { Acl: true }>;

// Team (2026-09): one page instead of three tabs - invite with a
// ready-made role, see who hasn't answered yet, change a member's role or
// remove them in place. Custom access levels stay under "advanced".
const SecretaryManager = ({ name }: { name: NodeWithAcl }) => {
  const getContent = useScopedLocale(LOCALE_NS);
  const { setPopup } = usePopup();
  const pushNotification = useNotification();
  const root = panelRootByNode[name];
  const [busy, setBusy] = useState<string | null>(null);
  const [asking, setAsking] = useState<string | null>(null);

  useBreadCrump([
    { title: getContent("dashboard"), target: root },
    { title: getContent("teamTitle"), target: `${root}/secretary` },
  ]);

  const load = (url: string) => fetcher({ url }).then((res) => res.data);
  const members = useSWR<Member[]>(`${API}/acl/${name}/secretary`, load);
  const invites = useSWR<Invite[]>(`${API}/acl/${name}/secretaryrequest`, load);
  const acls = useSWR<Acl<string[], unknown>[]>(`${API}/acl/${name}/acl`, load);

  const memberList = Array.isArray(members.data) ? members.data : [];
  const pending = (Array.isArray(invites.data) ? invites.data : []).filter((i) => i.status === "Pending");
  const roles = Array.isArray(acls.data) ? acls.data : [];

  const run = async (id: string, args: Parameters<typeof fetcher>[0], after: () => unknown) => {
    setBusy(id);
    try {
      await fetcher(args);
      await after();
    } catch (e) {
      pushNotification(e instanceof Error ? e.message : String(e), "Error");
    } finally {
      setBusy(null);
      setAsking(null);
    }
  };

  const invite = () =>
    setPopup(
      "InviteMember",
      <InviteMemberPopup
        name={name}
        mutate={() => {
          invites.mutate();
          acls.mutate();
        }}
      />,
    );

  return (
    <HandleLoading data={!!members.data && !!invites.data} error={members.error || invites.error}>
      <div className={classes.main}>
        <header className={classes.header}>
          <h1 className={classes.title}>{getContent("teamTitle")}</h1>
          <button type="button" className={classes.primary} onClick={invite}>
            <Ixon width="1rem">
              <PlusIcon />
            </Ixon>
            {getContent("smInvite")}
          </button>
        </header>

        {!!pending.length && (
          <section className={classes.section}>
            <h2 className={classes.h2}>{getContent("teamPending")}</h2>
            <ul className={classes.grid}>
              {pending.map((inv) => (
                <li key={inv._id} className={`${classes.card} ${classes.pending}`}>
                  <InitialAvatar name={inv.displayName || inv.phone} seed={inv._id} size="2.75rem" />
                  <div className={classes.meta}>
                    <strong>{inv.displayName || inv.phone}</strong>
                    <span dir="ltr" className={classes.phone}>{inv.phone}</span>
                    <span>{inv.acl?.name || getContent("teamNoRole")}</span>
                  </div>
                  <button
                    type="button"
                    className={classes.ghost}
                    disabled={busy === inv._id}
                    onClick={() =>
                      run(inv._id, { url: `${API}/acl/${name}/secretaryrequest/${inv._id}`, method: "DELETE" }, () => invites.mutate())
                    }
                  >
                    {getContent("smCancelInvite")}
                  </button>
                </li>
              ))}
            </ul>
          </section>
        )}

        <section className={classes.section}>
          <h2 className={classes.h2}>{getContent("teamMembers")}</h2>
          {!memberList.length ? (
            <p className={classes.empty}>{getContent("smNoSecretary")}</p>
          ) : (
            <ul className={classes.grid}>
              {memberList.map((m) => {
                const label = m.displayName || m.secretary?.phone || "—";
                return (
                  <li key={m._id} className={classes.card}>
                    <InitialAvatar name={label} seed={m._id} size="2.75rem" />
                    <div className={classes.meta}>
                      <strong>{label}</strong>
                      {!!m.secretary?.phone && (
                        <span dir="ltr" className={classes.phone}>
                          {m.secretary.phone}
                        </span>
                      )}
                    </div>
                    <select
                      className={`${classes.role} ${!m.acl ? classes.noRole : ""}`}
                      aria-label={getContent("rolePick")}
                      title={!m.acl ? getContent("teamNoRole") : undefined}
                      value={m.acl?._id || ""}
                      disabled={busy === m._id}
                      onChange={(e) =>
                        run(
                          m._id,
                          { url: `${API}/acl/${name}/secretary/${m._id}`, method: "POST", payload: { acl: e.target.value || null } },
                          () => members.mutate(),
                        )
                      }
                    >
                      <option value="">{getContent("teamNoRoleShort")}</option>
                      {roles.map((r) => (
                        <option key={r._id} value={r._id}>
                          {r.name}
                        </option>
                      ))}
                    </select>
                    {asking === m._id ? (
                      <div className={classes.ask}>
                        <span>{getContent("smRemoveAsk")}</span>
                        <div>
                          <button
                            type="button"
                            className={classes.danger}
                            disabled={busy === m._id}
                            onClick={() =>
                              run(m._id, { url: `${API}/acl/${name}/secretary/${m._id}`, method: "PUT" }, () => members.mutate())
                            }
                          >
                            {getContent("smRemove")}
                          </button>
                          <button type="button" className={classes.ghost} onClick={() => setAsking(null)}>
                            {getContent("cancel")}
                          </button>
                        </div>
                      </div>
                    ) : (
                      <button type="button" className={classes.ghost} onClick={() => setAsking(m._id)}>
                        {getContent("smRemove")}
                      </button>
                    )}
                  </li>
                );
              })}
            </ul>
          )}
        </section>

        <details className={classes.advanced}>
          <summary>{getContent("teamRoles")}</summary>
          <SecretaryAccessLevelsTab name={name} />
        </details>
      </div>
    </HandleLoading>
  );
};

export default SecretaryManager;
