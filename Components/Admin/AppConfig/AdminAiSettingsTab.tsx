"use client";

import { useState } from "react";
import useSWR from "swr";
import { API } from "@/Components/config";
import { fetcher, FetchError } from "@/Components/helpers/fetcher";
import useNotification from "@/Components/Hooks/useNotification";
import HandleLoading from "../UI/HandleLoading";
import WithTitle from "../UI/WithTitle";
import CreateForm from "../UI/CreateForm";
import Box from "../UI/Box";
import Button from "@/Components/UI/Button";
import Badge from "@/Components/UI/Badge";
import { adminIntlTag, ta } from "@/Components/Admin/i18n/adminText";
import AdminManageOllamaPage from "../Ollama/AdminManageOllamaPage";
import classes from "./AdminMapSettings.module.css";

// «هوش مصنوعی» in the system settings (2026-10): every AI provider of the
// site in one form - machine translation of content, the doctor's clinical
// assistant, the visit scribe's speech-to-text and the Ollama server of the
// chat bot (backend Lib/aiSettings.ts, GET/POST /admin/ai/settings). Keys
// are write-only. An empty field falls back to the server's .env. Below:
// a connection test per feature and the Ollama models.

type AiStatus = { on: boolean; provider?: string; model?: string };

type AiSettings = {
  aiProvider: "anthropic" | "openai" | "ollama";
  aiBaseUrl: string;
  apiKeySet: boolean;
  apiKeyPreview: string;
  apiKeyFromEnv: boolean;
  ollamaHost: string;
  translationAiEnabled: boolean;
  translationAiModel: string;
  clinicalAiEnabled: boolean;
  clinicalAiProvider: "ollama" | "cloud";
  clinicalAiModel: string;
  sttEnabled: boolean;
  sttUrl: string;
  sttKeySet: boolean;
  sttKeyPreview: string;
  sttModel: string;
  sttLanguage: string;
  defaults?: Record<string, string>;
  status?: { translation?: AiStatus; clinical?: AiStatus; stt?: AiStatus; chat?: AiStatus };
};

type AiInput = Omit<AiSettings, "apiKeySet" | "apiKeyPreview" | "apiKeyFromEnv" | "sttKeySet" | "sttKeyPreview" | "defaults" | "status"> & {
  aiApiKey: string;
  sttApiKey: string;
};

type Feature = "translation" | "clinical" | "stt" | "ollama";

type TestResult = {
  ok: boolean;
  latencyMs?: number;
  provider?: string;
  model?: string;
  models?: string[];
  error?: string;
};

const providerName = (p?: string) =>
  p === "anthropic" ? "Anthropic (Claude)" : p === "openai" ? ta("سازگار با OpenAI") : p === "ollama" ? "Ollama" : p || "";

const TestRow = ({ feature, title, status }: { feature: Feature; title: string; status?: AiStatus }) => {
  const pushNotification = useNotification();
  const [testing, setTesting] = useState(false);
  const [result, setResult] = useState<TestResult | null>(null);
  const run = async () => {
    if (testing) return;
    setTesting(true);
    try {
      const res = await fetcher({ url: `${API}/admin/ai/test`, method: "POST", payload: { feature }, bodyParser: "JSON" });
      setResult(res?.data && typeof res.data === "object" ? (res.data as TestResult) : null);
    } catch (err) {
      if (err instanceof FetchError) pushNotification(err.message, "Error");
    } finally {
      setTesting(false);
    }
  };
  return (
    <div className={classes.stack}>
      <div className={classes.row}>
        <strong>{title}</strong>
        <Badge color={status?.on ? "Success" : "Disabled"} size="L">
          {status?.on ? ta("فعال") : ta("غیرفعال")}
        </Badge>
        {status?.on && !!status.provider && (
          <span className={`${classes.note} ${classes.ltr}`}>
            {providerName(status.provider)}
            {status.model ? ` · ${status.model}` : ""}
          </span>
        )}
        <Button size="S" mode="Outline" onClick={run} isLoading={testing}>
          {ta("آزمایش اتصال")}
        </Button>
      </div>
      {!!result && (
        <div className={classes.row} aria-live="polite">
          <Badge color={result.ok ? "Success" : "Error"} size="L">
            {result.ok ? ta("اتصال برقرار است") : ta("اتصال ناموفق")}
          </Badge>
          {typeof result.latencyMs === "number" && (
            <span className={classes.note}>
              {ta("${1} میلی‌ثانیه", [result.latencyMs.toLocaleString(adminIntlTag())])}
            </span>
          )}
          {!result.ok && !!result.error && <span className={`${classes.error} ${classes.ltr}`}>{result.error}</span>}
          {result.ok && !!result.models && (
            <span className={`${classes.note} ${classes.ltr}`}>
              {result.models.length ? result.models.join("، ") : ta("هیچ مدلی روی سرور نیست")}
            </span>
          )}
        </div>
      )}
    </div>
  );
};

