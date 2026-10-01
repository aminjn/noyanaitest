"use client";
import { useEffect, useState } from "react";
import Link from "@/Components/i18n/Link";
import useSWR from "swr";
import classes from "./AdminManageUsersPage.module.css";
import { API } from "@/Components/config";
import { fetcher } from "@/Components/helpers/fetcher";
import { adminPath } from "@/Components/helpers/adminPath";
import Ixon from "@/Components/UI/Ixon";
import SearchIcon from "@/Components/Icons/SearchIcon";
import ChevronIcon from "@/Components/Icons/ChevronIcon";
import Loading from "../UI/Loading";
import ErrorMessage from "../UI/ErrorMessage";
import { RoleBadge, displayPhone, faDate, num } from "./userShared";
import { ta } from "@/Components/Admin/i18n/adminText";
import Button from "@/Components/UI/Button";
import PlusIcon from "@/Components/Icons/PlusIcon";
import EditIcon from "@/Components/Icons/EditIcon";
import GarbageIcon from "@/Components/Icons/GarbageIcon";
import LockIcon from "@/Components/Icons/LockIcon";
import LockCloseIcon from "@/Components/Icons/LockCloseIcon";
import IconButton from "../UI/IconButton";
import TableActions from "../UI/TableActions";
import useAccessLevel from "@/Components/Hooks/useAccessLevel";
import { StatusBadge, UserStatus, useUserActions } from "./userActions";

type UserRow = {
  _id: string;
  phone: string;
  username?: string;
  name?: string;
  role: string;
  status?: UserStatus;
  statusReason?: string;
  suspendedUntil?: string;
  createdAt: string;
};

type UsersResponse = {
  items: UserRow[];
  total: number;
  page: number;
  limit: number;
  roleCounts: Record<string, number>;
  statusCounts?: Record<string, number>;
};

const PAGE_SIZE = 25;

const roleTabs: { role: string; title: string }[] = [
  { role: "", get title() {
  return ta("همه");
} },
  { role: "admin", get title() {
  return ta("سوپر ادمین");
} },
  { role: "notadmin", get title() {
  return ta("کارمند");
} },
  { role: "user", get title() {
  return ta("کاربر");
} },
];

// account state, next to the role tabs
const statusTabs: { status: "" | UserStatus; title: string }[] = [
  { status: "", get title() {
  return ta("همه‌ی وضعیت‌ها");
} },
  { status: "active", get title() {
  return ta("فعال");
} },
  { status: "suspended", get title() {
  return ta("معلق");
} },
  { status: "deleted", get title() {
  return ta("حذف‌شده");
} },
];

