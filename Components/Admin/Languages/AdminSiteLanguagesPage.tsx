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
  isLocale,
  Locale,
  localeDir,
  localeNames,
  locales,
} from "@/Components/i18n/locales";

// Super admin "Site languages" (2026-09): switch each of the 15 languages
// on or off. A language that's off disappears from the language menu and
// its URLs redirect to the Persian page (middleware reads the list, cached
// for a minute). Persian is the source language and always stays on.
const AdminSiteLanguagesPage = () => {
  const pushNotification = useNotification();
  const { data, error, mutate } = useSWR<{ enabled?: unknown } | null>(
    `${API}/public/locales`,
    // GET /public/locales answers { message, data: { enabled, default } }
    (url: string) => fetcher({ url }).then((res) => res?.data),
  );
  const [enabled, setEnabled] = useState<Locale[] | null>(null);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    // null / malformed answer -> treat as "nothing saved yet": all on
    if (data === undefined || enabled) return;
    const list = Array.isArray(data?.enabled)
      ? data.enabled.filter(isLocale)
      : [...locales];
    setEnabled(list.includes(defaultLocale) ? list : [defaultLocale, ...list]);
  }, [data, enabled]);

  const saved = Array.isArray(data?.enabled) ? data.enabled : [...locales];
  const dirty =
    !!enabled &&
    (enabled.length !== saved.length ||
      enabled.some((code) => !saved.includes(code)));

  const toggle = (code: Locale) =>
    setEnabled((prev) =>
      !prev || code === defaultLocale
        ? prev
        : prev.includes(code)
          ? prev.filter((el) => el !== code)
          : [...prev, code],
    );

  const save = async () => {
    if (!enabled) return;
    setSaving(true);
    try {
      await fetcher({
        url: `${API}/admin/locales`,
        method: "PATCH",
        payload: { enabled },
      });
      await mutate();
      pushNotification(
        "ذخیره شد. تغییر تا حداکثر یک دقیقه روی سایت اعمال می‌شود.",
        "Success",
      );
    } catch (e) {
      pushNotification(e instanceof Error ? e.message : String(e), "Error");
    } finally {
      setSaving(false);
    }
  };

  return (
    <HandleLoading data={!!enabled} error={error}>
      {enabled && (
        <WithTitle title="زبان‌های سایت">
          <p className={classes.intro}>
            زبان‌هایی که خاموش باشند از منوی انتخاب زبان حذف می‌شوند و آدرس‌هایشان
            به نسخه‌ی فارسی هدایت می‌شود. فارسی زبان اصلی سایت است و همیشه روشن
            می‌ماند. متن‌های هر زبان از «متن‌های رابط کاربری» و «ترجمه محتوا»
            ویرایش می‌شوند.
          </p>
          <div className={classes.summary}>
            {`${enabled.length.toLocaleString("fa-IR")} زبان از ${locales.length.toLocaleString("fa-IR")} زبان روشن است`}
          </div>
          <ul className={classes.grid}>
            {locales.map((code) => {
              const on = enabled.includes(code);
              const locked = code === defaultLocale;
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
                        <span className={classes.tag}>راست‌به‌چپ</span>
                      )}
                      {locked && <span className={classes.tag}>زبان اصلی</span>}
                    </span>
                  </label>
                </li>
              );
            })}
          </ul>
          <div className={classes.actions}>
            <Button
              onClick={() => {
                if (dirty) save();
              }}
              isLoading={saving}
              variant={dirty ? undefined : "Disable"}
            >
              ذخیره
            </Button>
          </div>
        </WithTitle>
      )}
    </HandleLoading>
  );
};

export default AdminSiteLanguagesPage;
