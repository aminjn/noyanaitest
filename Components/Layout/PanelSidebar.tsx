import useSWR from "swr";
import useUser from "../Hooks/useUser";
import DoctorSidebar from "./DoctorSidebar";
import classes from "./PanelSidebar.module.css";
import { API } from "../config";
import { fetcher } from "../helpers/fetcher";
import { Fragment, ReactNode, useEffect, useMemo, useState } from "react";
import { ContentKey } from "../Enums/contentKeys";
import { usePathname } from "@/Components/i18n/navigation";
import Ixon from "../UI/Ixon";
import Link from "@/Components/i18n/Link";
import Loading from "../Admin/UI/Loading";
import ChevronIcon from "../Icons/ChevronIcon";
import HostedImage from "../UI/HostedImage";
import useScopedLocale from "../Hooks/useScopedLocale";
import { ContentNamespace } from "../Enums/contentNamespaces";
import CommandPalette, { CommandItem } from "../UI/CommandPalette";

const LOCALE_NS: ContentNamespace[] = ["common", "layoutPanel"];

export type LinkMapItem = {
  icon: ReactNode;
  title: ContentKey;
  className?: string;
  side?: ReactNode;
  // pending work on this page (invites, orders…) shown as a count pill
  badge?: number;
  // section heading shown above the first item of each group
  group?: ContentKey;
  // other first-level segments that also light this item up (a hub page
  // whose detail pages live elsewhere)
  match?: string[];
  show: boolean;
} & (
  | { target: string; onClick?: never; children?: never }
  | { onClick: () => unknown; target?: never; children?: never }
  // a section with its own submenu (2026-10: «مالی و حسابداری», «ارتباط با
  // بیماران»): opens on click, and is open while one of its pages is shown
  | { children: LinkMapItem[]; target?: never; onClick?: never }
);

// /<panel>/<target>/... -> active for the section and all its subpages
const isItemActive = (pathname: string, panel: string, target?: string, match?: string[]) => {
  if (target === undefined) return false;
  const segments = pathname.split("?")[0].split("/").filter(Boolean);
  if (segments[0] !== panel) return false;
  if (!target) return segments.length === 1;
  const parts = target.split("/").filter(Boolean);
  // a sub-page target ("finance/accounting") matches its own path
  if (parts.length > 1) return parts.every((p, i) => segments[i + 1] === p);
  return segments[1] === target || (!!match && match.includes(segments[1]));
};

const visibleChildren = (item: LinkMapItem) => (item.children || []).filter((c) => c.show);

export type LinkMap = LinkMapItem[];

const LinkItem = ({
  panel,
  item: { icon, title, className, onClick, side, target, badge, match },
  forceInactive = false,
}: {
  item: LinkMapItem;
  panel: string;
  // a section's overview link while one of its sub-pages is shown
  forceInactive?: boolean;
}) => {
  const getContent = useScopedLocale(LOCALE_NS);
  const pathname = usePathname();

  const isActive = useMemo<boolean>(
    () => !forceInactive && isItemActive(pathname, panel, target, match),
    [forceInactive, match, panel, pathname, target],
  );

  const content = useMemo(
    () => (
      <Fragment>
        <Ixon width="1.25rem">{icon}</Ixon>
        <span>{getContent(title)}</span>
        {!!side && <span className={classes.side}>{side}</span>}
        {!!badge && badge > 0 && <span className={classes.badge}>{badge > 99 ? "99+" : badge}</span>}
      </Fragment>
    ),
    [badge, getContent, icon, side, title],
  );

  return (
    <Fragment>
      {target !== undefined ? (
        <Link
          className={`${classes.link} ${
            isActive ? classes.activeLink : ""
          } ${className}`}
          href={`/${panel}/${target}`}
        >
          {content}
        </Link>
      ) : (
        <button className={`${classes.link} ${className}`} onClick={onClick}>
          {content}
        </button>
      )}
    </Fragment>
  );
};

