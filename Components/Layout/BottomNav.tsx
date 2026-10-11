import Link from "@/Components/i18n/Link";
import { createPortal } from "react-dom";
import { ReactNode, Ref, useEffect, useRef, useState } from "react";
import classes from "./BottomNav.module.css";
import { usePathname } from "@/Components/i18n/navigation";
import useScopedLocale from "../Hooks/useScopedLocale";
import useUser from "../Hooks/useUser";
import useHideOnScroll from "../Hooks/useHideOnScroll";
import usePopup from "../Hooks/usePopup";
import { ContentNamespace } from "../Enums/contentNamespaces";
import { ContentKey } from "../Enums/contentKeys";
import AuthPopup from "../Popups/AuthPopup";
import Ixon from "../UI/Ixon";
import HomeIcon from "../Icons/HomeIcon";
import SearchIcon from "../Icons/SearchIcon";
import SparkIcon from "../Icons/SparkIcon";
import Calendar02Icon from "../Icons/Calendar02Icon";
import UserCircleIcon from "../Icons/UserCircleIcon";
import AiOrb from "../UI/AiOrb";
import AiCoachMark from "../Ai/AiCoachMark";
import { markAiUsed, openCopilot, useAiDiscovery } from "../Ai/aiDiscovery";

const LOCALE_NS: ContentNamespace[] = ["common"];

// full-screen tools have their own bottom controls (chat composer, call bar)
// the booking finalize step has its own sticky pay bar
const HIDDEN_ON = ["/wizard", "/call", "/newCall", "/dashboard/chat", "/dashboard/call", "/book/finalize"];

type Item = {
  key: string;
  label: ContentKey;
  icon: ReactNode;
  href: string;
  // also active on these paths
  match: (path: string) => boolean;
  center?: boolean;
  ai?: boolean;
  needsUser?: boolean;
};

// One tab of a phone tab bar: a link, or a button (the panels' "menu").
export type TabItem = {
  key: string;
  label: string;
  icon: ReactNode;
  active?: boolean;
  center?: boolean;
  // the AI assistant: the raised orb tile, a "new" dot until first used and
  // the one-time coach mark (Components/Ai/aiDiscovery)
  ai?: boolean;
  // count pill on the icon (unread chats…)
  badge?: number;
} & ({ href: string; onClick?: never } | { onClick: () => unknown; href?: never });

// Hides the bar while scrolling down, shows it on scroll up; sets
// `hasBottomNav` on <body> while shown on the page (see --bottomNavSpace).
const useTabBarScroll = (off: boolean, pathname: string) => {
  useEffect(() => {
    if (off) return;
    document.body.classList.add("hasBottomNav");
    return () => document.body.classList.remove("hasBottomNav");
  }, [off]);
  // a new page starts with the bar shown
  const hidden = useHideOnScroll(off, pathname);
  // fixed action bars follow the bar down while it is hidden
  // (--bottomNavLive in app/globals.css), no empty strip under them
  useEffect(() => {
    if (off) return;
    document.body.classList.toggle("bottomNavHidden", hidden);
    return () => document.body.classList.remove("bottomNavHidden");
  }, [off, hidden]);
  return hidden;
};

// The frosted phone tab bar itself (<= 768px), shared by the public site,
// the patient dashboard (BottomNav) and the provider panels (PanelLayout).
export type AiCoachTexts = { title: string; text: string; gotIt: string; closeLabel: string; isNew: string };

