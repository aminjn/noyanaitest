"use client";

import useSWR from "swr";
import { API } from "@/Components/config";
import { fetcher } from "@/Components/helpers/fetcher";
import { useIntlLocale } from "@/Components/i18n/navigation";
import useScopedLocale from "@/Components/Hooks/useScopedLocale";
import useBreadCrump from "@/Components/Hooks/useBreadCrump";
import { ContentNamespace } from "@/Components/Enums/contentNamespaces";
import { ContentKey } from "@/Components/Enums/contentKeys";
import HandleLoading from "@/Components/Admin/UI/HandleLoading";
import InitialAvatar from "@/Components/UI/InitialAvatar";
import Link from "@/Components/i18n/Link";
import classes from "./InsurerNetworkPage.module.css";

const NS: ContentNamespace[] = ["common", "insurerPanel"];

type Place = { _id: string; name?: string; slug?: string; province?: { name?: string }; city?: { name?: string } };
type Doctor = { _id: string; firstName?: string; lastName?: string; slug?: string; mainSpeciality?: { name?: string } };
type Network = { doctors: Doctor[]; clinics: Place[]; hospitals: Place[]; labs: Place[]; pharmacies: Place[] };

const sections: { key: Exclude<keyof Network, "doctors">; title: ContentKey; path: string }[] = [
  { key: "clinics", title: "insNetClinics", path: "/clinic" },
  { key: "hospitals", title: "insNetHospitals", path: "/hospital" },
  { key: "labs", title: "insNetLabs", path: "/paraClinic" },
  { key: "pharmacies", title: "insNetPharmacies", path: "/pharmacy" },
];

// Who accepts this insurer (2026-10): doctors and the centres, labs and
// pharmacies that list it.
const InsurerNetworkPage = () => {
  const getContent = useScopedLocale(NS);
  const intlTag = useIntlLocale();
  const num = new Intl.NumberFormat(intlTag);
  const { data, error } = useSWR<Network>(`${API}/insurance/network`, (url: string) =>
    fetcher({ url }).then((res) => res.data),
  );
  useBreadCrump([
    { title: getContent("dashboard"), target: "/insurancepanel" },
    { title: getContent("insNetwork"), target: "/insurancepanel/network" },
  ]);
  const list = <T,>(v: T[] | undefined) => (Array.isArray(v) ? v : []);

  return (
    <HandleLoading data={!!data} error={error}>
      {!!data && (
        <div className={classes.main}>
          <h1 className={classes.title}>{getContent("insNetwork")}</h1>
          <p className={classes.hint}>{getContent("insNetworkHint")}</p>
          <section className={classes.section}>
            <h2 className={classes.h2}>
              {getContent("insNetDoctors")} <span className={classes.count}>{num.format(list(data.doctors).length)}</span>
            </h2>
            {!list(data.doctors).length ? (
              <p className={classes.empty}>{getContent("insNetEmpty")}</p>
            ) : (
              <ul className={classes.grid}>
                {list(data.doctors).map((d) => {
                  const name = [d.firstName, d.lastName].filter(Boolean).join(" ") || "—";
                  return (
                    <li key={d._id} className={classes.card}>
                      <InitialAvatar name={name} seed={d._id} size="2.5rem" />
                      <div className={classes.meta}>
                        {d.slug ? (
                          <Link href={`/dr/${d.slug}`} target="_blank">
                            <strong>{name}</strong>
                          </Link>
                        ) : (
                          <strong>{name}</strong>
                        )}
                        <span>{d.mainSpeciality?.name || ""}</span>
                      </div>
                    </li>
                  );
                })}
              </ul>
            )}
          </section>
          {sections.map((s) => {
            const items = list(data[s.key]);
            return (
              <section key={s.key} className={classes.section}>
                <h2 className={classes.h2}>
                  {getContent(s.title)} <span className={classes.count}>{num.format(items.length)}</span>
                </h2>
                {!items.length ? (
                  <p className={classes.empty}>{getContent("insNetEmpty")}</p>
                ) : (
                  <ul className={classes.grid}>
                    {items.map((p) => (
                      <li key={p._id} className={classes.card}>
                        <InitialAvatar name={p.name || "?"} seed={p._id} size="2.5rem" />
                        <div className={classes.meta}>
                          {p.slug ? (
                            <Link href={`${s.path}/${p.slug}`} target="_blank">
                              <strong>{p.name}</strong>
                            </Link>
                          ) : (
                            <strong>{p.name}</strong>
                          )}
                          <span>{[p.province?.name, p.city?.name].filter(Boolean).join("، ")}</span>
                        </div>
                      </li>
                    ))}
                  </ul>
                )}
              </section>
            );
          })}
        </div>
      )}
    </HandleLoading>
  );
};

export default InsurerNetworkPage;
