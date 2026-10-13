"use client";

import { useState } from "react";
import useScopedLocale from "@/Components/Hooks/useScopedLocale";
import { ContentNamespace } from "@/Components/Enums/contentNamespaces";
import Ixon from "@/Components/UI/Ixon";
import CallCallingIcon from "@/Components/Icons/CallCallingIcon";
import { API } from "@/Components/config";
import { fetcher } from "@/Components/helpers/fetcher";
import classes from "./PhoneReveal.module.css";

const NS: ContentNamespace[] = ["common", "drProfile"];

export type PhoneRevealHandle = { kind: string; count: number; ticket: string };
type PublicPhone = { phone: string; name?: string };

// «نمایش شماره تماس» (2026-10, Paziresh24 / Doctoreto): the page carries no
// number; a click asks the backend for it with the page's signed ticket and
// each answer is counted for the doctor's panel and the super admin
// (backend Lib/phoneReveal.ts)
const PhoneReveal = ({
  id,
  handle,
  placement = "header",
}: {
  id: string;
  handle?: PhoneRevealHandle;
  placement?: string;
}) => {
  const getContent = useScopedLocale(NS);
  const [phones, setPhones] = useState<PublicPhone[] | null>(null);
  const [busy, setBusy] = useState(false);
  const [failed, setFailed] = useState(false);
  if (!handle?.count || !handle.ticket) return null;

  const reveal = async () => {
    if (busy) return;
    setBusy(true);
    setFailed(false);
    try {
      const res = await fetcher<{ data?: { phones?: PublicPhone[] } }>({
        url: `${API}/public/phone/${handle.kind}/${id}`,
        method: "POST",
        payload: {
          ticket: handle.ticket,
          source: typeof window !== "undefined" ? window.location.pathname : undefined,
          placement,
        },
      });
      const list = (res?.data?.phones || []) as PublicPhone[];
      setPhones(Array.isArray(list) ? list.filter((p) => !!p?.phone) : []);
    } catch {
      setFailed(true);
    } finally {
      setBusy(false);
    }
  };

  if (phones)
    return (
      <div className={classes.list}>
        {phones.map((p) => (
          <a key={p.phone} className={classes.phone} href={`tel:${p.phone.replace(/[^\d+]/g, "")}`}>
            <Ixon width="1rem">
              <CallCallingIcon />
            </Ixon>
            {!!p.name && <span className={classes.name}>{p.name}</span>}
            <span dir="ltr">{p.phone}</span>
          </a>
        ))}
      </div>
    );

  return (
    <div className={classes.wrap}>
      <button type="button" className={classes.button} onClick={reveal} disabled={busy} aria-busy={busy}>
        <Ixon width="1rem">
          <CallCallingIcon />
        </Ixon>
        <span>{getContent("drShowPhone")}</span>
      </button>
      {failed && <span className={classes.error}>{getContent("drPhoneError")}</span>}
    </div>
  );
};

export default PhoneReveal;