// A menu entry with a submenu: the section title toggles it; the most
// specific child wins the active state (a child's own path beats the
// section's overview page).
const SectionItem = ({ item, panel }: { item: LinkMapItem; panel: string }) => {
  const getContent = useScopedLocale(LOCALE_NS);
  const pathname = usePathname();
  const children = visibleChildren(item);
  const anyActive = children.some((c) => isItemActive(pathname, panel, c.target, c.match));
  const [open, setOpen] = useState(anyActive);
  useEffect(() => {
    if (anyActive) setOpen(true);
  }, [anyActive]);
  // only the deepest matching child is highlighted
  const activeTarget = useMemo(() => {
    const hits = children.filter((c) => isItemActive(pathname, panel, c.target, c.match));
    return hits.sort((a, b) => (b.target || "").length - (a.target || "").length)[0]?.target;
  }, [children, panel, pathname]);
  const badge = children.reduce((sum, c) => sum + (c.badge || 0), item.badge || 0);
  return (
    <div className={classes.section}>
      <button
        type="button"
        className={`${classes.link} ${anyActive ? classes.sectionActive : ""} ${item.className || ""}`}
        aria-expanded={open}
        onClick={() => setOpen((v) => !v)}
      >
        <Ixon width="1.25rem">{item.icon}</Ixon>
        <span>{getContent(item.title)}</span>
        {!!item.side && <span className={classes.side}>{item.side}</span>}
        {!open && badge > 0 && <span className={classes.badge}>{badge > 99 ? "99+" : badge}</span>}
        <Ixon width="1rem" className={`${classes.sectionChevron} ${open ? classes.sectionChevronOpen : ""}`}>
          <ChevronIcon />
        </Ixon>
      </button>
      {open && (
        <div className={classes.sub}>
          {children.map((child) => (
            <LinkItem
              key={`${child.target}${child.title}`}
              item={{ ...child, className: `${child.className || ""} ${classes.subLink}` }}
              forceInactive={child.target !== activeTarget}
              panel={panel}
            />
          ))}
        </div>
      )}
    </div>
  );
};

const PanelSidebar = ({ links, panel }: { links: LinkMap; panel: string }) => {
  const { user } = useUser();
  const getContent = useScopedLocale(LOCALE_NS);

  const commands = useMemo<CommandItem[]>(
    () =>
      links
        .filter((l) => l.show)
        .flatMap((l): LinkMapItem[] =>
          l.children ? visibleChildren(l).map((c) => ({ ...c, group: l.title }) as LinkMapItem) : [l],
        )
        .filter((l) => l.target !== undefined)
        .map((l) => ({
          id: `${l.target}${l.title}`,
          label: getContent(l.title),
          hint: l.group ? getContent(l.group) : undefined,
          icon: l.icon,
          href: `/${panel}${l.target ? `/${l.target}` : ""}`,
        })),
    [getContent, links, panel],
  );

  if (!user) return <Loading />;
  return (
    <div className={classes.main}>
      <CommandPalette items={commands} className={classes.command} />
      <nav className={classes.bar}>
        {links
          .filter((item) => item.show)
          .map((item, i, shown) => (
            <Fragment key={`${item.target}${item.title}`}>
              {!!item.group && item.group !== shown[i - 1]?.group && (
                <span className={classes.group}>{getContent(item.group)}</span>
              )}
              {item.children ? (
                visibleChildren(item).length > 0 && <SectionItem item={item} panel={panel} />
              ) : (
                <LinkItem item={item} panel={panel} />
              )}
            </Fragment>
          ))}
      </nav>
      <Link href="/dashboard" className={classes.user}>
        <div className={classes.avatar}>
          <HostedImage
            src={user.avatar}
            alt={user.username || ""}
            fill
            sizes="2.5rem"
            style={{ objectFit: "cover" }}
          />
        </div>
        <div className={classes.userDetails}>
          <span className={classes.userName}>{user.username || getContent("user")}</span>
          <span className={classes.userPhone}>{user.phone}</span>
        </div>
        <Ixon width="1.125rem" className={classes.userChevron}>
          <ChevronIcon />
        </Ixon>
      </Link>
    </div>
  );
};

export default PanelSidebar;
