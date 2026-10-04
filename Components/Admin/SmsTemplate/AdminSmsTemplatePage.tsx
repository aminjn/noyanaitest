"use client";

import { useState } from "react";
import { useParams } from "next/navigation";
import useSWR from "swr";
import { API } from "@/Components/config";
import { fetcher } from "@/Components/helpers/fetcher";
import Button from "@/Components/UI/Button";
import Box from "../UI/Box";
import useNotification from "@/Components/Hooks/useNotification";
import { ta } from "@/Components/Admin/i18n/adminText";
import HandleLoading from "../UI/HandleLoading";
import WithTitle from "../UI/WithTitle";
import RequestDecisionBanner from "../BecomeRequest/RequestDecisionBanner";
import { requestKindLabel } from "../Requests/requestMeta";
import classes from "../SmsCampaign/AdminSmsCampaignPage.module.css";

// One CRM SMS template in the /requests queue (2026-10, backend
// Models/BizTemplate.ts): who wrote it, its text filled with a sample
// patient (with the tracked link and the «لغو۱۱» opt-out line), and the
// automations that will send it. Approving lets those automations run and
// the provider send it one-off to their own patients; reject tells them why.

type Template = {
  _id: string;
  ownerKind: string;
  ownerName: string;
  name: string;
  text: string;
  preview: string;
  category: string;
  status: string;
  rejectReason?: string;
  submittedAt?: string;
  decidedAt?: string;
  createdAt?: string;
  automations: { _id: string; kind: string; name: string; enabled: boolean }[];
};

const kindLabels: Record<string, () => string> = {
  recall: () => ta("یادآوری پس از ویزیت"),
  thanks: () => ta("تشکر و درخواست نظر"),
  birthday: () => ta("تبریک تولد"),
  noShow: () => ta("پیگیری نوبت ازدست‌رفته"),
  winback: () => ta("بازگرداندن بیمار غایب"),
  chronic: () => ta("پیگیری بیماران مزمن"),
};

const ApproveButton = ({ id, mutate }: { id: string; mutate: () => unknown }) => {
  const [busy, setBusy] = useState(false);
  const pushNotification = useNotification();
  const approve = async () => {
    if (busy) return;
    setBusy(true);
    try {
      await fetcher({ url: `${API}/admin/sms-templates/${id}/approve`, method: "POST" });
      pushNotification(ta("قالب تأیید شد."), "Success");
      await mutate();
    } catch (e) {
      pushNotification(e instanceof Error ? e.message : String(e), "Error");
    } finally {
      setBusy(false);
    }
  };
  return (
    <Button variant="Success" isLoading={busy} onClick={approve}>
      {ta("تأیید قالب")}
    </Button>
  );
};

const AdminSmsTemplatePage = () => {
  const params = useParams<{ nodeId: string }>();
  const id = params?.nodeId ? String(params.nodeId) : "";
  const { data, error, mutate } = useSWR<Template | null>(id ? `${API}/admin/sms-templates/${id}` : null, (url: string) =>
    fetcher({ url }).then((res) => (res?.data && typeof res.data === "object" ? (res.data as Template) : null)),
  );
  const row = (label: string, value: React.ReactNode) => (
    <div className={classes.row}>
      <span className={classes.label}>{label}</span>
      <span className={classes.value}>{value}</span>
    </div>
  );
  const autos = Array.isArray(data?.automations) ? data!.automations : [];
  return (
    <WithTitle title={data ? `${ta("قالب پیامک")} · ${data.name}` : ta("قالب پیامک")}>
      <HandleLoading data={!!data} error={error}>
        {!!data && (
          <div className={classes.main}>
            <RequestDecisionBanner
              group="smsTemplate"
              kind={data.ownerKind}
              nodeId={data._id}
              status={data.status}
              rejectReason={data.rejectReason}
              createdAt={data.submittedAt || data.createdAt}
              decidedAt={data.decidedAt}
              mutate={mutate}
              approve={<ApproveButton id={data._id} mutate={mutate} />}
            />
            <div className={classes.grid}>
              <Box className={classes.box}>
                <span className={classes.title}>{ta("متنی که گیرنده می‌بیند")}</span>
                <pre className={classes.sms} dir="auto">
                  {data.preview}
                </pre>
                <p className={classes.note}>
                  {ta("متغیرها (نام بیمار، نام مرکز، لینک نوبت یا نظر) برای هر گیرنده پر می‌شوند و خط لغو۱۱ خودکار به آخر هر پیامک اضافه می‌شود. متن نباید ادعای درمانی، قیمت دارو یا تبلیغ داروی نسخه‌ای داشته باشد.")}
                </p>
                <span className={classes.title}>{ta("متن قالب")}</span>
                <pre className={classes.sms} dir="auto">
                  {data.text}
                </pre>
              </Box>
              <Box className={classes.box}>
                <span className={classes.title}>{ta("جزئیات")}</span>
                {row(ta("فرستنده"), `${requestKindLabel(data.ownerKind)} · ${data.ownerName || "—"}`)}
                {row(
                  ta("خودکارسازی‌هایی که از آن استفاده می‌کنند"),
                  autos.length ? autos.map((a) => `${kindLabels[a.kind]?.() || a.kind} (${a.name})`).join("، ") : "—",
                )}
                <p className={classes.note}>{ta("پس از تأیید، این قالب فقط برای بیماران خود همین مرکز که پیامک را لغو نکرده‌اند و بین ساعت ۸ تا ۲۱ فرستاده می‌شود. ویرایش متن، قالب را دوباره به صف بررسی برمی‌گرداند.")}</p>
              </Box>
            </div>
          </div>
        )}
      </HandleLoading>
    </WithTitle>
  );
};

export default AdminSmsTemplatePage;
