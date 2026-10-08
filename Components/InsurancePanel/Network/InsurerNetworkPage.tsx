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
import ClientTabSystem from "@/Components/UI/ClientTabSystem";
import Button from "@/Components/UI/Button";
import usePopup from "@/Components/Hooks/usePopup";
import useAcl from "@/Components/Hooks/useAcl";
import ContractList from "@/Components/InsuranceContracts/ContractList";
import { InviteProviderPopup } from "@/Components/InsuranceContracts/ContractPopups";
import { asContracts, IInsuranceContract } from "@/Components/InsuranceContracts/insuranceContracts";
import classes from "./InsurerNetworkPage.module.css";

const NS: ContentNamespace[] = ["common", "insurerPanel", "insuranceContracts"];

type Place = { _id: string; name?: string; slug?: string; province?: { name?: string }; city?: { name?: string } };
// via "centre": the doctor takes it at an office of a clinic or hospital
// that lists it (the booking quote's rule), not on their own list
type Doctor = {
  _id: string;
  firstName?: string;
  lastName?: string;
  slug?: string;
  mainSpeciality?: { name?: string };
  via?: "doctor" | "centre";
  centre?: string;
};
type Network = { doctors: Doctor[]; clinics: Place[]; hospitals: Place[]; labs: Place[]; pharmacies: Place[] };

const sections: { key: Exclude<keyof Network, "doctors">; title: ContentKey; path: string }[] = [
  { key: "clinics", title: "insNetClinics", path: "/clinic" },
  { key: "hospitals", title: "insNetHospitals", path: "/hospital" },
  { key: "labs", title: "insNetLabs", path: "/paraClinic" },
  { key: "pharmacies", title: "insNetPharmacies", path: "/pharmacy" },
];

// Who accepts this insurer (2026-10): doctors (their own list, or the
// centre of their office) and the centres, labs and pharmacies that list
// it - the same rule as the booking quote and the public page's counts.
const NetworkTab = () => {
  const getContent = useScopedLocale(NS);
  const intlTag = useIntlLocale();
  const num = new Intl.NumberFormat(intlTag);
  const { data, error } = useSWR<Network>(`${API}/insurance/network`, (url: string) =>
    fetcher({ url }).then((res) => res.data),
  );
  const list = <T,>(v: T[] | undefined) => (Array.isArray(v) ? v : []);

  return (
    <HandleLoading data={!!data} error={error}>
      {!!data && (
        <div className={classes.main}>
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
                        {d.via === "centre" && !!d.centre && (
                          <span>{getContent("insNetViaCentre", [d.centre])}</span>
                        )}
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


const CONTRACTS = `${API}/insurance/contract`;

// The insurer's contracts (2026-10): requests from doctors and centres to
// answer, the invitations it sent, the active contracts (end one with a
// reason and a last day) and the history. Like the provider-network desks
// of Bupa / Okadoc partner portals: the insurer decides who is in network.
const ContractsTab = ({ filter, empty, canEdit, invite }: {
  filter: (c: IInsuranceContract) => boolean;
  empty: "icNoRequests" | "icNoActive" | "icNoHistory";
  canEdit: boolean;
  invite?: boolean;
}) => {
  const getContent = useScopedLocale(NS);
  const { setPopup } = usePopup();
  const { data, error, mutate } = useSWR<IInsuranceContract[]>(CONTRACTS, (url: string) =>
    fetcher({ url }).then((res) => asContracts(res?.data)),
  );
  const items = (data || []).filter(filter);
  const incoming = items.filter((c) => c.status === "Pending" && c.initiatedBy === "provider");
  const sent = items.filter((c) => !(c.status === "Pending" && c.initiatedBy === "provider"));
  return (
    <div className={classes.main}>
      {invite && canEdit && (
        <div className={classes.toolbar}>
          <p className={classes.hint}>{getContent("icInsurerHint")}</p>
          <Button onClick={() => setPopup("ContractInvite", <InviteProviderPopup mutate={() => mutate()} />)}>
            {getContent("icInvite")}
          </Button>
        </div>
      )}
      <HandleLoading data={!!data} error={error}>
        {!items.length ? (
          <p className={classes.empty}>{getContent(empty)}</p>
        ) : invite ? (
          <>
            {!!incoming.length && (
              <section className={classes.section}>
                <h2 className={classes.h2}>{getContent("icIncoming")}</h2>
                <ContractList items={incoming} side="insurer" base={CONTRACTS} canEdit={canEdit} mutate={() => mutate()} highlight />
              </section>
            )}
            {!!sent.length && (
              <section className={classes.section}>
                <h2 className={classes.h2}>{getContent("icSent")}</h2>
                <ContractList items={sent} side="insurer" base={CONTRACTS} canEdit={canEdit} mutate={() => mutate()} />
              </section>
            )}
          </>
        ) : (
          <ContractList items={items} side="insurer" base={CONTRACTS} canEdit={canEdit} mutate={() => mutate()} />
        )}
      </HandleLoading>
    </div>
  );
};

const InsurerNetworkPage = () => {
  const getContent = useScopedLocale(NS);
  // a contract decision is the owner's (the backend refuses a secretary)
  const hasAccess = useAcl("insurance");
  const canEdit = hasAccess();
  const intlTag = useIntlLocale();
  const { data } = useSWR<IInsuranceContract[]>(CONTRACTS, (url: string) =>
    fetcher({ url }).then((res) => asContracts(res?.data)),
  );
  const waiting = (data || []).filter((c) => c.status === "Pending" && c.initiatedBy === "provider").length;
  useBreadCrump([
    { title: getContent("dashboard"), target: "/insurancepanel" },
    { title: getContent("insNetwork"), target: "/insurancepanel/network" },
  ]);
  return (
    <div className={classes.main}>
      <h1 className={classes.title}>{getContent("insNetwork")}</h1>
      <ClientTabSystem
        items={[
          {
            id: "Requests",
            title: waiting ? `${getContent("icTabRequests")} (${new Intl.NumberFormat(intlTag).format(waiting)})` : getContent("icTabRequests"),
            content: <ContractsTab filter={(c) => c.status === "Pending"} empty="icNoRequests" canEdit={canEdit} invite />,
          },
          {
            id: "Contracts",
            title: getContent("icTabContracts"),
            content: <ContractsTab filter={(c) => c.status === "Active"} empty="icNoActive" canEdit={canEdit} />,
          },
          { id: "Network", title: getContent("icTabNetwork"), content: <NetworkTab /> },
          {
            id: "History",
            title: getContent("icTabHistory"),
            content: <ContractsTab filter={(c) => c.status !== "Pending" && c.status !== "Active"} empty="icNoHistory" canEdit={false} />,
          },
        ]}
      />
    </div>
  );
};

export default InsurerNetworkPage;
