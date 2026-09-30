"use client";

import { useState } from "react";
import useSWR from "swr";
import { API } from "@/Components/config";
import { fetcher } from "@/Components/helpers/fetcher";
import { adminPath } from "@/Components/helpers/adminPath";
import usePopup from "@/Components/Hooks/usePopup";
import PopupCard from "@/Components/UI/PopupCard";
import Input from "@/Components/UI/Input";
import Button from "@/Components/UI/Button";
import HandleLoading from "../UI/HandleLoading";
import WithTitle from "../UI/WithTitle";
import Table from "../UI/Table";
import InlineLink from "../UI/InlineLink";
import TableActions from "../UI/TableActions";
import IconButton from "../UI/IconButton";
import EditIcon from "@/Components/Icons/EditIcon";
import { RoleManager, UserDetail } from "../User/AdminManageUserPage";
import { RoleBadge, displayPhone } from "../User/userShared";
import { ta } from "@/Components/Admin/i18n/adminText";
import classes from "./AdminTeamMembersPage.module.css";

type StaffRow = {
  _id: string;
  phone: string;
  name?: string;
  role: "admin" | "notadmin" | "user";
};

type UserAccessRow = {
  user?: { _id: string } | string;
  accessLevel?: { _id: string; name?: string };
};

const listOf = (res: unknown): StaffRow[] => {
  const items = (res as { data?: { data?: { items?: unknown } } })?.data?.data
    ?.items;
  return Array.isArray(items) ? (items as StaffRow[]) : [];
};

// The role editor of the user page, in a popup: the one path that changes
// who is staff (the backend keeps one super admin and blocks changing your
// own role). The team page used to create access-level links directly,
// with none of those checks.
const TeamRolePopup = ({
  userId,
  onChanged,
}: {
  userId: string;
  onChanged: () => unknown;
}) => {
  const { data, error, mutate } = useSWR<UserDetail>(
    `${API}/admin/users/${userId}`,
    (url: string) => fetcher({ url }).then((res) => res.data.data),
  );
  return (
    <PopupCard title={ta("نقش و دسترسی")}>
      <HandleLoading data={!!data} error={error}>
        {!!data && (
          <RoleManager
            user={data}
            onChanged={() => {
              mutate();
              onChanged();
            }}
          />
        )}
      </HandleLoading>
    </PopupCard>
  );
};

// Add a staff member: find the account by phone or name, then give it a role.
const AddMemberPopup = ({ onChanged }: { onChanged: () => unknown }) => {
  const [q, setQ] = useState("");
  const [search, setSearch] = useState("");
  const [picked, setPicked] = useState<string | null>(null);
  const { data } = useSWR<StaffRow[]>(
    search ? `${API}/admin/users?q=${encodeURIComponent(search)}&limit=10` : null,
    (url: string) => fetcher({ url }).then(listOf),
  );
  if (picked) return <TeamRolePopup userId={picked} onChanged={onChanged} />;
  return (
    <PopupCard title={ta("افزودن کارمند")}>
      <form
        className={classes.search}
        onSubmit={(e) => {
          e.preventDefault();
          setSearch(q.trim());
        }}
      >
        <Input
          title={ta("شماره موبایل یا نام کاربر")}
          onChange={(e) => setQ(e.target.value)}
        />
        <Button type="submit">{ta("جستجو")}</Button>
      </form>
      {!!search && (
        <ul className={classes.results}>
          {(data || []).map((user) => (
            <li key={user._id}>
              <button
                type="button"
                className={classes.result}
                onClick={() => setPicked(user._id)}
              >
                <span>{user.name || displayPhone(user.phone)}</span>
                <span className={classes.muted}>{displayPhone(user.phone)}</span>
                <RoleBadge role={user.role} />
              </button>
            </li>
          ))}
          {data && !data.length && (
            <li className={classes.muted}>{ta("کاربری پیدا نشد")}</li>
          )}
        </ul>
      )}
    </PopupCard>
  );
};

// Everyone who can open this panel - super admins and staff - with their
// access level (2026-09 audit: this used to be three places: the user page
// role editor, a raw access-level link list, and each access level's admins
// tab).
const AdminTeamMembersPage = () => {
  const admins = useSWR<StaffRow[]>(`${API}/admin/users?role=admin&limit=100`, (url: string) =>
    fetcher({ url }).then(listOf),
  );
  const staff = useSWR<StaffRow[]>(`${API}/admin/users?role=notadmin&limit=100`, (url: string) =>
    fetcher({ url }).then(listOf),
  );
  const links = useSWR<UserAccessRow[]>(`${API}/auto/useraccesslevel`, (url: string) =>
    fetcher({ url }).then((res) => (Array.isArray(res?.data?.data) ? res.data.data : [])),
  );
  const { setPopup } = usePopup();
  const refresh = () => {
    admins.mutate();
    staff.mutate();
    links.mutate();
  };
  const levelOf = (userId: string) =>
    (links.data || []).find(
      (row) =>
        (typeof row.user === "string" ? row.user : row.user?._id) === userId,
    )?.accessLevel;
  const rows = [...(admins.data || []), ...(staff.data || [])];

  return (
    <HandleLoading data={!!admins.data && !!staff.data} error={admins.error || staff.error}>
      <WithTitle
        title={ta("کارکنان")}
        actions={[
          {
            title: ta("جدید"),
            action: () =>
              setPopup("AddTeamMember", <AddMemberPopup onChanged={refresh} />),
          },
        ]}
      >
        <Table
          name="AdminTeamMembers"
          data={rows}
          renderer={{
            name: {
              name: ta("کارمند"),
              value: (node) => node.name || displayPhone(node.phone),
              component: (node) => (
                <InlineLink href={adminPath(`/user/${node._id}`)}>
                  {node.name || displayPhone(node.phone)}
                </InlineLink>
              ),
              filter: "Text",
            },
            phone: {
              name: ta("موبایل"),
              value: (node) => displayPhone(node.phone),
              filter: "Text",
            },
            role: {
              name: ta("نقش"),
              value: (node) => node.role,
              component: (node) => <RoleBadge role={node.role} />,
              filter: "Set",
            },
            accessLevel: {
              name: ta("سطح دسترسی"),
              value: (node) =>
                node.role === "admin" ? ta("همه‌ی بخش‌ها") : levelOf(node._id)?.name || "—",
              component: (node) => {
                if (node.role === "admin") return ta("همه‌ی بخش‌ها");
                const level = levelOf(node._id);
                return level ? (
                  <InlineLink href={adminPath(`/accesslevel/${level._id}`)}>
                    {level.name || level._id}
                  </InlineLink>
                ) : (
                  "—"
                );
              },
              filter: "Set",
            },
            actions: {
              name: ta("عملیات"),
              component: (node) => (
                <TableActions>
                  <IconButton
                    title={ta("تغییر نقش")}
                    onClick={() =>
                      setPopup(
                        "TeamRole",
                        <TeamRolePopup userId={node._id} onChanged={refresh} />,
                      )
                    }
                  >
                    <EditIcon />
                  </IconButton>
                </TableActions>
              ),
            },
          }}
        />
      </WithTitle>
    </HandleLoading>
  );
};

export default AdminTeamMembersPage;
