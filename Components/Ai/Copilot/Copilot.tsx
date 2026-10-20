"use client";

import { CSSProperties, PointerEvent as ReactPointerEvent, useCallback, useEffect, useRef, useState } from "react";
import { fetcher } from "@/Components/helpers/fetcher";
import { safeLocalPath } from "@/Components/helpers/safeHref";
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
import useHideOnScroll from "@/Components/Hooks/useHideOnScroll";
import AiCoachMark from "../AiCoachMark";
import { markAiUsed, onOpenCopilot, registerCopilotHost, useAiDiscovery } from "../aiDiscovery";
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
          // only a path on this site (the reply is model output)
          const path = safeLocalPath(d.card.path);
          if (path && (profile === "admin" || path.startsWith("/wizard"))) window.location.href = path;
          else if (path) push(path);
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
    <div className={classes.panel} role="dialog" aria-modal="false" aria-label={t(ui.title)} data-copilot-panel>
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
            {/* the patient's most common ask first, one tap (Ada / K Health):
                the symptom checker; the rest stays below as chips */}
            {profile === "user" && (
              <button
                type="button"
                className={classes.symptomCta}
                onClick={() => {
                  onClose();
                  push("/wizard");
                }}
              >
                <span className={classes.symptomIcon} aria-hidden="true">
                  <Ixon width="1.25rem">
                    <SparkIcon />
                  </Ixon>
                </span>
                <span className={classes.symptomText}>
                  <strong>{t(T("copSymptomCta", "بررسی علائم با دستیار سلامت"))}</strong>
                  <span>{t(T("copSymptomCtaSub", "علائمتان را بگویید تا تخصص و پزشک مناسب را پیشنهاد کنیم"))}</span>
                </span>
              </button>
            )}
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

// Where the phone FAB sits: the side of the screen and how far the user
// dragged it up (px above its resting place). Kept per device.
type FabSpot = { side: "start" | "end"; up: number };
const FAB_KEY = "noyan-copilot-fab";
const PHONE = "(max-width: 48rem)";
const readSpot = (): FabSpot => {
  try {
    const v = JSON.parse(localStorage.getItem(FAB_KEY) || "null");
    if (v && (v.side === "start" || v.side === "end") && Number.isFinite(v.up)) return { side: v.side, up: Math.max(0, v.up) };
  } catch {
    // blocked storage / bad value: the default spot
  }
  return { side: "end", up: 0 };
};

