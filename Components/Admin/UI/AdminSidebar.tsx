import { ReactNode, useEffect, useMemo, useState } from "react";
import classes from "./AdminSidebar.module.css";
import Link from "@/Components/i18n/Link";
import { usePathname } from "@/Components/i18n/navigation";
import Ixon from "@/Components/UI/Ixon";
import ChevronIcon from "@/Components/Icons/ChevronIcon";
import SearchIcon from "@/Components/Icons/SearchIcon";
import CloseIcon from "@/Components/Icons/CloseIcon";
import useUser from "@/Components/Hooks/useUser";
import LogoLong from "@/Components/UI/LogoLong";
import ThemeToggle from "@/Components/UI/Theme/ThemeToggle";
import { adminPath } from "@/Components/helpers/adminPath";
import CommandPalette, { CommandItem } from "@/Components/UI/CommandPalette";
import useAccessLevel from "@/Components/Hooks/useAccessLevel";
import useSWR from "swr";
import { API } from "@/Components/config";
import { fetcher } from "@/Components/helpers/fetcher";
import {
  AdminMenuGroup,
  AdminMenuItem,
  adminHubs,
  adminMenu,
  adminPinnedItems,
  canNotAdminOpen,
} from "./adminMenu";
import { adminIntlTag, ta } from "@/Components/Admin/i18n/adminText";

export { canNotAdminOpen } from "./adminMenu";

const OPEN_GROUPS_KEY = "adminSidebarOpenGroups";

// Path after /<adminKey>/, e.g. "tamin/service" for /notadmin/tamin/service/123
const useAdminSubPath = () => {
  const pathname = usePathname();
  return pathname.split("/").slice(2).join("/");
};

const isUnder = (href: string, subPath: string) =>
  href === ""
    ? subPath === ""
    : subPath === href || subPath.startsWith(`${href}/`);

// A hub item (e.g. "taxonomy") is also active on every page it lists.
const isItemActive = (item: AdminMenuItem, subPath: string) =>
  isUnder(item.href, subPath) ||
  adminHubs.some(
    (hub) =>
      hub.hub === item.href &&
      hub.sections.some((section) =>
        section.items.some((el) => isUnder(el.href, subPath)),
      ),
  );

const ItemLink = ({
  item,
  active,
  icon,
  badge,
}: {
  item: AdminMenuItem;
  active: boolean;
  icon?: ReactNode;
  badge?: number;
}) => (
  <Link
    href={adminPath(item.href ? `/${item.href}` : "")}
    className={`${icon ? classes.pinned : classes.item} ${
      active ? classes.active : ""
    }`}
  >
    {icon && (
      <Ixon width="1.25rem" className={classes.icon}>
        {icon}
      </Ixon>
    )}
    <span>{ta(item.title)}</span>
    {!!badge && (
      <span className={classes.badge}>
        {badge > 99 ? "99+" : badge.toLocaleString(adminIntlTag())}
      </span>
    )}
  </Link>
);

const Group = ({
  group,
  open,
  onToggle,
  subPath,
}: {
  group: AdminMenuGroup;
  open: boolean;
  onToggle: () => void;
  subPath: string;
}) => {
  const hasActive = group.items.some((item) => isItemActive(item, subPath));
  return (
    <div className={`${classes.group} ${open ? classes.open : ""}`}>
      <button
        type="button"
        className={`${classes.groupHeader} ${hasActive ? classes.hasActive : ""}`}
        onClick={onToggle}
        aria-expanded={open}
      >
        <Ixon width="1.25rem" className={classes.icon}>
          {group.icon}
        </Ixon>
        <span className={classes.groupTitle}>{ta(group.title)}</span>
        <Ixon width="1rem" className={classes.chevron}>
          <ChevronIcon />
        </Ixon>
      </button>
      {open && (
        <div className={classes.items}>
          {group.items.map((item) => (
            <ItemLink
              key={item.href}
              item={item}
              active={isItemActive(item, subPath)}
            />
          ))}
        </div>
      )}
    </div>
  );
};

