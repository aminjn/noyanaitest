"use client";

import useSWR from "swr";
import { useState } from "react";
import classes from "./InviteMemberPopup.module.css";
import PopupCard from "@/Components/UI/PopupCard";
import Input from "@/Components/UI/Input";
import usePopup from "@/Components/Hooks/usePopup";
import useNotification from "@/Components/Hooks/useNotification";
import useScopedLocale from "@/Components/Hooks/useScopedLocale";
import { ContentNamespace } from "@/Components/Enums/contentNamespaces";
import { API } from "@/Components/config";
import { fetcher } from "@/Components/helpers/fetcher";
import { Acl, NodeWithAcl } from "./Request/CreateSecretaryRequestPopup";
import { rolePresets } from "./roles";

const LOCALE_NS: ContentNamespace[] = ["common", "secretaryManager"];

// Invite in one step: phone, name, a ready-made role. The role's access
// level is created on the fly the first time (and reused afterwards), so
// the owner never has to build one by hand before inviting.
const InviteMemberPopup = ({ name, mutate }: { name: NodeWithAcl; mutate: () => unknown }) => {
  const getContent = useScopedLocale(LOCALE_NS);
  const { closePopup } = usePopup();
  const pushNotification = useNotification();
  const presets = rolePresets(name);
  const { data: acls } = useSWR<Acl<string[], unknown>[]>(`${API}/acl/${name}/acl`, (url: string) =>
    fetcher({ url }).then((res) => res.data),
  );
  const custom = Array.isArray(acls) ? acls : [];

  const [phone, setPhone] = useState("");
  const [displayName, setDisplayName] = useState("");
  const [role, setRole] = useState<string>(presets[0].id);
  const [busy, setBusy] = useState(false);

  const resolveAcl = async (): Promise<string | undefined> => {
    if (role.startsWith("acl:")) return role.slice(4);
    const preset = presets.find((p) => p.id === role);
    if (!preset) return undefined;
    const title = getContent(preset.title);
    const existing = custom.find((a) => a.name === title);
    if (existing) return existing._id;
    const res = await fetcher({
      url: `${API}/acl/${name}/acl`,
      method: "POST",
      payload: { name: title, ...Object.fromEntries(preset.actions.map((a) => [a, true])) },
    });
    return (res?.data as { _id?: string } | undefined)?._id;
  };

  const submit = async () => {
    if (!phone.trim()) return pushNotification(getContent("checkInput"), "Warn");
    setBusy(true);
    try {
      const acl = await resolveAcl();
      await fetcher({
        url: `${API}/acl/${name}/secretaryrequest`,
        method: "POST",
        payload: { phone: phone.trim(), ...(displayName.trim() ? { displayName: displayName.trim() } : {}), ...(acl ? { acl } : {}) },
      });
      pushNotification(getContent("inviteSent"), "Success");
      mutate();
      closePopup("InviteMember");
    } catch (e) {
      pushNotification(e instanceof Error ? e.message : String(e), "Error");
    } finally {
      setBusy(false);
    }
  };

  return (
    <PopupCard title={getContent("smInvite")}>
      <div className={classes.main}>
        <Input title={getContent("phone")} type="tel" inputMode="tel" onChange={(e) => setPhone(e.target.value)} readOnly={busy} />
        <p className={classes.hint}>{getContent("invitePhoneHint")}</p>
        <Input title={getContent("displayName")} onChange={(e) => setDisplayName(e.target.value)} readOnly={busy} />

        <fieldset className={classes.roles}>
          <legend>{getContent("rolePick")}</legend>
          {presets.map((p) => (
            <label key={p.id} className={`${classes.role} ${role === p.id ? classes.on : ""}`}>
              <input type="radio" name="role" checked={role === p.id} onChange={() => setRole(p.id)} />
              <span>
                <b>{getContent(p.title)}</b>
                <small>{getContent(p.hint)}</small>
              </span>
            </label>
          ))}
          {custom
            .filter((a) => !presets.some((p) => getContent(p.title) === a.name))
            .map((a) => (
              <label key={a._id} className={`${classes.role} ${role === `acl:${a._id}` ? classes.on : ""}`}>
                <input type="radio" name="role" checked={role === `acl:${a._id}`} onChange={() => setRole(`acl:${a._id}`)} />
                <span>
                  <b>{a.name}</b>
                  <small>{getContent("roleCustomHint")}</small>
                </span>
              </label>
            ))}
        </fieldset>

        <div className={classes.actions}>
          <button type="button" className={classes.primary} onClick={submit} disabled={busy}>
            {getContent("smInvite")}
          </button>
          <button type="button" className={classes.ghost} onClick={() => closePopup("InviteMember")} disabled={busy}>
            {getContent("cancel")}
          </button>
        </div>
      </div>
    </PopupCard>
  );
};

export default InviteMemberPopup;
