import Link from "@/Components/i18n/Link";
import { ReactNode, useEffect, useRef } from "react";
import classes from "./PublicMobileMenu.module.css";
import useUser from "../Hooks/useUser";
import usePopup from "../Hooks/usePopup";
import Ixon from "../UI/Ixon";
import Button from "../UI/Button";
import LogoLong from "../UI/LogoLong";
import ThemeToggle from "../UI/Theme/ThemeToggle";
import AuthPopup from "../Popups/AuthPopup";
import { ContentKey } from "../Enums/contentKeys";
import { categoryTabs } from "./headerCategories";
import useHeaderCategories from "./useHeaderCategories";
import { itemsOf } from "./MegaMenu";
import XMarkIcon from "../Icons/XMarkIcon";
import ArrowLeftIcon from "../Icons/ArrowLeftIcon";
import Calendar02Icon from "../Icons/Calendar02Icon";
import BuildingIcon from "../Icons/BuildingIcon";
import BookIcon from "../Icons/BookIcon";
import InfoiCircleIcon from "../Icons/InfoiCircleIcon";
import HelpCircleIcon from "../Icons/HelpCircleIcon";
import CallingIcon from "../Icons/CallingIcon";
import MapIcon from "../Icons/MapIcon";
import StetoscopeIcon from "../Icons/StetoscopeIcon";
import HeadphoneIcon from "../Icons/HeadphoneIcon";
import UserCircleIcon from "../Icons/UserCircleIcon";
import SparkIcon from "../Icons/SparkIcon";
import DownloadIcon from "../Icons/DownloadIcon";
import usePwaInstall, { openInstallSheet } from "../Pwa/usePwaInstall";
import { t2xsRegular, tbaseMedium, tsmMedium } from "../UI/Typography";
import useScopedLocale from "../Hooks/useScopedLocale";
import { ContentNamespace } from "../Enums/contentNamespaces";

const LOCALE_NS: ContentNamespace[] = ["common"];

const menuItems: { title: ContentKey; target: string; icon: ReactNode }[] = [
  { title: "officeBook", target: "/book", icon: <Calendar02Icon /> },
  { title: "aiDetection", target: "/wizard", icon: <SparkIcon /> },
  { title: "noyanClinic", target: "/clinic", icon: <BuildingIcon /> },
  { title: "blogs", target: "/mag", icon: <BookIcon /> },
  {
    title: "bookingGuide",
    target: "/bookingGuide",
    icon: <InfoiCircleIcon />,
  },
  { title: "faqs", target: "/faq", icon: <HelpCircleIcon /> },
  { title: "contactUs", target: "/contact", icon: <CallingIcon /> },
  { title: "aboutUs", target: "/about", icon: <MapIcon /> },
];

