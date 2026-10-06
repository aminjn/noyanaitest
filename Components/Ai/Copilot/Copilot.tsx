"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { fetcher } from "@/Components/helpers/fetcher";
import useProgress from "@/Components/Hooks/useProgress";
import { useIntlLocale, usePathname } from "@/Components/i18n/navigation";
import { adminIntlTag } from "@/Components/Admin/i18n/adminText";
import Ixon from "@/Components/UI/Ixon";
import AiOrb from "@/Components/UI/AiOrb";
import SendIcon from "@/Components/Icons/SendIcon";
import XMarkIcon from "@/Components/Icons/XMarkIcon";
import TrashIcon from "@/Components/Icons/TrashIcon";
import SparkIcon from "@/Components/Icons/SparkIcon";
import VoiceButton from "../VoiceButton";
import AiSetupNotice from "../AiSetupNotice";
import { aiBase, AiProfile, copilotFeatureOf, T, useAiProfile, useAiStatus, useAiText } from "../aiShared";
import AiLocked, { aiGateOf, AiGateInfo, AiQuota } from "../AiLocked";
import { CHIP_LIMIT, chipsFor, COPILOT_PROFILES } from "./copilotProfiles";
import CopilotCard, { CopilotCardData } from "./CopilotCard";
import ai from "../Ai.module.css";
import classes from "./Copilot.module.css";

// «دستیار نویان» (2026-10): a floating button and a command bar in every
// panel - one assistant per profile (doctor, clinic, hospital, pharmacy,
// lab, insurer, the patient's dashboard, the super admin), with its own
// tools, chips and intro. Type or speak; reads answer right away, anything
// that changes data comes back as a filled form to confirm. Ctrl/⌘ + J (Ctrl + K stays the menu search).

type Msg = { role: "user" | "assistant"; text: string; card?: CopilotCardData; tool?: string };