const AdminManageUsersPage = () => {
  const [search, setSearch] = useState("");
  const [query, setQuery] = useState("");
  const [role, setRole] = useState("");
  const [status, setStatus] = useState<"" | UserStatus>("");
  const hasAccess = useAccessLevel();
  const [page, setPage] = useState(1);

  // Debounce typing so every keystroke doesn't hit the backend.
  useEffect(() => {
    const timer = setTimeout(() => {
      setQuery(search.trim());
      setPage(1);
    }, 300);
    return () => clearTimeout(timer);
  }, [search]);

  const params = new URLSearchParams({
    page: String(page),
    limit: String(PAGE_SIZE),
    ...(query && { q: query }),
    ...(role && { role }),
    ...(status && { status }),
  });
  const { data, error, isValidating, mutate } = useSWR<UsersResponse>(
    `${API}/admin/users?${params}`,
    (url: string) => fetcher({ url }).then((res) => res.data.data),
    { keepPreviousData: true },
  );

  const actions = useUserActions(() => mutate());
  const canCreate = hasAccess("User", "write");
  const canEdit = hasAccess("User", "update");
  const canDelete = hasAccess("User", "delete");
  const allCount = data
    ? Object.values(data.roleCounts).reduce((sum, n) => sum + n, 0)
    : 0;
  const pages = data ? Math.max(1, Math.ceil(data.total / data.limit)) : 1;

  return (
    <div className={classes.main}>
      <header className={classes.header}>
        <div className={classes.headerText}>
          <h1 className={classes.title}>{ta("کاربران")}</h1>
          {data && (
            <span className={classes.subtitle}>
              {ta("${1} کاربر ثبت‌نام‌شده", [num.format(allCount)])}
            </span>
          )}
        </div>
        {canCreate && (
          <Button size="M" leadIcon={<PlusIcon />} onClick={actions.create}>
            {ta("کاربر جدید")}
          </Button>
        )}
      </header>

      <section className={classes.card}>
        <div className={classes.toolbar}>
          <div className={classes.search}>
            <Ixon width="1.1rem" className={classes.searchIcon}>
              <SearchIcon />
            </Ixon>
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder={ta("جستجو با موبایل، نام، نام کاربری یا کد ملی...")}
            />
          </div>
          <div className={classes.tabs} role="tablist">
            {roleTabs.map((tab) => (
              <button
                key={tab.role}
                type="button"
                role="tab"
                aria-selected={role === tab.role}
                className={`${classes.tab} ${role === tab.role ? classes.tabActive : ""}`}
                onClick={() => {
                  setRole(tab.role);
                  setPage(1);
                }}
              >
                <span>{tab.title}</span>
                {data && (
                  <span className={classes.tabCount}>
                    {num.format(tab.role ? data.roleCounts[tab.role] || 0 : allCount)}
                  </span>
                )}
              </button>
            ))}
          </div>
          <div className={classes.tabs} role="tablist" aria-label={ta("وضعیت حساب")}>
            {statusTabs.map((tab) => (
              <button
                key={tab.status || "all"}
                type="button"
                role="tab"
                aria-selected={status === tab.status}
                className={`${classes.tab} ${status === tab.status ? classes.tabActive : ""}`}
                onClick={() => {
                  setStatus(tab.status);
                  setPage(1);
                }}
              >
                <span>{tab.title}</span>
                {data?.statusCounts && tab.status && (
                  <span className={classes.tabCount}>
                    {num.format(data.statusCounts[tab.status] || 0)}
                  </span>
                )}
              </button>
            ))}
          </div>
        </div>

        {error && !data ? (
          <ErrorMessage message={error.message} />
        ) : !data ? (
          <Loading />
        ) : (
          <>
            <div className={`${classes.tableWrap} ${isValidating ? classes.stale : ""}`}>
              <table className={classes.table}>
                <thead>
                  <tr>
                    <th>{ta("کاربر")}</th>
                    <th>{ta("موبایل")}</th>
                    <th>{ta("نقش")}</th>
                    <th>{ta("وضعیت")}</th>
                    <th>{ta("تاریخ عضویت")}</th>
                    <th>{ta("عملیات")}</th>
                  </tr>
                </thead>
                <tbody>
                  {data.items.map((user) => (
                    <tr key={user._id}>
                      <td>
                        <Link href={adminPath(`/user/${user._id}`)} className={classes.userCell}>
                          <span className={classes.avatar}>
                            {(user.name || user.username || ta("؟")).trim().charAt(0)}
                          </span>
                          <span className={classes.userName}>
                            {user.name || user.username || ta("بدون نام")}
                            {user.name && user.username && (
                              <span className={classes.userSub}>{user.username}</span>
                            )}
                          </span>
                        </Link>
                      </td>
                      <td className={classes.phone}>{displayPhone(user.phone)}</td>
                      <td>
                        <RoleBadge role={user.role} />
                      </td>
                      <td title={user.statusReason || undefined}>
                        <StatusBadge status={user.status} until={user.suspendedUntil} />
                      </td>
                      <td className={classes.muted}>
                        {isNaN(new Date(user.createdAt).getTime())
                          ? "—"
                          : faDate.format(new Date(user.createdAt))}
                      </td>
                      <td>
                        <TableActions>
                          {canEdit && user.status !== "deleted" && (
                            <IconButton title={ta("ویرایش")} onClick={() => actions.edit(user)}>
                              <EditIcon />
                            </IconButton>
                          )}
                          {canEdit && user.role !== "admin" && user.status === "suspended" && (
                            <IconButton title={ta("رفع تعلیق")} onClick={() => actions.activate(user)}>
                              <LockIcon />
                            </IconButton>
                          )}
                          {canEdit && user.role !== "admin" && (user.status || "active") === "active" && (
                            <IconButton title={ta("تعلیق")} onClick={() => actions.suspend(user)}>
                              <LockCloseIcon />
                            </IconButton>
                          )}
                          {canDelete && user.role === "user" && user.status !== "deleted" && (
                            <IconButton title={ta("حذف")} variant="Danger" onClick={() => actions.remove(user)}>
                              <GarbageIcon />
                            </IconButton>
                          )}
                          <Link
                            href={adminPath(`/user/${user._id}`)}
                            className={classes.rowLink}
                            aria-label={ta("مشاهده کاربر")}
                          >
                            <Ixon width="1rem">
                              <ChevronIcon />
                            </Ixon>
                          </Link>
                        </TableActions>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
              {data.items.length === 0 && (
                <p className={classes.empty}>{ta("کاربری با این مشخصات پیدا نشد")}</p>
              )}
            </div>

            {data.total > data.limit && (
              <div className={classes.pagination}>
                <button
                  type="button"
                  disabled={page <= 1}
                  onClick={() => setPage((p) => p - 1)}
                >
                  {ta("قبلی")}
                </button>
                <span>{ta("صفحه ${1} از ${2}", [num.format(page), num.format(pages)])}</span>
                <button
                  type="button"
                  disabled={page >= pages}
                  onClick={() => setPage((p) => p + 1)}
                >
                  {ta("بعدی")}
                </button>
              </div>
            )}
          </>
        )}
      </section>
    </div>
  );
};

export default AdminManageUsersPage;
