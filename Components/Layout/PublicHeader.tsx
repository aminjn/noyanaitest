import Link from "@/Components/i18n/Link";
import LogoLong from "../UI/LogoLong";
import classes from "./PublicHeader.module.css";
import UserButton from "./UserButton";
import LanguageSwitcher from "../i18n/LanguageSwitcher";
import ThemeToggle from "../UI/Theme/ThemeToggle";
import { usePathname } from "@/Components/i18n/navigation";
import { Fragment, ReactNode, RefObject, useEffect, useLayoutEffect, useRef, useState } from "react";
import Ixon from "../UI/Ixon";
import ChevronIcon from "../Icons/ChevronIcon";
import { ContentKey } from "../Enums/contentKeys";
import SearchIcon from "../Icons/SearchIcon";
import Bell01Icon from "../Icons/Bell01Icon";
import SearchButton from "./SearchButton";
import { txsRegular } from "../UI/Typography";
import NotificationButton from "./NotificationButton";
import CartButton from "./CartButton";
import BarsIcon from "../Icons/BarsIcon";
import PublicMobileMenu from "./PublicMobileMenu";
import MegaMenu from "./MegaMenu";
import SparkIcon from "../Icons/SparkIcon";
import StetoscopeIcon from "../Icons/StetoscopeIcon";
import SearchModal from "./SearchModal";
import XMarkIcon from "../Icons/XMarkIcon";
import LineBagIcon from "../Icons/LinebagIcon";
import useScopedLocale from "../Hooks/useScopedLocale";
import { ContentNamespace } from "../Enums/contentNamespaces";

const LOCALE_NS: ContentNamespace[] = ["common"];

const NavLink = ({
  target,
  title,
  accent,
  icon,
}: {
  target: string;
  title: ContentKey;
  accent?: boolean;
  icon?: ReactNode;
}) => {
  const pathname = usePathname();
  const getContent = useScopedLocale(LOCALE_NS);
  const isActive =
    target === "/" ? pathname === "/" : pathname.startsWith(target);

  return (
    <Link
      href={target}
      aria-current={isActive ? "page" : undefined}
      className={`${classes.link} ${isActive ? classes.active : ""} ${
        accent ? classes.accent : ""
      }`}
    >
      {!!icon && <Ixon width="1rem">{icon}</Ixon>}
      <span>{getContent(title)}</span>
    </Link>
  );
};