const CopilotPanel = ({ profile, onClose }: { profile: AiProfile; onClose: () => void }) => {
  const t = useAiText(profile);
  const ui = COPILOT_PROFILES[profile];
  const { status, ok: setUp, hasTool, mutate } = useAiStatus(profile);
  // the copilot's own feature in the AI policy: its quota, or why it is shut
  const own = status?.features?.[copilotFeatureOf(profile)];
  const ok = setUp && (!own || own.state === "ok");
  const [gate, setGate] = useState<AiGateInfo | null>(null);
  const pathname = usePathname();
  const push = useProgress();
  const intl = useIntlLocale();
  const [msgs, setMsgs] = useState<Msg[]>([]);
  const [text, setText] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [allChips, setAllChips] = useState(false);
  const bodyRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);

  // the short history kept on the server (text only)
  useEffect(() => {
    let live = true;
    fetcher({ url: `${aiBase(profile)}/copilot/history` })
      .then((res) => {
        if (!live || !Array.isArray(res?.data)) return;
        setMsgs((cur) => (cur.length ? cur : (res.data as Msg[]).slice(-10).map((m) => ({ role: m.role, text: m.text, tool: m.tool }))));
      })
      .catch(() => undefined);
    inputRef.current?.focus();
    return () => {
      live = false;
    };
  }, [profile]);

  useEffect(() => {
    bodyRef.current?.scrollTo({ top: bodyRef.current.scrollHeight, behavior: "smooth" });
  }, [msgs, busy]);

  const ask = useCallback(
    async (q: string) => {
      const query = q.trim();
      if (!query || busy) return;
      setText("");
      setError("");
      setMsgs((m) => [...m, { role: "user", text: query }]);
      setBusy(true);
      try {
        const res = await fetcher({ url: `${aiBase(profile)}/copilot`, method: "POST", payload: { text: query, page: pathname } });
        const d = (res?.data || {}) as { reply?: string; tool?: string; card?: CopilotCardData };
        setMsgs((m) => [...m, { role: "assistant", text: d.reply || "", card: d.card, tool: d.tool }]);
        mutate();
        // a page the user asked for opens right away
        if (d.card?.type === "navigate") {
          const path = d.card.path;
          if (profile === "admin" || path.startsWith("/wizard")) window.location.href = path;
          else push(path);
        }
      } catch (err) {
        // refused by the AI policy: the locked / limit state, not an error
        const g = aiGateOf(err);
        if (g) {
          setGate(g);
          mutate();
        } else setError((err as Error).message);
      } finally {
        setBusy(false);
      }
    },
    [busy, pathname, profile, push, mutate],
  );

  const clear = async () => {
    setMsgs([]);
    await fetcher({ url: `${aiBase(profile)}/copilot/history`, method: "DELETE" }).catch(() => undefined);
  };

  const fmt = new Intl.NumberFormat(profile === "admin" ? adminIntlTag() : intl);
  const allowed = chipsFor(
    ui.chips.filter((c) => hasTool(c.tool)),
    pathname,
  );
  const chips = allChips ? allowed : allowed.slice(0, CHIP_LIMIT);
  const hidden = allowed.length - CHIP_LIMIT;

  return (
    <div className={classes.panel} role="dialog" aria-modal="false" aria-label={t(ui.title)}>
      <header className={classes.head}>
        <AiOrb size="2rem" />
        <span className={classes.title}>{t(ui.title)}</span>
        <button type="button" className={classes.iconBtn} onClick={clear} aria-label={t(T("copClear", "پاک کردن گفتگو"))} title={t(T("copClear", "پاک کردن گفتگو"))}>
          <Ixon width="1rem">
            <TrashIcon />
          </Ixon>
        </button>
        <button type="button" className={classes.iconBtn} onClick={onClose} aria-label={t(T("copClose", "بستن"))}>
          <Ixon width="1.125rem">
            <XMarkIcon />
          </Ixon>
        </button>
      </header>
      <div className={classes.body} ref={bodyRef} aria-live="polite">
        <AiSetupNotice profile={profile} status={status} />
        {!msgs.length && (
          <div className={classes.empty}>
            <p className={ai.text}>{t(ui.intro)}</p>
            {ok && !!chips.length && (
              <div className={ai.chips}>
                {chips.map((c) => (
                  <button key={c.tool} type="button" className={ai.chip} onClick={() => ask(t(c.text))}>
                    {t(c.text)}
                  </button>
                ))}
                {hidden > 0 && (
                  <button type="button" className={`${ai.chip} ${classes.chipMore}`} aria-expanded={allChips} onClick={() => setAllChips((v) => !v)}>
                    {allChips ? t(T("copChipsLess", "کمتر")) : t(T("copChipsMore", "${1} پیشنهاد دیگر"), [fmt.format(hidden)])}
                  </button>
                )}
              </div>
            )}
          </div>
        )}
        {msgs.map((m, i) => (
          <div key={i} className={`${classes.msg} ${m.role === "user" ? classes.mine : ""}`}>
            {!!m.text && <p className={classes.bubble}>{m.text}</p>}
            {m.card && (
              <CopilotCard
                profile={profile}
                card={m.card}
                onAsk={ask}
                onDone={(msg) => setMsgs((all) => [...all, { role: "assistant", text: msg }])}
              />
            )}
          </div>
        ))}
        {busy && (
          <div className={classes.msg}>
            <p className={`${classes.bubble} ${classes.typing}`}>
              <Ixon width="0.9rem">
                <SparkIcon />
              </Ixon>
              {t(T("copThinking", "در حال انجام…"))}
            </p>
          </div>
        )}
        {!!error && <p className={`${ai.notice}`}>{error}</p>}
        {!!gate && <AiLocked profile={profile} gate={gate} />}
      </div>
      <form
        className={classes.bar}
        onSubmit={(e) => {
          e.preventDefault();
          ask(text);
        }}
      >
        <textarea
          ref={inputRef}
          className={classes.input}
          rows={1}
          value={text}
          dir="auto"
          disabled={!ok}
          placeholder={t(T("copPlaceholder", "بنویسید یا بگویید چه کاری انجام شود…"))}
          onChange={(e) => setText(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter" && !e.shiftKey) {
              e.preventDefault();
              ask(text);
            }
          }}
        />
        {ok && status?.stt && <VoiceButton profile={profile} compact onText={(v) => ask(v)} disabled={busy} />}
        <button type="submit" className={classes.send} disabled={!ok || busy || !text.trim()} aria-label={t(T("copSend", "فرستادن"))}>
          <Ixon width="1.125rem">
            <SendIcon />
          </Ixon>
        </button>
      </form>
      {/* today's requests left (nothing when unlimited) */}
      {ok && !!own?.limit && (
        <div className={classes.foot}>
          <AiQuota profile={profile} state={own} />
        </div>
      )}
    </div>
  );
};

const Copilot = ({ profile: fixed }: { profile?: AiProfile }) => {
  const detected = useAiProfile();
  const profile = fixed || detected;
  const t = useAiText(profile);
  const [open, setOpen] = useState(false);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === "j") {
        e.preventDefault();
        setOpen((o) => !o);
      } else if (e.key === "Escape") setOpen(false);
    };
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, []);

  if (!profile) return null;
  return (
    <>
      {open && <CopilotPanel profile={profile} onClose={() => setOpen(false)} />}
      {!open && (
        <button
          type="button"
          className={classes.fab}
          data-copilot-fab
          onClick={() => setOpen(true)}
          aria-label={t(COPILOT_PROFILES[profile].title)}
          title={`${t(COPILOT_PROFILES[profile].title)} (Ctrl+J)`}
        >
          <AiOrb size="2.25rem" />
          <span className={classes.fabLabel}>{t(T("copFab", "دستیار نویان"))}</span>
        </button>
      )}
    </>
  );
};

export default Copilot;
