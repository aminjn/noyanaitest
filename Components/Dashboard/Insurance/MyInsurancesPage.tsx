"use client";
import { useMemo, useState } from "react";
import useSWR from "swr";
import { API } from "@/Components/config";
import { fetcher } from "@/Components/helpers/fetcher";
import { useIntlLocale } from "@/Components/i18n/navigation";
import { TEHRAN_TZ, tehranYmd } from "@/Components/helpers/tehranTime";
import HandleLoading from "@/Components/Admin/UI/HandleLoading";
import useScopedLocale from "@/Components/Hooks/useScopedLocale";
import useNotification from "@/Components/Hooks/useNotification";
import useBreadCrump from "@/Components/Hooks/useBreadCrump";
import { ContentNamespace } from "@/Components/Enums/contentNamespaces";
import Link from "@/Components/i18n/Link";
import Button from "@/Components/UI/Button";
import Input from "@/Components/UI/Input";
import DateInput from "@/Components/UI/DateInput";
import HostedImage from "@/Components/UI/HostedImage";
import Ixon from "@/Components/UI/Ixon";
import ShieldCheckIcon from "@/Components/Icons/ShieldCheckIcon";
import PlusIcon from "@/Components/Icons/PlusIcon";
import EditIcon from "@/Components/Icons/EditIcon";
import TrashIcon from "@/Components/Icons/TrashIcon";
import AlertTriangleIcon from "@/Components/Icons/AlertTriangleIcon";
import classes from "./MyInsurancesPage.module.css";

const NS: ContentNamespace[] = ["common", "patientInsurance"];

type Role = "basic" | "supplementary";

export type SavedInsurance = {
  insurance: { _id: string; name: string; image?: string; isBasic?: boolean; active?: boolean };
  plan: { _id: string; name: string } | null;
  role: Role;
  memberNumber: string;
  expiresAt: string | null;
  expired: boolean;
  source: "manual" | "booking";
};

type Choice = { _id: string; name: string; image?: string; isBasic: boolean; plans: { _id: string; name: string }[] };

type InsurancesData = {
  patient: { _id: string; name: string; self: boolean } | null;
  people: { _id: string; name: string; self: boolean }[];
  items: SavedInsurance[];
  insurers: Choice[];
};

type Draft = { insurance: string; plan: string | null; memberNumber: string; expiresAt: string | null };

const asList = <T,>(v: unknown): T[] => (Array.isArray(v) ? (v as T[]) : []);

export const useMyInsurances = (patient?: string | null) =>
  useSWR<InsurancesData>(`${API}/user/insurances${patient ? `?patient=${patient}` : ""}`, (url: string) =>
    fetcher({ url }).then((res) => {
      const d = res?.data || {};
      // a record missing a field never crashes the page
      return {
        patient: d.patient?._id ? d.patient : null,
        people: asList<InsurancesData["people"][number]>(d.people).filter((p) => !!p?._id),
        items: asList<SavedInsurance>(d.items).filter((i) => !!i?.insurance?._id),
        insurers: asList<Choice>(d.insurers)
          .filter((i) => !!i?._id)
          .map((i) => ({ ...i, plans: asList<Choice["plans"][number]>(i.plans).filter((p) => !!p?._id) })),
      };
    }),
  );

