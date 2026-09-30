"use client";
import { useEffect, useState } from "react";
import useSWR from "swr";
import classes from "./AdminSiteLanguagesPage.module.css";
import { API } from "@/Components/config";
import { fetcher } from "@/Components/helpers/fetcher";
import useNotification from "@/Components/Hooks/useNotification";
import HandleLoading from "../UI/HandleLoading";
import WithTitle from "../UI/WithTitle";
import Button from "@/Components/UI/Button";
import {
  defaultLocale,
  intlLocale,
  isLocale,
  Locale,
  localeDir,
  localeNames,
  locales,
} from "@/Components/i18n/locales";
import { ta } from "@/Components/Admin/i18n/adminText";

// Super admin "Site languages" (2026-09): pick the site's default language
// and switch the others on or off. The default has no URL prefix, is what a
// visitor gets before choosing, and is the language of this super admin
// panel; it can't be switched off. A language that's off disappears from
// the language menu and its URLs redirect to the default one (middleware
// reads the settings, cached for a minute). Content is still written in
// Persian (the source language) and translated from there.
const AdminSiteLanguagesPage = () => {
  const pushNotification = useNotification();
  const { data, error, mutate } = useSWR<{
    enabled?: unknown;
    default?: unknown;
  } | null>(
    `${API}/public/locales`,
    // GET /public/locales answers { message, data: { enabled, default } }
    (url: string) => fetcher({ url }).then((res) => res?.data),
  );
  const [enabled, setEnabled] = useState<Locale[] | null>(null);
  const savedDefault: Locale = isLocale(data?.default) ? data.default : defaultLocale;
  const [def, setDef] = useState<Locale | null>(null);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    // null / malformed answer -> treat as "nothing saved yet": all on
    if (data === undefined || enabled) return;
    const list = Array.isArray(data?.enabled)
      ? data.enabled.filter(isLocale)
      : [...locales];
    setEnabled(list.includes(savedDefault) ? list : [savedDefault, ...list]);
    setDef(savedDefault);
  }, [data, enabled, savedDefault]);

  const current = def || savedDefault;
  const saved = Array.isArray(data?.enabled) ? data.enabled : [...locales];
  const dirty =
    !!enabled &&
    (current !== savedDefault ||
      enabled.length !== saved.length ||
      enabled.some((code) => !saved.includes(code)));

  const toggle = (code: Locale) =>
    setEnabled((prev) =>
      !prev || code === current
        ? prev
        : prev.includes(code)
          ? prev.filter((el) => el !== code)
          : [...prev, code],
    );
  // the default is always served
  const makeDefault = (code: Locale) => {
    setDef(code);
    setEnabled((prev) => (prev && !prev.includes(code) ? [...prev, code] : prev));
  };
  const num = new Intl.NumberFormat(intlLocale[current]);

  const save = async () => {
    if (!enabled) return;
    setSaving(true);
    try {
      await fetcher({
        url: `${API}/admin/locales`,
        method: "PATCH",
        payload: { enabled, default: current },
      });
      await mutate();
      pushNotification(
        ta("ذخیره شد. تغییر تا حداکثر یک دقیقه روی سایت اعمال می‌شود."),
        "Success",
      );
      // a new default changes this panel's language too: reload into it
      if (current !== savedDefault)
        setTimeout(() => window.location.reload(), 1500);
    } catch (e) {
      pushNotification(e instanceof Error ? e.message : String(e), "Error");
    } finally {
      setSaving(false);
    }
  };

  return (
    <HandleLoading data={!!enabled} error={error}>
      {enabled && (
        <WithTitle title={ta("زبان‌های سایت")}>
          <p className={classes.intro}>
            {ta("زبان پیش‌فرض، زبانی است که بازدیدکننده پیش از انتخاب زبان می‌بیند و آدرس‌های بدون پیشوند به آن باز می‌شوند. پنل سوپر ادمین هم همیشه به همین زبان است. زبان‌های دیگر فقط در سایت و پنل‌های کاربران قابل انتخاب هستند. زبانی که خاموش باشد از منوی انتخاب زبان حذف می‌شود و آدرس‌هایش به زبان پیش‌فرض هدایت می‌شود. متن‌های هر زبان از «متن‌های رابط کاربری» و «ترجمه محتوا» ویرایش می‌شوند.")}
          </p>
          <div className={classes.summary}>
            {ta("${1} زبان از ${2} زبان روشن است", [num.format(enabled.length), num.format(locales.length)])}
          </div>
          <ul className={classes.grid}>
            {locales.map((code) => {
              const on = enabled.includes(code);
              const locked = code === current;
              return (
                <li key={code}>
                  <label
                    className={`${classes.item} ${on ? classes.on : ""} ${locked ? classes.locked : ""}`}
                  >
                    <input
                      type="checkbox"
                      checked={on}
                      disabled={locked}
                      onChange={() => toggle(code)}
                    />
                    <span className={classes.name} dir={localeDir(code)}>
                      {localeNames[code]}
                    </span>
                    <span className={classes.meta}>
                      <span className={classes.code}>{code.toUpperCase()}</span>
                      {localeDir(code) === "rtl" && (
                        <span className={classes.tag}>{ta("راست‌به‌چپ")}</span>
                      )}
                      {locked && (
                        <span className={`${classes.tag} ${classes.defaultTag}`}>
                          {ta("زبان پیش‌فرض")}
                        </span>
                      )}
                    </span>
                  </label>
                  {!locked && (
                    <button
                      type="button"
                      className={classes.makeDefault}
                      onClick={() => makeDefault(code)}
                    >
                      {ta("انتخاب به‌عنوان پیش‌فرض")}
                    </button>
                  )}
                </li>
              );
            })}
          </ul>
          {current !== savedDefault && (
            <p className={classes.warn}>
              {ta("با ذخیره، زبان پیش‌فرض سایت و پنل سوپر ادمین «${1}» می‌شود.", [localeNames[current]])}
            </p>
          )}
          <div className={classes.actions}>
            <Button
              onClick={() => {
                if (dirty) save();
              }}
              isLoading={saving}
              variant={dirty ? undefined : "Disable"}
            >
              {ta("ذخیره")}
            </Button>
          </div>
        </WithTitle>
      )}
    </HandleLoading>
  );
};

export default AdminSiteLanguagesPage;
