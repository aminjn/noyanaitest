"use client";

import { useState } from "react";
import useSWR from "swr";
import { API } from "@/Components/config";
import { fetcher } from "@/Components/helpers/fetcher";
import { ta } from "@/Components/Admin/i18n/adminText";
import usePopup from "@/Components/Hooks/usePopup";
import Button from "@/Components/UI/Button";
import HandleLoading from "../UI/HandleLoading";
import WithTitle from "../UI/WithTitle";
import Box from "../UI/Box";
import DataPair from "../UI/DataPair";
import ConfirmationPopup from "../UI/ConfirmationPopup";
import classes from "./AdminCatalogCleanupTab.module.css";

export type CatalogKind = "speciality" | "disease" | "service";

type Row = { id: string; name: string; canonical?: boolean; active?: boolean; doctors?: number };
type Group = { _id: string; target: Row; members: { row: Row; why: string; score: number }[] };
type Suggestion = { _id: string; raw: string; variants?: string[]; doctorCount: number; hint?: string; hintName?: string };
type Merge = { _id: string; targetName: string; sourceNames: string[]; createdAt: string; undoneAt?: string };
type Overview = { total: number; canonical: number; unused: number; archived: number; pending: number };

const whyLabel = (why: string) =>
  ({
    key: ta("همان نام"),
    synonym: ta("نام دیگر"),
    canonical: ta("نزدیک به نام رسمی"),
    similar: ta("نام مشابه"),
  })[why] || why;

const get = <T,>(url: string) => fetcher<{ data: T }>({ url }).then((r) => r.data);

