"use client";

import { useEffect, useState } from "react";
import { API } from "@/Components/config";
import { fetcher } from "@/Components/helpers/fetcher";
import PopupCard from "@/Components/UI/PopupCard";
import Input from "@/Components/UI/Input";
import InitialAvatar from "@/Components/UI/InitialAvatar";
import usePopup from "@/Components/Hooks/usePopup";
import useNotification from "@/Components/Hooks/useNotification";
import useScopedLocale from "@/Components/Hooks/useScopedLocale";
import { ContentNamespace } from "@/Components/Enums/contentNamespaces";
import { CenterKind, doctorName, doctorSpec } from "./useCenterDoctors";
import classes from "./CenterDoctorsPage.module.css";

const NS: ContentNamespace[] = ["common", "centerDoctors"];

type Found = { _id: string; firstName?: string; lastName?: string; mainSpeciality?: { name?: string } | null };

// The centre invites a doctor (2026-10): search by name or council number,
// the doctor accepts from their own panel.
const InviteDoctorPopup = ({ kind, onDone }: { kind: CenterKind; onDone: () => unknown }) => {
  const getContent = useScopedLocale(NS);
  const { closePopup } = usePopup();
  const pushNotification = useNotification();
  const [q, setQ] = useState("");
  const [found, setFound] = useState<Found[] | null>(null);
  const [busy, setBusy] = useState<string | null>(null);

  useEffect(() => {
    const text = q.trim();
    if (text.length < 2) return setFound(null);
    const t = setTimeout(() => {
      fetcher({ url: `${API}/${kind}/doctor/search?q=${encodeURIComponent(text)}` })
        .then((res) => setFound(Array.isArray(res.data) ? (res.data as Found[]) : []))
        .catch(() => setFound([]));
    }, 300);
    return () => clearTimeout(t);
  }, [q, kind]);

  const invite = async (id: string) => {
    setBusy(id);
    try {
      await fetcher({
        url: `${API}/${kind}/doctor/invite`,
        method: "POST",
        bodyParser: "JSON",
        payload: { doctor: id },
      });
      pushNotification(getContent("cdInviteSent"), "Success");
      closePopup();
      onDone();
    } catch (err) {
      pushNotification((err as Error)?.message || "", "Error");
    } finally {
      setBusy(null);
    }
  };

  return (
    <PopupCard title={getContent("cdInvite")}>
      <div className={classes.popupBody}>
        <p className={classes.hint}>{getContent("cdInviteHint")}</p>
        <Input title={getContent("cdInviteSearch")} onChange={(e) => setQ(e.target.value)} autoFocuse />
        {found && !found.length && <p className={classes.hint}>{getContent("cdInviteNone")}</p>}
        {!!found?.length && (
          <ul className={classes.found}>
            {found.map((d) => (
              <li key={d._id} className={classes.foundItem}>
                <InitialAvatar name={doctorName(d)} seed={d._id} size="2.5rem" />
                <div className={classes.meta}>
                  <strong>{doctorName(d)}</strong>
                  <span>{doctorSpec(d)}</span>
                </div>
                <button
                  type="button"
                  className={classes.primary}
                  disabled={busy === d._id}
                  onClick={() => invite(d._id)}
                >
                  {getContent("cdInviteSend")}
                </button>
              </li>
            ))}
          </ul>
        )}
      </div>
    </PopupCard>
  );
};

export default InviteDoctorPopup;
