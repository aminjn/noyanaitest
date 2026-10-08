"use client";

import { useEffect, useState } from "react";
import useSWR from "swr";
import classes from "./Sampling.module.css";
import { API } from "@/Components/config";
import { fetcher } from "@/Components/helpers/fetcher";
import useScopedLocale from "@/Components/Hooks/useScopedLocale";
import useNotification from "@/Components/Hooks/useNotification";
import useAcl from "@/Components/Hooks/useAcl";
import { ContentNamespace } from "@/Components/Enums/contentNamespaces";
import { ContentKey } from "@/Components/Enums/contentKeys";
import HandleLoading from "@/Components/Admin/UI/HandleLoading";
import WithTitle from "@/Components/Admin/UI/WithTitle";
import Button from "@/Components/UI/Button";
import Input from "@/Components/UI/Input";
import ToggleInput from "@/Components/UI/ToggleInput";
import TimePicker from "@/Components/UI/TimePicker";
import DateInput from "@/Components/UI/DateInput";
import NodesSelector from "@/Components/UI/NodesSelector";
import Ixon from "@/Components/UI/Ixon";
import XMarkIcon from "@/Components/Icons/XMarkIcon";
import { useIntlLocale, useListSeparator } from "@/Components/i18n/navigation";
import { tehranTodayYmd, tehranYmd } from "@/Components/helpers/tehranTime";
import {
  addressCityLabel,
  IAddressCity,
} from "@/Components/Dashboard/Address/DashboardManageAddressesPage";
import useSamplingFormat from "@/Components/LabSampling/useSamplingFormat";
import { SamplingHours, SamplingSettings } from "@/Components/LabSampling/samplingTypes";
import { t2xsRegular, tsmDemiBold, tsmRegular } from "@/Components/UI/Typography";

const NS: ContentNamespace[] = ["common", "labSampling"];

// shift days 0 = Saturday ... 6 = Friday (backend DoctorShift / sampling)
const DAYS = [0, 1, 2, 3, 4, 5, 6];

type Draft = Omit<SamplingSettings, "home" | "labCity"> & {
  home: Omit<SamplingSettings["home"], "cities"> & { cities: string[] };
};

const idsOf = (list: unknown): string[] =>
  (Array.isArray(list) ? list : [])
    .map((c) => (c && typeof c === "object" ? (c as { _id?: string })._id : c))
    .filter((c): c is string => typeof c === "string" && !!c);

const toDraft = (s: SamplingSettings): Draft => ({
  enabled: !!s.enabled,
  hours: Array.isArray(s.hours) ? s.hours : [],
  slotMinutes: Number(s.slotMinutes) || 15,
  capacity: Number(s.capacity) || 1,
  closedDays: Array.isArray(s.closedDays) ? s.closedDays : [],
  horizonDays: Number(s.horizonDays) || 14,
  leadMinutes: Number(s.leadMinutes) || 0,
  home: {
    enabled: !!s.home?.enabled,
    fee: Number(s.home?.fee) || 0,
    cities: idsOf(s.home?.cities),
    windowMinutes: Number(s.home?.windowMinutes) || 120,
    capacity: Number(s.home?.capacity) || 1,
  },
});

const intOf = (value: string, fallback: number) => {
  const n = Number(
    value
      .replace(/[۰-۹]/g, (d) => String("۰۱۲۳۴۵۶۷۸۹".indexOf(d)))
      .replace(/[٠-٩]/g, (d) => String("٠١٢٣٤٥٦٧٨٩".indexOf(d)))
      .replace(/[^\d]/g, ""),
  );
  return Number.isFinite(n) ? n : fallback;
};

