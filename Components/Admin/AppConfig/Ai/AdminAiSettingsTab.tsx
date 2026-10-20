"use client";

import { useEffect, useMemo, useState } from "react";
import useSWR from "swr";
import { API } from "@/Components/config";
import { fetcher, FetchError } from "@/Components/helpers/fetcher";
import useNotification from "@/Components/Hooks/useNotification";
import HandleLoading from "../../UI/HandleLoading";
import WithTitle from "../../UI/WithTitle";
import Box from "../../UI/Box";
import Button from "@/Components/UI/Button";
import Badge from "@/Components/UI/Badge";
import Input from "@/Components/UI/Input";
import SelectInput from "@/Components/UI/SelectInput";
import AreaInput from "@/Components/UI/AreaInput";
import ToggleInput from "@/Components/UI/ToggleInput";
import { adminIntlTag, ta } from "@/Components/Admin/i18n/adminText";
import AdminManageOllamaPage from "../../Ollama/AdminManageOllamaPage";
import base from "../AdminMapSettings.module.css";
import classes from "./AdminAiSettings.module.css";

// «هوش مصنوعی ← اتصال و مدل‌ها» in the system settings (2026-10): the site's
// one AI connection (Ollama in Iran, an OpenAI-compatible service or
// Anthropic) entered once, its models loaded with one button, then every AI
// feature under it, one after another: its switch, the model it uses and
// the admin's own instruction for it (backend Lib/aiSettings.ts AI_FEATURES,
// GET/POST /admin/ai/settings, POST /admin/ai/models). The key is
// write-only. Who may use which feature, and how much, is the «سیاست هوش
// مصنوعی» tab (AdminAiPolicyTab).
//
// Benchmark: Doctolib's and Practo's AI tools sit on one vendor connection
// with per-feature prompts set by their own teams; here the super admin
// does both, and patient data can stay on an Ollama server inside Iran.

type Kind = "ollama" | "openai" | "anthropic";
type FeatureKey = "translation" | "content" | "clinical" | "finance" | "chat" | "stt";
type FeatureState = { enabled: boolean; model: string; instruction: string; language?: string };
type FeatureView = FeatureState & { on: boolean; runningModel: string; why?: string };

type AiSettings = {
  connection: { kind: Kind; url: string; keySet: boolean; keyPreview?: string; keyFromEnv?: boolean };
  features: Record<FeatureKey, FeatureView>;
  sttUrl: string;
  sttKeySet: boolean;
  sttKeyPreview?: string;
};

type TestResult = { ok: boolean; latencyMs?: number; provider?: string; model?: string; error?: string };

const FEATURE_KEYS: FeatureKey[] = ["translation", "content", "clinical", "finance", "chat", "stt"];

const featureMeta: Record<FeatureKey, { readonly title: string; readonly note: string }> = {
  translation: {
    get title() {
      return ta("ترجمه‌ی خودکار محتوا");
    },
    get note() {
      return ta("ترجمه‌ی متن‌ها، صفحه‌ها و محتوای سایت به همه‌ی زبان‌های فعال");
    },
  },
  content: {
    get title() {
      return ta("محتوای پزشکی و ورود داده");
    },
    get note() {
      return ta("نوشتن و بازبینی بیماری‌ها، داروها و علائم، و جدا کردن نام‌ها در ورود گروهی؛ بدون مدل جدا همان مدل ترجمه");
    },
  },
  clinical: {
    get title() {
      return ta("دستیار بالینی پزشک");
    },
    get note() {
      return ta("دستیار نویان در پنل‌ها، نسخه‌نویس ویزیت، خلاصه‌ی پرونده، پیشنهاد پاسخ گفتگو و متن پیامک (داده‌ی بیمار)");
    },
  },
  finance: {
    get title() {
      return ta("دستیار مالی و حسابداری");
    },
    get note() {
      return ta("سند خودکار، خواندن رسید، تحلیل مالی و فیش حقوقی در بخش مالی پنل‌ها؛ بدون مدل جدا همان مدل دستیار بالینی");
    },
  },
  chat: {
    get title() {
      return ta("دستیار گفتگوی سلامت");
    },
    get note() {
      return ta("گفتگوی بیماران در دستیار سلامت سایت؛ فقط با سرور Ollama");
    },
  },
  stt: {
    get title() {
      return ta("تبدیل گفتار به متن");
    },
    get note() {
      return ta("نسخه‌نویس صوتی ویزیت و ورود صوتی؛ با اتصال سازگار با OpenAI که مدل Whisper دارد");
    },
  },
};