// «بیمه‌های من» (2026-10, Zocdoc's insurance card on the account, Doctolib's
// Carte Vitale + mutuelle): one basic and one supplementary insurance per
// person - the patient's own and each family member's they book for - with
// plan, member number and expiry. Every booking preselects them (backend
// Lib/patientInsurances.ts, Lib/insuranceTariffs.ts).
const MyInsurancesPage = () => {
  const getContent = useScopedLocale(NS);
  const intlTag = useIntlLocale();
  const dayFmt = useMemo(
    () => new Intl.DateTimeFormat(intlTag, { timeZone: TEHRAN_TZ, day: "numeric", month: "long", year: "numeric" }),
    [intlTag],
  );
  const notify = useNotification();
  const [person, setPerson] = useState<string | null>(null);
  const { data, error, mutate } = useMyInsurances(person);
  const [editing, setEditing] = useState<Role | null>(null);
  const [draft, setDraft] = useState<Draft | null>(null);
  const [busy, setBusy] = useState(false);

  useBreadCrump([
    { title: getContent("dashboard"), target: "/dashboard" },
    { title: getContent("piTitle"), target: "/dashboard/insurance" },
  ]);

  const items = data?.items || [];
  const insurers = data?.insurers || [];
  const slot = (role: Role) => items.find((i) => i.role === role) || null;

  const toInput = (i: SavedInsurance): Draft => ({
    insurance: i.insurance._id,
    plan: i.plan?._id || null,
    memberNumber: i.memberNumber || "",
    expiresAt: i.expiresAt ? tehranYmd(i.expiresAt) : null,
  });

  const save = async (next: Draft[]) => {
    setBusy(true);
    try {
      await fetcher({
        url: `${API}/user/insurances`,
        method: "PUT",
        bodyParser: "JSON",
        payload: {
          ...(data?.patient && !data.patient.self ? { patient: data.patient._id } : {}),
          items: next.map((d) => ({
            insurance: d.insurance,
            plan: d.plan || null,
            memberNumber: d.memberNumber.trim() || null,
            expiresAt: d.expiresAt || null,
          })),
        },
      });
      notify(getContent("piSaved"), "Success");
      setEditing(null);
      setDraft(null);
      await mutate();
    } catch (err) {
      notify(err instanceof Error ? err.message : String(err), "Error");
    } finally {
      setBusy(false);
    }
  };

  const others = (role: Role) => items.filter((i) => i.role !== role).map(toInput);
  const open = (role: Role) => {
    const current = slot(role);
    setEditing(role);
    setDraft(current ? toInput(current) : { insurance: "", plan: null, memberNumber: "", expiresAt: null });
  };
  const remove = (role: Role) => save(others(role));
  const submit = () => {
    if (!draft || !editing) return;
    if (!draft.insurance) return notify(getContent("piChooseInsurer"), "Error");
    save([...others(editing), draft]);
  };

  const card = (role: Role) => {
    const current = slot(role);
    const list = insurers.filter((i) => i.isBasic === (role === "basic"));
    const title = role === "basic" ? getContent("bfInsBasic") : getContent("bfInsSupp");
    const hint = role === "basic" ? getContent("piOneBasic") : getContent("piOneSupp");
    if (editing === role && draft) {
      const chosen = insurers.find((i) => i._id === draft.insurance);
      return (
        <section className={`${classes.card} ${classes.editing}`} aria-label={title}>
          <header className={classes.cardHead}>
            <span className={`${classes.icon} tone-teal`}>
              <Ixon width="1.1rem">
                <ShieldCheckIcon />
              </Ixon>
            </span>
            <div className={classes.cardTitle}>
              <b>{title}</b>
              <small>{hint}</small>
            </div>
          </header>
          <div className={classes.block}>
            <span className={classes.label}>{getContent("piInsurer")}</span>
            {list.length ? (
              <div className={classes.chips} role="radiogroup" aria-label={getContent("piInsurer")}>
                {list.map((i) => (
                  <button
                    key={i._id}
                    type="button"
                    role="radio"
                    aria-checked={draft.insurance === i._id}
                    className={`${classes.chip} ${draft.insurance === i._id ? classes.chipOn : ""}`}
                    onClick={() => setDraft({ ...draft, insurance: i._id, plan: null })}
                  >
                    {i.name || "—"}
                  </button>
                ))}
              </div>
            ) : (
              <p className={classes.muted}>{getContent("piNoInsurers")}</p>
            )}
          </div>
          {!!chosen?.plans.length && (
            <div className={classes.block}>
              <span className={classes.label}>{getContent("piPlan")}</span>
              <div className={classes.chips} role="radiogroup" aria-label={getContent("piPlan")}>
                {[{ _id: "", name: getContent("piNoPlan") }, ...chosen.plans].map((p) => (
                  <button
                    key={p._id || "none"}
                    type="button"
                    role="radio"
                    aria-checked={(draft.plan || "") === p._id}
                    className={`${classes.chip} ${(draft.plan || "") === p._id ? classes.chipOn : ""}`}
                    onClick={() => setDraft({ ...draft, plan: p._id || null })}
                  >
                    {p.name || "—"}
                  </button>
                ))}
              </div>
            </div>
          )}
          <div className={classes.fields}>
            <Input
              title={getContent("piMember")}
              defaultValue={draft.memberNumber}
              inputMode="text"
              autoComplete="off"
              placeholder={getContent("piMemberHint")}
              onChange={(e) => setDraft({ ...draft, memberNumber: e.target.value })}
            />
            <DateInput
              title={getContent("piExpiry")}
              defaultValue={draft.expiresAt || undefined}
              placeholder={getContent("piNoExpiry")}
              onChange={(d) => setDraft({ ...draft, expiresAt: tehranYmd(d) })}
              onClear={() => setDraft({ ...draft, expiresAt: null })}
            />
          </div>
          <div className={classes.actions}>
            <Button size="M" radius="High" variant={draft.insurance ? "Primary" : "Disable"} isLoading={busy} onClick={submit}>
              {getContent("piSave")}
            </Button>
            <Button size="M" radius="High" mode="Outline" variant="Neutral" onClick={() => (setEditing(null), setDraft(null))}>
              {getContent("cancel")}
            </Button>
          </div>
        </section>
      );
    }
    if (!current)
      return (
        <section className={`${classes.card} ${classes.empty}`} aria-label={title}>
          <header className={classes.cardHead}>
            <span className={`${classes.icon} tone-indigo`}>
              <Ixon width="1.1rem">
                <ShieldCheckIcon />
              </Ixon>
            </span>
            <div className={classes.cardTitle}>
              <b>{title}</b>
              <small>{hint}</small>
            </div>
          </header>
          <p className={classes.muted}>{getContent("piSlotEmpty")}</p>
          <div className={classes.actions}>
            <Button size="M" radius="High" mode="Outline" leadIcon={<PlusIcon />} onClick={() => !editing && open(role)}>
              {getContent("piAdd")}
            </Button>
          </div>
        </section>
      );
    return (
      <section className={classes.card} aria-label={title}>
        <header className={classes.cardHead}>
          {current.insurance.image ? (
            <span className={classes.logo}>
              <HostedImage src={current.insurance.image} alt={current.insurance.name} fill sizes="2.75rem" style={{ objectFit: "contain" }} />
            </span>
          ) : (
            <span className={`${classes.icon} tone-teal`}>
              <Ixon width="1.1rem">
                <ShieldCheckIcon />
              </Ixon>
            </span>
          )}
          <div className={classes.cardTitle}>
            <small>{title}</small>
            <b>{current.insurance.name || "—"}</b>
          </div>
        </header>
        <dl className={classes.facts}>
          <div>
            <dt>{getContent("piPlan")}</dt>
            <dd>{current.plan?.name || getContent("piNoPlan")}</dd>
          </div>
          <div>
            <dt>{getContent("piMember")}</dt>
            <dd dir="ltr">{current.memberNumber || "—"}</dd>
          </div>
          <div>
            <dt>{getContent("piExpiry")}</dt>
            <dd>{current.expiresAt ? dayFmt.format(new Date(current.expiresAt)) : getContent("piNoExpiry")}</dd>
          </div>
        </dl>
        {current.insurance.active === false && (
          <p className={classes.warn}>
            <Ixon width="0.9rem">
              <AlertTriangleIcon />
            </Ixon>
            {getContent("piInactive")}
          </p>
        )}
        {current.source === "booking" && <p className={classes.muted}>{getContent("piFromBooking")}</p>}
        <div className={classes.actions}>
          {current.expired ? (
            <span className={`${classes.badge} ${classes.badgeBad}`}>{getContent("piExpired")}</span>
          ) : (
            <span className={`${classes.badge} ${classes.badgeOk}`}>{getContent("piPreselect")}</span>
          )}
          <Button size="S" radius="High" mode="Outline" leadIcon={<EditIcon />} onClick={() => !editing && open(role)}>
            {getContent("piEdit")}
          </Button>
          <Button
            size="S"
            radius="High"
            mode="Outline"
            variant="Error"
            leadIcon={<TrashIcon />}
            isLoading={busy && !editing}
            onClick={() => !editing && !busy && remove(role)}
          >
            {getContent("piRemove")}
          </Button>
        </div>
      </section>
    );
  };

  return (
    <HandleLoading data={!!data} error={error}>
      {!!data && (
        <div className={classes.main}>
          <header className={classes.header}>
            <h1 className={classes.title}>{getContent("piTitle")}</h1>
            <p className={classes.intro}>{getContent("piIntro")}</p>
          </header>
          {data.people.length > 1 && (
            <div className={classes.chips} role="tablist" aria-label={getContent("piFor")}>
              {data.people.map((p) => {
                const on = (data.patient?._id || "") === p._id;
                return (
                  <button
                    key={p._id}
                    type="button"
                    role="tab"
                    aria-selected={on}
                    className={`${classes.chip} ${on ? classes.chipOn : ""}`}
                    onClick={() => {
                      setEditing(null);
                      setDraft(null);
                      setPerson(p.self ? null : p._id);
                    }}
                  >
                    {p.self ? getContent("wlMe") : p.name || "—"}
                  </button>
                );
              })}
            </div>
          )}
          {!data.patient ? (
            <div className={classes.card}>
              <p className={classes.muted}>{getContent("piNeedIdentity")}</p>
              <Link href="/dashboard" className={classes.link}>
                {getContent("dashboard")}
              </Link>
            </div>
          ) : (
            <div className={classes.grid}>
              {card("basic")}
              {card("supplementary")}
            </div>
          )}
          <p className={classes.note}>{getContent("piNote")}</p>
        </div>
      )}
    </HandleLoading>
  );
};

export default MyInsurancesPage;
