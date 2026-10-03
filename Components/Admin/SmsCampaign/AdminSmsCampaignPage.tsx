"use client";

import { useState } from "react";
import { useParams } from "next/navigation";
import useSWR from "swr";
import { API } from "@/Components/config";
import { fetcher } from "@/Components/helpers/fetcher";
import Button from "@/Components/UI/Button";
import Box from "../UI/Box";
import useNotification from "@/Components/Hooks/useNotification";
import { adminNumberFormat, ta } from "@/Components/Admin/i18n/adminText";
import HandleLoading from "../UI/HandleLoading";
import WithTitle from "../UI/WithTitle";
import RequestDecisionBanner from "../BecomeRequest/RequestDecisionBanner";
import { requestKindLabel } from "../Requests/requestMeta";
import classes from "./AdminSmsCampaignPage.module.css";

// One SMS campaign in the /requests queue (2026-10, backend Lib/business/
// campaign.ts): who sends it, to how many of their own patients, what it
// costs and the exact text a recipient gets (with the opt-out link). The
// admin clears the text against medical advertising rules - approve sends
// it at the next allowed hour (08:00-21:00), reject tells the provider why.

type Campaign = {
  _id: string;
  ownerKind: string;
  ownerName: string;
  name: string;
  text: string;
  preview: string;
  status: string;
  rejectReason?: string;
  recipients: number;
  parts: number;
  sentCount: number;
  failedCount: number;
  charged: number;
  fromQuota: number;
  fromWallet: number;
  submittedAt?: string;
  decidedAt?: string;
  createdAt?: string;
  audience?: { tags?: string[]; gender?: string; inactiveDays?: number; activeDays?: number; minVisits?: number };
  estimate: null | { recipients: number; parts: number; totalParts: number; fromQuota: number; fromWallet: number; cost: number; affordable: boolean };
};

const num = adminNumberFormat();

const ApproveButton = ({ id, mutate }: { id: string; mutate: () => unknown }) => {
  const [busy, setBusy] = useState(false);
  const pushNotification = useNotification();
  const approve = async () => {
    if (busy) return;
    setBusy(true);
    try {
      await fetcher({ url: `${API}/admin/campaigns/${id}/approve`, method: "POST" });
      pushNotification(ta("کمپین تأیید شد و در ساعت مجاز ارسال می‌شود."), "Success");
      await mutate();
    } catch (e) {
      pushNotification(e instanceof Error ? e.message : String(e), "Error");
    } finally {
      setBusy(false);
    }
  };
  return (
    <Button variant="Success" isLoading={busy} onClick={approve}>
      {ta("تأیید و ارسال")}
    </Button>
  );
};

const AdminSmsCampaignPage = () => {
  const params = useParams<{ nodeId: string }>();
  const id = params?.nodeId ? String(params.nodeId) : "";
  const { data, error, mutate } = useSWR<Campaign | null>(id ? `${API}/admin/campaigns/${id}` : null, (url: string) =>
    fetcher({ url }).then((res) => (res?.data && typeof res.data === "object" ? (res.data as Campaign) : null)),
  );
  const e = data?.estimate;
  const row = (label: string, value: React.ReactNode) => (
    <div className={classes.row}>
      <span className={classes.label}>{label}</span>
      <span className={classes.value}>{value}</span>
    </div>
  );
  const audience = data?.audience;
  const audienceText = audience
    ? [
        audience.tags?.length ? `${ta("برچسب")}: ${audience.tags.join("، ")}` : "",
        audience.gender ? (audience.gender === "female" ? ta("زن") : ta("مرد")) : "",
        audience.inactiveDays ? ta("بی‌مراجعه از ${1} روز پیش", [num.format(audience.inactiveDays)]) : "",
        audience.activeDays ? ta("مراجعه در ${1} روز اخیر", [num.format(audience.activeDays)]) : "",
        audience.minVisits ? ta("دست‌کم ${1} مراجعه یا خرید", [num.format(audience.minVisits)]) : "",
      ]
        .filter(Boolean)
        .join(" · ") || ta("همه‌ی بیماران و مشتریان")
    : "";
  return (
    <WithTitle title={data ? `${ta("کمپین پیامکی")} · ${data.name}` : ta("کمپین پیامکی")}>
      <HandleLoading data={!!data} error={error}>
        {!!data && (
          <div className={classes.main}>
            <RequestDecisionBanner
              group="campaign"
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
                  {ta("لینک لغو به‌طور خودکار به آخر هر پیامک اضافه می‌شود. متن نباید ادعای درمانی، قیمت دارو یا تبلیغ داروی نسخه‌ای داشته باشد.")}
                </p>
              </Box>
              <Box className={classes.box}>
                <span className={classes.title}>{ta("جزئیات")}</span>
                {row(ta("فرستنده"), `${requestKindLabel(data.ownerKind)} · ${data.ownerName || "—"}`)}
                {row(ta("مخاطبان"), audienceText)}
                {row(ta("تعداد گیرنده"), num.format(e?.recipients ?? data.recipients))}
                {row(ta("بخش‌های هر پیامک"), num.format(e?.parts ?? data.parts))}
                {e && row(ta("از سهمیه‌ی پلن / از کیف پول"), `${num.format(e.fromQuota)} / ${num.format(e.fromWallet)}`)}
                {e && row(ta("هزینه از کیف پول (تومان)"), num.format(e.cost))}
                {e && !e.affordable && <p className={classes.warn}>{ta("موجودی کیف پول ارائه‌دهنده برای این کمپین کافی نیست.")}</p>}
                {data.status === "Sent" &&
                  row(ta("ارسال‌شده / ناموفق"), `${num.format(data.sentCount)} / ${num.format(data.failedCount)}`)}
                {data.status === "Sent" && row(ta("هزینه‌ی کسرشده (تومان)"), num.format(data.charged))}
              </Box>
            </div>
          </div>
        )}
      </HandleLoading>
    </WithTitle>
  );
};

export default AdminSmsCampaignPage;
