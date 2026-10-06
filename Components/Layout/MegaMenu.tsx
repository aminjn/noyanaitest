import Link from "@/Components/i18n/Link";
import {
  KeyboardEvent,
  ReactNode,
  useCallback,
  useEffect,
  useId,
  useRef,
  useState,
} from "react";
import classes from "./MegaMenu.module.css";
import Ixon from "../UI/Ixon";
import ChevronIcon from "../Icons/ChevronIcon";
import ArrowLeftIcon from "../Icons/ArrowLeftIcon";
import SparkIcon from "../Icons/SparkIcon";
import Calendar02Icon from "../Icons/Calendar02Icon";
import PillIcon from "../Icons/PillIcon";
import FlaskIcon from "../Icons/FlaskIcon";
import StetoscopeIcon from "../Icons/StetoscopeIcon";
import VirusIcon from "../Icons/VirusIcon";
import { ContentKey } from "../Enums/contentKeys";
import { usePathname } from "@/Components/i18n/navigation";
import useScopedLocale from "../Hooks/useScopedLocale";
import { ContentNamespace } from "../Enums/contentNamespaces";
import {
  categoryTabs,
  CategoryLike,
  CategoryTab,
  HeaderCategories,
} from "./headerCategories";
import useHeaderCategories from "./useHeaderCategories";

const LOCALE_NS: ContentNamespace[] = ["common"];

// how many items a category shows before "see all"
const MAX_ITEMS = 18;

// Shortcuts shown when a category has no items yet: every one of them is a
// real page with content, so the panel is never a lone "nothing found".
export const popularLinks: {
  title: ContentKey;
  target: string;
  icon: ReactNode;
  tone: CategoryTab["tone"];
}[] = [
  { title: "officeBook", target: "/book", icon: <Calendar02Icon />, tone: "indigo" },
  { title: "aiDetection", target: "/wizard", icon: <SparkIcon />, tone: "violet" },
  { title: "specialitiesList", target: "/speciality", icon: <StetoscopeIcon />, tone: "sky" },
  { title: "diseasesList", target: "/disease", icon: <VirusIcon />, tone: "rose" },
  { title: "homeHeroQuickLinkPharmacy", target: "/product", icon: <PillIcon />, tone: "teal" },
  { title: "homeHeroQuickLinkLab", target: "/paraClinic", icon: <FlaskIcon />, tone: "amber" },
];

export const itemsOf = (
  data: HeaderCategories | undefined,
  key: CategoryTab["key"],
): CategoryLike[] => {
  const list = data?.[key];
  return Array.isArray(list)
    ? (list as CategoryLike[]).filter((el) => !!el && !!el._id && !!(el.title || el.name))
    : [];
};

