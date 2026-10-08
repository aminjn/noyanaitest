"use client";

import useSWR, { useSWRConfig } from "swr";
import { useEffect, useRef, useState } from "react";
import classes from "./CentreSwitcher.module.css";
import { API } from "../config";
import { fetcher } from "../helpers/fetcher";
import Link from "@/Components/i18n/Link";
import useScopedLocale from "../Hooks/useScopedLocale";
import { ContentNamespace } from "../Enums/contentNamespaces";
import useProgress from "../Hooks/useProgress";
import useNotification from "../Hooks/useNotification";
import InitialAvatar from "../UI/InitialAvatar";
import Ixon from "../UI/Ixon";
import ChevronIcon from "../Icons/ChevronIcon";
import CheckIcon from "../Icons/CheckIcon";
import PlusIcon from "../Icons/PlusIcon";

const LOCALE_NS: ContentNamespace[] = ["common", "layoutPanel"];

type CentreKind = "clinic" | "hospital";
type CentreRow = { _id: string; name?: string; role?: "owner" | "staff" };

const panelOf: Record<CentreKind, string> = { clinic: "clinicpanel", hospital: "hospitalpanel" };

// The clinic / hospital panel's centre switcher (2026-10, Doctolib / Practo
// multi-site: one account can own several centres). Backend
// Controllers/activeCentreController.ts lists the centres the account can
// open (its own and those it works in as staff) and sets the active one;
// every panel call is then scoped to it. The list shows only with more than
// one centre; an owner always has "add another centre", which opens the
// usual become-clinic / become-hospital request.
const CentreSwitcher = ({ kind }: { kind: CentreKind }) => {
  const getContent = useScopedLocale(LOCALE_NS);
  const { mutate: mutateAll } = useSWRConfig();
  const push = useProgress();
  const pushNotification = useNotification();
  const [open, setOpen] = useState(false);
  const [busy, setBusy] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  const { data } = useSWR<{ centres?: CentreRow[]; activeId?: string }>(`${API}/${kind}/centres`, (url: string) =>
    fetcher({ url }).then((res) => res.data),
  );

  useEffect(() => {
    if (!open) return;
    const onDown = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    };
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && setOpen(false);
    document.addEventListener("mousedown", onDown);
    document.addEventListener("keyup", onKey);
    return () => {
      document.removeEventListener("mousedown", onDown);
      document.removeEventListener("keyup", onKey);
    };
  }, [open]);

  const centres = (Array.isArray(data?.centres) ? data.centres : []).filter((c) => !!c && !!c._id);
  const ownsAny = centres.some((c) => c.role === "owner");
  if (!centres.length) return null;
  const active = centres.find((c) => c._id === data?.activeId) || centres[0];
  const addHref = `/become/${kind}?another=1`;

  const switchTo = async (id: string) => {
    if (id === active._id) return setOpen(false);
    setBusy(true);
    try {
      await fetcher({ url: `${API}/${kind}/centres/active`, method: "POST", payload: { id } });
      setOpen(false);
      // every panel call answers for the new centre now
      await mutateAll(() => true);
      push(`/${panelOf[kind]}`);
    } catch (e) {
      pushNotification(e instanceof Error ? e.message : String(e), "Error");
    } finally {
      setBusy(false);
    }
  };

  if (centres.length < 2)
    return ownsAny ? (
      <Link href={addHref} className={classes.addOnly}>
        <Ixon width="1rem">
          <PlusIcon />
        </Ixon>
        <span>{getContent("addAnotherCentre")}</span>
      </Link>
    ) : null;

  const activeName = active.name || getContent(kind === "clinic" ? "clinicPanel" : "hospitalPanelTitle");
  return (
    <div className={classes.main} ref={ref}>
      <button
        type="button"
        className={classes.current}
        aria-haspopup="listbox"
        aria-expanded={open}
        aria-label={getContent("centreSwitcherLabel")}
        onClick={() => setOpen((v) => !v)}
        disabled={busy}
      >
        <InitialAvatar name={activeName} seed={active._id} size="2rem" />
        <span className={classes.names}>
          <span className={classes.hint}>{getContent("centreSwitcherLabel")}</span>
          <span className={classes.name}>{activeName}</span>
        </span>
        <Ixon width="1rem" className={`${classes.chevron} ${open ? classes.chevronOpen : ""}`}>
          <ChevronIcon />
        </Ixon>
      </button>
      {open && (
        <div className={classes.menu}>
          <ul role="listbox" aria-label={getContent("centreSwitcherLabel")} className={classes.list}>
            {centres.map((c) => {
              const name = c.name || getContent(kind === "clinic" ? "clinicPanel" : "hospitalPanelTitle");
              const isActive = c._id === active._id;
              return (
                <li key={c._id} role="option" aria-selected={isActive}>
                  <button
                    type="button"
                    className={`${classes.item} ${isActive ? classes.itemActive : ""}`}
                    onClick={() => switchTo(c._id)}
                    disabled={busy}
                  >
                    <InitialAvatar name={name} seed={c._id} size="1.75rem" />
                    <span className={classes.name}>{name}</span>
                    {c.role === "staff" && <span className={classes.role}>{getContent("centreStaffRole")}</span>}
                    {isActive && (
                      <Ixon width="1rem" className={classes.check}>
                        <CheckIcon />
                      </Ixon>
                    )}
                  </button>
                </li>
              );
            })}
          </ul>
          {ownsAny && (
            <Link href={addHref} className={classes.add} onClick={() => setOpen(false)}>
              <Ixon width="1rem">
                <PlusIcon />
              </Ixon>
              <span>{getContent("addAnotherCentre")}</span>
            </Link>
          )}
        </div>
      )}
    </div>
  );
};

export default CentreSwitcher;