// The floating «دستیار نویان» button. On a phone it never sits on what the
// page needs (Doctolib / Zocdoc keep their mobile web free of floating
// chat bubbles over actions):
// - it rides above the tab bar and above any fixed action bar
//   ([data-fixed-bar]: finalize / pay bars, form save bars),
// - it steps out while the page scrolls down (with the tab bar) and while a
//   drawer, sheet or popup is open (html.scrollLocked, globals.css),
// - it can be dragged up or to the other edge if it still covers something.
// It is a labelled pill (orb + «دستیار هوشمند») while the page rests at the
// top, shrinks to the orb once the page is scrolled and opens up again when
// back at the top; a "new" dot until first used, and a one-time coach mark
// (`coach`) on phones.
const CopilotFab = ({
  label,
  title,
  onOpen,
  coach,
  isNew,
}: {
  label: string;
  title: string;
  onOpen: () => void;
  coach?: { title: string; text: string; gotIt: string; closeLabel: string };
  isNew: string;
}) => {
  const pathname = usePathname();
  const ref = useRef<HTMLButtonElement>(null);
  const [phone, setPhone] = useState(false);
  const [lift, setLift] = useState(0);
  const [spot, setSpot] = useState<FabSpot>({ side: "end", up: 0 });
  const drag = useRef<{ x: number; y: number; moved: boolean; id: number } | null>(null);
  const dragged = useRef(false);
  const [delta, setDelta] = useState<{ x: number; y: number } | null>(null);
  const scrolledAway = useHideOnScroll(!phone, pathname);
  const { used } = useAiDiscovery();
  // phones: the label shows at the top of the page, the orb alone below it
  const [compact, setCompact] = useState(false);
  useEffect(() => {
    if (!phone) {
      setCompact(false);
      return;
    }
    let idle = 0;
    const onScroll = () => {
      if (window.scrollY > 24) setCompact(true);
      window.clearTimeout(idle);
      idle = window.setTimeout(() => window.scrollY <= 24 && setCompact(false), 300);
    };
    setCompact(window.scrollY > 24);
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => {
      window.clearTimeout(idle);
      window.removeEventListener("scroll", onScroll);
    };
  }, [phone, pathname]);

  useEffect(() => {
    const mq = window.matchMedia(PHONE);
    const on = () => setPhone(mq.matches);
    on();
    setSpot(readSpot());
    mq.addEventListener?.("change", on);
    return () => mq.removeEventListener?.("change", on);
  }, []);

  // the height of a fixed / stuck action bar at the bottom of the screen
  useEffect(() => {
    if (!phone) {
      setLift(0);
      return;
    }
    let frame = 0;
    const measure = () => {
      cancelAnimationFrame(frame);
      frame = requestAnimationFrame(() => {
        const h = window.innerHeight;
        let top = h;
        document.querySelectorAll<HTMLElement>("[data-fixed-bar]").forEach((el) => {
          const r = el.getBoundingClientRect();
          if (!r.height || getComputedStyle(el).display === "none") return;
          // on screen, in the lower half, resting on the bottom edge or on
          // the tab bar (a sticky save bar that is stuck)
          if (r.top < h && r.top > h / 2 && r.bottom > h - 100) top = Math.min(top, r.top);
        });
        setLift(top < h ? Math.round(h - top) : 0);
      });
    };
    measure();
    const mo = new MutationObserver(measure);
    mo.observe(document.body, { childList: true, subtree: true, attributes: true, attributeFilter: ["class"] });
    window.addEventListener("scroll", measure, { passive: true });
    window.addEventListener("resize", measure);
    return () => {
      cancelAnimationFrame(frame);
      mo.disconnect();
      window.removeEventListener("scroll", measure);
      window.removeEventListener("resize", measure);
    };
  }, [phone, pathname]);

  const onPointerDown = (e: ReactPointerEvent<HTMLButtonElement>) => {
    dragged.current = false;
    if (!phone) return;
    drag.current = { x: e.clientX, y: e.clientY, moved: false, id: e.pointerId };
  };
  const onPointerMove = (e: ReactPointerEvent<HTMLButtonElement>) => {
    const d = drag.current;
    if (!d || d.id !== e.pointerId) return;
    const dx = e.clientX - d.x;
    const dy = e.clientY - d.y;
    if (!d.moved && Math.hypot(dx, dy) < 8) return;
    if (!d.moved) {
      d.moved = true;
      ref.current?.setPointerCapture?.(e.pointerId);
    }
    setDelta({ x: dx, y: dy });
  };
  const onPointerUp = (e: ReactPointerEvent<HTMLButtonElement>) => {
    const d = drag.current;
    drag.current = null;
    if (!d || !d.moved) return;
    dragged.current = true;
    const rect = ref.current?.getBoundingClientRect();
    setDelta(null);
    if (!rect) return;
    const dy = e.clientY - d.y;
    const rtl = document.documentElement.dir === "rtl";
    const left = rect.left + rect.width / 2 < window.innerWidth / 2;
    const side: FabSpot["side"] = left === rtl ? "end" : "start";
    // between its resting place and the sticky header (4.5rem + a gap)
    const rest = rect.bottom - dy + spot.up;
    const max = Math.max(0, rest - rect.height - 80);
    const next = { side, up: Math.min(max, Math.max(0, spot.up - dy)) };
    setSpot(next);
    try {
      localStorage.setItem(FAB_KEY, JSON.stringify(next));
    } catch {
      // blocked storage: the spot lasts for this page only
    }
  };

  const style = phone
    ? ({
        "--fabLift": `${lift}px`,
        "--fabUp": `${spot.up}px`,
        transform: delta ? `translate(${delta.x}px, ${delta.y}px)` : undefined,
        transition: delta ? "none" : undefined,
      } as CSSProperties)
    : undefined;

  return (
    <>
    <button
      ref={ref}
      type="button"
      className={`${classes.fab} ${phone && spot.side === "start" ? classes.fabStart : ""} ${scrolledAway && !delta ? classes.fabAway : ""} ${phone && compact ? classes.fabCompact : ""}`}
      style={style}
      data-copilot-fab
      onPointerDown={onPointerDown}
      onPointerMove={onPointerMove}
      onPointerUp={onPointerUp}
      onPointerCancel={() => {
        drag.current = null;
        setDelta(null);
      }}
      onClick={() => {
        // the end of a drag is not a tap
        if (dragged.current) {
          dragged.current = false;
          return;
        }
        onOpen();
      }}
      aria-label={used ? label : `${label} (${isNew})`}
      aria-haspopup="dialog"
      title={title}
    >
      <span className={classes.fabOrb}>
        <AiOrb size="2.25rem" />
        {!used && <span className={classes.fabDot} aria-hidden="true" />}
      </span>
      <span className={classes.fabLabel}>{label}</span>
    </button>
    {phone && !!coach && (
      <AiCoachMark anchor={ref} title={coach.title} text={coach.text} gotIt={coach.gotIt} closeLabel={coach.closeLabel} />
    )}
    </>
  );
};

