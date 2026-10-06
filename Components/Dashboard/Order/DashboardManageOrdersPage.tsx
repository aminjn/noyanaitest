"use client";

import useSWR from "swr";
import { useMemo, useState } from "react";
import classes from "./DashboardManageOrdersPage.module.css";
import { API } from "@/Components/config";
import { fetcher } from "@/Components/helpers/fetcher";
import HandleLoading from "@/Components/Admin/UI/HandleLoading";
import useScopedLocale from "@/Components/Hooks/useScopedLocale";
import { ContentNamespace } from "@/Components/Enums/contentNamespaces";
import { ContentKey } from "@/Components/Enums/contentKeys";
import { currencize } from "@/Components/helpers/currencize";
import { MongoDoc } from "@/Components/Hooks/useUser";
import { useIntlLocale } from "@/Components/i18n/navigation";
import Link from "@/Components/i18n/Link";
import AssistantStrip from "@/Components/UI/AssistantStrip";
import Ixon from "@/Components/UI/Ixon";
import PackageIcon from "@/Components/Icons/PackageIcon";
import OrderStatusBadge from "./OrderStatusBadge";
import { OrderStatus } from "./orderStatus";
import { safeFormatDate } from "@/Components/helpers/safeFormatDate";

const NS: ContentNamespace[] = ["common", "dashboardOrder"];

type Named = { name?: string } | null | undefined;
type OrderLine = {
  item?: (Named & { product?: Named; test?: Named }) | string | null;
  qty: number;
  price: number;
  status?: "pending" | "fulfilled" | "cancelled";
};

// GET /user/order - mirrors Models/Order.ts on noyanai-back; each line's
// item carries just its name (products and tests through their catalog
// entry). The full order is on /order/:id.
interface IOrderListItem extends MongoDoc {
  products?: OrderLine[];
  productPackages?: OrderLine[];
  services?: OrderLine[];
  servicePackages?: OrderLine[];
  tests?: OrderLine[];
  total: number;
  paymentMethod: string;
  status: OrderStatus;
  submittedAt: string;
  paidAt?: string;
}

const lines = (o: IOrderListItem) =>
  [o.products, o.productPackages, o.services, o.servicePackages, o.tests].flatMap((l) => (Array.isArray(l) ? l : []));

const lineName = (l: OrderLine) => {
  const it = l.item;
  if (!it || typeof it === "string") return "";
  return it.name || it.product?.name || it.test?.name || "";
};

const TABS = ["all", "paid", "pending", "cancelled"] as const;
type Tab = (typeof TABS)[number];
const tabKeys: Record<Tab, ContentKey> = {
  all: "poTabAll",
  paid: "poTabPaid",
  pending: "poTabPending",
  cancelled: "poTabCancelled",
};