const WithSubs = ({
  title,
  subs,
}: {
  title: ContentKey;
  subs: { title: ContentKey; taregt: string; icon?: ReactNode }[];
}) => {
  const [isOpen, setIsOpen] = useState<boolean>(false);

  const getContent = useScopedLocale(LOCALE_NS);

  useEffect(() => {
    if (isOpen) {
      const listener = () => setIsOpen(false);
      const onKey = (e: KeyboardEvent) => e.key === "Escape" && setIsOpen(false);
      document.addEventListener("click", listener, false);
      document.addEventListener("keydown", onKey, false);
      return () => {
        document.removeEventListener("click", listener, false);
        document.removeEventListener("keydown", onKey, false);
      };
    }
  }, [isOpen]);

  return (
    <div className={classes.subsRoot}>
      <button
        type="button"
        className={`${classes.link} ${isOpen ? classes.linkOpen : ""}`}
        aria-expanded={isOpen}
        onClick={(e) => {
          e.stopPropagation();
          setIsOpen((prev) => !prev);
        }}
      >
        <span>{getContent(title)}</span>
        <Ixon width="0.875rem" className={classes.chevron}>
          <ChevronIcon />
        </Ixon>
      </button>
      {isOpen && (
        <div className={`${classes.subs} glassMenu`}>
          {subs.map((sub) => (
            <Link key={sub.title} href={sub.taregt} className={classes.sub}>
              {!!sub.icon && (
                <span className={`${classes.subIcon} glassIcon`}>
                  <Ixon width="1.125rem">{sub.icon}</Ixon>
                </span>
              )}
              <span>{getContent(sub.title)}</span>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
};


// How much of the menu fits on the bar right now: measured on the bar (a
// capped 90rem row whose account button widens when signed in), so the
// links never run under the search / account buttons at any screen size.
type NavFit = "full" | "tight" | "compact" | "burger";
const useIsoLayoutEffect = typeof window === "undefined" ? useEffect : useLayoutEffect;
const useNavFit = (innerRef: RefObject<HTMLElement>) => {
  const [fit, setFit] = useState<NavFit | undefined>(undefined);
  useIsoLayoutEffect(() => {
    const inner = innerRef.current;
    if (!inner) return;
    const nav = inner.querySelector<HTMLElement>("[data-nav]");
    const start = inner.querySelector<HTMLElement>("[data-start]");
    const end = inner.querySelector<HTMLElement>("[data-end]");
    if (!nav || !start || !end) return;
    let frame = 0;
    const measure = () => {
      cancelAnimationFrame(frame);
      frame = requestAnimationFrame(() => {
        // phones: the CSS already shows the burger
        if (window.matchMedia("(max-width: 750px)").matches) return setFit("burger");
        const prev = inner.getAttribute("data-fit");
        const cs = getComputedStyle(inner);
        const widthOf = (mode: NavFit) => {
          inner.setAttribute("data-fit", mode);
          const gap = parseFloat(cs.columnGap || cs.gap) || 0;
          const pad = parseFloat(cs.paddingInlineStart || cs.paddingLeft) + parseFloat(cs.paddingInlineEnd || cs.paddingRight);
          const room = inner.clientWidth - pad - start.offsetWidth - end.offsetWidth - gap * 2;
          return { room, need: nav.scrollWidth };
        };
        const full = widthOf("full");
        const tight = widthOf("tight");
        // packed links and the account button as its avatar only (2026-10:
        // a signed-in phone number took the menu's room on a laptop)
        const compact = widthOf("compact");
        // a small margin so the last link never touches the search button
        const fits = (m: { need: number; room: number }) => m.need + 8 <= m.room;
        const next: NavFit = fits(full) ? "full" : fits(tight) ? "tight" : fits(compact) ? "compact" : "burger";
        if (prev) inner.setAttribute("data-fit", prev);
        else inner.removeAttribute("data-fit");
        setFit(next);
      });
    };
    measure();
    const ro = new ResizeObserver(measure);
    ro.observe(inner);
    ro.observe(end);
    window.addEventListener("resize", measure);
    return () => {
      cancelAnimationFrame(frame);
      ro.disconnect();
      window.removeEventListener("resize", measure);
    };
  }, [innerRef]);
  return fit;
};

const modals = ["search", "cart", "notification"] as const;

type Modal = (typeof modals)[number];

const modalLabels: Record<Modal, ContentKey> = {
  cart: "cart",
  notification: "notifications",
  search: "search",
};

const modalIcons: Record<Modal, ReactNode> = {
  cart: <LineBagIcon />,
  search: <SearchIcon />,
  notification: <Bell01Icon />,
};

const PublicHeader = () => {
  const getContent = useScopedLocale(LOCALE_NS);

  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState<boolean>(false);
  const innerRef = useRef<HTMLElement>(null);
  const navFit = useNavFit(innerRef);

  const [openModel, setOpenModel] = useState<Modal | null>(null);

  // a sentinel at the top instead of a scroll listener: the bar gets its
  // glass once the page leaves the top
  const sentinelRef = useRef<HTMLSpanElement>(null);
  const [isScrolled, setIsScrolled] = useState<boolean>(false);
  useEffect(() => {
    const el = sentinelRef.current;
    if (!el || typeof IntersectionObserver === "undefined") return;
    const observer = new IntersectionObserver(([entry]) =>
      setIsScrolled(!entry.isIntersecting),
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  return (
    <Fragment>
      <span ref={sentinelRef} className={classes.sentinel} aria-hidden="true" />
      <div
        className={`${classes.container} ${isScrolled ? classes.scrolled : ""}`}
      >
        <header className={classes.inner} ref={innerRef} data-fit={navFit}>
          <div className={classes.start} data-start>
            <button
              type="button"
              data-burger
              className={classes.burgerBtn}
              aria-label={getContent("menu")}
              aria-expanded={isMobileMenuOpen}
              onClick={() => setIsMobileMenuOpen(true)}
            >
              <Ixon width="1.25rem">
                <BarsIcon />
              </Ixon>
            </button>
            <Link className={classes.logo} href={"/"}>
              <LogoLong />
            </Link>
          </div>
          <nav className={classes.nav} data-nav>
            <NavLink title="homePage" target="/" />
            <MegaMenu />
            <NavLink title="officeBook" target="/book" />
            <NavLink title="aiDetection" target="/wizard" icon={<SparkIcon />} />
            <NavLink title="noyanClinic" target="/product" />
            <WithSubs
              title="more"
              subs={[
                // the pharmacy and lab directories (2026-10): reachable from
                // the menu, not only the footer
                { title: "pharmacies", taregt: "/pharmacy" },
                { title: "paraClinics", taregt: "/paraClinic" },
                { title: "blogs", taregt: "/mag" },
                { title: "bookingGuide", taregt: "/bookingGuide" },
                { title: "faqs", taregt: "/faq" },
                { title: "contactUs", taregt: "/contact" },
                { title: "aboutUs", taregt: "/about" },
              ]}
            />
            <NavLink
              title="forDoctors"
              target="/onboarding"
              accent
              icon={<StetoscopeIcon />}
            />
          </nav>
          <div className={classes.end} data-end>
            <div
              className={`${classes.endContent} ${!!openModel ? classes.hideMobileOpen : ""}`}
            >
              <span className={classes.iconBtn}>
                <SearchButton open={() => setOpenModel("search")} />
              </span>
              <span className={classes.iconBtn}>
                <CartButton
                  isOpen={openModel === "cart"}
                  open={() => setOpenModel("cart")}
                  close={() => setOpenModel(null)}
                />
              </span>
              <span className={classes.iconBtn}>
                <NotificationButton
                  isOpen={openModel === "notification"}
                  open={() => setOpenModel("notification")}
                  close={() => setOpenModel(null)}
                />
              </span>
              {/* phones: these two live in the burger menu */}
              <span className={classes.wideOnly}>
                <ThemeToggle compact />
              </span>
              <span className={classes.wideOnly}>
                <LanguageSwitcher />
              </span>
              <UserButton />
            </div>
            {!!openModel && (
              <div className={classes.mobileOpen}>
                <span className={`${classes.mobileIcon} glassIcon`}>
                  <Ixon width="1rem">{modalIcons[openModel]}</Ixon>
                </span>
                <span className={`${classes.mobileLabel} ${txsRegular}`}>
                  {getContent(modalLabels[openModel])}
                </span>
                <button
                  type="button"
                  onClick={() => setOpenModel(null)}
                  className={classes.mobileClose}
                  aria-label={getContent("close")}
                >
                  <Ixon width="1rem">
                    <XMarkIcon />
                  </Ixon>
                </button>
              </div>
            )}
          </div>
        </header>
        {openModel === "search" && (
          <SearchModal close={() => setOpenModel(null)} />
        )}
        <PublicMobileMenu
          isOpen={isMobileMenuOpen}
          onClose={() => setIsMobileMenuOpen(false)}
        />
      </div>
    </Fragment>
  );
};

export default PublicHeader;
