"use client";

import useSWR from "swr";
import { fetcher } from "@/Components/helpers/fetcher";
import useScopedLocale from "@/Components/Hooks/useScopedLocale";
import usePopup from "@/Components/Hooks/usePopup";
import HandleLoading from "@/Components/Admin/UI/HandleLoading";
import Button from "@/Components/UI/Button";
import { ContentNamespace } from "@/Components/Enums/contentNamespaces";
import { ContentKey } from "@/Components/Enums/contentKeys";
import { asContracts, IInsuranceContract } from "./insuranceContracts";
import ContractList from "./ContractList";
import { RequestContractPopup } from "./ContractPopups";
import classes from "./InsuranceContracts.module.css";

const NS: ContentNamespace[] = ["common", "insuranceContracts"];

// A doctor's, clinic's, hospital's, lab's or pharmacy's insurers (2026-10):
// each one a contract with its status, like the in-network contracts of
// Zocdoc / Practo. Until now the provider ticked insurers on its own; a
// request now waits for the insurer (or Noyan, for an insurer with no
// panel) and only an active contract shows on the public page and in
// booking. The same block in every provider panel.
const ProviderInsurerContracts = ({
  base,
  canEdit = true,
}: {
  // the panel's /insurer-contract endpoint, e.g. `${API}/doctor/insurer-contract`
  base: string;
  canEdit?: boolean;
}) => {
  const getContent = useScopedLocale(NS);
  const { setPopup } = usePopup();
  const { data, error, mutate } = useSWR<IInsuranceContract[]>(base, (url: string) =>
    fetcher({ url }).then((res) => asContracts(res?.data)),
  );
  const list = data || [];
  const groups: { key: string; title: ContentKey; items: IInsuranceContract[]; highlight?: boolean }[] = [
    { key: "pending", title: "icPendingList", items: list.filter((c) => c.status === "Pending"), highlight: true },
    { key: "active", title: "icActiveList", items: list.filter((c) => c.status === "Active") },
    { key: "history", title: "icHistoryList", items: list.filter((c) => c.status !== "Pending" && c.status !== "Active") },
  ];

  return (
    <div className={classes.main}>
      <div className={classes.header}>
        <div className={classes.headText}>
          <h2 className={classes.title}>{getContent("icTitle")}</h2>
          <p className={classes.hint}>{getContent("icProviderHint")}</p>
        </div>
        {canEdit && (
          <Button onClick={() => setPopup("ContractRequest", <RequestContractPopup base={base} mutate={() => mutate()} />)}>
            {getContent("icRequest")}
          </Button>
        )}
      </div>
      <HandleLoading data={!!data} error={error}>
        {!list.length ? (
          <p className={classes.empty}>{getContent("icEmpty")}</p>
        ) : (
          groups
            .filter((g) => g.items.length)
            .map((g) => (
              <section key={g.key} className={classes.section}>
                <h3 className={classes.h3}>{getContent(g.title)}</h3>
                <ContractList
                  items={g.items}
                  side="provider"
                  base={base}
                  canEdit={canEdit}
                  mutate={() => mutate()}
                  highlight={g.highlight && g.items.some((c) => c.initiatedBy === "insurer")}
                />
              </section>
            ))
        )}
      </HandleLoading>
    </div>
  );
};

export default ProviderInsurerContracts;
