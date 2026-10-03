"use client";

import { useState } from "react";
import useSWR from "swr";
import { API } from "@/Components/config";
import { fetcher } from "@/Components/helpers/fetcher";
import useNotification from "@/Components/Hooks/useNotification";
import classes from "./Accounting.module.css";
import { asArray, useBiz, useBizText } from "./bizShared";

export type BizCostCenter = { _id: string; name: string; isActive: boolean };

export const useCostCenters = () => {
  const { api } = useBiz();
  return useSWR<BizCostCenter[]>(`${API}${api}/centers`, (url: string) =>
    fetcher({ url }).then((res) => asArray<BizCostCenter>(res.data)),
  );
};

const NEW = "__new";

// The cost centre (مرکز هزینه) of a hand-typed entry, optional. A new one is
// made right here, from the form that needs it - never "define it on another
// page first".
const CostCenterSelect = ({ value, onChange }: { value: string; onChange: (id: string) => void }) => {
  const t = useBizText();
  const { api, canWrite } = useBiz();
  const pushNotification = useNotification();
  const { data, mutate } = useCostCenters();
  const [adding, setAdding] = useState(false);
  const [name, setName] = useState("");
  const [busy, setBusy] = useState(false);
  const centers = asArray<BizCostCenter>(data).filter((c) => c.isActive || c._id === value);

  const add = async () => {
    if (busy || name.trim().length < 2) return;
    setBusy(true);
    try {
      const res = await fetcher({ url: `${API}${api}/centers`, method: "POST", payload: { name: name.trim() } });
      const created = res.data as BizCostCenter;
      await mutate();
      onChange(created?._id || "");
      setAdding(false);
      setName("");
    } catch (err) {
      pushNotification((err as Error)?.message || String(err), "Error");
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className={classes.field}>
      <span>{t("bizCostCenter")}</span>
      {adding ? (
        <div className={classes.inlineAdd}>
          <input value={name} maxLength={80} autoFocus placeholder={t("bizCostCenterName")} onChange={(e) => setName(e.target.value)} onKeyDown={(e) => e.key === "Enter" && add()} />
          <button type="button" className={classes.primary} disabled={busy || name.trim().length < 2} onClick={add}>
            {t("bizAdd")}
          </button>
          <button type="button" className={classes.ghost} onClick={() => setAdding(false)}>
            {t("bizCancel")}
          </button>
        </div>
      ) : (
        <select value={value} onChange={(e) => (e.target.value === NEW ? setAdding(true) : onChange(e.target.value))} aria-label={t("bizCostCenter")}>
          <option value="">{t("bizNoCostCenter")}</option>
          {centers.map((c) => (
            <option key={c._id} value={c._id}>
              {c.name}
            </option>
          ))}
          {canWrite && <option value={NEW}>{t("bizNewCostCenter")}</option>}
        </select>
      )}
    </div>
  );
};

export default CostCenterSelect;
