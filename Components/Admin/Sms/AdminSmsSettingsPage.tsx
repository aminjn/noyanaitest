"use client";

import { useState } from "react";
import useSWR from "swr";
import WithTitle from "../UI/WithTitle";
import Box from "../UI/Box";
import HandleLoading from "../UI/HandleLoading";
import Input from "@/Components/UI/Input";
import Button from "@/Components/UI/Button";
import Badge from "@/Components/UI/Badge";
import Act from "@/Components/UI/Act";
import { API } from "@/Components/config";
import { fetcher } from "@/Components/helpers/fetcher";
import { adminPath } from "@/Components/helpers/adminPath";
import InlineLink from "../UI/InlineLink";
import classes from "./AdminSmsSettingsPage.module.css";
import { adminIntlTag, ta } from "@/Components/Admin/i18n/adminText";

// Super admin: SMS gateway (IPPanel) credentials, set here instead of only
// in the server's .env (which stays the fallback). The token is never shown
// again after saving - only its last 4 characters. Plain Persian strings,
// like the other admin settings pages.

type SmsSettings = {
  fromNumber: string;
  // the advertising line campaign SMS leave from (2026-10)
  marketingFromNumber: string;
  requestUrl: string;
  tokenSet: boolean;
  tokenHint: string;
  effective: {
    tokenSource: "panel" | "env" | "none";
    tokenHint: string;
    fromNumber: string;
    url: string;
  };
  dryRun: boolean;
  updatedAt: string | null;
  updatedBy: { phone?: string; username?: string } | null;
};

const sourceLabel = {
  get panel() {
  return ta("از همین صفحه");
},
  get env() {
  return ta("از فایل ‎.env سرور");
},
  get none() {
  return ta("تنظیم نشده");
},
} as const;