const PHONE_MQ = "(max-width: 48rem)";
const usePhone = () => {
  const [phone, setPhone] = useState(false);
  useEffect(() => {
    const mq = window.matchMedia(PHONE_MQ);
    const on = () => setPhone(mq.matches);
    on();
    mq.addEventListener?.("change", on);
    return () => mq.removeEventListener?.("change", on);
  }, []);
  return phone;
};

const Copilot = ({ profile: fixed }: { profile?: AiProfile }) => {
  const detected = useAiProfile();
  const profile = fixed || detected;
  const t = useAiText(profile);
  const [open, setOpen] = useState(false);
  const phone = usePhone();
  // the patient dashboard: on phones its tab bar's AI tab is the one entry
  // (BottomNav); it opens this assistant while it is available, else the
  // health assistant (/wizard). The floating button stays off there.
  const inTabBar = profile === "user";
  const { status, ok: setUp } = useAiStatus(inTabBar ? profile : null);
  const own = status?.features?.[copilotFeatureOf("user")];
  const hostOk = inTabBar && setUp && (!own || own.state === "ok");
  useEffect(() => (hostOk ? registerCopilotHost() : undefined), [hostOk]);
  useEffect(() => (hostOk ? onOpenCopilot(() => setOpen(true)) : undefined), [hostOk]);
  useEffect(() => {
    if (open) markAiUsed();
  }, [open]);

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
      {!open && !(inTabBar && phone) && (
        <CopilotFab
          label={t(T("aiAssistant", "دستیار هوشمند"))}
          title={`${t(COPILOT_PROFILES[profile].title)} (Ctrl+J)`}
          isNew={t(T("aiEntryNew", "جدید"))}
          onOpen={() => setOpen(true)}
          coach={
            profile === "admin" || inTabBar
              ? undefined
              : {
                  title: t(T("aiAssistant", "دستیار هوشمند")),
                  text: t(T("aiCoachProvider", "کارهای پنل را بنویسید یا بگویید؛ هر تغییری پیش از ثبت به تأیید شما می‌رسد.")),
                  gotIt: t(T("understood", "متوجه شدم")),
                  closeLabel: t(T("copClose", "بستن")),
                }
          }
        />
      )}
    </>
  );
};

export default Copilot;
