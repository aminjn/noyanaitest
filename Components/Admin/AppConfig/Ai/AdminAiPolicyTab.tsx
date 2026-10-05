"use client";

import { useMemo, useState } from "react";
import useSWR from "swr";
import { API } from "@/Components/config";
import { fetcher, FetchError } from "@/Components/helpers/fetcher";
import useNotification from "@/Components/Hooks/useNotification";
import { adminPath } from "@/Components/helpers/adminPath";
import { adminIntlTag, ta } from "@/Components/Admin/i18n/adminText";
import Button from "@/Components/UI/Button";
import Badge from "@/Components/UI/Badge";
import Input from "@/Components/UI/Input";
import SelectInput from "@/Components/UI/SelectInput";
import ToggleInput from "@/Components/UI/ToggleInput";
import CheckboxGroupInput from "@/Components/UI/CheckboxGroupInput";
import HandleLoading from "../../UI/HandleLoading";
import WithTitle from "../../UI/WithTitle";
import CreateForm from "../../UI/CreateForm";
import Box from "../../UI/Box";
import InlineLink from "../../UI/InlineLink";
import { doctorDashboardModuleLabels } from "../../BaseDoctorLicense/AdminManageBaseDoctorLicensesPage";
import { clinicDashboardModuleLabels } from "../../BaseClinicLicense/AdminManageBaseClinicLicensesPage";
import { hospitalDashboardModuleLabels } from "../../BaseHospitalLicense/AdminManageBaseHospitalLicensesPage";
import { pharmacyDashboardModuleLabels } from "../../BasePharmacyLicense/AdminManageBasePharmacyLicensesPage";
import { paraClinicDashboardModuleLabels } from "../../BaseParaClinicLicense/AdminManageBaseParaClinicLicensesPage";
import { insuranceDashboardModuleLabels } from "../../BaseInsuranceLicense/AdminManageBaseInsuranceLicensesPage";
import {
  accessOptions,
  AiFeatureDef,
  AiFeaturePolicy,
  AiLimitSet,
  AiPlanRow,
  AiPolicy,
  audienceLabel,
  groupLabel,
  planPath,
  PROVIDER_KINDS,
  unitLabel,
} from "./aiPolicyShared";
import classes from "./AdminAiPolicy.module.css";

// «سیاست هوش مصنوعی» (2026-10, owner decision): one control for every AI
// feature of the platform (backend Lib/ai/aiFeatures.ts registry,
// Lib/ai/aiPolicy.ts, enforced by Lib/ai/aiGate.ts). The master switch and
// the paywall mode first; then each feature: free / only with a plan / off,
// the plan modules (or patient Pro) that unlock it, and its own limits for
// the free and the paid tier - per user per day, per user per month and per
// organisation per month, 0 = unlimited. A plan can also include features
// and its own quotas in the plan editor («پلن‌ها و مجوزها»).
//
// Benchmark: Doctolib sells its AI assistant as an add-on, K Health and Ada
// keep a free tier with limits, Intuit Assist / Canva / Notion give each
// plan its AI credits and limit each feature on its own - NoyanAI does all
// three from here, without a deploy.

type PolicyData = {
  policy: AiPolicy;
  features: AiFeatureDef[];
  modules: Record<string, string[]>;
  plans: AiPlanRow[];
};

const POLICY_PATH = `${API}/admin/ai/policy`;

const MODULE_LABELS: Record<string, Record<string, string>> = {
  doctor: doctorDashboardModuleLabels,
  clinic: clinicDashboardModuleLabels,
  hospital: hospitalDashboardModuleLabels,
  pharmacy: pharmacyDashboardModuleLabels,
  paraClinic: paraClinicDashboardModuleLabels,
  insurance: insuranceDashboardModuleLabels,
};

const GROUPS = ["assistant", "clinical", "crm", "finance", "content"];

const fmt = () => new Intl.NumberFormat(adminIntlTag());