// The lab's sampling schedule (backend Models/ParaClinicSamplingSettings.ts):
// weekly opening ranges cut into slots of a set length, each taking several
// patients; closed days; and home sampling with its fee, cities and visit
// windows. Saved as a whole.
const SamplingSettingsTab = () => {
  const getContent = useScopedLocale(NS);
  const t = (key: string, args?: string[]) => getContent(key as ContentKey, args);
  const fmt = useSamplingFormat();
  const intl = useIntlLocale();
  const listSep = useListSeparator();
  const notify = useNotification();
  const hasAccess = useAcl("paraClinic");
  const canMutate = hasAccess("mutateOrders");
  const { data, error, mutate } = useSWR<SamplingSettings>(
    `${API}/paraClinic/sampling/settings`,
    (url: string) => fetcher({ url }).then((res) => res.data),
  );
  const [draft, setDraft] = useState<Draft | null>(null);
  const [saving, setSaving] = useState(false);
  const [pickedDay, setPickedDay] = useState<string | null>(null);

  useEffect(() => {
    if (data && !draft) setDraft(toDraft(data));
  }, [data, draft]);

  const set = (patch: Partial<Draft>) => setDraft((prev) => (prev ? { ...prev, ...patch } : prev));
  const setHome = (patch: Partial<Draft["home"]>) =>
    setDraft((prev) => (prev ? { ...prev, home: { ...prev.home, ...patch } } : prev));
  const setRange = (index: number, patch: Partial<SamplingHours>) =>
    setDraft((prev) =>
      prev ? { ...prev, hours: prev.hours.map((h, i) => (i === index ? { ...h, ...patch } : h)) } : prev,
    );

  const save = async () => {
    if (!draft || saving) return;
    setSaving(true);
    try {
      await fetcher({ url: `${API}/paraClinic/sampling/settings`, method: "POST", payload: draft });
      notify(t("lsSaved"), "Success");
      const fresh = await mutate();
      if (fresh) setDraft(toDraft(fresh));
    } catch (err) {
      notify((err as Error)?.message || "", "Error");
    } finally {
      setSaving(false);
    }
  };

  const slotsPerWeek = draft
    ? draft.hours.reduce(
        (sum, h) => sum + Math.max(0, Math.floor((h.end - h.start) / Math.max(5, draft.slotMinutes))),
        0,
      )
    : 0;
  const number = new Intl.NumberFormat(intl);

  return (
    <WithTitle title={t("lsSettings")}>
      <HandleLoading data={!!draft} error={error}>
        {!!draft && (
          <div className={classes.stack}>
            <ToggleInput
              title={t("lsEnabled")}
              value={draft.enabled}
              readOnly={!canMutate}
              onChange={() => set({ enabled: !draft.enabled })}
            />
            <span className={`${classes.muted} ${t2xsRegular}`}>{t("lsEnabledHint")}</span>

            <div className={classes.section}>
              <span className={`${classes.sectionTitle} ${tsmDemiBold}`}>{t("lsWeeklyHours")}</span>
              <div className={classes.week}>
                {DAYS.map((day) => {
                  const ranges = draft.hours
                    .map((h, index) => ({ ...h, index }))
                    .filter((h) => h.day === day);
                  return (
                    <div key={day} className={classes.dayRow}>
                      <span className={`${classes.dayName} ${tsmRegular}`}>{fmt.weekday(day)}</span>
                      <div className={classes.ranges}>
                        {!ranges.length && (
                          <span className={`${classes.muted} ${t2xsRegular}`}>{t("lsClosedDay")}</span>
                        )}
                        {ranges.map((h) => (
                          <div key={h.index} className={classes.range}>
                            <TimePicker
                              prefix={t("lsFrom")}
                              value={h.start}
                              onChange={(v) => setRange(h.index, { start: typeof v === "number" ? v : h.start })}
                            />
                            <TimePicker
                              prefix={t("lsTo")}
                              value={h.end}
                              onChange={(v) => setRange(h.index, { end: typeof v === "number" ? v : h.end })}
                            />
                            {canMutate && (
                              <Button
                                size="S"
                                mode="Outline"
                                variant="Error"
                                radius="Medium"
                                onClick={() => set({ hours: draft.hours.filter((_, i) => i !== h.index) })}
                              >
                                {t("lsRemove")}
                              </Button>
                            )}
                          </div>
                        ))}
                        {canMutate && (
                          <span>
                            <Button
                              size="S"
                              mode="Outline"
                              radius="Medium"
                              onClick={() => {
                                const last = ranges[ranges.length - 1];
                                const start = last ? Math.min(last.end, 23 * 60) : 7 * 60;
                                set({
                                  hours: [...draft.hours, { day, start, end: Math.min(start + 180, 24 * 60) }],
                                });
                              }}
                            >
                              {t("lsAddRange")}
                            </Button>
                          </span>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
              <div className={classes.grid}>
                <Input
                  type="number"
                  inputMode="numeric"
                  title={t("lsSlotMinutes")}
                  defaultValue={String(draft.slotMinutes)}
                  readOnly={!canMutate}
                  onChange={(e) => set({ slotMinutes: intOf(e.target.value, draft.slotMinutes) })}
                />
                <Input
                  type="number"
                  inputMode="numeric"
                  title={t("lsCapacity")}
                  defaultValue={String(draft.capacity)}
                  readOnly={!canMutate}
                  onChange={(e) => set({ capacity: intOf(e.target.value, draft.capacity) })}
                />
                <Input
                  type="number"
                  inputMode="numeric"
                  title={t("lsHorizon")}
                  defaultValue={String(draft.horizonDays)}
                  readOnly={!canMutate}
                  onChange={(e) => set({ horizonDays: intOf(e.target.value, draft.horizonDays) })}
                />
                <Input
                  type="number"
                  inputMode="numeric"
                  title={t("lsLead")}
                  defaultValue={String(draft.leadMinutes)}
                  readOnly={!canMutate}
                  onChange={(e) => set({ leadMinutes: intOf(e.target.value, draft.leadMinutes) })}
                />
              </div>
              <span className={`${classes.muted} ${t2xsRegular}`}>
                {t("lsSlotsPreview", [number.format(slotsPerWeek), number.format(draft.capacity)])}
              </span>
            </div>

            <div className={classes.section}>
              <span className={`${classes.sectionTitle} ${tsmDemiBold}`}>{t("lsClosedDays")}</span>
              <div className={classes.closedDays}>
                {draft.closedDays.map((ymd) => (
                  <button
                    key={ymd}
                    type="button"
                    className={`${classes.closedChip} ${t2xsRegular}`}
                    title={t("lsRemove")}
                    disabled={!canMutate}
                    onClick={() => set({ closedDays: draft.closedDays.filter((d) => d !== ymd) })}
                  >
                    <span>{fmt.day(ymd)}</span>
                    {canMutate && (
                      <Ixon width="0.75rem">
                        <XMarkIcon />
                      </Ixon>
                    )}
                  </button>
                ))}
              </div>
              {canMutate && (
                <div className={classes.range}>
                  <DateInput
                    key={draft.closedDays.join(",")}
                    title={t("lsAddClosedDay")}
                    onChange={(d) => setPickedDay(tehranYmd(d))}
                  />
                  <Button
                    size="S"
                    mode="Outline"
                    radius="Medium"
                    onClick={() => {
                      if (!pickedDay || pickedDay < tehranTodayYmd()) return;
                      if (!draft.closedDays.includes(pickedDay))
                        set({ closedDays: [...draft.closedDays, pickedDay].sort() });
                      setPickedDay(null);
                    }}
                  >
                    {t("lsAddClosedDay")}
                  </Button>
                </div>
              )}
            </div>

            <div className={classes.section}>
              <span className={`${classes.sectionTitle} ${tsmDemiBold}`}>{t("lsHomeSection")}</span>
              <ToggleInput
                title={t("lsHomeEnabled")}
                value={draft.home.enabled}
                readOnly={!canMutate}
                onChange={() => setHome({ enabled: !draft.home.enabled })}
              />
              {draft.home.enabled && (
                <div className={classes.stack}>
                  <div className={classes.grid}>
                    <Input
                      type="number"
                      inputMode="numeric"
                      price
                      title={t("lsHomeFee")}
                      defaultValue={String(draft.home.fee)}
                      readOnly={!canMutate}
                      onChange={(e) => setHome({ fee: intOf(e.target.value, draft.home.fee) })}
                    />
                    <Input
                      type="number"
                      inputMode="numeric"
                      title={t("lsHomeWindow")}
                      defaultValue={String(draft.home.windowMinutes)}
                      readOnly={!canMutate}
                      onChange={(e) => setHome({ windowMinutes: intOf(e.target.value, draft.home.windowMinutes) })}
                    />
                    <Input
                      type="number"
                      inputMode="numeric"
                      title={t("lsHomeCapacity")}
                      defaultValue={String(draft.home.capacity)}
                      readOnly={!canMutate}
                      onChange={(e) => setHome({ capacity: intOf(e.target.value, draft.home.capacity) })}
                    />
                  </div>
                  <NodesSelector<true>
                    title={t("lsHomeCities")}
                    path={`${API}/public/search/city`}
                    multi
                    readOnly={!canMutate}
                    defaultValue={draft.home.cities}
                    getOptionLabel={(node) =>
                      addressCityLabel(node as IAddressCity, listSep) || (node as IAddressCity)._id
                    }
                    getOptionValue={(node) => (node as IAddressCity)._id}
                    dataParser={(res) => {
                      const list = (res as { data?: unknown })?.data;
                      return Array.isArray(list) ? list : [];
                    }}
                    onChange={(ids) => setHome({ cities: Array.isArray(ids) ? ids : [] })}
                  />
                  <span className={`${classes.muted} ${t2xsRegular}`}>
                    {data?.labCity?.name
                      ? `${t("lsHomeCitiesHint")} (${data.labCity.name})`
                      : t("lsHomeCitiesHint")}
                  </span>
                </div>
              )}
            </div>

            {canMutate && (
              <div className={classes.save}>
                <Button size="M" radius="Medium" isLoading={saving} onClick={save}>
                  {t("lsSave")}
                </Button>
              </div>
            )}
          </div>
        )}
      </HandleLoading>
    </WithTitle>
  );
};

export default SamplingSettingsTab;