const PublicMobileMenu = ({
  isOpen,
  onClose,
}: {
  isOpen: boolean;
  onClose: () => void;
}) => {
  const getContent = useScopedLocale(LOCALE_NS);
  const { user } = useUser();
  const { setPopup } = usePopup();

  const data = useHeaderCategories();
  const { isStandalone } = usePwaInstall();
  const panelRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!isOpen) return;

    document.body.style.overflow = "hidden";
    // move focus into the drawer for keyboard and screen-reader users
    requestAnimationFrame(() =>
      panelRef.current?.querySelector<HTMLElement>("button, a")?.focus(),
    );

    const listener = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    document.addEventListener("keyup", listener, false);

    return () => {
      document.body.style.overflow = "";
      document.removeEventListener("keyup", listener, false);
    };
  }, [isOpen, onClose]);

  // the specialities the header knows about, as quick chips
  const specialities = itemsOf(data, "specialities").slice(0, 8);
  const specialitiesTab = categoryTabs[0];

  return (
    <div
      className={`${classes.root} ${isOpen ? classes.open : ""}`}
      aria-hidden={!isOpen}
    >
      <div className={classes.backdrop} onClick={onClose} />
      <div
        className={`${classes.panel} glassMenu`}
        ref={panelRef}
        role="dialog"
        aria-modal="true"
        aria-label={getContent("menu")}
      >
        <div className={classes.top}>
          <button
            type="button"
            className={classes.closeBtn}
            onClick={onClose}
            aria-label={getContent("close")}
          >
            <Ixon width="1.125rem">
              <XMarkIcon />
            </Ixon>
          </button>
          <Link href="/" className={classes.logo} onClick={onClose}>
            <LogoLong width={104} height={36} />
          </Link>
          <ThemeToggle className={classes.theme} />
        </div>

        <div className={classes.scroll}>
          {user ? (
            <Link
              href="/dashboard"
              className={classes.profileRow}
              onClick={onClose}
            >
              <Ixon width="1.5rem">
                <UserCircleIcon />
              </Ixon>
              <span className={tbaseMedium}>{user.phone}</span>
            </Link>
          ) : (
            <Button
              className={classes.authBtn}
              variant="Primary"
              mode="Outline"
              size="L"
              radius="Medium"
              tailIcon={<ArrowLeftIcon />}
              onClick={() => {
                onClose();
                setPopup("Auth", <AuthPopup />);
              }}
            >
              {getContent("loginOrSignup")}
            </Button>
          )}

          <section className={classes.section}>
            <span className={`${classes.sectionTitle} ${t2xsRegular}`}>
              {getContent("categories")}
            </span>
            <ul className={classes.tiles}>
              {categoryTabs.map((tab) => (
                <li key={tab.key}>
                  <Link
                    href={tab.allTarget}
                    className={classes.tile}
                    onClick={onClose}
                  >
                    <span className={`${classes.tileIcon} tone-${tab.tone}`}>
                      <Ixon width="1.125rem">{tab.icon}</Ixon>
                    </span>
                    <span className={classes.tileLabel}>
                      {getContent(tab.label)}
                    </span>
                  </Link>
                </li>
              ))}
            </ul>
            {!!specialities.length && (
              <div className={classes.chips}>
                {specialities.map((cat) => (
                  <Link
                    key={cat._id}
                    href={specialitiesTab.hrefFor(cat.slug || cat._id)}
                    className={classes.chip}
                    onClick={onClose}
                  >
                    {cat.title || cat.name}
                  </Link>
                ))}
              </div>
            )}
          </section>

          <nav className={classes.nav} aria-label={getContent("menu")}>
            {menuItems.map((item) => (
              <Link
                key={item.title}
                href={item.target}
                className={classes.navItem}
                onClick={onClose}
              >
                <span className={`${classes.navItemIcon} glassIcon`}>
                  <Ixon width="1.125rem">{item.icon}</Ixon>
                </span>
                <span className={tsmMedium}>{getContent(item.title)}</span>
              </Link>
            ))}
          </nav>

          <div className={classes.ctas} onClick={onClose}>
            {!isStandalone && (
              <Button
                variant="Primary"
                mode="Inline"
                size="L"
                radius="Medium"
                leadIcon={<DownloadIcon />}
                className={classes.installBtn}
                onClick={() => openInstallSheet()}
              >
                {getContent("installApp")}
              </Button>
            )}
            <Button
              href="/onboarding"
              variant="Secondary"
              mode="Outline"
              size="L"
              radius="Medium"
              leadIcon={<StetoscopeIcon />}
            >
              {getContent("doctorsAndMedicalCenters")}
            </Button>
            <Button
              href={user ? "/dashboard/support" : "/contact"}
              variant="Primary"
              mode="Fill"
              size="L"
              radius="Medium"
              leadIcon={<HeadphoneIcon />}
            >
              {getContent("contactSupport")}
            </Button>
          </div>
        </div>

        <div className={classes.footer}>
          <p className={`${classes.footerHours} ${t2xsRegular}`}>
            {getContent("supportWorkingHours")}
          </p>
          <div className={classes.footerContacts}>
            <a
              className={`${classes.footerContact} ${t2xsRegular}`}
              href={`mailto:${getContent("mailValue")}`}
            >
              {getContent("mailLabel")}
            </a>
            <a
              className={`${classes.footerContact} ${t2xsRegular}`}
              href={`tel:${getContent("mobileValue")}`}
            >
              {getContent("mobileLabel")}
            </a>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PublicMobileMenu;
