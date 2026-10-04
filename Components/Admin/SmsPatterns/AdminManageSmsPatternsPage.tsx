"use client";

import { useState } from "react";
import useSWR from "swr";
import { API } from "@/Components/config";
import { fetcher } from "@/Components/helpers/fetcher";
import { MongoDoc } from "@/Components/Hooks/useUser";
import HandleLoading from "../UI/HandleLoading";
import WithTitle from "../UI/WithTitle";
import CreateForm, { FormRenderer } from "../UI/CreateForm";
import {
  smsAudienceLabels,
  smsAudienceOrder,
  smsPatternCatalog,
  SmsPatternEntry,
  SmsPatternName,
} from "./smsPatternCatalog";
import { ta } from "@/Components/Admin/i18n/adminText";
import ClientTabSystem from "@/Components/UI/ClientTabSystem";
import {
  isLocale,
  Locale,
  localeNames,
  siteDefaultLocale,
} from "@/Components/i18n/locales";
import classes from "./AdminManageSmsPatternsPage.module.css";

// The pattern list (titles, variables, sample texts, audience) lives in
// ./smsPatternCatalog.ts, mirrored from the backend's event lists.

// Mirrors backend Models/SmsPatterns.ts - the IPPanel pattern codes used by
// Lib/sendSms.ts's sendSmsRaw (its `code: pattern` field). Field keys are
// the same-named env vars each one defaults from. Routers/autoRouter.ts
// registers this model with `singleton: true`, so GET/POST both hit
// `${API}/auto/smsPatterns`.
export type ISmsPatterns = MongoDoc & {
  singleton: "SINGLETON";
} & Record<SmsPatternName, string>;

// What to put in IPPanel for one pattern: its variables and a sample text
// to copy (written in the panel's language, the base pattern's language).
const PatternHint = ({ entry }: { entry: SmsPatternEntry }) => {
  const [copied, setCopied] = useState(false);
  const sample = entry.sample();
  const copy = async () => {
    try {
      if (navigator.clipboard) await navigator.clipboard.writeText(sample);
      else {
        const area = document.createElement("textarea");
        area.value = sample;
        document.body.appendChild(area);
        area.select();
        document.execCommand("copy");
        document.body.removeChild(area);
      }
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      setCopied(false);
    }
  };
  return (
    <div className={classes.pattern}>
      <div className={classes.variables}>
        <span className={classes.caption}>{ta("متغیرها:")}</span>
        {entry.variables.length ? (
          entry.variables.map((name) => (
            <code key={name} className={classes.variable} dir="ltr">
              %{name}%
            </code>
          ))
        ) : (
          <span className={classes.caption}>{ta("بدون متغیر")}</span>
        )}
      </div>
      <div className={classes.sampleRow}>
        <p className={classes.sample}>{sample}</p>
        <button type="button" className={classes.copy} onClick={copy}>
          {copied ? ta("کپی شد") : ta("کپی متن نمونه")}
        </button>
      </div>
    </div>
  );
};

// One text field per pattern, grouped by who receives it (patients,
// providers, staff, general) - CreateForm shows the groups as tabs.
const patternFormRenderer = {} as FormRenderer<ISmsPatterns>;
for (const audience of smsAudienceOrder)
  for (const entry of smsPatternCatalog.filter((e) => e.audience === audience))
    (patternFormRenderer as Record<string, unknown>)[entry.name] = {
      get title() {
        return ta("پترن پیامک - ${1}", [entry.label()]);
      },
      get section() {
        return smsAudienceLabels[entry.audience];
      },
      type: "text",
      ltr: true,
      hint: <PatternHint entry={entry} />,
    };

const PatternsGuide = () => (
  <p className={classes.hint}>
    {ta("برای هر رویداد یک پترن در پنل IPPanel با متن نمونه‌ی زیر آن بسازید و کدش را اینجا وارد کنید. نام متغیرها باید دقیقاً همان باشد (مثلاً %amount%). برای لینک، نشانی سایت را با شناسه بنویسید، مثلاً https://نشانی-سایت/dashboard/booking/%reservationId%. فیلد خالی یعنی برای آن رویداد پیامکی فرستاده نمی‌شود و فقط اعلان داخل سایت می‌رود.")}
  </p>
);