// Patient's orders as cards: what was ordered, total, payment status and
// how much of it the sellers have prepared.
const DashboardManageOrdersPage = () => {
  const getContent = useScopedLocale(NS);
  const intlTag = useIntlLocale();
  const num = useMemo(() => new Intl.NumberFormat(intlTag), [intlTag]);
  const day = useMemo(() => new Intl.DateTimeFormat(intlTag, { day: "numeric", month: "long", year: "numeric" }), [intlTag]);
  const [tab, setTab] = useState<Tab>("all");
  const [filter, setFilter] = useState<"" | "unpaid" | "preparing">("");

  const { data, error } = useSWR<IOrderListItem[]>(`${API}/user/order`, (url: string) =>
    fetcher({ url }).then((res) => res.data),
  );

  const orders = useMemo(
    () =>
      (Array.isArray(data) ? data : []).map((o) => {
        const all = lines(o);
        const live = all.filter((l) => l.status !== "cancelled");
        const ready = live.filter((l) => l.status === "fulfilled").length;
        return {
          o,
          names: all.map(lineName).filter(Boolean),
          count: all.length,
          ready,
          live: live.length,
          preparing: o.status === "paid" && ready < live.length,
        };
      }),
    [data],
  );

  const counts = {
    all: orders.length,
    paid: orders.filter((x) => x.o.status === "paid").length,
    pending: orders.filter((x) => x.o.status === "pending").length,
    cancelled: orders.filter((x) => x.o.status === "cancelled").length,
    preparing: orders.filter((x) => x.preparing).length,
  };

  const shown = orders.filter((x) => {
    if (filter === "unpaid") return x.o.status === "pending";
    if (filter === "preparing") return x.preparing;
    return tab === "all" || x.o.status === tab;
  });

  return (
    <HandleLoading data={!!data} error={error}>
      {!!data && (
        <div className={classes.main}>
          <header className={classes.header}>
            <h1 className={classes.title}>{getContent("poTitle")}</h1>
            <div className={classes.tabs} role="tablist">
              {TABS.map((t) => (
                <button
                  key={t}
                  type="button"
                  role="tab"
                  aria-selected={!filter && tab === t}
                  className={`${classes.tab} ${!filter && tab === t ? classes.tabOn : ""}`}
                  onClick={() => {
                    setTab(t);
                    setFilter("");
                  }}
                >
                  {getContent(tabKeys[t])}
                  <span className={classes.tabCount}>{num.format(counts[t])}</span>
                </button>
              ))}
            </div>
          </header>

          <AssistantStrip
            title={getContent("poAssistant")}
            clearLabel={getContent("poClear")}
            onClear={() => setFilter("")}
            chips={[
              ...(counts.pending
                ? [
                    {
                      key: "unpaid",
                      label: getContent("poAiUnpaid", [num.format(counts.pending)]),
                      active: filter === "unpaid",
                      onClick: () => setFilter(filter === "unpaid" ? "" : "unpaid"),
                    },
                  ]
                : []),
              ...(counts.preparing
                ? [
                    {
                      key: "preparing",
                      label: getContent("poAiPreparing", [num.format(counts.preparing)]),
                      active: filter === "preparing",
                      onClick: () => setFilter(filter === "preparing" ? "" : "preparing"),
                    },
                  ]
                : []),
            ]}
          />

          {!shown.length ? (
            <div className={classes.empty}>
              <p>{getContent("poEmpty")}</p>
              <Link href="/product" className={classes.primary}>
                {getContent("poShop")}
              </Link>
            </div>
          ) : (
            <ul className={classes.grid}>
              {shown.map(({ o, names, count, ready, live }) => (
                <li key={o._id} className={classes.card}>
                  <div className={classes.top}>
                    <span className={`${classes.icon} glassIcon tone-teal`}>
                      <Ixon width="1.25rem">
                        <PackageIcon />
                      </Ixon>
                    </span>
                    <div className={classes.meta}>
                      <strong>{o.submittedAt ? safeFormatDate(day, o.submittedAt) : "—"}</strong>
                      <span>{getContent("poItems", [num.format(count)])}</span>
                    </div>
                    <OrderStatusBadge status={o.status} />
                  </div>

                  <p className={classes.items}>
                    {names.slice(0, 3).join(" · ") || getContent("poItems", [num.format(count)])}
                    {names.length > 3 && (
                      <span className={classes.more}> {getContent("poMore", [num.format(names.length - 3)])}</span>
                    )}
                  </p>

                  {o.status === "paid" && live > 0 && (
                    <div className={classes.progressBox}>
                      <span>{getContent("poProgress", [num.format(ready), num.format(live)])}</span>
                      <div className={classes.progress} aria-hidden>
                        <span style={{ width: `${(ready / live) * 100}%` }} />
                      </div>
                    </div>
                  )}

                  <div className={classes.bottom}>
                    <span className={classes.total}>
                      {currencize(o.total)} <small>{getContent("toman")}</small>
                    </span>
                    <Link href={`/order/${o._id}`} className={classes.primary}>
                      {getContent("poDetails")}
                    </Link>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </div>
      )}
    </HandleLoading>
  );
};

export default DashboardManageOrdersPage;
