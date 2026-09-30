"use client";
import { useMemo, useState } from "react";
import useSWR from "swr";
import Link from "@/Components/i18n/Link";
import classes from "./AdminInboxPage.module.css";
import { API } from "@/Components/config";
import { fetcher } from "@/Components/helpers/fetcher";
import { adminPath } from "@/Components/helpers/adminPath";
import HandleLoading from "../UI/HandleLoading";
import Ixon from "@/Components/UI/Ixon";
import CheckCircleIcon from "@/Components/Icons/CheckCircleIcon";
import ChevronIcon from "@/Components/Icons/ChevronIcon";
import RetryIcon from "@/Components/Icons/RetryIcon";
import { adminIntlTag, adminNumberFormat, ta } from "@/Components/Admin/i18n/adminText";

type InboxKind = { key: string; title: string; count: number };
type InboxItem = {
  _id: string;
  kind: string;
  title: string;
  subtitle?: string;
  date?: string;
  href: string;
};
type Inbox = { kinds: InboxKind[]; items: InboxItem[] };

// List page of each kind, for "see all" when there are more than the inbox
// shows.
const kindListPage: Record<string, string> = {
  becomeDoctor: "becomedoctor",
  becomeClinic: "becomeclinic",
  becomeHospital: "becomehospital",
  becomePharmacy: "becomepharmacy",
  becomeParaClinic: "becomeParaClinic",
  becomeInsurance: "becomeinsurance",
  clinicAddition: "clinicaddition",
  hospitalAddition: "hospitaladdition",
  insuranceAddition: "insuranceaddition",
  doctorJoinClinic: "doctorjoinclinic",
  doctorJoinHospital: "doctorjoinhospital",
  tickets: "ticket",
  contactRequests: "contactRequest",
  comments: "comment",
};

// Waiting longer than this is flagged.
const STALE_DAYS = 3;
const DAY = 24 * 60 * 60 * 1000;

const num = adminNumberFormat();

// 09123456789 instead of 989123456789
const displaySubtitle = (text: string) =>
  /^98\d{10}$/.test(text) ? `0${text.slice(2)}` : text;
const relative = new Intl.RelativeTimeFormat(adminIntlTag(), { numeric: "auto" });

const age = (date?: string) => {
  if (!date) return { label: "", stale: false };
  const ms = Date.now() - new Date(date).getTime();
  if (Number.isNaN(ms)) return { label: "", stale: false };
  const days = Math.floor(ms / DAY);
  const hours = Math.floor(ms / (60 * 60 * 1000));
  const label =
    days >= 1
      ? relative.format(-days, "day")
      : hours >= 1
        ? relative.format(-hours, "hour")
        : relative.format(-Math.max(1, Math.floor(ms / 60000)), "minute");
  return { label, stale: days >= STALE_DAYS };
};

const AdminInboxPage = () => {
  const { data, error, mutate, isValidating } = useSWR<Inbox>(
    `${API}/admin/inbox`,
    (url: string) => fetcher({ url }).then((res) => res.data.data),
  );
  const [kind, setKind] = useState<string>("all");

  const kinds = useMemo(
    () =>
      (Array.isArray(data?.kinds) ? data.kinds : []).filter(
        (el) => el.count > 0,
      ),
    [data],
  );
  const items = useMemo(
    () => (Array.isArray(data?.items) ? data.items : []),
    [data],
  );
  const titleOf = useMemo(
    () => new Map(kinds.map((el) => [el.key, el.title])),
    [kinds],
  );
  const total = kinds.reduce((sum, el) => sum + el.count, 0);
  const staleCount = items.filter((el) => age(el.date).stale).length;
  const shown = kind === "all" ? items : items.filter((el) => el.kind === kind);
  const selected = kinds.find((el) => el.key === kind);
  const hiddenCount = selected ? selected.count - shown.length : 0;

  return (
    <HandleLoading data={!!data} error={error}>
      {data && (
        <div className={classes.main}>
          <header className={classes.header}>
            <div>
              <h1 className={classes.pageTitle}>{ta("صندوق درخواست‌ها")}</h1>
              <span className={classes.sub}>
                {total === 0
                  ? ta("همه‌ی درخواست‌ها رسیدگی شده‌اند")
                  : ta("${1} مورد در انتظار رسیدگی${2}", [num.format(total), staleCount
                        ? ` · ${num.format(staleCount)} مورد بیش از ${num.format(STALE_DAYS)} روز`
                        : ""])}
              </span>
            </div>
            <button
              type="button"
              className={classes.refresh}
              onClick={() => mutate()}
              disabled={isValidating}
            >
              <Ixon width="1rem">
                <RetryIcon />
              </Ixon>
              <span>{isValidating ? ta("در حال بارگذاری...") : ta("به‌روزرسانی")}</span>
            </button>
          </header>

          {total === 0 ? (
            <div className={classes.allClear}>
              <Ixon width="2rem">
                <CheckCircleIcon />
              </Ixon>
              <span>{ta("کار معوقه‌ای وجود ندارد")}</span>
            </div>
          ) : (
            <>
              <div className={classes.chips} role="tablist">
                <button
                  type="button"
                  role="tab"
                  aria-selected={kind === "all"}
                  className={`${classes.chip} ${kind === "all" ? classes.chipActive : ""}`}
                  onClick={() => setKind("all")}
                >
                  {ta("همه")}
                  <span className={classes.chipCount}>{num.format(total)}</span>
                </button>
                {kinds.map((el) => (
                  <button
                    key={el.key}
                    type="button"
                    role="tab"
                    aria-selected={kind === el.key}
                    className={`${classes.chip} ${kind === el.key ? classes.chipActive : ""}`}
                    onClick={() => setKind(el.key)}
                  >
                    {el.title}
                    <span className={classes.chipCount}>
                      {num.format(el.count)}
                    </span>
                  </button>
                ))}
              </div>

              <ul className={classes.list}>
                {shown.map((item) => {
                  const { label, stale } = age(item.date);
                  return (
                    <li key={`${item.kind}:${item._id}`}>
                      <Link
                        href={adminPath(`/${item.href}`)}
                        className={classes.row}
                      >
                        <span className={classes.kind}>
                          {titleOf.get(item.kind) || item.kind}
                        </span>
                        <span className={classes.text}>
                          <span className={classes.title}>
                            {item.title || "—"}
                          </span>
                          {item.subtitle && (
                            <span className={classes.subtitle}>
                              {displaySubtitle(item.subtitle)}
                            </span>
                          )}
                        </span>
                        {label && (
                          <span
                            className={`${classes.age} ${stale ? classes.stale : ""}`}
                          >
                            {label}
                          </span>
                        )}
                        <Ixon width="0.9rem" className={classes.arrow}>
                          <ChevronIcon />
                        </Ixon>
                      </Link>
                    </li>
                  );
                })}
              </ul>

              {selected && hiddenCount > 0 && kindListPage[selected.key] && (
                <Link
                  href={adminPath(`/${kindListPage[selected.key]}`)}
                  className={classes.more}
                >
                  {ta("مشاهده‌ی همه‌ی ${1} مورد «${2}»", [num.format(selected.count), selected.title])}
                </Link>
              )}
            </>
          )}
        </div>
      )}
    </HandleLoading>
  );
};

export default AdminInboxPage;