type LocalizedPatterns = Partial<
  Record<SmsPatternName, Partial<Record<Locale, string>>>
>;

// One language's own pattern codes. A gateway pattern is fixed text, so a
// language needs its own pattern on the provider's panel; an empty field
// sends the base pattern (backend Lib/sendSms.ts). Saving replaces the
// whole map with this language's fields merged in.
const LocalizedPatternsForm = ({
  locale,
  localized,
  onSaved,
}: {
  locale: Locale;
  localized: LocalizedPatterns;
  onSaved: () => unknown;
}) => {
  const names = Object.keys(patternFormRenderer) as SmsPatternName[];
  const defaultValue = Object.fromEntries(
    names.map((name) => [name, localized[name]?.[locale] || ""]),
  ) as unknown as ISmsPatterns;
  return (
    <div className={classes.localized}>
      <p className={classes.hint}>
        {ta("برای هر پیامک، یک پترن با متن «${1}» در پنل IPPanel بسازید و کدش را اینجا وارد کنید. فیلد خالی یعنی برای این زبان همان پترن پایه ارسال می‌شود. زبان گیرنده همان زبانی است که آخرین بار در سایت استفاده کرده؛ هشدارهای ادمین به زبان پیش‌فرض سایت هستند.", [localeNames[locale]])}
      </p>
      <CreateForm<ISmsPatterns>
        defaultValue={defaultValue}
        hookProps={{
          path: `${API}/admin/sms/localizedPatterns`,
          method: "POST",
          parser: "JSON",
          mutator: (input) => {
            const next: LocalizedPatterns = JSON.parse(JSON.stringify(localized));
            for (const [name, code] of Object.entries(input)) {
              const key = name as SmsPatternName;
              next[key] = { ...(next[key] || {}), [locale]: String(code ?? "").trim() };
            }
            return { localized: next };
          },
          successCb: () => onSaved(),
        }}
        renderer={patternFormRenderer}
      />
    </div>
  );
};

const AdminManageSmsPatternsPage = () => {
  const { data, error, mutate } = useSWR<ISmsPatterns>(
    `${API}/auto/smsPatterns`,
    (url: string) => fetcher({ url }).then((res) => res.data.data),
  );
  const localizedSWR = useSWR<LocalizedPatterns>(
    `${API}/admin/sms/localizedPatterns`,
    (url: string) =>
      fetcher({ url }).then((res) => res?.data?.localized || {}),
  );
  const localesSWR = useSWR<{ enabled?: string[]; default?: string }>(
    `${API}/public/locales`,
    (url: string) => fetcher({ url }).then((res) => res?.data),
  );
  const siteDefault = isLocale(localesSWR.data?.default)
    ? localesSWR.data.default
    : siteDefaultLocale();
  const otherLocales = (
    Array.isArray(localesSWR.data?.enabled) ? localesSWR.data.enabled : []
  )
    .filter(isLocale)
    .filter((code) => code !== siteDefault);
  const localized =
    localizedSWR.data && typeof localizedSWR.data === "object"
      ? localizedSWR.data
      : {};

  return (
    <HandleLoading data={!!data} error={error}>
      {!!data && (
        <WithTitle title={ta("پترن‌های پیامک")}>
          <ClientTabSystem
            keepMounted
            items={[
              {
                id: "base",
                title: ta("پترن پایه (${1})", [localeNames[siteDefault]]),
                content: (
                  <div className={classes.localized}>
                    <PatternsGuide />
                    <CreateForm<ISmsPatterns>
                      defaultValue={data}
                      hookProps={{
                        path: `${API}/auto/smsPatterns`,
                        method: "POST",
                        successCb: () => mutate(),
                      }}
                      renderer={patternFormRenderer}
                    />
                  </div>
                ),
              },
              ...otherLocales.map((code) => ({
                id: code,
                title: localeNames[code],
                content: localizedSWR.data ? (
                  <LocalizedPatternsForm
                    locale={code}
                    localized={localized}
                    onSaved={() => localizedSWR.mutate()}
                  />
                ) : null,
              })),
            ]}
          />
        </WithTitle>
      )}
    </HandleLoading>
  );
};

export default AdminManageSmsPatternsPage;
