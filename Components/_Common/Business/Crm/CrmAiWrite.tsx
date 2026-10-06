"use client";

import { useState } from "react";
import { fetcher } from "@/Components/helpers/fetcher";
import useNotification from "@/Components/Hooks/useNotification";
import { aiBase, AiProfile, T, useAiStatus, useAiText } from "@/Components/Ai/aiShared";
import AiLocked, { aiGateOf, AiGateInfo, gateOfState } from "@/Components/Ai/AiLocked";
import ai from "@/Components/Ai/Ai.module.css";

// «نوشتن با هوش مصنوعی» in the SMS template form (2026-10, after Nexxa's
// api/ai/campaign): the goal in a few words -> a short SMS with the CRM's
// variables. It only fills the form; saving and Noyan's approval are as
// before. Hidden when the server or the access does not allow it or the AI
// policy switched it off; locked when the plan lacks it or its quota is used.
const CrmAiWrite = ({
  node,
  onText,
}: {
  node: AiProfile;
  onText: (r: { name: string; category: string; text: string }) => void;
}) => {
  const { status, mutate } = useAiStatus(node);
  const t = useAiText(node);
  const notify = useNotification();
  const [open, setOpen] = useState(false);
  const [goal, setGoal] = useState("");
  const [busy, setBusy] = useState(false);
  const [refused, setRefused] = useState<AiGateInfo | null>(null);
  const feature = status?.features?.["crm.template"];
  if (!status?.configured || !status?.acl?.crmWrite || !feature || feature.state === "off") return null;
  const gate = refused || gateOfState(feature);
  if (gate) return <AiLocked profile={node} gate={gate} compact />;

  const write = async () => {
    if (goal.trim().length < 3) return;
    setBusy(true);
    try {
      const res = await fetcher({ url: `${aiBase(node)}/crm/template`, method: "POST", payload: { goal: goal.trim() } });
      onText(res.data);
      setOpen(false);
      mutate();
    } catch (err) {
      const g = aiGateOf(err);
      if (g) setRefused(g);
      else notify((err as Error).message, "Error");
    } finally {
      setBusy(false);
    }
  };

  if (!open)
    return (
      <button type="button" className={ai.aiButton} onClick={() => setOpen(true)}>
        ✦ {t(T("crmAiWrite", "نوشتن با هوش مصنوعی"))}
      </button>
    );
  return (
    <div className={ai.notice}>
      <input
        value={goal}
        onChange={(e) => setGoal(e.target.value)}
        placeholder={t(T("crmAiGoal", "هدف پیامک، مثلاً: یادآوری چکاپ سه‌ماهه‌ی بیماران دیابتی"))}
        maxLength={600}
        dir="auto"
        style={{ flex: "1 1 14rem", minWidth: 0, minHeight: "2.25rem", padding: "0.25rem 0.5rem", borderRadius: "var(--radiusSm)", border: "1px solid var(--line)", font: "inherit" }}
        onKeyDown={(e) => e.key === "Enter" && (e.preventDefault(), write())}
      />
      <button type="button" className={ai.aiButton} onClick={write} disabled={busy || goal.trim().length < 3}>
        {busy ? t(T("aiThinking", "در حال آماده‌سازی…")) : t(T("crmAiDo", "بنویس"))}
      </button>
    </div>
  );
};

export default CrmAiWrite;