// "20 a day · 300 a month" / "unlimited"
const limitText = (l: AiLimitSet, unit: string, org: boolean) => {
  const n = fmt();
  const parts = [
    l.day ? ta("${1} ${2} در روز", [n.format(l.day), unitLabel(unit)]) : "",
    l.month ? ta("${1} در ماه", [n.format(l.month)]) : "",
    org && l.orgMonth ? ta("${1} برای هر مجموعه در ماه", [n.format(l.orgMonth)]) : "",
  ].filter(Boolean);
  return parts.length ? parts.join(" · ") : ta("نامحدود");
};

const same = (a: unknown, b: unknown) => JSON.stringify(a) === JSON.stringify(b);

const LimitRow = ({
  title,
  value,
  org,
  onChange,
}: {
  title: string;
  value: AiLimitSet;
  org: boolean;
  onChange: (v: AiLimitSet) => void;
}) => {
  const num = (k: keyof AiLimitSet) => (e: { target: { value: string } }) =>
    onChange({ ...value, [k]: Math.max(0, Math.round(Number(e.target.value.replace(/[۰-۹]/g, (d) => String("۰۱۲۳۴۵۶۷۸۹".indexOf(d)))) || 0)) });
  return (
    <fieldset className={classes.limitRow}>
      <legend className={classes.limitTitle}>{title}</legend>
      <Input type="number" min={0} title={ta("هر کاربر در روز")} defaultValue={String(value.day)} onChange={num("day")} />
      <Input type="number" min={0} title={ta("هر کاربر در ماه")} defaultValue={String(value.month)} onChange={num("month")} />
      {org && (
        <Input type="number" min={0} title={ta("هر مجموعه در ماه")} defaultValue={String(value.orgMonth)} onChange={num("orgMonth")} />
      )}
    </fieldset>
  );
};

