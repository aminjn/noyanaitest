"use client";

import { useMemo, useState } from "react";
import { usePathname, useIntlLocale } from "@/Components/i18n/navigation";
import useSWR from "swr";
import classes from "./DashboardManageinvoicesPagee.module.css";
import { API } from "@/Components/config";
import { fetcher } from "@/Components/helpers/fetcher";
import HandleLoading from "@/Components/Admin/UI/HandleLoading";
import Pagination from "@/Components/UI/Pagination";
import useScopedLocale from "@/Components/Hooks/useScopedLocale";
import { ContentNamespace } from "@/Components/Enums/contentNamespaces";
import { ContentKey } from "@/Components/Enums/contentKeys";
import { currencize } from "@/Components/helpers/currencize";
import { MongoDoc } from "@/Components/Hooks/useUser";
import Link from "@/Components/i18n/Link";
import InitialAvatar from "@/Components/UI/InitialAvatar";
import Ixon from "@/Components/UI/Ixon";
import ReceiptIcon from "@/Components/Icons/ReceiptIcon";
import {
  DoctorSessionType,
  doctorSessionTypeContentKeyDict,
} from "@/Components/DoctorPanel/Calendar/DoctorCalendarDay";
import { safeFormatDate } from "@/Components/helpers/safeFormatDate";

const NS: ContentNamespace[] = ["common", "dashboardInvoice"];

// mirrors Lib/enums.ts `pageLimit` on the backend
const INVOICES_PAGE_LIMIT = 25;

// GET /user/invoice - each invoice carries its checkout (paid or not) and
// the session's doctor name; `summary` covers all of the user's invoices.
interface IInvoiceListItem extends MongoDoc {
  submittedAt: string;
  total: number;
  sessionKind?: DoctorSessionType;
  checkout?: { paidAt?: string } | null;
  session?: {
    doctor?: {
      _id?: string;
      firstName?: string;
      lastName?: string;
      mainSpeciality?: { name?: string } | string | null;
    } | null;
  } | null;
}

type Summary = { paidTotal: number; paidCount: number; unpaidTotal: number; unpaidCount: number };

const TABS = ["all", "paid", "unpaid"] as const;
type Tab = (typeof TABS)[number];
const tabKeys: Record<Tab, ContentKey> = { all: "all", paid: "invTabPaid", unpaid: "invTabUnpaid" };

