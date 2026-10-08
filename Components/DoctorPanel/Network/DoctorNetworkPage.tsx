"use client";

import useSWR from "swr";
import { ReactNode, useState } from "react";
import classes from "./DoctorNetworkPage.module.css";
import { API } from "@/Components/config";
import { fetcher } from "@/Components/helpers/fetcher";
import useBreadCrump from "@/Components/Hooks/useBreadCrump";
import useScopedLocale from "@/Components/Hooks/useScopedLocale";
import useNotification from "@/Components/Hooks/useNotification";
import useDoctorAcl from "@/Components/Hooks/useDoctorAcl";
import { ContentNamespace } from "@/Components/Enums/contentNamespaces";
import { ContentKey } from "@/Components/Enums/contentKeys";
import { useIntlLocale } from "@/Components/i18n/navigation";
import Link from "@/Components/i18n/Link";
import Ixon from "@/Components/UI/Ixon";
import InitialAvatar from "@/Components/UI/InitialAvatar";
import ActionInbox from "@/Components/UI/ActionInbox";
import HospitalIcon from "@/Components/Icons/HospitalIcon";
import BuildingIcon from "@/Components/Icons/BuildingIcon";
import PillIcon from "@/Components/Icons/PillIcon";
import ShieldCheckIcon from "@/Components/Icons/ShieldCheckIcon";

const NS: ContentNamespace[] = ["common", "doctorPanelNetwork"];

type Named = { _id?: string; name?: string } | null | undefined;
type Join = { _id: string; status?: string; submissionParty?: string; clinic?: Named; hospital?: Named };

const list = <T,>(v: unknown) => (Array.isArray(v) ? (v as T[]) : []);
const load = (url: string) => fetcher({ url }).then((res) => res.data);

