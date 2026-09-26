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
import { adminPath } from "@/Components/helpers/adminPath";
import useAccessLevel from "@/Components/Hooks/useAccessLevel";
import {
  AdminMenuGroup,
  AdminMenuItem,
  adminMenu,
  adminPinnedItems,
} from "./adminMenu";

export { canNotAdminOpen } from "./adminMenu";

const OPEN_GROUPS_KEY = "adminSidebarOpenGroups";

// Path after /<adminKey>/, e.g. "tamin/service" for /notadmin/tamin/service/123
const useAdminSubPath = () => {
  const pathname = usePathname();
  return pathname.split("/").slice(2).join("/");
};

const isItemActive = (item: AdminMenuItem, subPath: string) =>
  item.href === ""
    ? subPath === ""
    : subPath === item.href || subPath.startsWith(`${item.href}/`);

const ItemLink = ({
  item,
  active,
  icon,
}: {
  item: AdminMenuItem;
  active: boolean;
  icon?: ReactNode;
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
    <span>{item.title}</span>
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
        <span className={classes.groupTitle}>{group.title}</span>
        <span className={classes.count}>{group.items.length}</span>
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

  // Groups visible to this user, with items they may open.
  const visibleGroups = useMemo<AdminMenuGroup[]>(() => {
    if (!user) return [];
    const isAdmin = user.role === "admin";
    const canSee = (item: AdminMenuItem) =>
      isAdmin ||
      (item.access !== undefined && hasAccess(item.access, "readAll"));
    return adminMenu
      .filter((group) => !group.super || isAdmin)
      .map((group) => ({ ...group, items: group.items.filter(canSee) }))
      .filter((group) => group.items.length > 0);
  }, [hasAccess, user]);

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
        <Link className={classes.logo} href={"/"}>
          <LogoLong />
        </Link>
        <div className={classes.search}>
          <Ixon width="1.1rem" className={classes.searchIcon}>
            <SearchIcon />
          </Ixon>
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="جستجو در منو..."
          />
          {search && (
            <button
              type="button"
              className={classes.clear}
              onClick={() => setSearch("")}
              aria-label="پاک کردن جستجو"
            >
              <Ixon width="0.9rem">
                <CloseIcon />
              </Ixon>
            </button>
          )}
        </div>
      </div>
      <nav className={classes.nav}>
        {!term &&
          adminPinnedItems
            .filter((item) => user?.role === "admin" || item.href === "")
            .map((item) => (
              <ItemLink
                key={item.href}
                item={item}
                icon={item.icon}
                active={isItemActive(item, subPath)}
              />
            ))}
        {normalGroups.length > 0 && (
          <div className={classes.section}>
            <span className={classes.sectionTitle}>مدیریت</span>
            {renderGroups(normalGroups)}
          </div>
        )}
        {superGroups.length > 0 && (
          <div className={classes.section}>
            <span className={classes.sectionTitle}>سوپر ادمین</span>
            {renderGroups(superGroups)}
          </div>
        )}
        {term && searchedGroups.length === 0 && (
          <p className={classes.empty}>موردی پیدا نشد</p>
        )}
      </nav>
    </aside>
  );
};

export default AdminSidebar;
