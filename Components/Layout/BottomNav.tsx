import Link from "@/Components/i18n/Link";
import { createPortal } from "react-dom";
import { ReactNode, useEffect, useRef, useState } from "react";
import classes from "./BottomNav.module.css";
import { usePathname } from "@/Components/i18n/navigation";
import useScopedLocale from "../Hooks/useScopedLocale";
import useUser from "../Hooks/useUser";
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
  needsUser?: boolean;
};

// One tab of a phone tab bar: a link, or a button (the panels' "menu").
export type TabItem = {
  key: string;
  label: string;
  icon: ReactNode;
  active?: boolean;
  center?: boolean;
  // count pill on the icon (unread chats…)
  badge?: number;
} & ({ href: string; onClick?: never } | { onClick: () => unknown; href?: never });

// Hides the bar while scrolling down, shows it on scroll up; sets
// `hasBottomNav` on <body> while shown on the page (see --bottomNavSpace).
const useTabBarScroll = (off: boolean, pathname: string) => {
  const [hidden, setHidden] = useState<boolean>(false);
  const last = useRef(0);

  useEffect(() => {
    if (off) return;
    document.body.classList.add("hasBottomNav");
    return () => document.body.classList.remove("hasBottomNav");
  }, [off]);

  useEffect(() => {
    if (off) return;
    // the page scrolls inside <body> (see globals.css), elsewhere the window
    const y = () => Math.max(document.body.scrollTop, window.scrollY);
    last.current = y();
    let frame = 0;
    const onScroll = () => {
      cancelAnimationFrame(frame);
      frame = requestAnimationFrame(() => {
        const now = y();
        const delta = now - last.current;
        if (Math.abs(delta) < 8) return;
        setHidden(delta > 0 && now > 96);
        last.current = now;
      });
    };
    document.body.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => {
      cancelAnimationFrame(frame);
      document.body.removeEventListener("scroll", onScroll);
      window.removeEventListener("scroll", onScroll);
    };
  }, [off]);

  // a new page starts with the bar shown
  useEffect(() => setHidden(false), [pathname]);
  return hidden;
};

// The frosted phone tab bar itself (<= 768px), shared by the public site,
// the patient dashboard (BottomNav) and the provider panels (PanelLayout).
export const TabBar = ({
  items,
  label,
  off = false,
}: {
  items: TabItem[];
  label: string;
  off?: boolean;
}) => {
  const pathname = usePathname();
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
      <ul className={classes.list} style={{ gridTemplateColumns: `repeat(${items.length}, minmax(0, 1fr))` }}>
        {items.map((item) => {
          const content = (
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
          const className = `${classes.item} ${item.center ? classes.center : ""} ${item.active ? classes.active : ""}`;
          return (
            <li key={item.key} className={classes.cell}>
              {item.href !== undefined ? (
                <Link href={item.href} className={className} aria-current={item.active ? "page" : undefined}>
                  {content}
                </Link>
              ) : (
                <button type="button" className={className} onClick={item.onClick}>
                  {content}
                </button>
              )}
            </li>
          );
        })}
      </ul>
    </nav>,
    document.body,
  );
};

// Phone tab bar (<= 768px) for the public site and the patient dashboard:
// home, find a doctor, the AI assistant (centre), my appointments, profile.
// Frosted, respects the home-indicator safe area, hides while scrolling
// down and comes back on scroll up. It sets `hasBottomNav` on <body> so the
// floating «دستیار نویان» button, the install sheet and the page bottom
// move above it (--bottomNavSpace in globals.css).
const BottomNav = () => {
  const getContent = useScopedLocale(LOCALE_NS);
  const pathname = usePathname();
  const { user } = useUser();
  const { setPopup } = usePopup();

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
    { key: "ai", label: "bottomNavAi", icon: <SparkIcon />, href: "/wizard", match: (p) => p.startsWith("/wizard"), center: true },
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
      items={items.map((item): TabItem => {
        const base = {
          key: item.key,
          label: getContent(item.label),
          icon: item.icon,
          active: item.match(pathname),
          center: item.center,
        };
        return item.needsUser && !user
          ? { ...base, onClick: () => setPopup("Auth", <AuthPopup />) }
          : { ...base, href: item.href };
      })}
    />
  );
};

export default BottomNav;