const urlPlaceholder: Record<Kind, string> = {
  ollama: "http://10.0.0.5:11434",
  openai: "https://api.openai.com/v1",
  anthropic: "https://api.anthropic.com",
};

const providerName = (p?: string) =>
  p === "anthropic" ? "Anthropic (Claude)" : p === "openai" ? ta("سازگار با OpenAI") : p === "ollama" ? "Ollama" : p || "";

const FeatureCard = ({
  name,
  view,
  value,
  models,
  modelsKey,
  onChange,
}: {
  name: FeatureKey;
  view: FeatureView;
  value: FeatureState;
  models: string[];
  modelsKey: number;
  onChange: (next: Partial<FeatureState>) => void;
}) => {
  const pushNotification = useNotification();
  const [testing, setTesting] = useState(false);
  const [result, setResult] = useState<TestResult | null>(null);
  const meta = featureMeta[name];
  // the loaded models, plus the one saved (it may not be in the list)
  const options = useMemo(() => {
    const list = Array.from(new Set([...(value.model ? [value.model] : []), ...models]));
    return {
      "": view.runningModel && !value.model ? ta("خودکار (${1})", [view.runningModel]) : ta("خودکار"),
      ...Object.fromEntries(list.map((m) => [m, m])),
    };
  }, [models, value.model, view.runningModel]);

  const test = async () => {
    if (testing) return;
    setTesting(true);
    try {
      const res = await fetcher({ url: `${API}/admin/ai/test`, method: "POST", payload: { feature: name }, bodyParser: "JSON" });
      setResult(res?.data && typeof res.data === "object" ? (res.data as TestResult) : null);
    } catch (err) {
      if (err instanceof FetchError) pushNotification(err.message, "Error");
    } finally {
      setTesting(false);
    }
  };

  return (
    <Box className={classes.card}>
      <div className={classes.cardHead}>
        <div className={classes.cardTitle}>
          <strong>{meta.title}</strong>
          <span className={base.note}>{meta.note}</span>
        </div>
        <ToggleInput title={meta.title} value={value.enabled} onChange={() => onChange({ enabled: !value.enabled })} />
      </div>
      <div className={classes.fields}>
        <SelectInput
          key={`${name}-${modelsKey}`}
          title={name === "stt" ? ta("مدل گفتار به متن") : ta("مدل")}
          options={options}
          defaultValue={value.model}
          onChange={(e) => onChange({ model: e.target.value })}
        />
        {name === "stt" && (
          <Input
            title={ta("زبان گفتار (پیش‌فرض fa)")}
            defaultValue={value.language || ""}
            inputClass={base.ltr}
            onChange={(e) => onChange({ language: e.target.value })}
          />
        )}
      </div>
      {name !== "stt" && (
        <AreaInput
          title={ta("دستورالعمل این بخش (اختیاری)")}
          defaultValue={value.instruction}
          onChange={(e) => onChange({ instruction: e.target.value })}
        />
      )}
      <div className={base.row}>
        <Badge color={view.on ? "Success" : "Disabled"} size="L">
          {view.on ? ta("فعال") : ta("غیرفعال")}
        </Badge>
        {view.on && !!view.runningModel && <span className={`${base.note} ${base.ltr}`}>{view.runningModel}</span>}
        <Button size="S" mode="Outline" onClick={test} isLoading={testing}>
          {ta("آزمایش اتصال")}
        </Button>
      </div>
      {!view.on && !!view.why && (
        <span className={base.error} dir="auto">
          {view.why}
        </span>
      )}
      {!!result && (
        <div className={base.row} aria-live="polite">
          <Badge color={result.ok ? "Success" : "Error"} size="L">
            {result.ok ? ta("اتصال برقرار است") : ta("اتصال ناموفق")}
          </Badge>
          {typeof result.latencyMs === "number" && (
            <span className={base.note}>{ta("${1} میلی‌ثانیه", [result.latencyMs.toLocaleString(adminIntlTag())])}</span>
          )}
          {result.ok && !!result.model && (
            <span className={`${base.note} ${base.ltr}`}>
              {providerName(result.provider)}
              {result.provider ? " · " : ""}
              {result.model}
            </span>
          )}
          {!result.ok && !!result.error && (
            <span className={base.error} dir="auto">
              {result.error}
            </span>
          )}
        </div>
      )}
    </Box>
  );
};

