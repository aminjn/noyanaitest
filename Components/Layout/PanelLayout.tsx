import { ReactNode, useContext, useEffect, useState } from "react";
import classes from "./PanelLayout.module.css";
import Loading from "../Admin/UI/Loading";
import useUser from "../Hooks/useUser";
import LoginRequired from "../UI/LoginRequired";
import Ixon from "../UI/Ixon";
import BarsIcon from "../Icons/BarsIcon";
import XMarkIcon from "../Icons/XMarkIcon";
import ChevronIcon from "../Icons/ChevronIcon";
import LogoLong from "../UI/LogoLong";
import Link from "@/Components/i18n/Link";
import { usePathname } from "@/Components/i18n/navigation";
import LanguageSwitcher from "../i18n/LanguageSwitcher";
import NotificationButton from "./NotificationButton";
import UserButton from "./UserButton";
import ThemeToggle from "../UI/Theme/ThemeToggle";
import BreadCrumpContext from "../Store/BreadCrumpStore";
import { ContentKey } from "../Enums/contentKeys";
import useScopedLocale from "../Hooks/useScopedLocale";
import { ContentNamespace } from "../Enums/contentNamespaces";
import Copilot from "../Ai/Copilot/Copilot";
import { TabBar, TabItem } from "./BottomNav";
import { lockScroll } from "../helpers/scrollLock";

const LOCALE_NS: ContentNamespace[] = ["common", "layoutPanel"];

const panelTitles: Record<string, ContentKey> = {
  doctorpanel: "doctorPanelTitle",
  clinicpanel: "clinicPanel",
  pharmacypanel: "pharmacyDashboard",
  insurancepanel: "insuranceDashboard",
  paraClinicPanel: "paraClinicDashboard",
  secretarypanel: "secretaryDashboard",
  hospitalpanel: "hospitalPanelTitle",
};

// Where the current page sits (set by each page through BreadCrumpContext).
const Trail = () => {
  const { trail } = useContext(BreadCrumpContext);
  if (!trail.length) return null;
  return (
    <nav className={classes.trail} aria-label="breadcrumb">
      {trail.map((segment, i) => (
        <span key={segment.target} className={classes.trailItem}>
          {i > 0 && (
            <Ixon width=".875rem" className={classes.trailSep}>
              <ChevronIcon />
            </Ixon>
          )}
          {i === trail.length - 1 ? (
            <span className={classes.trailCurrent}>{segment.title}</span>
          ) : (
            <Link href={segment.target}>{segment.title}</Link>
          )}
        </span>
      ))}
    </nav>
  );
};

// App shell shared by every panel (doctor, clinic, pharmacy, ...): a
// full-height sidebar with the panel's menu and a slim top bar; on phones
// the sidebar is a drawer opened from the top bar. A panel may give `tabs`
// for the phone tab bar (the daily pages); a last "menu" tab opens the
// drawer with everything else.
const PanelLayout = ({
  children,
  sidebar,
  tabs,
  tabsOff,
}: {
  children: ReactNode;
  sidebar: ReactNode;
  tabs?: TabItem[];
  // full-screen tools (a chat room, a call) hide the tab bar
  tabsOff?: boolean;
}) => {
  const { user, isUserLoading } = useUser();
  const getContent = useScopedLocale(LOCALE_NS);
  const pathname = usePathname();
  const panel = pathname.split("/").filter(Boolean)[0] || "";

  const [isSidebarOpen, setIsSidebarOpen] = useState<boolean>(false);
  const [notificationsOpen, setNotificationsOpen] = useState<boolean>(false);


  useEffect(() => setIsSidebarOpen(false), [pathname]);

  useEffect(() => {
    if (!isSidebarOpen) return;
    const unlock = lockScroll();
    const listener = (e: KeyboardEvent) => {
      if (e.key === "Escape") setIsSidebarOpen(false);
    };
    document.addEventListener("keyup", listener, false);
    return () => {
      unlock();
      document.removeEventListener("keyup", listener, false);
    };
  }, [isSidebarOpen]);

  if (isUserLoading) return <Loading />;
  if (!user) return <LoginRequired />;
  const tabItems: TabItem[] = tabs?.length
    ? [
        ...tabs,
        {
          key: "menu",
          label: getContent("menu"),
          icon: <BarsIcon />,
          active: isSidebarOpen,
          onClick: () => setIsSidebarOpen(true),
        },
      ]
    : [];
  return (
    <div
      className={`${classes.shell} ${tabItems.length && !tabsOff ? classes.withTabs : ""} ${tabsOff ? classes.fullTool : ""}`}
    >
      <div
        className={`${classes.backdrop} ${isSidebarOpen ? classes.backdropOpen : ""}`}
        onClick={() => setIsSidebarOpen(false)}
        aria-hidden
      />
      <aside
        className={`${classes.sidebar} ${isSidebarOpen ? classes.sidebarOpen : ""}`}
        aria-label={getContent("menu")}
      >
        <div className={classes.brand}>
          <Link href="/" className={classes.logo} aria-label={getContent("viewSite")}>
            <LogoLong />
          </Link>
          <button
            type="button"
            className={classes.sidebarClose}
            aria-label={getContent("close")}
            onClick={() => setIsSidebarOpen(false)}
          >
            <Ixon width="1.125rem">
              <XMarkIcon />
            </Ixon>
          </button>
        </div>
        {panelTitles[panel] && (
          <span className={classes.panelName}>{getContent(panelTitles[panel])}</span>
        )}
        {/* phones: the display mode and the language live here, so the top
            bar keeps 44px targets for the bell and the account */}
        <div className={classes.drawerTools}>
          <ThemeToggle />
          <LanguageSwitcher />
        </div>
        <div className={classes.sidebarBody}>{sidebar}</div>
      </aside>

      <div className={classes.main}>
        <header className={classes.topbar}>
          <button
            type="button"
            className={classes.burger}
            aria-label={getContent("menu")}
            onClick={() => setIsSidebarOpen(true)}
          >
            <Ixon width="1.25rem">
              <BarsIcon />
            </Ixon>
          </button>
          <Link href="/" className={classes.topbarLogo}>
            <LogoLong />
          </Link>
          <Trail />
          <div className={classes.topbarActions}>
            <Link href="/" className={classes.siteLink}>
              {getContent("viewSite")}
            </Link>
            <span className={classes.wideOnly}>
              <ThemeToggle />
            </span>
            <span className={classes.wideOnly}>
              <LanguageSwitcher />
            </span>
            <NotificationButton
              isOpen={notificationsOpen}
              open={() => setNotificationsOpen(true)}
              close={() => setNotificationsOpen(false)}
            />
            <UserButton />
          </div>
        </header>
        <main className={classes.content}>{children}</main>
      </div>
      {!!tabItems.length && <TabBar items={tabItems} label={getContent("menu")} off={tabsOff} />}
      {/* «دستیار نویان»: the profile's own assistant (none on the secretary's home) */}
      <Copilot />
    </div>
  );
};

export default PanelLayout;