// Header "categories" mega menu: a frosted panel with the category column
// at the start and the active category's own items (e.g. every speciality)
// next to it, each as a glass tile with the category's icon. Opens on click, on hover (pointer devices, with a short intent
// delay) and from the keyboard (Enter/Space/ArrowDown); Escape closes and
// returns focus to the trigger; arrow keys move along the category column.
const MegaMenu = () => {
  const getContent = useScopedLocale(LOCALE_NS);
  const pathname = usePathname();
  const panelId = useId();

  const [isOpen, setIsOpen] = useState<boolean>(false);
  const [activeKey, setActiveKey] = useState<CategoryTab["key"]>(
    categoryTabs[0].key,
  );

  const data = useHeaderCategories();

  const rootRef = useRef<HTMLDivElement>(null);
  const triggerRef = useRef<HTMLButtonElement>(null);
  const tabRefs = useRef<(HTMLButtonElement | null)[]>([]);
  const timer = useRef<ReturnType<typeof setTimeout>>();

  const clearTimer = () => timer.current && clearTimeout(timer.current);

  const close = useCallback((focusTrigger?: boolean) => {
    clearTimer();
    setIsOpen(false);
    if (focusTrigger) triggerRef.current?.focus();
  }, []);

  // close on navigation
  useEffect(() => {
    close();
  }, [pathname, close]);

  useEffect(() => {
    if (!isOpen) return;
    const onClick = (e: MouseEvent) => {
      if (rootRef.current && !rootRef.current.contains(e.target as Node))
        close();
    };
    const onKey = (e: globalThis.KeyboardEvent) => {
      if (e.key === "Escape") close(true);
    };
    window.addEventListener("click", onClick);
    window.addEventListener("keydown", onKey);
    return () => {
      window.removeEventListener("click", onClick);
      window.removeEventListener("keydown", onKey);
    };
  }, [isOpen, close]);

  useEffect(() => clearTimer, []);

  const finePointer = () =>
    typeof window !== "undefined" &&
    window.matchMedia("(hover: hover) and (pointer: fine)").matches;

  const onEnter = () => {
    if (!finePointer()) return;
    clearTimer();
    timer.current = setTimeout(() => setIsOpen(true), 90);
  };

  const onLeave = () => {
    if (!finePointer()) return;
    clearTimer();
    timer.current = setTimeout(() => setIsOpen(false), 220);
  };

  const focusTab = (index: number) => {
    const count = categoryTabs.length;
    const next = (index + count) % count;
    setActiveKey(categoryTabs[next].key);
    tabRefs.current[next]?.focus();
  };

  const onTriggerKey = (e: KeyboardEvent<HTMLButtonElement>) => {
    if (e.key === "ArrowDown") {
      e.preventDefault();
      setIsOpen(true);
      requestAnimationFrame(() =>
        focusTab(categoryTabs.findIndex((tab) => tab.key === activeKey)),
      );
    }
  };

  const onTabKey = (e: KeyboardEvent<HTMLButtonElement>, index: number) => {
    if (e.key === "ArrowDown") {
      e.preventDefault();
      focusTab(index + 1);
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      focusTab(index - 1);
    } else if (e.key === "Home") {
      e.preventDefault();
      focusTab(0);
    } else if (e.key === "End") {
      e.preventDefault();
      focusTab(categoryTabs.length - 1);
    }
  };

  const active =
    categoryTabs.find((tab) => tab.key === activeKey) || categoryTabs[0];
  const items = itemsOf(data, active.key);
  const shown = items.slice(0, MAX_ITEMS);
  const label = getContent(active.label);

  return (
    <div
      className={classes.root}
      ref={rootRef}
      onMouseEnter={onEnter}
      onMouseLeave={onLeave}
    >
      <button
        ref={triggerRef}
        type="button"
        data-mega-trigger
        className={`${classes.trigger} ${isOpen ? classes.triggerOpen : ""}`}
        aria-expanded={isOpen}
        aria-controls={panelId}
        onClick={() => setIsOpen((prev) => !prev)}
        onKeyDown={onTriggerKey}
      >
        <span>{getContent("categories")}</span>
        <Ixon width="0.875rem" className={classes.triggerChevron}>
          <ChevronIcon />
        </Ixon>
      </button>

      <div
        id={panelId}
        className={`${classes.panel} glassMenu ${isOpen ? classes.open : ""}`}
        hidden={!isOpen}
      >
        <ul className={classes.tabs} aria-label={getContent("categories")}>
          {categoryTabs.map((tab, index) => {
            const count = itemsOf(data, tab.key).length;
            const isActive = tab.key === active.key;
            return (
              <li key={tab.key}>
                <button
                  ref={(el) => {
                    tabRefs.current[index] = el;
                  }}
                  type="button"
                  className={`${classes.tab} ${isActive ? classes.tabActive : ""}`}
                  aria-pressed={isActive}
                  onMouseEnter={() => setActiveKey(tab.key)}
                  onFocus={() => setActiveKey(tab.key)}
                  onClick={() => setActiveKey(tab.key)}
                  onKeyDown={(e) => onTabKey(e, index)}
                >
                  <span className={`${classes.tabIcon} tone-${tab.tone}`}>
                    <Ixon width="1.125rem">{tab.icon}</Ixon>
                  </span>
                  <span className={classes.tabLabel}>
                    {getContent(tab.label)}
                  </span>
                  {count > 0 && (
                    <span className={classes.tabCount}>{count}</span>
                  )}
                  <Ixon width="0.75rem" className={classes.tabChevron}>
                    <ChevronIcon />
                  </Ixon>
                </button>
              </li>
            );
          })}
        </ul>

        <div className={classes.content}>
          <div className={classes.contentHead}>
            <span className={`${classes.headIcon} tone-${active.tone}`}>
              <Ixon width="1.5rem">{active.icon}</Ixon>
            </span>
            <div className={classes.headText}>
              <span className={classes.headTitle}>{label}</span>
              <span className={classes.headDesc}>
                {getContent(active.description)}
              </span>
            </div>
            <Link
              href={active.allTarget}
              className={classes.seeAll}
              onClick={() => close()}
            >
              <span>{getContent("fullListOfX", [label])}</span>
              <Ixon width="1rem">
                <ArrowLeftIcon />
              </Ixon>
            </Link>
          </div>

          {shown.length ? (
            <ul className={classes.items}>
              {shown.map((cat) => (
                <li key={cat._id}>
                  <Link
                    href={active.hrefFor(cat.slug || cat._id)}
                    className={classes.item}
                    onClick={() => close()}
                  >
                    <span className={`${classes.itemIcon} tone-${active.tone}`}>
                      <Ixon width="1rem">{active.icon}</Ixon>
                    </span>
                    <span className={classes.itemLabel}>
                      {cat.title || cat.name}
                    </span>
                  </Link>
                </li>
              ))}
              {items.length > shown.length && (
                <li>
                  <Link
                    href={active.allTarget}
                    className={`${classes.item} ${classes.itemMore}`}
                    onClick={() => close()}
                  >
                    <span className={classes.itemLabel}>
                      {getContent("fullListOfX", [label])}
                    </span>
                    <Ixon width="0.875rem">
                      <ArrowLeftIcon />
                    </Ixon>
                  </Link>
                </li>
              )}
            </ul>
          ) : (
            <p className={classes.emptyNote}>{getContent("nothingFound")}</p>
          )}

          <Link
            href="/wizard"
            className={classes.aiCard}
            onClick={() => close()}
          >
            <span className={classes.aiIcon}>
              <Ixon width="1.25rem">
                <SparkIcon />
              </Ixon>
            </span>
            <span className={classes.aiText}>
              <span className={classes.aiTitle}>{getContent("megaAiTitle")}</span>
              <span className={classes.aiDesc}>{getContent("megaAiText")}</span>
            </span>
            <span className={classes.aiGo}>
              <span>{getContent("chatWithAi")}</span>
              <Ixon width="1rem">
                <ArrowLeftIcon />
              </Ixon>
            </span>
          </Link>
        </div>
      </div>
    </div>
  );
};

export default MegaMenu;
