import Link from "@/Components/i18n/Link";
import LogoLong from "../UI/LogoLong";
import classes from "./PublicHeader.module.css";
import UserButton from "./UserButton";
import LanguageSwitcher from "../i18n/LanguageSwitcher";
import ThemeToggle from "../UI/Theme/ThemeToggle";
import { usePathname } from "@/Components/i18n/navigation";
import { Fragment, ReactNode, useEffect, useRef, useState } from "react";
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
                <Ixon className={classes.subIcon} width="1.125rem">
                  {sub.icon}
                </Ixon>
              )}
              <span>{getContent(sub.title)}</span>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
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

  const [openModel, setOpenModel] = useState<Modal | null>(null);

  // the page scrolls inside <body>, so watch a sentinel instead of window
  // scroll events: the bar gets its shadow once the page leaves the top
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
        <header className={classes.inner}>
          <div className={classes.start}>
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
          <nav className={classes.nav}>
            <NavLink title="homePage" target="/" />
            <MegaMenu />
            <NavLink title="officeBook" target="/book" />
            <NavLink title="aiDetection" target="/wizard" icon={<SparkIcon />} />
            <NavLink title="noyanClinic" target="/product" />
            <WithSubs
              title="more"
              subs={[
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
          <div className={classes.end}>
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
              <ThemeToggle compact className={classes.theme} />
              <LanguageSwitcher />
              <UserButton />
            </div>
            {!!openModel && (
              <div className={classes.mobileOpen}>
                <Ixon width="1rem" className={classes.mobileIcon}>
                  {modalIcons[openModel]}
                </Ixon>
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