const FeatureCard = ({
  def,
  saved,
  plans,
  globalOff,
  onSaved,
}: {
  def: AiFeatureDef;
  saved: AiFeaturePolicy;
  plans: AiPlanRow[];
  globalOff: boolean;
  onSaved: () => unknown;
}) => {
  const notify = useNotification();
  const [draft, setDraft] = useState<AiFeaturePolicy>(saved);
  const [busy, setBusy] = useState(false);
  const dirty = !same(draft, saved);
  const kinds = def.audiences.filter((a) => PROVIDER_KINDS.includes(a));
  const patient = def.audiences.includes("patient");
  const org = kinds.length > 0;
  const selling = plans.filter((p) => p.aiFeatures.includes(def.key) || !!p.aiQuotas?.[def.key]);
  const save = async () => {
    if (!dirty || busy) return;
    setBusy(true);
    try {
      await fetcher({ url: POLICY_PATH, method: "POST", payload: { features: { [def.key]: draft } }, bodyParser: "JSON" });
      notify(ta("ذخیره شد"), "Success");
      await onSaved();
    } catch (err) {
      if (err instanceof FetchError) notify(err.message, "Error");
    } finally {
      setBusy(false);
    }
  };
  const off = draft.access === "off";
  return (
    <article className={`${classes.card} ${off || globalOff ? classes.cardOff : ""}`} aria-labelledby={`ai-${def.key}`}>
      <div className={classes.cardHead}>
        <div className={classes.cardText}>
          <strong id={`ai-${def.key}`} className={classes.cardTitle}>
            {ta(def.title)}
          </strong>
          <span className={classes.note}>{ta(def.description)}</span>
          <span className={classes.chips}>
            {def.audiences.map((a) => (
              <Badge key={a} color="Disabled" size="S">
                {audienceLabel(a)}
              </Badge>
            ))}
            <Badge color="Info" size="S">
              {unitLabel(def.unit)}
            </Badge>
          </span>
        </div>
        <div className={classes.access}>
          <SelectInput
            key={`${def.key}-${saved.access}`}
            title={ta("دسترسی")}
            options={accessOptions(def.internal)}
            defaultValue={draft.access}
            onChange={(e) => setDraft((d) => ({ ...d, access: e.target.value as AiFeaturePolicy["access"] }))}
          />
        </div>
      </div>
      {!off && (
        <p className={classes.summary}>
          {def.internal ? (
            <>{ta("سقف: ${1}", [limitText(draft.limits.free, def.unit, false)])}</>
          ) : (
            <>
              {draft.access === "plan" ? ta("بدون پلن: بسته") : ta("رایگان: ${1}", [limitText(draft.limits.free, def.unit, org)])}
              {" · "}
              {ta("با پلن: ${1}", [limitText(draft.limits.paid, def.unit, org)])}
            </>
          )}
        </p>
      )}
      <details className={classes.details}>
        <summary>{ta("قوانین و سقف‌ها")}</summary>
        <div className={classes.detailsBody}>
          {!def.internal && kinds.length > 0 && (
            <div className={classes.block}>
              <span className={classes.blockTitle}>{ta("کدام ماژول پلن آن را باز می‌کند")}</span>
              <span className={classes.note}>
                {ta("دارنده‌ی هر پلنی که یکی از این ماژول‌ها را دارد «با پلن» حساب می‌شود. پلن می‌تواند این قابلیت را مستقیم هم در خودش بگذارد.")}
              </span>
              <div className={classes.moduleGrid}>
                {kinds.map((kind) => (
                  <CheckboxGroupInput
                    key={kind}
                    title={audienceLabel(kind)}
                    options={MODULE_LABELS[kind] || {}}
                    defaultValue={draft.modules[kind] || []}
                    onChange={(list) => setDraft((d) => ({ ...d, modules: { ...d.modules, [kind]: list } }))}
                  />
                ))}
              </div>
            </div>
          )}
          {patient && (
            <ToggleInput
              title={ta("اشتراک پرو کاربران آن را باز می‌کند")}
              value={draft.pro}
              onChange={() => setDraft((d) => ({ ...d, pro: !d.pro }))}
            />
          )}
          {!def.internal && (
            <div className={classes.block}>
              <span className={classes.blockTitle}>{ta("پلن‌هایی که این قابلیت را می‌فروشند")}</span>
              {selling.length ? (
                <span className={classes.chips}>
                  {selling.map((p) => (
                    <InlineLink key={p._id} href={adminPath(planPath(p.kind, p._id))}>
                      {`${audienceLabel(p.kind)}: ${p.displayName || "—"}`}
                    </InlineLink>
                  ))}
                </span>
              ) : (
                <span className={classes.note}>{ta("هیچ پلنی آن را جدا نمی‌فروشد؛ فقط ماژول‌های بالا.")}</span>
              )}
            </div>
          )}
          <div className={classes.block}>
            <span className={classes.blockTitle}>{ta("سقف‌ها (۰ = نامحدود)")}</span>
            <span className={classes.note}>
              {def.unit === "minute"
                ? ta("به دقیقه‌ی صدا. روز و ماه به وقت تهران و تقویم شمسی.")
                : ta("به تعداد درخواست. روز و ماه به وقت تهران و تقویم شمسی.")}
            </span>
            {def.internal ? (
              <LimitRow
                title={ta("بودجه‌ی کل سایت")}
                value={draft.limits.free}
                org={false}
                onChange={(v) => setDraft((d) => ({ ...d, limits: { ...d.limits, free: v } }))}
              />
            ) : (
              <>
                <LimitRow
                  title={ta("بدون پلن (رایگان)")}
                  value={draft.limits.free}
                  org={org}
                  onChange={(v) => setDraft((d) => ({ ...d, limits: { ...d.limits, free: v } }))}
                />
                <LimitRow
                  title={patient && !org ? ta("با پرو") : ta("با پلن")}
                  value={draft.limits.paid}
                  org={org}
                  onChange={(v) => setDraft((d) => ({ ...d, limits: { ...d.limits, paid: v } }))}
                />
              </>
            )}
          </div>
        </div>
      </details>
      <div className={classes.cardActions}>
        <Button size="S" onClick={save} isLoading={busy} variant={dirty ? "Primary" : "Disable"}>
          {ta("ذخیره")}
        </Button>
        {dirty && (
          <Button size="S" mode="Outline" onClick={() => setDraft(saved)}>
            {ta("انصراف")}
          </Button>
        )}
      </div>
    </article>
  );
};

