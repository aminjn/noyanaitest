"use client";
import dynamic from "next/dynamic";
import { useRef } from "react";
import { API } from "@/Components/config";
import { fetcher } from "@/Components/helpers/fetcher";
import { ta } from "@/Components/Admin/i18n/adminText";
import { displayPhone } from "../User/userShared";
import classes from "@/Components/UI/NodesSelector.module.css";

const AsyncSelect = dynamic(() => import("react-select/async"), { ssr: false });

// A user picked by server search (GET /admin/users?q=), for owner and
// participant pickers: the old pickers loaded every account from /auto/user
// into the browser (2026-10 admin audit P2-12). Type part of a phone number,
// a name or a national id; up to 20 matches come back.
export type UserOption = {
  _id: string;
  phone?: string;
  username?: string;
  name?: string;
  status?: string;
};

export const userOptionLabel = (user?: UserOption | null) => {
  if (!user) return "";
  const phone = displayPhone(user.phone);
  const name = user.name?.trim() || user.username?.trim() || "";
  const label = name && phone ? `${name} · ${phone}` : name || phone || user._id;
  return user.status === "suspended" ? `${label} (${ta("معلق")})` : label;
};

const SEARCH_LIMIT = 20;

const searchUsers = async (q: string): Promise<UserOption[]> => {
  const text = q.trim();
  if (text.length < 2) return [];
  try {
    const res = await fetcher({
      url: `${API}/admin/users?q=${encodeURIComponent(text)}&limit=${SEARCH_LIMIT}`,
    });
    const items = res?.data?.data?.items;
    return Array.isArray(items) ? items.filter((u: UserOption) => u && u._id) : [];
  } catch {
    return [];
  }
};

type Props<TMulti extends boolean> = {
  title?: string;
  multi?: TMulti;
  value: TMulti extends true ? UserOption[] : UserOption | null;
  onChange: (value: TMulti extends true ? UserOption[] : UserOption | null) => unknown;
  readOnly?: boolean;
  clearable?: boolean;
};

const UserSearchSelect = <TMulti extends boolean = false>({
  title,
  multi,
  value,
  onChange,
  readOnly,
  clearable,
}: Props<TMulti>) => {
  // react-select calls loadOptions on every key; wait for a pause
  const timer = useRef<ReturnType<typeof setTimeout>>();
  const loadOptions = (input: string) =>
    new Promise<UserOption[]>((resolve) => {
      if (timer.current) clearTimeout(timer.current);
      timer.current = setTimeout(() => searchUsers(input).then(resolve), 300);
    });

  return (
    <div className={classes.main}>
      {!!title && <span className={classes.title}>{title}</span>}
      <AsyncSelect
        classNamePrefix="nsel"
        cacheOptions
        defaultOptions={false}
        isMulti={!!multi}
        isClearable={clearable}
        isDisabled={readOnly}
        loadOptions={loadOptions}
        value={value}
        getOptionValue={(node: unknown) => (node as UserOption)._id}
        getOptionLabel={(node: unknown) => userOptionLabel(node as UserOption)}
        onChange={(next: unknown) => {
          if (multi)
            (onChange as (v: UserOption[]) => unknown)(
              Array.isArray(next) ? (next as UserOption[]) : [],
            );
          else (onChange as (v: UserOption | null) => unknown)((next as UserOption) || null);
        }}
        placeholder={ta("شماره موبایل، نام یا کد ملی را بنویسید")}
        noOptionsMessage={({ inputValue }: { inputValue: string }) =>
          inputValue.trim().length < 2
            ? ta("دست‌کم ۲ حرف بنویسید")
            : ta("کاربری پیدا نشد")
        }
        loadingMessage={() => ta("در حال جستجو…")}
      />
    </div>
  );
};

export default UserSearchSelect;