const AdminSmsSettingsPage = () => {
  const { data, error, mutate } = useSWR<SmsSettings>(
    `${API}/admin/sms/settings`,
    (url: string) => fetcher({ url }).then((res) => res.data),
  );
  const [token, setToken] = useState("");
  const [fromNumber, setFromNumber] = useState<string | undefined>();
  const [requestUrl, setRequestUrl] = useState<string | undefined>();
  const [marketingFromNumber, setMarketingFromNumber] = useState<string | undefined>();
  const [save, setSave] = useState<Record<string, unknown> | null>(null);
  const [testPhone, setTestPhone] = useState("");
  const [test, setTest] = useState<Record<string, unknown> | null>(null);

  return (
    <WithTitle title={ta("تنظیمات درگاه پیامک")}>
      <HandleLoading data={!!data} error={error}>
        {!!data && (
          <>
            <Box className={classes.box}>
              <span className={classes.sectionTitle}>{ta("وضعیت فعلی")}</span>
              <div className={classes.checkRow}>
                <span className={classes.checkTitle}>{ta("توکن:")}</span>
                <Badge
                  size="S"
                  radius="High"
                  mode="Fill"
                  color={data.effective.tokenSource === "none" ? "Error" : "Success"}
                >
                  {sourceLabel[data.effective.tokenSource]}
                </Badge>
                {!!data.effective.tokenHint && (
                  <span className={classes.checkValue} dir="ltr">
                    {data.effective.tokenHint}
                  </span>
                )}
              </div>
              <div className={classes.checkRow}>
                <span className={classes.checkTitle}>{ta("شماره فرستنده:")}</span>
                <span className={classes.checkValue} dir="ltr">
                  {data.effective.fromNumber || "—"}
                </span>
              </div>
              <div className={classes.checkRow}>
                <span className={classes.checkTitle}>{ta("آدرس ارسال:")}</span>
                <span className={classes.checkValue} dir="ltr">
                  {data.effective.url}
                </span>
              </div>
              {data.dryRun && (
                <p className={classes.note}>
                  {ta("تا وقتی توکن تنظیم نشده (یا سرور در حالت development است) پیامکی ارسال نمی‌شود و فقط در لاگ سرور ثبت می‌شود.")}
                </p>
              )}
              {!!data.updatedAt && (
                <p className={classes.note}>
                  {ta("آخرین تغییر: ${1}${2}", [new Date(data.updatedAt).toLocaleString(adminIntlTag()), data.updatedBy?.phone ? ` - ${data.updatedBy.phone}` : ""])}
                </p>
              )}
            </Box>

            <Box className={classes.box}>
              <span className={classes.sectionTitle}>{ta("اطلاعات API پیامک")}</span>
              <p className={classes.note}>
                {ta("توکن را از پنل آی‌پی‌پنل (بخش توسعه‌دهندگان / کلید دسترسی) بردارید. کد هر پیامک (پترن) جداگانه در صفحه‌ی")}{" "}
                <InlineLink href={adminPath("/messaging?tab=patterns")}>
                  {ta("پترن‌های پیامک")}
                </InlineLink>{" "}
                {ta("وارد می‌شود.")}
              </p>
              <div className={classes.grid}>
                <Input
                  title={data.tokenSet ? ta("توکن API جدید") : ta("توکن API")}
                  type="password"
                  onChange={(e) => setToken(e.target.value)}
                />
                <Input
                  title={ta("شماره فرستنده (مثلا ‎+983000505)")}
                  defaultValue={data.fromNumber}
                  onChange={(e) => setFromNumber(e.target.value)}
                />
                <Input
                  title={ta("شماره‌ی خط تبلیغاتی برای کمپین‌های پیامکی")}
                  defaultValue={data.marketingFromNumber}
                  onChange={(e) => setMarketingFromNumber(e.target.value)}
                />
                <Input
                  title={ta("آدرس ارسال (خالی = پیش‌فرض آی‌پی‌پنل)")}
                  defaultValue={data.requestUrl}
                  onChange={(e) => setRequestUrl(e.target.value)}
                />
              </div>
              {data.tokenSet && (
                <p className={classes.note}>
                  {ta("توکن ذخیره‌شده: ")}
                  <span dir="ltr">{data.tokenHint}</span>
                  {ta(" - فیلد توکن را خالی بگذارید تا همان بماند.")}
                </p>
              )}
              <div className={classes.actions}>
                <Button
                  isLoading={!!save && !save.clearToken}
                  onClick={() =>
                    setSave({
                      ...(token.trim() && { apiToken: token.trim() }),
                      fromNumber: fromNumber ?? data.fromNumber,
                      requestUrl: requestUrl ?? data.requestUrl,
                      marketingFromNumber: marketingFromNumber ?? data.marketingFromNumber,
                    })
                  }
                >
                  {ta("ذخیره")}
                </Button>
                {data.tokenSet && (
                  <Button
                    variant="Error"
                    mode="Outline"
                    isLoading={!!save?.clearToken}
                    onClick={() => setSave({ clearToken: true })}
                  >
                    {ta("حذف توکن ذخیره‌شده")}
                  </Button>
                )}
              </div>
              <Act
                path={save ? `${API}/admin/sms/settings` : null}
                method="POST"
                payload={save || undefined}
                successMessage={ta("تنظیمات پیامک ذخیره شد")}
                onDone={(status) => {
                  setSave(null);
                  if (status) {
                    setToken("");
                    mutate();
                  }
                }}
              />
            </Box>

            <Box className={classes.box}>
              <span className={classes.sectionTitle}>{ta("پیامک آزمایشی")}</span>
              <p className={classes.note}>
                {ta("پترن کد ورود (OTP_PATTERN) با کد نمونه‌ی 12345 به این شماره فرستاده می‌شود؛ اگر درگاه خطا بدهد، متن خطا همان‌جا نمایش داده می‌شود.")}
              </p>
              <div className={classes.grid}>
                <Input
                  title={ta("شماره موبایل (مثلا 09121234567)")}
                  inputMode="numeric"
                  onChange={(e) => setTestPhone(e.target.value)}
                />
              </div>
              <Button
                className={classes.submit}
                isLoading={!!test}
                onClick={() => testPhone.trim() && setTest({ phone: testPhone.trim() })}
              >
                {ta("ارسال پیامک آزمایشی")}
              </Button>
              <Act
                path={test ? `${API}/admin/sms/test` : null}
                method="POST"
                payload={test || undefined}
                successMessage={
                  data.dryRun
                    ? ta("حالت آزمایشی: پیامک ارسال نشد و فقط در لاگ سرور ثبت شد")
                    : ta("پیامک آزمایشی ارسال شد")
                }
                onDone={() => setTest(null)}
              />
            </Box>
          </>
        )}
      </HandleLoading>
    </WithTitle>
  );
};

export default AdminSmsSettingsPage;