const AiSettingsForm = ({ data, refresh }: { data: AiSettings; refresh: () => unknown }) => {
  const pushNotification = useNotification();
  const [kind, setKind] = useState<Kind>(data.connection.kind || "ollama");
  const [url, setUrl] = useState(data.connection.url || "");
  const [key, setKey] = useState("");
  const [features, setFeatures] = useState<Record<FeatureKey, FeatureState>>(() =>
    Object.fromEntries(
      FEATURE_KEYS.map((f) => {
        const v = data.features?.[f];
        return [f, { enabled: !!v?.enabled, model: v?.model || "", instruction: v?.instruction || "", language: v?.language || "" }];
      }),
    ) as Record<FeatureKey, FeatureState>,
  );
  const [sttUrl, setSttUrl] = useState(data.sttUrl || "");
  const [sttKey, setSttKey] = useState("");
  const [models, setModels] = useState<string[]>([]);
  const [modelsKey, setModelsKey] = useState(0);
  const [loading, setLoading] = useState(false);
  const [loadError, setLoadError] = useState<string>("");
  const [saving, setSaving] = useState(false);

  const loadModels = async () => {
    if (loading) return;
    setLoading(true);
    setLoadError("");
    try {
      const res = await fetcher({
        url: `${API}/admin/ai/models`,
        method: "POST",
        payload: { kind, url: url.trim(), ...(key ? { key } : {}) },
        bodyParser: "JSON",
      });
      const d = res?.data as { ok?: boolean; models?: unknown; error?: string } | undefined;
      const list = Array.isArray(d?.models) ? (d.models as unknown[]).map(String) : [];
      if (!d?.ok) setLoadError(d?.error || ta("اتصال ناموفق"));
      setModels(list);
      setModelsKey((k) => k + 1);
      if (d?.ok && !list.length) setLoadError(ta("هیچ مدلی روی سرور نیست"));
    } catch (err) {
      if (err instanceof FetchError) setLoadError(err.message);
    } finally {
      setLoading(false);
    }
  };

  // the saved connection's models on open
  useEffect(() => {
    if (data.connection.url || data.connection.keySet) loadModels();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const save = async () => {
    if (saving) return;
    setSaving(true);
    try {
      await fetcher({
        url: `${API}/admin/ai/settings`,
        method: "POST",
        bodyParser: "JSON",
        payload: {
          connection: { kind, url: url.trim(), ...(key ? { key } : {}) },
          features,
          sttUrl: sttUrl.trim(),
          ...(sttKey ? { sttKey } : {}),
        },
      });
      setKey("");
      setSttKey("");
      pushNotification(ta("تنظیمات ذخیره شد"), "Success");
      refresh();
    } catch (err) {
      if (err instanceof FetchError) pushNotification(err.message, "Error");
    } finally {
      setSaving(false);
    }
  };

  const setFeature = (f: FeatureKey) => (next: Partial<FeatureState>) =>
    setFeatures((prev) => ({ ...prev, [f]: { ...prev[f], ...next } }));

  return (
    <div className={base.stack}>
      <Box className={classes.card}>
        <h3 className={base.sectionTitle}>{ta("اتصال هوش مصنوعی")}</h3>
        <p className={base.note}>
          {ta("یک بار وصل کنید؛ همه‌ی بخش‌ها از همین اتصال استفاده می‌کنند. بعد «بارگذاری مدل‌ها» را بزنید و برای هر بخش مدل و دستورالعمل آن را انتخاب کنید.")}
        </p>
        <div className={classes.fields}>
          <SelectInput
            title={ta("نوع سرویس")}
            defaultValue={kind}
            options={{
              ollama: ta("Ollama (سرور داخل ایران)"),
              openai: ta("سازگار با OpenAI (OpenAI، OpenRouter، Groq، سرور داخلی و...)"),
              anthropic: "Anthropic (Claude)",
            }}
            onChange={(e) => {
              setKind(e.target.value as Kind);
              setModels([]);
              setModelsKey((k) => k + 1);
            }}
          />
          <Input
            key={`url-${kind}`}
            title={ta("آدرس")}
            defaultValue={url}
            placeholder={urlPlaceholder[kind]}
            inputClass={base.ltr}
            onChange={(e) => setUrl(e.target.value)}
          />
          {kind !== "ollama" && (
            <Input
              title={ta("کلید API")}
              type="password"
              autoComplete="new-password"
              defaultValue=""
              placeholder={data.connection.keySet ? data.connection.keyPreview || "" : ""}
              inputClass={base.ltr}
              onChange={(e) => setKey(e.target.value)}
            />
          )}
        </div>
        {kind !== "ollama" && data.connection.keySet && (
          <p className={base.note}>{ta("کلید ذخیره‌شده می‌ماند مگر کلید تازه وارد کنید.")}</p>
        )}
        {kind !== "ollama" && data.connection.keyFromEnv && (
          <p className={base.note}>{ta("کلیدی اینجا ذخیره نشده و کلید فایل ‎.env سرور استفاده می‌شود.")}</p>
        )}
        <div className={base.row}>
          <Button size="M" mode="Outline" onClick={loadModels} isLoading={loading}>
            {ta("بارگذاری مدل‌ها")}
          </Button>
          {!!models.length && <span className={base.note}>{ta("${1} مدل پیدا شد", [models.length.toLocaleString(adminIntlTag())])}</span>}
          {!!loadError && (
            <span className={base.error} dir="auto">
              {loadError}
            </span>
          )}
        </div>
      </Box>

      {FEATURE_KEYS.map((f) => (
        <FeatureCard
          key={f}
          name={f}
          view={data.features?.[f] || { enabled: false, model: "", instruction: "", on: false, runningModel: "" }}
          value={features[f]}
          models={models}
          modelsKey={modelsKey}
          onChange={setFeature(f)}
        />
      ))}

      <details className={classes.advanced}>
        <summary>{ta("سرور جدای گفتار به متن (اختیاری)")}</summary>
        <p className={base.note}>
          {ta("فقط وقتی اتصال اصلی گفتار به متن ندارد (مثلاً Ollama)؛ یک سرور سازگار با OpenAI که Whisper دارد، مثل http://127.0.0.1:8000/v1")}
        </p>
        <div className={classes.fields}>
          <Input title={ta("آدرس سرور گفتار به متن")} defaultValue={sttUrl} inputClass={base.ltr} onChange={(e) => setSttUrl(e.target.value)} />
          <Input
            title={ta("کلید API (اختیاری)")}
            type="password"
            autoComplete="new-password"
            defaultValue=""
            placeholder={data.sttKeySet ? data.sttKeyPreview || "" : ""}
            inputClass={base.ltr}
            onChange={(e) => setSttKey(e.target.value)}
          />
        </div>
      </details>

      <div className={classes.saveBar}>
        <Button size="M" onClick={save} isLoading={saving}>
          {ta("ثبت")}
        </Button>
        <span className={base.note}>{ta("آزمایش اتصال هر بخش با تنظیمات ذخیره‌شده انجام می‌شود؛ اول «ثبت» را بزنید.")}</span>
      </div>
    </div>
  );
};

const AdminAiSettingsTab = () => {
  const { data, error, mutate } = useSWR<AiSettings>(`${API}/admin/ai/settings`, (url: string) =>
    fetcher({ url }).then((res) => res.data),
  );
  const [version, setVersion] = useState(0);

  return (
    <HandleLoading data={!!data} error={error}>
      {!!data && (
        <div className={base.stack}>
          <WithTitle title={ta("هوش مصنوعی")}>
            <AiSettingsForm
              key={version}
              data={data}
              refresh={async () => {
                await mutate();
                setVersion((v) => v + 1);
              }}
            />
          </WithTitle>
          {data.connection.kind === "ollama" && !!data.connection.url && (
            <WithTitle title={ta("مدل‌های سرور Ollama و تنظیمات پیشرفته‌ی دستیار گفتگو")}>
              <AdminManageOllamaPage />
            </WithTitle>
          )}
        </div>
      )}
    </HandleLoading>
  );
};

export default AdminAiSettingsTab;
