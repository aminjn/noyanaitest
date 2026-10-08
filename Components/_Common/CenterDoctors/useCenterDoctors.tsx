"use client";

import useSWR from "swr";
import { useState } from "react";
import { API } from "@/Components/config";
import { fetcher } from "@/Components/helpers/fetcher";
import useNotification from "@/Components/Hooks/useNotification";

export type CenterKind = "clinic" | "hospital";

type Doc = {
  _id: string;
  firstName?: string;
  lastName?: string;
  slug?: string;
  mainSpeciality?: { name?: string } | string | null;
};
export type CenterDepartment = {
  _id: string;
  name?: string;
  summary?: string;
  phone?: string;
  active?: boolean;
  order?: number;
};
// the doctor's share of the insurers' payments to the centre (2026-10):
// agreed, a proposal waiting for the doctor, the doctor's last "no"
export type InsurerSplit = {
  doctorPercent?: number;
  agreedAt?: string;
  proposal?: { doctorPercent?: number; at?: string } | null;
  declined?: { doctorPercent?: number; at?: string } | null;
};
export type CenterMember = {
  _id: string;
  doctor: Doc;
  department?: { _id: string; name?: string } | string | null;
  insurerSplit?: InsurerSplit | null;
};
const pct = (v: unknown, fallback: number | null) => {
  const n = Number(v);
  return v == null || v === "" || !Number.isFinite(n) ? fallback : Math.min(100, Math.max(0, n));
};
// none on the membership = 100% (the rule before the split existed)
export const agreedPercent = (s?: InsurerSplit | null) => pct(s?.doctorPercent, 100) as number;
export const proposedPercent = (s?: InsurerSplit | null) => (s?.proposal ? pct(s.proposal.doctorPercent, null) : null);
export const declinedPercent = (s?: InsurerSplit | null) => (s?.declined ? pct(s.declined.doctorPercent, null) : null);
export const memberDepartmentId = (m: CenterMember) =>
  m.department && typeof m.department === "object" ? m.department._id : m.department || "";
export type CenterRequest = { _id: string; doctor: Doc; message?: string; submittedAt?: string };

export const doctorName = (d?: Doc | null) => [d?.firstName, d?.lastName].filter(Boolean).join(" ") || "—";
export const doctorSpec = (d?: Doc | null) =>
  d?.mainSpeciality && typeof d.mainSpeciality === "object" ? d.mainSpeciality.name || "" : "";

// GET /<center>/doctor - members + pending join requests (both directions)
const useCenterDoctors = (kind: CenterKind) => {
  const pushNotification = useNotification();
  const [busy, setBusy] = useState<string | null>(null);
  const { data, error, mutate } = useSWR<{
    members?: CenterMember[];
    incoming?: CenterRequest[];
    outgoing?: CenterRequest[];
    departments?: CenterDepartment[];
  }>(`${API}/${kind}/doctor`, (url: string) => fetcher({ url }).then((res) => res.data));

  // true when the change went through (a popup closes only then)
  const run = async (id: string, args: Parameters<typeof fetcher>[0]) => {
    setBusy(id);
    try {
      await fetcher(args);
      await mutate();
      return true;
    } catch (e) {
      pushNotification(e instanceof Error ? e.message : String(e), "Error");
      return false;
    } finally {
      setBusy(null);
    }
  };

  return {
    data,
    error,
    busy,
    members: Array.isArray(data?.members) ? data.members : [],
    incoming: Array.isArray(data?.incoming) ? data.incoming : [],
    outgoing: Array.isArray(data?.outgoing) ? data.outgoing : [],
    answer: (id: string, status: "Approved" | "Rejected", reason?: string) =>
      run(id, {
        url: `${API}/${kind}/doctor/request/${id}`,
        method: "POST",
        bodyParser: "JSON",
        payload: { status, ...(reason ? { reason } : {}) },
      }),
    departments: Array.isArray(data?.departments) ? data.departments : [],
    refresh: () => mutate(),
    remove: (id: string) => run(id, { url: `${API}/${kind}/doctor/${id}`, method: "DELETE" }),
    // the centre takes back an invite the doctor has not answered
    withdraw: (id: string) => run(id, { url: `${API}/${kind}/doctor/invite/${id}`, method: "DELETE" }),
    // which department a member works in ("" = none)
    setDepartment: (id: string, department: string) =>
      run(id, {
        url: `${API}/${kind}/doctor/${id}`,
        method: "PATCH",
        bodyParser: "JSON",
        payload: { department: department || null },
      }),
    saveDepartment: (id: string | null, payload: Partial<Omit<CenterDepartment, "_id">>) =>
      run(id || "new-department", {
        url: id ? `${API}/${kind}/department/${id}` : `${API}/${kind}/department`,
        method: id ? "PATCH" : "POST",
        bodyParser: "JSON",
        payload,
      }),
    // the centre proposes the doctor's percentage (the doctor accepts it)
    proposeSplit: (id: string, doctorPercent: number) =>
      run(id, {
        url: `${API}/${kind}/doctor/${id}/split`,
        method: "PUT",
        bodyParser: "JSON",
        payload: { doctorPercent },
      }),
    withdrawSplit: (id: string) => run(id, { url: `${API}/${kind}/doctor/${id}/split`, method: "DELETE" }),
    removeDepartment: (id: string) =>
      run(id, { url: `${API}/${kind}/department/${id}`, method: "DELETE" }),
  };
};

export default useCenterDoctors;
