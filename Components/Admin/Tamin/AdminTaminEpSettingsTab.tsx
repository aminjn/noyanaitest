"use client";

import useSWR from "swr";
import { API } from "@/Components/config";
import { fetcher } from "@/Components/helpers/fetcher";
import HandleLoading from "../UI/HandleLoading";
import WithTitle from "../UI/WithTitle";
import CreateForm from "../UI/CreateForm";
import Box from "../UI/Box";
import Badge from "@/Components/UI/Badge";
import { adminIntlTag, ta } from "@/Components/Admin/i18n/adminText";
import classes from "../AppConfig/AdminMapSettings.module.css";

// «اتصال نسخه‌نویسی پزشک» tab of «تامین اجتماعی» (2026-10): the client id
// and redirect address of the doctor e-prescription login (backend
// Lib/taminEp.ts, GET/POST /admin/tamin/ep-settings, super admin only). The
// environment (production | test) is TAMIN_EP_ENV in the server's .env.

type Source = "appConfig" | "env" | "siteBaseUrl" | "default" | "none";

type EpSettings = {
  environment: "production" | "test";
  clientId: string;
  clientIdSource: Source;
  redirectUri: string;
  redirectUriSource: Source;
  authorizeUrl: string;
  tokenUrl: string;
  taminEpClientId: string;
  taminEpRedirectUri: string;
  siteBaseUrl: string;
  connectedDoctors: number;
};

type EpSettingsInput = { taminEpClientId: string; taminEpRedirectUri: string };

const sourceLabel = (source: Source) =>
  ({
    get appConfig() {
      return ta("همین صفحه");
    },
    get env() {
      return ta("فایل ‎.env سرور");
    },
    get siteBaseUrl() {
      return ta("نشانی سایت (siteBaseUrl)");
    },
    get default() {
      return ta("پیش‌فرض محیط آزمایشی");
    },
    get none() {
      return ta("تنظیم نشده");
    },
  })[source] ?? source;

const Stat = ({ label, value, ltr }: { label: string; value: string; ltr?: boolean }) => (
  <div className={classes.stat}>
    <dt>{label}</dt>
    <dd className={ltr ? classes.ltr : undefined}>{value}</dd>
  </div>
);

const AdminTaminEpSettingsTab = () => {
  const { data, error, mutate } = useSWR<EpSettings>(
    `${API}/admin/tamin/ep-settings`,
    (url: string) => fetcher({ url }).then((res) => res.data),
  );
  const ready = !!data?.clientId && !!data?.redirectUri;

  return (
    <HandleLoading data={!!data} error={error}>
      {!!data && (
        <div className={classes.stack}>
          <WithTitle title={ta("اتصال نسخه‌نویسی پزشک به تامین")}>
            <p className={classes.note}>
              {ta("پزشکان با حساب تامین خود وارد می‌شوند و نسخه‌ها مستقیم در سامانه‌ی نسخه‌نویسی الکترونیک تامین ثبت می‌شود. شناسه‌ی کلاینت را تامین می‌دهد و نشانی بازگشت باید دقیقاً همانی باشد که نزد تامین ثبت شده است (https و بدون پارامتر). خالی گذاشتن هر فیلد یعنی استفاده از فایل ‎.env سرور.")}
            </p>
            <CreateForm<EpSettingsInput>
              key={`${data.taminEpClientId}|${data.taminEpRedirectUri}`}
              layout="flat"
              defaultValue={{
                taminEpClientId: data.taminEpClientId || "",
                taminEpRedirectUri: data.taminEpRedirectUri || "",
              }}
              hookProps={{
                path: `${API}/admin/tamin/ep-settings`,
                method: "POST",
                parser: "JSON",
                successCb: () => mutate(),
              }}
              renderer={{
                taminEpClientId: { title: ta("شناسه‌ی کلاینت (client_id)"), type: "text", ltr: true },
                // empty: the site address + /doctorpanel/tamin (shown below)
                taminEpRedirectUri: { title: ta("نشانی بازگشت (redirect_uri)"), type: "text", ltr: true },
              }}
            />
          </WithTitle>
          <Box className={classes.box}>
            <div className={classes.row}>
              <h3 className={classes.sectionTitle}>{ta("وضعیت فعلی")}</h3>
              <Badge color={data.environment === "production" ? "Success" : "Warning"} size="L">
                {data.environment === "production" ? ta("محیط اصلی تامین") : ta("محیط آزمایشی تامین")}
              </Badge>
              <Badge color={ready ? "Success" : "Error"} size="L">
                {ready ? ta("آماده") : ta("تنظیم نشده")}
              </Badge>
            </div>
            <dl className={classes.stats}>
              <Stat label={ta("شناسه‌ی کلاینت")} value={data.clientId || "—"} ltr />
              <Stat label={ta("منبع شناسه‌ی کلاینت")} value={sourceLabel(data.clientIdSource)} />
              <Stat label={ta("نشانی بازگشت")} value={data.redirectUri || "—"} ltr />
              <Stat label={ta("منبع نشانی بازگشت")} value={sourceLabel(data.redirectUriSource)} />
              <Stat label={ta("صفحه‌ی ورود تامین")} value={data.authorizeUrl} ltr />
              <Stat
                label={ta("پزشکان متصل")}
                value={Number(data.connectedDoctors || 0).toLocaleString(adminIntlTag())}
              />
            </dl>
            <p className={classes.note}>
              {ta("محیط (اصلی یا آزمایشی) با متغیر TAMIN_EP_ENV در فایل ‎.env سرور تعیین می‌شود. نشانی بازگشت بالا را عیناً به تامین بدهید تا برای این سایت ثبت کند.")}
            </p>
          </Box>
        </div>
      )}
    </HandleLoading>
  );
};

export default AdminTaminEpSettingsTab;
