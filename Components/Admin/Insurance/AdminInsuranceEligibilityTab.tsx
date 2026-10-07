"use client";

import { useState } from "react";
import useSWR from "swr";
import { API } from "@/Components/config";
import { fetcher } from "@/Components/helpers/fetcher";
import { ta } from "@/Components/Admin/i18n/adminText";
import useNotification from "@/Components/Hooks/useNotification";
import HandleLoading from "../UI/HandleLoading";
import WithTitle from "../UI/WithTitle";
import Button from "@/Components/UI/Button";
import Input from "@/Components/UI/Input";
import ToggleInput from "@/Components/UI/ToggleInput";
import Ixon from "@/Components/UI/Ixon";
import AlertTriangleIcon from "@/Components/Icons/AlertTriangleIcon";
import classes from "./AdminInsuranceEligibilityTab.module.css";

type ProviderId = "tamin" | "salamat";
type Provider = { id: ProviderId; enabled: boolean; locked: boolean; configured: boolean; sandboxToken: boolean };
type Result = { provider: string; status: string; coverage?: { percent?: number; amount?: number } };

const providerName = (id: ProviderId) => (id === "tamin" ? ta("تأمین اجتماعی") : ta("بیمه‌ی سلامت"));

// what an answer means (backend Lib/insuranceEligibility.ts)
const statusLabel = (s: string) =>
  ({
    verified: ta("اعتبار بیمه تأیید شد"),
    notEligible: ta("بیمه اعتبار این بیمار را تأیید نکرد"),
    off: ta("خاموش"),
    locked: ta("قفل برای کاربران واقعی"),
    notConfigured: ta("پیکربندی نشده"),
    noToken: ta("اتصال به سامانه‌ی تأمین برقرار نیست"),
    notApplicable: ta("برای این بیمه استعلام برخط نیست"),
    error: ta("خطا در ارتباط با سامانه‌ی بیمه"),
  })[s] || s;

// «استعلام برخط بیمه» (2026-10): the live eligibility providers of the
// booking quote, each off until turned on here, and a test with the admin
// sandbox credential. A tab of the insurance hub.
const AdminInsuranceEligibilityTab = () => {
  const notify = useNotification();
  const { data, error, mutate } = useSWR<Provider[]>(`${API}/admin/insurance-eligibility`, (url: string) =>
    fetcher({ url }).then((res) => (Array.isArray(res?.data?.providers) ? res.data.providers : [])),
  );
  const [nid, setNid] = useState("");
  const [testing, setTesting] = useState<ProviderId | null>(null);
  const [results, setResults] = useState<Partial<Record<ProviderId, Result>>>({});

  const toggle = async (p: Provider) => {
    try {
      await fetcher({ url: `${API}/admin/insurance-eligibility`, method: "PUT", bodyParser: "JSON", payload: { [p.id]: !p.enabled } });
      notify(ta("ذخیره شد"), "Success");
      mutate();
    } catch (err) {
      notify((err as Error)?.message || "", "Error");
    }
  };
  const test = async (id: ProviderId) => {
    if (!/^\d{10}$/.test(nid.trim())) return notify(ta("کد ملی ۱۰ رقمی را وارد کنید"), "Error");
    setTesting(id);
    try {
      const res = await fetcher({
        url: `${API}/admin/insurance-eligibility/test`,
        method: "POST",
        bodyParser: "JSON",
        payload: { provider: id, nationalId: nid.trim() },
      });
      setResults((r) => ({ ...r, [id]: res?.data }));
    } catch (err) {
      notify((err as Error)?.message || "", "Error");
    } finally {
      setTesting(null);
    }
  };

  return (
    <HandleLoading data={!!data} error={error}>
      {!!data && (
        <WithTitle
          title={ta("استعلام برخط بیمه")}
          description={ta(
            "هنگام رزرو، اعتبار بیمه‌ی بیمار از سامانه‌ی خود بیمه استعلام می‌شود. اگر پاسخ دهد «اعتبار بیمه تأیید شد» نمایش داده می‌شود و سهمی که بیمه برگرداند جای برآورد تعرفه را می‌گیرد؛ اگر خاموش باشد یا پاسخ ندهد، همان برآورد تعرفه‌های نویان می‌ماند.",
          )}
        >
          <div className={classes.list}>
            {data.map((p) => {
              const r = results[p.id];
              return (
                <section key={p.id} className={classes.card}>
                  <header className={classes.head}>
                    <b>{providerName(p.id)}</b>
                    <span className={`${classes.badge} ${p.enabled && !p.locked && p.configured ? classes.on : ""}`}>
                      {!p.enabled ? ta("خاموش") : p.locked ? ta("روشن، اما قفل برای کاربران واقعی") : !p.configured ? ta("روشن، پیکربندی نشده") : ta("فعال")}
                    </span>
                  </header>
                  <ToggleInput title={ta("استعلام برخط در رزرو")} value={p.enabled} onChange={() => toggle(p)} />
                  {p.locked && (
                    <p className={classes.warn}>
                      <Ixon width="0.9rem">
                        <AlertTriangleIcon />
                      </Ixon>
                      {ta(
                        "اتصال تأمین اجتماعی برای کاربران واقعی موقتاً قفل است (فقط سندباکس). تا این قفل برداشته نشود، استعلام برای بیماران انجام نمی‌شود و رزروها با برآورد تعرفه ادامه می‌دهند؛ آزمون زیر با اعتبار سندباکس ادمین کار می‌کند.",
                      )}
                    </p>
                  )}
                  {p.id === "tamin" && !p.sandboxToken && (
                    <p className={classes.muted}>{ta("توکن سندباکس تأمین ادمین ثبت نشده است؛ از بخش آزمون تأمین وارد شوید.")}</p>
                  )}
                  {!p.configured && (
                    <p className={classes.muted}>
                      {ta("وب‌سرویس استحقاق بیمه‌ی سلامت هنوز پیکربندی نشده است؛ هر استعلام پاسخ «پیکربندی نشده» می‌گیرد.")}
                    </p>
                  )}
                  <div className={classes.test}>
                    <Input
                      title={ta("کد ملی برای آزمون")}
                      inputMode="numeric"
                      defaultValue={nid}
                      onChange={(e) => setNid(e.target.value)}
                    />
                    <Button size="M" mode="Outline" isLoading={testing === p.id} onClick={() => test(p.id)}>
                      {ta("آزمون استعلام")}
                    </Button>
                  </div>
                  {!!r && (
                    <p className={r.status === "verified" ? classes.ok : classes.muted} role="status">
                      {statusLabel(r.status)}
                      {r.coverage?.percent ? ` · ${ta("سهم بیمه: ${1}٪", [r.coverage.percent])}` : ""}
                    </p>
                  )}
                </section>
              );
            })}
          </div>
        </WithTitle>
      )}
    </HandleLoading>
  );
};

export default AdminInsuranceEligibilityTab;