export const TabBar = ({
  items,
  label,
  off = false,
  coach,
}: {
  items: TabItem[];
  label: string;
  off?: boolean;
  // the AI tab's first-run coach mark and its "new" text for screen readers
  coach?: AiCoachTexts;
}) => {
  const pathname = usePathname();
  const aiRef = useRef<HTMLElement>(null);
  const { used } = useAiDiscovery();
  // rendered into <body>: a fixed bar inside a frosted (backdrop-filter)
  // panel would be positioned against that panel instead of the screen
  const [mounted, setMounted] = useState<boolean>(false);
  useEffect(() => setMounted(true), []);
  const hidden = useTabBarScroll(off, pathname);
  if (off || !mounted || !items.length) return null;
  return createPortal(
    <nav
      className={`${classes.bar} ${hidden ? classes.hidden : ""}`}
      aria-label={label}
      data-bottom-nav
    >
      <ul
        className={classes.list}
        style={{ gridTemplateColumns: items.map((i) => (i.ai ? "minmax(0, 1.35fr)" : "minmax(0, 1fr)")).join(" ") }}
      >
        {items.map((item) => {
          const dot = !!item.ai && !used;
          const content = item.ai ? (
            <>
              <span className={classes.aiTile}>
                <AiOrb size="100%" />
                {dot && <span className={classes.dot} aria-hidden="true" />}
              </span>
              <span className={classes.label}>{item.label}</span>
              {dot && !!coach?.isNew && <span className={classes.srOnly}>{` (${coach.isNew})`}</span>}
            </>
          ) : (
            <>
              <span
                className={`${classes.iconWrap} ${item.center ? "glassIcon tone-violet" : item.active ? "glassIcon" : ""}`}
              >
                <Ixon width="1.375rem">{item.icon}</Ixon>
                {!!item.badge && item.badge > 0 && (
                  <span className={classes.badge}>{item.badge > 99 ? "99+" : item.badge}</span>
                )}
              </span>
              <span className={classes.label}>{item.label}</span>
            </>
          );
          const className = `${classes.item} ${item.center ? classes.center : ""} ${item.ai ? classes.ai : ""} ${item.active ? classes.active : ""}`;
          const ref = item.ai ? aiRef : undefined;
          return (
            <li key={item.key} className={classes.cell}>
              {item.href !== undefined ? (
                <Link
                  href={item.href}
                  ref={ref as Ref<HTMLAnchorElement>}
                  className={className}
                  aria-current={item.active ? "page" : undefined}
                  data-ai-entry={item.ai ? "" : undefined}
                  onClick={item.ai ? markAiUsed : undefined}
                >
                  {content}
                </Link>
              ) : (
                <button
                  type="button"
                  ref={ref as Ref<HTMLButtonElement>}
                  className={className}
                  data-ai-entry={item.ai ? "" : undefined}
                  aria-haspopup={item.ai ? "dialog" : undefined}
                  onClick={() => {
                    if (item.ai) markAiUsed();
                    item.onClick();
                  }}
                >
                  {content}
                </button>
              )}
            </li>
          );
        })}
      </ul>
      {!!coach && items.some((i) => i.ai) && (
        <AiCoachMark anchor={aiRef} title={coach.title} text={coach.text} gotIt={coach.gotIt} closeLabel={coach.closeLabel} />
      )}
    </nav>,
    document.body,
  );
};

// Phone tab bar (<= 768px) for the public site and the patient dashboard:
// home, find a doctor, the AI assistant (centre), my appointments, profile.
// Frosted, respects the home-indicator safe area, hides while scrolling
// down and comes back on scroll up. It sets `hasBottomNav` on <body> so the
// floating «دستیار نویان» button, the install sheet and the page bottom
// move above it (--bottomNavSpace in globals.css). The centre tab is the
// one AI entry on these pages: «دستیار هوشمند», the AI orb raised above the
// bar, a "new" dot until first used and a one-time coach mark; in the
// dashboard it opens the dashboard's assistant (which hands symptom
// questions to /wizard), elsewhere it links to the health assistant.
const BottomNav = () => {
  const getContent = useScopedLocale(LOCALE_NS);
  const pathname = usePathname();
  const { user } = useUser();
  const { setPopup } = usePopup();
  // the dashboard's own assistant is up: the AI tab opens it (one entry)
  const { host } = useAiDiscovery();

  const off = HIDDEN_ON.some((p) => pathname === p || pathname.startsWith(`${p}/`));

  const items: Item[] = [
    { key: "home", label: "tabHome", icon: <HomeIcon />, href: "/", match: (p) => p === "/" },
    {
      key: "doctors",
      label: "tabDoctors",
      icon: <SearchIcon />,
      href: "/book",
      match: (p) => ["/book", "/doctors", "/speciality", "/dr", "/doctor"].some((s) => p.startsWith(s)),
    },
    { key: "ai", label: "aiAssistant", icon: <SparkIcon />, href: "/wizard", match: (p) => p.startsWith("/wizard"), center: true, ai: true },
    {
      key: "bookings",
      label: "tabBookings",
      icon: <Calendar02Icon />,
      href: "/dashboard/booking",
      match: (p) => p.startsWith("/dashboard/booking"),
      needsUser: true,
    },
    {
      key: "profile",
      label: user ? "tabProfile" : "tabLogin",
      icon: <UserCircleIcon />,
      href: "/dashboard",
      match: (p) => p.startsWith("/dashboard") && !p.startsWith("/dashboard/booking"),
      needsUser: true,
    },
  ];

  return (
    <TabBar
      off={off}
      label={getContent("menu")}
      coach={{
        title: getContent("aiAssistant"),
        text: getContent("aiCoachPatient"),
        gotIt: getContent("understood"),
        closeLabel: getContent("close"),
        isNew: getContent("aiEntryNew"),
      }}
      items={items.map((item): TabItem => {
        const base = {
          key: item.key,
          label: getContent(item.label),
          icon: item.icon,
          active: item.match(pathname),
          center: item.center,
          ai: item.ai,
        };
        if (item.ai && host) return { ...base, onClick: openCopilot };
        return item.needsUser && !user
          ? { ...base, onClick: () => setPopup("Auth", <AuthPopup />) }
          : { ...base, href: item.href };
      })}
    />
  );
};

export default BottomNav;