const AdminAiSettingsTab = () => {
  const { data, error, mutate } = useSWR<AiSettings>(`${API}/admin/ai/settings`, (url: string) =>
    fetcher({ url }).then((res) => res.data),
  );

  return (
    <HandleLoading data={!!data} error={error}>
      {!!data && (
        <div className={classes.stack}>
          <WithTitle title={ta("هوش مصنوعی")}>
            <p className={classes.note}>
              {ta("سرویس‌دهنده، کلید و مدل‌های هوش مصنوعی سایت: ترجمه‌ی خودکار محتوا، دستیار بالینی پزشک، تبدیل گفتار به متن و دستیار گفتگو. کلیدها فقط روی سرور می‌مانند. فیلد خالی یعنی مقدار فایل ‎.env سرور.")}
            </p>
            <p className={classes.note}>
              {ta("نمونه‌ی نام مدل: claude-sonnet-5 (Anthropic)، gpt-4o (OpenAI)، qwen2.5:14b (Ollama). نمونه‌ی آدرس Ollama: http://10.0.0.5:11434 و آدرس گفتار به متن: http://127.0.0.1:8000/v1")}
            </p>
            {[data.apiKeySet && data.apiKeyPreview, data.sttKeySet && data.sttKeyPreview]
              .filter(Boolean)
              .map((preview) => (
                <p key={String(preview)} className={classes.note}>
                  {ta("کلید ذخیره‌شده: ${1}. برای تغییر، کلید جدید را وارد کنید؛ اگر خالی بماند همان کلید می‌ماند.", [String(preview)])}
                </p>
              ))}
            {data.apiKeyFromEnv && (
              <p className={classes.note}>{ta("کلیدی اینجا ذخیره نشده و کلید فایل ‎.env سرور استفاده می‌شود.")}</p>
            )}
            <CreateForm<AiInput>
              key={`${data.apiKeyPreview}|${data.sttKeyPreview}|${data.aiProvider}`}
              layout="tabs"
              defaultValue={{
                aiProvider: data.aiProvider,
                aiApiKey: "",
                aiBaseUrl: data.aiBaseUrl || "",
                ollamaHost: data.ollamaHost || "",
                translationAiEnabled: !!data.translationAiEnabled,
                translationAiModel: data.translationAiModel || "",
                clinicalAiEnabled: !!data.clinicalAiEnabled,
                clinicalAiProvider: data.clinicalAiProvider || "ollama",
                clinicalAiModel: data.clinicalAiModel || "",
                sttEnabled: !!data.sttEnabled,
                sttUrl: data.sttUrl || "",
                sttApiKey: "",
                sttModel: data.sttModel || "",
                sttLanguage: data.sttLanguage || "",
              }}
              hookProps={{
                path: `${API}/admin/ai/settings`,
                method: "POST",
                parser: "JSON",
                successCb: () => mutate(),
              }}
              renderer={{
                aiProvider: {
                  title: ta("سرویس‌دهنده‌ی اصلی"),
                  type: "select",
                  options: {
                    anthropic: "Anthropic (Claude)",
                    openai: ta("سازگار با OpenAI (OpenAI، OpenRouter، Groq، سرور داخلی و...)"),
                    ollama: ta("Ollama (سرور داخل ایران)"),
                  },
                  section: ta("اتصال"),
                },
                aiApiKey: {
                  title: ta("کلید API"),
                  type: "secret",
                  section: ta("اتصال"),
                },
                aiBaseUrl: {
                  title: ta("آدرس سرویس (Base URL)"),
                  type: "text",
                  section: ta("اتصال"),
                },
                ollamaHost: {
                  title: ta("آدرس سرور Ollama"),
                  type: "text",
                  section: ta("اتصال"),
                },
                translationAiEnabled: { title: ta("ترجمه‌ی خودکار محتوا"), type: "bool", section: ta("ترجمه") },
                translationAiModel: {
                  title: ta("مدل ترجمه"),
                  type: "text",
                  section: ta("ترجمه"),
                },
                clinicalAiEnabled: { title: ta("دستیار بالینی پزشک"), type: "bool", section: ta("دستیار بالینی") },
                clinicalAiProvider: {
                  title: ta("محل پردازش داده‌ی بیمار"),
                  type: "select",
                  options: {
                    ollama: ta("سرور Ollama داخلی (پیشنهادی)"),
                    cloud: ta("سرویس‌دهنده‌ی اصلی (ابری)"),
                  },
                  section: ta("دستیار بالینی"),
                },
                clinicalAiModel: { title: ta("مدل دستیار بالینی"), type: "text", section: ta("دستیار بالینی") },
                sttEnabled: { title: ta("تبدیل گفتار به متن (نسخه‌نویس ویزیت)"), type: "bool", section: ta("گفتار به متن") },
                sttUrl: {
                  title: ta("آدرس سرور گفتار به متن"),
                  type: "text",
                  section: ta("گفتار به متن"),
                },
                sttApiKey: {
                  title: ta("کلید API (اختیاری)"),
                  type: "secret",
                  section: ta("گفتار به متن"),
                },
                sttModel: { title: ta("مدل (پیش‌فرض whisper-1)"), type: "text", section: ta("گفتار به متن") },
                sttLanguage: { title: ta("زبان گفتار (پیش‌فرض fa)"), type: "text", section: ta("گفتار به متن") },
              }}
            />
          </WithTitle>

          <Box className={classes.box}>
            <h3 className={classes.sectionTitle}>{ta("وضعیت و آزمایش اتصال")}</h3>
            <p className={classes.note}>{ta("هر آزمایش یک درخواست کوتاه واقعی با تنظیمات ذخیره‌شده می‌فرستد. اول «ثبت» را بزنید.")}</p>
            <TestRow feature="translation" title={ta("ترجمه‌ی خودکار محتوا")} status={data.status?.translation} />
            <TestRow feature="clinical" title={ta("دستیار بالینی پزشک")} status={data.status?.clinical} />
            <TestRow feature="stt" title={ta("تبدیل گفتار به متن")} status={data.status?.stt} />
            <TestRow
              feature="ollama"
              title={ta("سرور Ollama (دستیار گفتگو)")}
              status={data.status?.chat?.on ? { on: true, provider: "ollama" } : { on: false }}
            />
          </Box>

          {!!data.ollamaHost && (
            <WithTitle title={ta("دستیار گفتگو: مدل‌ها و دستورالعمل‌ها")}>
              <AdminManageOllamaPage />
            </WithTitle>
          )}
        </div>
      )}
    </HandleLoading>
  );
};

export default AdminAiSettingsTab;