// «ادغام و پاک‌سازی» (2026-10): one tab per catalogue (specialities,
// conditions, services). The duplicate groups with one-click merges, the
// unused entries archived in one go, the names imports could not place,
// and the latest merges to undo. Backend: Services/catalogCleanup.ts.
const AdminCatalogCleanupTab = ({ kind }: { kind: CatalogKind }) => {
  const base = `${API}/admin/catalog/${kind}`;
  const { setPopup, closePopup } = usePopup();
  const [busy, setBusy] = useState<string | null>(null);
  const [notice, setNotice] = useState<{ ok: boolean; text: string } | null>(null);
  const [excluded, setExcluded] = useState<Record<string, boolean>>({});
  const [mapTo, setMapTo] = useState<Record<string, string>>({});

  const overview = useSWR<Overview>(`${base}/overview`, get);
  const groups = useSWR<Group[]>(`${base}/duplicates`, get);
  const suggestions = useSWR<Suggestion[]>(`${base}/suggestions`, get);
  const merges = useSWR<Merge[]>(`${base}/merges`, get);
  const entries = useSWR<Row[]>(`${base}/entries`, get);

  const refresh = () => Promise.all([overview.mutate(), groups.mutate(), suggestions.mutate(), merges.mutate(), entries.mutate()]);

  const run = async (key: string, call: () => Promise<unknown>, ok: string) => {
    if (busy) return;
    setBusy(key);
    setNotice(null);
    try {
      await call();
      setNotice({ ok: true, text: ok });
      await refresh();
    } catch (err) {
      setNotice({ ok: false, text: err instanceof Error ? err.message : ta("انجام نشد") });
    } finally {
      setBusy(null);
    }
  };

  const post = (url: string, payload: Record<string, unknown> = {}) => fetcher({ url, method: "POST", payload });

  const confirm = (message: string, action: () => void) =>
    setPopup(
      "CatalogCleanupConfirm",
      <ConfirmationPopup
        message={message}
        onConfirm={() => {
          closePopup();
          action();
        }}
      />,
    );

  const mergeGroup = (g: Group) => {
    const sources = g.members.filter((m) => !excluded[`${g._id}:${m.row.id}`]).map((m) => m.row.id);
    if (!sources.length) return;
    run(`merge:${g._id}`, () => post(`${base}/merge`, { target: g.target.id, sources }), ta("ادغام شد"));
  };

  const list = Array.isArray(groups.data) ? groups.data : [];
  const pending = Array.isArray(suggestions.data) ? suggestions.data : [];
  const history = Array.isArray(merges.data) ? merges.data : [];
  const o = overview.data;

  return (
    <div className={classes.main}>
      <p className={classes.intro}>
        {ta(
          "تکراری‌ها در یک مورد ادغام می‌شوند: پزشکان و همه‌ی ارجاع‌ها به مقصد منتقل می‌شوند، آدرس قدیمی به صفحه‌ی مقصد می‌رود و نام‌های ادغام‌شده نام دیگرِ مقصد می‌شوند تا ایمپورت بعدی خودش آن‌ها را بشناسد. هر ادغام تا ۳۰ روز برگشت‌پذیر است.",
        )}
      </p>

      {!!o && (
        <div className={classes.stats}>
          <Box className={classes.stat}>
            <DataPair title={ta("فعال")} value={o.total} />
          </Box>
          {kind === "speciality" && (
            <Box className={classes.stat}>
              <DataPair title={ta("فهرست رسمی")} value={o.canonical} />
            </Box>
          )}
          <Box className={classes.stat}>
            <DataPair title={ta("بدون پزشک")} value={o.unused} />
          </Box>
          <Box className={classes.stat}>
            <DataPair title={ta("بایگانی‌شده")} value={o.archived} />
          </Box>
          <Box className={classes.stat}>
            <DataPair title={ta("نام‌های در انتظار")} value={o.pending} />
          </Box>
        </div>
      )}

      <div className={classes.toolbar}>
        {kind === "speciality" && (
          // one button (2026-10): the official list is applied, procedures
          // filed as specialities become services, fellowships fold into
          // their speciality, other wordings and non-fields are merged (Lib/catalog/tidySpecialities.ts
          // in the backend): a preview first, then the confirmation
          <Button
            variant="Primary"
            mode="Outline"
            size="M"
            radius="High"
            isLoading={busy === "tidy"}
            onClick={async () => {
              if (busy) return;
              setBusy("tidy");
              setNotice(null);
              try {
                const preview = (
                  (await post(`${API}/admin/catalog/speciality/tidy`, { dry: true })) as {
                    data?: { steps?: { target: string; sources?: string[]; service?: string }[]; entries?: number };
                  }
                )?.data;
                const steps = Array.isArray(preview?.steps) ? preview.steps : [];
                if (!steps.length) {
                  setNotice({ ok: true, text: ta("موردی برای مرتب‌سازی نیست") });
                  return;
                }
                const lines = steps
                  .slice(0, 30)
                  .map(
                    (st) =>
                      `${(Array.isArray(st.sources) ? st.sources : []).join("، ")} ← ${st.target}${st.service ? ` (${ta("خدمت: ${1}", [st.service])})` : ""}`,
                  )
                  .join(" · ")
                  .concat(steps.length > 30 ? " …" : "");
                confirm(ta("این تغییرات انجام شود؟ ${1} مورد: ${2}. هر ادغام تا ۳۰ روز برگشت‌پذیر است.", [String(preview?.entries || 0), lines]), () =>
                  run("tidy", () => post(`${API}/admin/catalog/speciality/tidy`), ta("تخصص‌ها مرتب شدند")),
                );
              } catch (err) {
                setNotice({ ok: false, text: err instanceof Error ? err.message : ta("انجام نشد") });
              } finally {
                setBusy(null);
              }
            }}
          >
            {ta("مرتب‌سازی تخصص‌ها")}
          </Button>
        )}
        <Button
          variant="Primary"
          mode="Fill"
          size="M"
          radius="High"
          disabled={!list.length}
          isLoading={busy === "all"}
          onClick={() =>
            confirm(ta("همه‌ی ${1} گروه پیشنهادی ادغام شوند؟", [String(list.length)]), () =>
              run("all", () => post(`${base}/merge-all`), ta("همه‌ی گروه‌ها ادغام شدند")),
            )
          }
        >
          {ta("ادغام همه‌ی پیشنهادها")}
        </Button>
        <Button
          variant="Error"
          mode="Outline"
          size="M"
          radius="High"
          disabled={!o?.unused}
          isLoading={busy === "unused"}
          onClick={() =>
            confirm(ta("موارد بدون پزشک و بدون استفاده بایگانی شوند؟ (حذف نمی‌شوند)"), () =>
              run("unused", () => post(`${base}/archive-unused`), ta("موارد بدون استفاده بایگانی شدند")),
            )
          }
        >
          {ta("بایگانی موارد بدون استفاده")}
        </Button>
      </div>

      {!!notice && (
        <p className={notice.ok ? classes.ok : classes.error} role="status">
          {notice.text}
        </p>
      )}

      <WithTitle title={`${ta("گروه‌های تکراری")} (${list.length})`}>
        <HandleLoading data={!!groups.data} error={groups.error}>
          {!list.length ? (
            <p className={classes.empty}>{ta("تکراری‌ای پیدا نشد")}</p>
          ) : (
            <ul className={classes.groups}>
              {list.map((g) => (
                <li key={g._id} className={classes.group}>
                  <div className={classes.groupHead}>
                    <div>
                      <span className={classes.into}>{ta("مقصد")}</span>
                      <strong>{g.target.name}</strong>
                      {g.target.canonical && <span className={classes.badge}>{ta("رسمی")}</span>}
                      <span className={classes.meta}>{ta("${1} پزشک", [String(g.target.doctors || 0)])}</span>
                    </div>
                    <Button
                      variant="Primary"
                      mode="Fill"
                      size="S"
                      radius="High"
                      isLoading={busy === `merge:${g._id}`}
                      onClick={() => mergeGroup(g)}
                    >
                      {ta("ادغام")}
                    </Button>
                  </div>
                  <ul className={classes.members}>
                    {g.members.map((m) => {
                      const key = `${g._id}:${m.row.id}`;
                      return (
                        <li key={key}>
                          <label className={classes.member}>
                            <input
                              type="checkbox"
                              checked={!excluded[key]}
                              onChange={() => setExcluded((p) => ({ ...p, [key]: !p[key] }))}
                            />
                            <span>{m.row.name}</span>
                            <span className={classes.meta}>
                              {whyLabel(m.why)} · {ta("${1} پزشک", [String(m.row.doctors || 0)])}
                            </span>
                          </label>
                        </li>
                      );
                    })}
                  </ul>
                </li>
              ))}
            </ul>
          )}
        </HandleLoading>
      </WithTitle>

      <WithTitle title={`${ta("نام‌های ناشناخته از ایمپورت")} (${pending.length})`}>
        <HandleLoading data={!!suggestions.data} error={suggestions.error}>
          {!pending.length ? (
            <p className={classes.empty}>{ta("نامی در انتظار نیست")}</p>
          ) : (
            <ul className={classes.groups}>
              {pending.map((s) => (
                <li key={s._id} className={classes.suggestion}>
                  <div>
                    <strong>{s.raw}</strong>
                    <span className={classes.meta}>{ta("${1} پزشک", [String(s.doctorCount || 0)])}</span>
                    {!!s.hintName && <span className={classes.meta}>{ta("نزدیک‌ترین: ${1}", [s.hintName])}</span>}
                  </div>
                  <div className={classes.actions}>
                    {!!s.hint && (
                      <Button
                        variant="Primary"
                        mode="Fill"
                        size="S"
                        radius="High"
                        isLoading={busy === `map:${s._id}`}
                        onClick={() =>
                          run(`map:${s._id}`, () => post(`${API}/admin/catalog/suggestions/${s._id}`, { action: "map", target: s.hint }), ta("وصل شد"))
                        }
                      >
                        {ta("وصل به «${1}»", [s.hintName || ""])}
                      </Button>
                    )}
                    <select
                      className={classes.select}
                      aria-label={ta("وصل به مورد دیگر")}
                      value={mapTo[s._id] || ""}
                      onChange={(e) => setMapTo((p) => ({ ...p, [s._id]: e.target.value }))}
                    >
                      <option value="">{ta("وصل به مورد دیگر")}</option>
                      {(Array.isArray(entries.data) ? entries.data : []).map((r) => (
                        <option key={r.id} value={r.id}>
                          {r.canonical ? `${r.name} ✓` : r.name}
                        </option>
                      ))}
                    </select>
                    {!!mapTo[s._id] && (
                      <Button
                        variant="Primary"
                        mode="Outline"
                        size="S"
                        radius="High"
                        onClick={() =>
                          run(`map:${s._id}`, () => post(`${API}/admin/catalog/suggestions/${s._id}`, { action: "map", target: mapTo[s._id] }), ta("وصل شد"))
                        }
                      >
                        {ta("وصل")}
                      </Button>
                    )}
                    <Button
                      variant="Neutral"
                      mode="Outline"
                      size="S"
                      radius="High"
                      onClick={() => run(`create:${s._id}`, () => post(`${API}/admin/catalog/suggestions/${s._id}`, { action: "create" }), ta("ساخته شد"))}
                    >
                      {ta("ساخت مورد تازه")}
                    </Button>
                    <Button
                      variant="Error"
                      mode="Inline"
                      size="S"
                      radius="High"
                      onClick={() => run(`reject:${s._id}`, () => post(`${API}/admin/catalog/suggestions/${s._id}`, { action: "reject" }), ta("رد شد"))}
                    >
                      {ta("رد")}
                    </Button>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </HandleLoading>
      </WithTitle>

      <WithTitle title={ta("ادغام‌های اخیر")}>
        <HandleLoading data={!!merges.data} error={merges.error}>
          {!history.length ? (
            <p className={classes.empty}>{ta("هنوز ادغامی انجام نشده است")}</p>
          ) : (
            <ul className={classes.groups}>
              {history.map((m) => (
                <li key={m._id} className={classes.suggestion}>
                  <div>
                    <strong>{m.targetName}</strong>
                    <span className={classes.meta}>← {m.sourceNames.filter(Boolean).join("، ")}</span>
                  </div>
                  {m.undoneAt ? (
                    <span className={classes.meta}>{ta("برگردانده شد")}</span>
                  ) : (
                    <Button
                      variant="Neutral"
                      mode="Outline"
                      size="S"
                      radius="High"
                      isLoading={busy === `undo:${m._id}`}
                      onClick={() => run(`undo:${m._id}`, () => post(`${API}/admin/catalog/merges/${m._id}/undo`), ta("ادغام برگردانده شد"))}
                    >
                      {ta("برگرداندن")}
                    </Button>
                  )}
                </li>
              ))}
            </ul>
          )}
        </HandleLoading>
      </WithTitle>
    </div>
  );
};

export default AdminCatalogCleanupTab;