// "My network" (2026-09): clinics, hospitals, pharmacies & labs and
// insurers were four menu items with three tabs each. One hub now shows
// invites waiting for an answer and a card per kind; each card opens the
// existing detail page for adding / leaving.
const DoctorNetworkPage = () => {
  const getContent = useScopedLocale(NS);
  const intlTag = useIntlLocale();
  const num = new Intl.NumberFormat(intlTag);
  const pushNotification = useNotification();
  const hasAccess = useDoctorAcl();
  const [busy, setBusy] = useState<string | null>(null);

  useBreadCrump([
    { title: getContent("dashboard"), target: "/doctorpanel" },
    { title: getContent("myNetwork"), target: "/doctorpanel/network" },
  ]);

  const clinics = useSWR(hasAccess("readClinics") ? `${API}/doctor/clinic` : null, load);
  const clinicJoin = useSWR(hasAccess("readClinics") ? `${API}/doctor/clinicjoin` : null, load);
  const hospitals = useSWR(hasAccess("readHospitals") ? `${API}/doctor/hospital` : null, load);
  const hospitalJoin = useSWR(hasAccess("readHospitals") ? `${API}/doctor/hospitaljoin` : null, load);
  const pharmacies = useSWR(hasAccess("readPharmacy") ? `${API}/doctor/pharmacy` : null, load);
  const insurances = useSWR(hasAccess("readInsurance") ? `${API}/doctor/insurance` : null, load);
  // insurer contracts waiting on the doctor (an insurer's invitation)
  const contracts = useSWR(hasAccess("readInsurance") ? `${API}/doctor/insurer-contract` : null, load);

  const joins = [
    ...list<Join>(clinicJoin.data).map((j) => ({ ...j, kind: "clinic" as const, center: j.clinic })),
    ...list<Join>(hospitalJoin.data).map((j) => ({ ...j, kind: "hospital" as const, center: j.hospital })),
  ].filter((j) => j.status === "Pending");
  const invites = joins.filter((j) => j.submissionParty !== "DoctorProfile");
  const pendingOf = (kind: "clinic" | "hospital") =>
    joins.filter((j) => j.kind === kind && j.submissionParty === "DoctorProfile").length;

  const answer = async (j: (typeof invites)[number], status: "Approved" | "Rejected") => {
    setBusy(j._id);
    try {
      await fetcher({ url: `${API}/doctor/${j.kind}join/${j._id}`, method: "POST", payload: { status } });
      await Promise.all([clinicJoin.mutate(), hospitalJoin.mutate(), clinics.mutate(), hospitals.mutate()]);
    } catch (e) {
      pushNotification(e instanceof Error ? e.message : String(e), "Error");
    } finally {
      setBusy(null);
    }
  };

  const cards: {
    key: string;
    show: boolean;
    title: ContentKey;
    icon: ReactNode;
    href: string;
    names: string[];
    pending?: number;
  }[] = [
    {
      key: "clinic",
      show: hasAccess("readClinics"),
      title: "clinics",
      icon: <HospitalIcon />,
      href: "/doctorpanel/clinic",
      names: list<{ clinic?: Named }>(clinics.data).map((m) => m.clinic?.name || "").filter(Boolean),
      pending: pendingOf("clinic"),
    },
    {
      key: "hospital",
      show: hasAccess("readHospitals"),
      title: "hospitals",
      icon: <BuildingIcon />,
      href: "/doctorpanel/hospital",
      names: list<{ hospital?: Named }>(hospitals.data).map((m) => m.hospital?.name || "").filter(Boolean),
      pending: pendingOf("hospital"),
    },
    {
      key: "pharmacy",
      show: hasAccess("readPharmacy"),
      title: "phrmaciesAndLabs",
      icon: <PillIcon />,
      href: "/doctorpanel/pharmacy",
      names: list<{ pharmacy?: Named }>(pharmacies.data).map((m) => m.pharmacy?.name || "").filter(Boolean),
    },
    {
      key: "insurance",
      show: hasAccess("readInsurance"),
      title: "insurances",
      icon: <ShieldCheckIcon />,
      href: "/doctorpanel/insurance",
      names: list<{ insurance?: Named }>(insurances.data).map((m) => m.insurance?.name || "").filter(Boolean),
      pending: list<{ status?: string; initiatedBy?: string }>(contracts.data).filter(
        (c) => c.status === "Pending" && c.initiatedBy === "insurer",
      ).length,
    },
  ];

  return (
    <div className={classes.main}>
      <header className={classes.header}>
        <h1 className={classes.title}>{getContent("myNetwork")}</h1>
        <p className={classes.intro}>{getContent("netIntro")}</p>
      </header>

      {!!invites.length && (
        <section className={classes.section}>
          <h2 className={classes.h2}>{getContent("netInvites")}</h2>
          <ActionInbox
            highlight
            items={invites.map((j) => ({
              id: j._id,
              lead: <InitialAvatar name={j.center?.name || "?"} seed={j.center?._id || j._id} size="2.75rem" />,
              title: getContent("netInviteFrom", [j.center?.name || getContent(j.kind === "clinic" ? "clinics" : "hospitals")]),
              subtitle: getContent(j.kind === "clinic" ? "clinics" : "hospitals"),
              actions: [
                { label: getContent("netAccept"), kind: "primary", onClick: () => answer(j, "Approved"), disabled: busy === j._id },
                { label: getContent("reject"), kind: "ghost", onClick: () => answer(j, "Rejected"), disabled: busy === j._id },
              ],
            }))}
          />
        </section>
      )}

      <ul className={classes.grid}>
        {cards
          .filter((c) => c.show)
          .map((c) => (
            <li key={c.key}>
              <Link href={c.href} className={classes.card}>
                <div className={classes.cardHead}>
                  <span className={`${classes.icon} glassIcon`}>
                    <Ixon width="1.25rem">{c.icon}</Ixon>
                  </span>
                  <strong>{getContent(c.title)}</strong>
                  <span className={classes.count}>{num.format(c.names.length)}</span>
                </div>
                {c.names.length ? (
                  <div className={classes.chips}>
                    {c.names.slice(0, 4).map((n) => (
                      <span key={n} className={classes.chip}>
                        {n}
                      </span>
                    ))}
                    {c.names.length > 4 && (
                      <span className={classes.more}>{getContent("netMore", [num.format(c.names.length - 4)])}</span>
                    )}
                  </div>
                ) : (
                  <p className={classes.none}>{getContent("netNone")}</p>
                )}
                <div className={classes.foot}>
                  {!!c.pending && <span className={classes.pending}>{getContent("netPending", [num.format(c.pending)])}</span>}
                  <span className={classes.manage}>{getContent("netManage")}</span>
                </div>
              </Link>
            </li>
          ))}
      </ul>
    </div>
  );
};

export default DoctorNetworkPage;