const AdminSidebar = () => {
  const { user } = useUser(true);
  const hasAccess = useAccessLevel();
  const subPath = useAdminSubPath();
  const [search, setSearch] = useState<string>("");
  const [openGroups, setOpenGroups] = useState<string[]>([]);

  // the developer-tools hub only where the backend allows those tools
  // (dev machine, or ALLOW_DEVTOOLS on the server)
  const { data: devToolsAllowed } = useSWR<boolean>(
    user?.role === "admin" ? `${API}/admin/devtools/allowed` : null,
    (url: string) => fetcher({ url }).then((res) => !!res?.data?.allowed),
  );

  // Groups visible to this user, with items they may open.
  const visibleGroups = useMemo<AdminMenuGroup[]>(() => {
    if (!user) return [];
    const isAdmin = user.role === "admin";
    const canSee = (item: AdminMenuItem) =>
      (item.href !== "devtools" || !!devToolsAllowed) &&
      (isAdmin ||
      (item.access !== undefined && hasAccess(item.access, "readAll")) ||
      (adminHubs.some((hub) => hub.hub === item.href) &&
        canNotAdminOpen(item.href, hasAccess)));
    return adminMenu
      .filter((group) => !group.super || isAdmin)
      .map((group) => ({ ...group, items: group.items.filter(canSee) }))
      .filter((group) => group.items.length > 0);
  }, [hasAccess, user, devToolsAllowed]);

  const isAdmin = user?.role === "admin";

  // Pending-work count on the inbox item, refreshed every minute.
  const { data: inboxCount } = useSWR<number>(
    isAdmin ? `${API}/admin/inbox?countOnly=1` : null,
    (url: string) =>
      fetcher({ url }).then((res) =>
        (res.data.data?.kinds || []).reduce(
          (sum: number, kind: { count?: number }) => sum + (kind.count || 0),
          0,
        ),
      ),
    { refreshInterval: 60_000 },
  );

  // Hub pages (categories/tags, dev tools) aren't in the sidebar, but Ctrl+K
  // finds them.
  const hubCommands = useMemo<CommandItem[]>(() => {
    if (!user) return [];
    return adminHubs.flatMap((hub) =>
      hub.sections
        .filter((section) => !section.super || isAdmin)
        .flatMap((section) =>
          section.items
            .filter(
              (item) =>
                isAdmin ||
                canNotAdminOpen(item.href.split("/")[0], hasAccess),
            )
            .map((item) => ({
              id: `${section.id}:${item.href}`,
              label: ta(item.title),
              hint: ta(section.title),
              icon: section.icon,
              href: adminPath(`/${item.href}`),
            })),
        ),
    );
  }, [hasAccess, isAdmin, user]);

  // Ctrl+K: jump to any of the (100+) admin pages by name or group
  const commands = useMemo<CommandItem[]>(
    () => [
      ...adminPinnedItems
        .filter((item) => isAdmin || !item.adminOnly)
        .map((item) => ({
        id: `pin:${item.href}`,
        label: ta(item.title),
        icon: item.icon,
        href: adminPath(item.href ? `/${item.href}` : ""),
      })),
      ...visibleGroups.flatMap((group) =>
        group.items.map((item) => ({
          id: `${group.id}:${item.href}`,
          label: ta(item.title),
          hint: ta(group.title),
          icon: group.icon,
          href: adminPath(item.href ? `/${item.href}` : ""),
        })),
      ),
      ...hubCommands,
    ],
    [hubCommands, isAdmin, visibleGroups],
  );

  // Restore open groups, and always open the group of the current page.
  useEffect(() => {
    let saved: string[] = [];
    try {
      saved = JSON.parse(localStorage.getItem(OPEN_GROUPS_KEY) || "[]");
    } catch {}
    const activeGroup = adminMenu.find((group) =>
      group.items.some((item) => isItemActive(item, subPath)),
    );
    setOpenGroups((prev) =>
      Array.from(
        new Set([...prev, ...saved, ...(activeGroup ? [activeGroup.id] : [])]),
      ),
    );
  }, [subPath]);

  const toggleGroup = (id: string) =>
    setOpenGroups((prev) => {
      const next = prev.includes(id)
        ? prev.filter((el) => el !== id)
        : [...prev, id];
      try {
        localStorage.setItem(OPEN_GROUPS_KEY, JSON.stringify(next));
      } catch {}
      return next;
    });

  const term = search.trim().toLowerCase();
  const matches = (text: string) => text.toLowerCase().includes(term);
  const searchedGroups = term
    ? visibleGroups
        .map((group) =>
          matches(group.title)
            ? group
            : {
                ...group,
                items: group.items.filter(
                  (item) => matches(item.title) || matches(item.href),
                ),
              },
        )
        .filter((group) => group.items.length > 0)
    : visibleGroups;

  const normalGroups = searchedGroups.filter((group) => !group.super);
  const superGroups = searchedGroups.filter((group) => group.super);

  const renderGroups = (groups: AdminMenuGroup[]) =>
    groups.map((group) => (
      <Group
        key={group.id}
        group={group}
        subPath={subPath}
        open={!!term || openGroups.includes(group.id)}
        onToggle={() => toggleGroup(group.id)}
      />
    ));

  return (
    <aside className={classes.main}>
      <div className={classes.header}>
        <div className={classes.logoRow}>
          <Link className={classes.logo} href={"/"}>
            <LogoLong />
          </Link>
          <ThemeToggle />
        </div>
        <div className={classes.search}>
          <Ixon width="1.1rem" className={classes.searchIcon}>
            <SearchIcon />
          </Ixon>
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder={ta("جستجو در منو… (Ctrl+K)")}
          />
          {search && (
            <button
              type="button"
              className={classes.clear}
              onClick={() => setSearch("")}
              aria-label={ta("پاک کردن جستجو")}
            >
              <Ixon width="0.9rem">
                <CloseIcon />
              </Ixon>
            </button>
          )}
        </div>
      </div>
      <CommandPalette items={commands} trigger={false} />
      <nav className={classes.nav}>
        {!term &&
          adminPinnedItems
            .filter((item) => isAdmin || !item.adminOnly)
            .map((item) => (
              <ItemLink
                key={item.href}
                item={item}
                icon={item.icon}
                badge={item.href === "inbox" ? inboxCount : undefined}
                active={isItemActive(item, subPath)}
              />
            ))}
        {normalGroups.length > 0 && (
          <div className={classes.section}>
            <span className={classes.sectionTitle}>{ta("مدیریت")}</span>
            {renderGroups(normalGroups)}
          </div>
        )}
        {superGroups.length > 0 && (
          <div className={classes.section}>
            <span className={classes.sectionTitle}>{ta("سوپر ادمین")}</span>
            {renderGroups(superGroups)}
          </div>
        )}
        {term && searchedGroups.length === 0 && (
          <p className={classes.empty}>{ta("موردی پیدا نشد")}</p>
        )}
      </nav>
    </aside>
  );
};

export default AdminSidebar;
