"use client";

import { useEffect, useState } from "react";
import { API } from "@/Components/config";
import { fetcher } from "@/Components/helpers/fetcher";
import useNotification from "@/Components/Hooks/useNotification";
import usePopup from "@/Components/Hooks/usePopup";
import PopupCard from "@/Components/UI/PopupCard";
import HandleLoading from "@/Components/Admin/UI/HandleLoading";
import classes from "../Accounting.module.css";
import inv from "./Inventory.module.css";
import { asArray, useBizFormat } from "../bizShared";
import { InvContext, InvSupplier, useInv, useInvSuppliers, useInvText } from "./invShared";

// New supplier or edit: a drug distributor (پخش), a kit dealer, a supplies
// shop. Also opened from the purchase form, so a purchase never waits on
// "go define the supplier first".
export const SupplierForm = ({
  supplier,
  onDone,
}: {
  supplier?: InvSupplier;
  onDone: (s: InvSupplier) => unknown;
}) => {
  const t = useInvText();
  const { api } = useInv();
  const popup = usePopup();
  // keyed: from the purchase form it must close only itself
  const closePopup = () => popup.closePopup("InvSupplierForm");
  const pushNotification = useNotification();
  const [name, setName] = useState(supplier?.name || "");
  const [phone, setPhone] = useState(supplier?.phone || "");
  const [economicCode, setEconomicCode] = useState(supplier?.economicCode || "");
  const [address, setAddress] = useState(supplier?.address || "");
  const [note, setNote] = useState(supplier?.note || "");
  const [isActive, setIsActive] = useState(supplier?.isActive ?? true);
  const [busy, setBusy] = useState(false);

  const save = async () => {
    if (busy) return;
    setBusy(true);
    try {
      const res = await fetcher({
        url: supplier ? `${API}${api}/suppliers/${supplier._id}` : `${API}${api}/suppliers`,
        method: supplier ? "PATCH" : "POST",
        payload: {
          name: name.trim(),
          phone: phone.trim() || undefined,
          economicCode: economicCode.trim() || undefined,
          address: address.trim() || undefined,
          note: note.trim() || undefined,
          ...(supplier ? { isActive } : {}),
        },
      });
      pushNotification(t("bizSaved"), "Success");
      closePopup();
      onDone(res.data as InvSupplier);
    } catch (err) {
      pushNotification((err as Error)?.message || String(err), "Error");
      setBusy(false);
    }
  };

  return (
    <PopupCard title={supplier ? supplier.name : t("invAddSupplier")}>
      <div className={classes.popup}>
        <div className={classes.form}>
          <label className={`${classes.field} ${classes.wide}`}>
            {t("invSupplierName")}
            <input value={name} onChange={(e) => setName(e.target.value)} maxLength={200} />
          </label>
          <label className={classes.field}>
            {t("phone")}
            <input value={phone} onChange={(e) => setPhone(e.target.value)} maxLength={30} dir="ltr" inputMode="tel" />
          </label>
          <label className={classes.field}>
            {t("invEconomicCode")}
            <input value={economicCode} onChange={(e) => setEconomicCode(e.target.value)} maxLength={30} dir="ltr" inputMode="numeric" />
          </label>
          <label className={`${classes.field} ${classes.wide}`}>
            {t("address")}
            <input value={address} onChange={(e) => setAddress(e.target.value)} maxLength={500} />
          </label>
          <label className={`${classes.field} ${classes.wide}`}>
            {t("bizDescription")}
            <textarea value={note} onChange={(e) => setNote(e.target.value)} maxLength={500} />
          </label>
          {!!supplier && (
            <label className={`${inv.check} ${classes.wide}`}>
              <input type="checkbox" checked={isActive} onChange={(e) => setIsActive(e.target.checked)} />
              {t("invActive")}
            </label>
          )}
        </div>
        <div className={classes.actions}>
          <button type="button" className={classes.ghost} onClick={closePopup}>
            {t("bizCancel")}
          </button>
          <button type="button" className={classes.primary} disabled={busy || name.trim().length < 2} onClick={save}>
            {t("bizSave")}
          </button>
        </div>
      </div>
    </PopupCard>
  );
};

const InventorySuppliers = ({ refreshKey, onChanged }: { refreshKey: number; onChanged: () => unknown }) => {
  const t = useInvText();
  const f = useBizFormat();
  const ctx = useInv();
  const { setPopup } = usePopup();
  const { data, error, mutate } = useInvSuppliers();
  useEffect(() => {
    mutate();
  }, [refreshKey, mutate]);
  const changed = () => {
    mutate();
    onChanged();
  };
  const open = (s?: InvSupplier) =>
    ctx.canWrite &&
    setPopup(
      "InvSupplierForm",
      <InvContext.Provider value={ctx}>
        <SupplierForm supplier={s} onDone={changed} />
      </InvContext.Provider>,
    );
  const rows = asArray<InvSupplier>(data);
  return (
    <section className={classes.card}>
      <div className={classes.cardHead}>
        <span className={classes.cardTitle}>{t("invTabSuppliers")}</span>
        {ctx.canWrite && (
          <button type="button" className={classes.primary} onClick={() => open()}>
            {t("invAddSupplier")}
          </button>
        )}
      </div>
      <HandleLoading data={!!data} error={error}>
        {!!data &&
          (rows.length === 0 ? (
            <p className={classes.empty}>{t("invNoSuppliers")}</p>
          ) : (
            <div className={classes.tableWrap}>
              <table className={classes.table}>
                <thead>
                  <tr>
                    <th>{t("invSupplierName")}</th>
                    <th>{t("phone")}</th>
                    <th className={classes.num}>{t("invPurchasesCount")}</th>
                    <th className={classes.num}>{t("invGrand")}</th>
                    <th className={classes.num}>{t("invPaid")}</th>
                    <th className={classes.num}>{t("invDue")}</th>
                  </tr>
                </thead>
                <tbody>
                  {rows.map((s) => (
                    <tr
                      key={s._id}
                      className={`${ctx.canWrite ? classes.rowLink : ""} ${s.isActive ? "" : inv.inactive}`}
                      tabIndex={ctx.canWrite ? 0 : undefined}
                      onClick={() => open(s)}
                      onKeyDown={(e) => e.key === "Enter" && open(s)}
                    >
                      <td className={classes.wrap}>{s.name}</td>
                      <td dir="ltr" className={inv.start}>
                        {s.phone || "—"}
                      </td>
                      <td className={classes.num}>{f.money(s.count)}</td>
                      <td className={classes.num}>{f.money(s.total)}</td>
                      <td className={classes.num}>{f.money(s.paid)}</td>
                      <td className={`${classes.num} ${s.due > 0 ? classes.negative : ""}`}>{f.money(s.due)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ))}
      </HandleLoading>
    </section>
  );
};

export default InventorySuppliers;
