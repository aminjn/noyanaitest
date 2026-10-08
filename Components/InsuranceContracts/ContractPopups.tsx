"use client";

import PopupCard from "@/Components/UI/PopupCard";
import CreateForm from "@/Components/Admin/UI/CreateForm";
import usePopup from "@/Components/Hooks/usePopup";
import useScopedLocale from "@/Components/Hooks/useScopedLocale";
import { API } from "@/Components/config";
import { ContentNamespace } from "@/Components/Enums/contentNamespaces";
import { ContractProviderKind, contractProviderKinds, providerKindKey } from "./insuranceContracts";

const NS: ContentNamespace[] = ["common", "insuranceContracts"];

const idOf = (v: unknown) =>
  v && typeof v === "object" ? String((v as { _id?: unknown })._id || "") : v ? String(v) : "";

const reasonOk = (v: unknown) => String(v ?? "").trim().length >= 3;

// The forms of the contract steps (2026-10), shared by the provider panels
// and the insurer's: ask an insurer, invite a provider, reject with a
// reason, end with a reason and a last day.

type ContractRequestInput = { insurance: string; validFrom: string; validUntil: string; note: string };

// a provider asks an insurer for a contract
export const RequestContractPopup = ({ base, mutate }: { base: string; mutate: () => unknown }) => {
  const getContent = useScopedLocale(NS);
  const { closePopup } = usePopup();
  return (
    <PopupCard title={getContent("icRequest")}>
      <CreateForm<ContractRequestInput>
        layout="flat"
        renderer={{
          insurance: {
            type: "nodes",
            title: getContent("icInsurer"),
            required: true,
            // every active insurer
            path: `${API}/public/selectinsurance`,
            getOptionLabel: (node) => (node as { name?: string }).name || (node as { _id: string })._id,
            getOptionValue: (node) => (node as { _id: string })._id,
            multi: false,
          },
          validFrom: { type: "date", title: getContent("icFrom") },
          validUntil: { type: "date", title: getContent("icUntil") },
          note: { type: "area", title: getContent("icNote") },
        }}
        onCancel={() => closePopup()}
        hookProps={{
          path: base,
          method: "POST",
          parser: "JSON",
          hasProblem: (inp) => (!idOf(inp.insurance) ? getContent("checkInput") : false),
          mutator: (inp) => ({
            insurance: idOf(inp.insurance),
            ...(inp.validFrom ? { validFrom: inp.validFrom } : {}),
            ...(inp.validUntil ? { validUntil: inp.validUntil } : {}),
            ...(String(inp.note || "").trim() ? { note: String(inp.note).trim() } : {}),
          }),
          successMessage: getContent("icRequestSent"),
          successCb: () => {
            closePopup();
            mutate();
          },
        }}
      />
    </PopupCard>
  );
};

type InviteInput = { kind: ContractProviderKind; provider: string; validFrom: string; validUntil: string; note: string };

// an insurer invites a provider found by name
export const InviteProviderPopup = ({ mutate }: { mutate: () => unknown }) => {
  const getContent = useScopedLocale(NS);
  const { closePopup } = usePopup();
  const kinds = Object.fromEntries(contractProviderKinds.map((k) => [k, getContent(providerKindKey[k])]));
  return (
    <PopupCard title={getContent("icInvite")}>
      <CreateForm<InviteInput>
        layout="flat"
        defaultValue={{ kind: "doctor" } as InviteInput}
        renderer={{
          kind: { type: "select", title: getContent("icProviderKind"), options: kinds, required: true },
          provider: {
            type: "nodes",
            title: getContent("icProvider"),
            required: true,
            hint: getContent("icSearchHint"),
            path: (v) => `${API}/insurance/contract/providers?kind=${encodeURIComponent(String(v.kind || "doctor"))}`,
            search: true,
            getOptionLabel: (node) => {
              const n = node as { name?: string; city?: string; contract?: string | null; _id: string };
              return [n.name || n._id, n.city, n.contract ? getContent("icHasContract") : ""].filter(Boolean).join(" · ");
            },
            getOptionValue: (node) => (node as { _id: string })._id,
            multi: false,
          },
          validFrom: { type: "date", title: getContent("icFrom") },
          validUntil: { type: "date", title: getContent("icUntil") },
          note: { type: "area", title: getContent("icNote") },
        }}
        onCancel={() => closePopup()}
        hookProps={{
          path: `${API}/insurance/contract`,
          method: "POST",
          parser: "JSON",
          hasProblem: (inp) => (!idOf(inp.provider) ? getContent("checkInput") : false),
          mutator: (inp) => ({
            kind: inp.kind || "doctor",
            provider: idOf(inp.provider),
            ...(inp.validFrom ? { validFrom: inp.validFrom } : {}),
            ...(inp.validUntil ? { validUntil: inp.validUntil } : {}),
            ...(String(inp.note || "").trim() ? { note: String(inp.note).trim() } : {}),
          }),
          successMessage: getContent("icInviteSent"),
          successCb: () => {
            closePopup();
            mutate();
          },
        }}
      />
    </PopupCard>
  );
};

// reject a pending request / invitation, with the reason the other side reads
export const RejectContractPopup = ({ url, mutate }: { url: string; mutate: () => unknown }) => {
  const getContent = useScopedLocale(NS);
  const { closePopup } = usePopup();
  return (
    <PopupCard title={getContent("icRejectTitle")}>
      <CreateForm<{ reason: string }>
        layout="flat"
        renderer={{ reason: { type: "area", title: getContent("icReason"), required: true } }}
        onCancel={() => closePopup()}
        hookProps={{
          path: url,
          method: "POST",
          parser: "JSON",
          hasProblem: (inp) => (!reasonOk(inp.reason) ? getContent("icReasonShort") : false),
          successMessage: getContent("icDone"),
          successCb: () => {
            closePopup();
            mutate();
          },
        }}
      />
    </PopupCard>
  );
};

// end an active contract: a reason, and its last day (empty or today: now)
export const EndContractPopup = ({ url, mutate }: { url: string; mutate: () => unknown }) => {
  const getContent = useScopedLocale(NS);
  const { closePopup } = usePopup();
  return (
    <PopupCard title={getContent("icEndTitle")}>
      <CreateForm<{ reason: string; endDate: string }>
        layout="flat"
        renderer={{
          reason: { type: "area", title: getContent("icReason"), required: true },
          endDate: { type: "date", title: getContent("icEndDate"), hint: getContent("icEndDateHint") },
        }}
        onCancel={() => closePopup()}
        hookProps={{
          path: url,
          method: "POST",
          parser: "JSON",
          hasProblem: (inp) => (!reasonOk(inp.reason) ? getContent("icReasonShort") : false),
          mutator: (inp) => ({ reason: String(inp.reason || "").trim(), ...(inp.endDate ? { endDate: inp.endDate } : {}) }),
          successMessage: getContent("icDone"),
          successCb: () => {
            closePopup();
            mutate();
          },
        }}
      />
    </PopupCard>
  );
};
