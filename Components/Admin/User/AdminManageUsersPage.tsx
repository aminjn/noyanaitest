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

type UserRow = {
  _id: string;
  phone: string;
  username?: string;
  name?: string;
  role: string;
  createdAt: string;
};

type UsersResponse = {
  items: UserRow[];
  total: number;
  page: number;
  limit: number;
  roleCounts: Record<string, number>;
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

const AdminManageUsersPage = () => {
  const [search, setSearch] = useState("");
  const [query, setQuery] = useState("");
  const [role, setRole] = useState("");
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
  });
  const { data, error, isValidating } = useSWR<UsersResponse>(
    `${API}/admin/users?${params}`,
    (url: string) => fetcher({ url }).then((res) => res.data.data),
    { keepPreviousData: true },
  );

  const allCount = data
    ? Object.values(data.roleCounts).reduce((sum, n) => sum + n, 0)
    : 0;
  const pages = data ? Math.max(1, Math.ceil(data.total / data.limit)) : 1;

  return (
    <div className={classes.main}>
      <header className={classes.header}>
        <div>
          <h1 className={classes.title}>{ta("کاربران")}</h1>
          {data && (
            <span className={classes.subtitle}>
              {ta("${1} کاربر ثبت‌نام‌شده", [num.format(allCount)])}
            </span>
          )}
        </div>
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
                    <th>{ta("تاریخ عضویت")}</th>
                    <th aria-label={ta("جزئیات")} />
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
                      <td className={classes.muted}>{faDate.format(new Date(user.createdAt))}</td>
                      <td>
                        <Link
                          href={adminPath(`/user/${user._id}`)}
                          className={classes.rowLink}
                          aria-label={ta("مشاهده کاربر")}
                        >
                          <Ixon width="1rem">
                            <ChevronIcon />
                          </Ixon>
                        </Link>
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
