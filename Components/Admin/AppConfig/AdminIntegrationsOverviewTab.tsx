"use client";

import useSWR from "swr";
import { API } from "@/Components/config";
import { fetcher } from "@/Components/helpers/fetcher";
import { adminPath } from "@/Components/helpers/adminPath";
import Box from "../UI/Box";
import Badge from "@/Components/UI/Badge";
import InlineLink from "../UI/InlineLink";
import WithTitle from "../UI/WithTitle";
import { ta } from "@/Components/Admin/i18n/adminText";
import classes from "./AdminMapSettings.module.css";

// «سرویس‌ها و کلیدها»: the first tab of the system settings (2026-10). Every
// outside service the site connects to, whether it is connected, and the
// one place its keys are entered - so "where do I put the API key?" has one
// answer. Each card only reads; the link opens the tab that edits it.

type State = "on" | "off" | "partial";

const Card = ({ title, state, detail, href }: { title: string; state: State; detail: string; href: string }) => (
  <Box className={classes.box}>
    <div className={classes.row}>
      <strong>{title}</strong>
      <Badge color={state === "on" ? "Success" : state === "partial" ? "Warning" : "Disabled"} size="L">
        {state === "on" ? ta("تنظیم‌شده") : state === "partial" ? ta("نیمه‌کاره") : ta("تنظیم نشده")}
      </Badge>
    </div>
    <p className={classes.note}>{detail}</p>
    <InlineLink href={adminPath(href)}>{ta("تنظیم و کلیدها")}</InlineLink>
  </Box>
);

const get = (url: string) => fetcher({ url }).then((res) => res.data);
const opts = { shouldRetryOnError: false };

const AdminIntegrationsOverviewTab = () => {
  const { data: sms } = useSWR<{ effective?: { tokenSource?: string } }>(`${API}/admin/sms/settings`, get, opts);
  const { data: map } = useSWR<{ nexamapEnabled?: boolean; apiKeySet?: boolean; apiKeyFromEnv?: boolean }>(
    `${API}/admin/map/settings`,
    get,
    opts,
  );
  const { data: ai } = useSWR<{ status?: Record<string, { on?: boolean }> }>(`${API}/admin/ai/settings`, get, opts);
  const { data: config } = useSWR<Record<string, unknown>>(
    `${API}/auto/appConfig`,
    (url: string) => fetcher({ url }).then((res) => res.data.data),
    opts,
  );

  const filled = (k: string) => !!String(config?.[k] ?? "").trim();
  const smsOn = !!sms?.effective?.tokenSource && sms.effective.tokenSource !== "none";
  const mapKey = !!(map?.apiKeySet || map?.apiKeyFromEnv);
  const aiOn = Object.values(ai?.status || {}).filter((s) => s?.on).length;
  const identityKeys = [
    "getIdentityInfoApiKey",
    "matchNationalIdAndPhoneNumberApiKey",
    "getMedicalSystemCodeApiKey",
    "getMcCertificateApiKey",
    "podiumToken",
  ].filter(filled).length;

  return (
    <WithTitle title={ta("سرویس‌ها و کلیدها")}>
      <p className={classes.note}>
        {ta("همه‌ی سرویس‌های بیرونی سایت و اینکه تنظیم شده‌اند یا نه. کلید هر سرویس فقط در تب خودش وارد می‌شود و روی سرور می‌ماند؛ «آزمایش اتصال» هم همان‌جاست.")}
      </p>
      <div className={classes.cards}>
        <Card
          title={ta("پیامک (آی‌پی‌پنل)")}
          state={smsOn ? "on" : "off"}
          detail={ta("کد ورود، یادآوری نوبت و همه‌ی پیامک‌ها.")}
          href="/appConfig?tab=sms"
        />
        <Card
          title={ta("نقشه (نکسا مپ)")}
          state={map?.nexamapEnabled && mapKey ? "on" : mapKey || map?.nexamapEnabled ? "partial" : "off"}
          detail={ta("نقشه‌ها، جست‌وجوی نشانی و مسیر.")}
          href="/appConfig?tab=map"
        />
        <Card
          title={ta("هوش مصنوعی")}
          state={aiOn >= 3 ? "on" : aiOn ? "partial" : "off"}
          detail={ta("ترجمه‌ی خودکار، دستیار بالینی، گفتار به متن و دستیار گفتگو.")}
          href="/appConfig?tab=ai"
        />
        <Card
          title={ta("پرداخت آنلاین (سامان)")}
          state={config?.sepEnabled ? "on" : filled("sepTerminalId") ? "partial" : "off"}
          detail={ta("درگاه پرداخت نوبت، داروخانه و پلن‌ها.")}
          href="/financeSettings?tab=payments"
        />
        <Card
          title={ta("استعلام هویت و نظام پزشکی")}
          state={identityKeys >= 5 ? "on" : identityKeys ? "partial" : "off"}
          detail={ta("تطبیق کد ملی و موبایل، کد نظام پزشکی و گواهی پزشک.")}
          href="/appConfig?tab=general"
        />
        <Card
          title={ta("تماس تلفنی (SIP)")}
          state={filled("sipHost") && filled("sipUsername") ? "on" : filled("sipHost") ? "partial" : "off"}
          detail={ta("تماس صوتی بیمار و پزشک.")}
          href="/appConfig?tab=general"
        />
      </div>
    </WithTitle>
  );
};

export default AdminIntegrationsOverviewTab;