// Invoice history from the previous booking flow, as cards (read-only:
// new appointment payments live in Transactions).
const DashboardManageinvoicesPage = () => {
  const [page, setPage] = useState<number>(1);
  const [tab, setTab] = useState<Tab>("all");
  const pathname = usePathname();
  const getContent = useScopedLocale(NS);
  const intlTag = useIntlLocale();
  const num = useMemo(() => new Intl.NumberFormat(intlTag), [intlTag]);
  const day = useMemo(() => new Intl.DateTimeFormat(intlTag, { day: "numeric", month: "long", year: "numeric" }), [intlTag]);

  const { data, error } = useSWR<{ data: IInvoiceListItem[]; total: number; summary?: Summary }>(
    `${API}/user/invoice?page=${page}${tab === "all" ? "" : `&status=${tab}`}`,
    (url: string) => fetcher({ url }).then((res) => res.data),
  );

  const list = Array.isArray(data?.data) ? data.data : [];
  const s: Summary = data?.summary || { paidTotal: 0, paidCount: 0, unpaidTotal: 0, unpaidCount: 0 };
  const counts: Record<Tab, number> = { all: s.paidCount + s.unpaidCount, paid: s.paidCount, unpaid: s.unpaidCount };

  return (
    <HandleLoading data={!!data} error={error}>
      {!!data && (
        <div className={classes.main}>
          <header className={classes.header}>
            <h1 className={classes.title}>{getContent("invoices")}</h1>
            <div className={classes.tabs} role="tablist">
              {TABS.map((t) => (
                <button
                  key={t}
                  type="button"
                  role="tab"
                  aria-selected={tab === t}
                  className={`${classes.tab} ${tab === t ? classes.tabOn : ""}`}
                  onClick={() => {
                    setTab(t);
                    setPage(1);
                  }}
                >
                  {getContent(tabKeys[t])}
                  <span className={classes.tabCount}>{num.format(counts[t])}</span>
                </button>
              ))}
            </div>
          </header>

          <div className={classes.tiles}>
            <div className={classes.tile}>
              <span>{getContent("invPaidSum")}</span>
              <strong>
                {currencize(s.paidTotal)} <small>{getContent("toman")}</small>
              </strong>
              <em>{getContent("invCount", [num.format(s.paidCount)])}</em>
            </div>
            <div className={`${classes.tile} ${s.unpaidCount ? classes.tileWarn : ""}`}>
              <span>{getContent("invUnpaidSum")}</span>
              <strong>
                {currencize(s.unpaidTotal)} <small>{getContent("toman")}</small>
              </strong>
              <em>{getContent("invCount", [num.format(s.unpaidCount)])}</em>
            </div>
          </div>

          {counts.all > 0 && (
            <p className={classes.note} role="note">
              {getContent("invArchiveNote")}{" "}
              <Link href="/dashboard/transaction">{getContent("transactions")}</Link>
            </p>
          )}

          {!list.length ? (
            <div className={classes.empty}>{getContent("invEmpty")}</div>
          ) : (
            <ul className={classes.grid}>
              {list.map((inv) => {
                const doc = inv.session?.doctor;
                const docName = [doc?.firstName, doc?.lastName].filter(Boolean).join(" ");
                const spec =
                  doc?.mainSpeciality && typeof doc.mainSpeciality === "object" ? doc.mainSpeciality.name : "";
                const kindKey = inv.sessionKind ? doctorSessionTypeContentKeyDict[inv.sessionKind] : undefined;
                const paid = !!inv.checkout;
                return (
                  <li key={inv._id} className={classes.card}>
                    <div className={classes.top}>
                      {docName ? (
                        <InitialAvatar name={docName} seed={doc?._id || inv._id} size="2.75rem" />
                      ) : (
                        <span className={`${classes.icon} glassIcon`}>
                          <Ixon width="1.25rem">
                            <ReceiptIcon />
                          </Ixon>
                        </span>
                      )}
                      <div className={classes.meta}>
                        <strong>{docName ? getContent("invVisitWith", [docName]) : getContent("invFallback")}</strong>
                        <span>{[spec, kindKey ? getContent(kindKey) : ""].filter(Boolean).join(" · ")}</span>
                      </div>
                      <span className={`${classes.badge} ${paid ? classes.badgePaid : classes.badgeUnpaid}`}>
                        {getContent(paid ? "paid" : "notPaid")}
                      </span>
                    </div>
                    <div className={classes.bottom}>
                      <div className={classes.amount}>
                        <span className={classes.total}>
                          {currencize(inv.total)} <small>{getContent("toman")}</small>
                        </span>
                        <span className={classes.date}>
                          {inv.submittedAt ? safeFormatDate(day, inv.submittedAt) : "—"}
                        </span>
                      </div>
                      <Link href={`/dashboard/invoice/${inv._id}`} className={classes.primary}>
                        {getContent("invDetails")}
                      </Link>
                    </div>
                  </li>
                );
              })}
            </ul>
          )}

          {data.total > INVOICES_PAGE_LIMIT && (
            <Pagination
              className={classes.pagination}
              currentPage={page}
              pagesCount={Math.ceil(data.total / INVOICES_PAGE_LIMIT)}
              makePath={() => pathname}
              onClickPage={setPage}
            />
          )}
        </div>
      )}
    </HandleLoading>
  );
};

export default DashboardManageinvoicesPage;
