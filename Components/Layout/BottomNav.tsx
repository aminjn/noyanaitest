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
const HIDDEN_ON = ["/wizard", "/call", "/newCall", "/dashboard/chat", "/dashboard/call"];

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
  const [hidden, setHidden] = useState<boolean>(false);
  // rendered into <body>: a fixed bar inside a frosted (backdrop-filter)
  // panel would be positioned against that panel instead of the screen
  const [mounted, setMounted] = useState<boolean>(false);
  useEffect(() => setMounted(true), []);
  const last = useRef(0);

  const off = HIDDEN_ON.some((p) => pathname === p || pathname.startsWith(`${p}/`));

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

  if (off || !mounted) return null;

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

  return createPortal(
    <nav
      className={`${classes.bar} ${hidden ? classes.hidden : ""}`}
      aria-label={getContent("menu")}
      data-bottom-nav
    >
      <ul className={classes.list}>
        {items.map((item) => {
          const active = item.match(pathname);
          const content = (
            <>
              <span className={`${classes.iconWrap} ${item.center ? "glassIcon tone-violet" : active ? "glassIcon" : ""}`}>
                <Ixon width="1.375rem">{item.icon}</Ixon>
              </span>
              <span className={classes.label}>{getContent(item.label)}</span>
            </>
          );
          const className = `${classes.item} ${item.center ? classes.center : ""} ${active ? classes.active : ""}`;
          return (
            <li key={item.key} className={classes.cell}>
              {item.needsUser && !user ? (
                <button
                  type="button"
                  className={className}
                  onClick={() => setPopup("Auth", <AuthPopup />)}
                >
                  {content}
                </button>
              ) : (
                <Link
                  href={item.href}
                  className={className}
                  aria-current={active ? "page" : undefined}
                >
                  {content}
                </Link>
              )}
            </li>
          );
        })}
      </ul>
    </nav>,
    document.body,
  );
};

export default BottomNav;