const AdminAiPolicyTab = () => {
  const { data, error, mutate } = useSWR<PolicyData>(POLICY_PATH, (url: string) => fetcher({ url }).then((res) => res.data));
  const [group, setGroup] = useState("all");
  const byGroup = useMemo(() => {
    const list = Array.isArray(data?.features) ? data!.features : [];
    return GROUPS.map((g) => ({ g, list: list.filter((f) => f.group === g) })).filter((x) => x.list.length);
  }, [data]);
  const policy = data?.policy;
  const globalOff = !!policy && (!policy.enabled || policy.mode === "off");

  return (
    <HandleLoading data={!!data} error={error}>
      {!!data && !!policy && (
        <div className={classes.stack}>
          <WithTitle title={ta("سیاست هوش مصنوعی")}>
            <p className={classes.note}>
              {ta("همه‌ی قابلیت‌های هوش مصنوعی سایت در یک جا: رایگان، فقط با پلن یا خاموش، و سقف استفاده‌ی هر کدام. پیش‌فرض‌ها همان قوانین قبلی‌اند؛ تا اینجا را تغییر ندهید برای کسی چیزی عوض نمی‌شود.")}
            </p>
            <CreateForm<{ enabled: boolean; mode: AiPolicy["mode"] }>
              key={`${policy.enabled}|${policy.mode}`}
              layout="flat"
              defaultValue={{ enabled: policy.enabled, mode: policy.mode }}
              hookProps={{ path: POLICY_PATH, method: "POST", parser: "JSON", successCb: () => mutate() }}
              renderer={{
                enabled: {
                  title: ta("هوش مصنوعی در کل سایت روشن است"),
                  type: "bool",
                  hint: ta("خاموش: هیچ قابلیت هوش مصنوعی، حتی ابزارهای داخلی، کار نمی‌کند."),
                },
                mode: {
                  title: ta("حالت فروش"),
                  type: "select",
                  options: {
                    plan: ta("پولی (بر اساس پلن هر قابلیت)"),
                    free: ta("رایگان برای همه (قفل پلن برداشته می‌شود، سقف‌ها می‌مانند)"),
                    off: ta("خاموش برای بیماران و ارائه‌دهندگان"),
                  },
                  hint: ta("در حالت پولی، قابلیتی که «فقط با پلن» است برای کسی که پلنش آن را ندارد قفل می‌شود."),
                },
              }}
            />
          </WithTitle>

          <Box className={classes.box}>
            <div className={classes.toolbar}>
              <h3 className={classes.sectionTitle}>{ta("قابلیت‌ها")}</h3>
              <SelectInput
                title={ta("گروه")}
                defaultValue="all"
                options={{ all: ta("همه"), ...Object.fromEntries(byGroup.map((x) => [x.g, groupLabel(x.g)])) }}
                onChange={(e) => setGroup(e.target.value)}
              />
            </div>
            {globalOff && (
              <p className={classes.warn}>{ta("هوش مصنوعی برای کاربران خاموش است؛ تنظیمات زیر بعد از روشن کردن اعمال می‌شود.")}</p>
            )}
            {byGroup
              .filter((x) => group === "all" || x.g === group)
              .map(({ g, list }) => (
                <section key={g} className={classes.group} aria-label={groupLabel(g)}>
                  <h4 className={classes.groupTitle}>{groupLabel(g)}</h4>
                  <div className={classes.cards}>
                    {list.map((def) =>
                      policy.features[def.key] ? (
                        <FeatureCard
                          key={`${def.key}-${JSON.stringify(policy.features[def.key])}`}
                          def={def}
                          saved={policy.features[def.key]}
                          plans={Array.isArray(data.plans) ? data.plans : []}
                          globalOff={globalOff}
                          onSaved={() => mutate()}
                        />
                      ) : null,
                    )}
                  </div>
                </section>
              ))}
          </Box>
        </div>
      )}
    </HandleLoading>
  );
};

export default AdminAiPolicyTab;
