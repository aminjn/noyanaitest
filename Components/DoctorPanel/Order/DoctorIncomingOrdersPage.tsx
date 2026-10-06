"use client";
import { TEHRAN_TZ } from "@/Components/helpers/tehranTime";

import useSWR from "swr";
import { useMemo, useState } from "react";
import classes from "./DoctorIncomingOrdersPage.module.css";
import { API } from "@/Components/config";
import { fetcher } from "@/Components/helpers/fetcher";
import { currencize } from "@/Components/helpers/currencize";
import { MongoDoc } from "@/Components/Hooks/useUser";
import useScopedLocale from "@/Components/Hooks/useScopedLocale";
import useBreadCrump from "@/Components/Hooks/useBreadCrump";
import useNotification from "@/Components/Hooks/useNotification";
import HandleLoading from "@/Components/Admin/UI/HandleLoading";
import OrderStatusBadge from "@/Components/Dashboard/Order/OrderStatusBadge";
import OrderItemStatusBadge from "@/Components/Dashboard/Order/OrderItemStatusBadge";
import { OrderStatus } from "@/Components/Dashboard/Order/orderStatus";
import { OrderItemStatus } from "@/Components/Dashboard/Order/orderItemStatus";
import { ContentNamespace } from "@/Components/Enums/contentNamespaces";
import { ContentKey } from "@/Components/Enums/contentKeys";
import { useIntlLocale } from "@/Components/i18n/navigation";
import Link from "@/Components/i18n/Link";
import InitialAvatar from "@/Components/UI/InitialAvatar";
import Ixon from "@/Components/UI/Ixon";
import CheckIcon from "@/Components/Icons/CheckIcon";
import XMarkIcon from "@/Components/Icons/XMarkIcon";
import { safeFormatDate } from "@/Components/helpers/safeFormatDate";

const NS: ContentNamespace[] = ["common", "doctorPanelOrder"];

// Shape returned by GET /doctor/order (doctorController.getMyIncomingOrders)
// and GET /doctor/order/:nodeId (doctorController.getMyIncomingOrder) - each
// order is already filtered down to just this doctor's own
// services/servicePackages line items, plus a "subtotal" computed over only
// those items.
export interface IIncomingOrderItem {
  item: { _id: string; name?: string };
  qty: number;
  price: number;
  status: OrderItemStatus;
}

export interface IIncomingOrder extends MongoDoc {
  user: { _id: string; username?: string; phone: string };
  submittedAt: string;
  status: OrderStatus;
  services: IIncomingOrderItem[];
  servicePackages: IIncomingOrderItem[];
  subtotal: number;
}

const buyerLabel = (order: IIncomingOrder) =>
  order.user?.username || order.user?.phone || "";

type Line = IIncomingOrderItem & { model: "services" | "servicePackages" };

const linesOf = (o: IIncomingOrder): Line[] => [
  ...(Array.isArray(o.services) ? o.services : []).map((l) => ({ ...l, model: "services" as const })),
  ...(Array.isArray(o.servicePackages) ? o.servicePackages : []).map((l) => ({
    ...l,
    model: "servicePackages" as const,
  })),
];

const TABS = ["todo", "awaiting", "done", "all"] as const;
type Tab = (typeof TABS)[number];
const tabKeys: Record<Tab, ContentKey> = { todo: "ioTodo", awaiting: "ioAwaiting", done: "ioDone", all: "all" };

const tabOf = (o: IIncomingOrder, lines: Line[]): Exclude<Tab, "all"> => {
  if (o.status === "pending") return "awaiting";
  if (o.status === "paid" && lines.some((l) => l.status === "pending")) return "todo";
  return "done";
};

// one pending line: "done" / "cancel", each asking once inline before the
// PATCH (the backend only moves a pending line)
const LineActions = ({ orderId, line, mutate }: { orderId: string; line: Line; mutate: () => unknown }) => {
  const getContent = useScopedLocale(NS);
  const pushNotification = useNotification();
  const [ask, setAsk] = useState<"fulfilled" | "cancelled" | null>(null);
  const [busy, setBusy] = useState(false);

  const run = async () => {
    if (!ask || !line.item?._id) return;
    setBusy(true);
    try {
      await fetcher({
        url: `${API}/doctor/order/${orderId}`,
        method: "PATCH",
        payload: { model: line.model, itemId: line.item._id, status: ask },
      });
      mutate();
    } catch (e) {
      pushNotification(e instanceof Error ? e.message : String(e), "Error");
    } finally {
      setBusy(false);
      setAsk(null);
    }
  };

  if (ask)
    return (
      <span className={classes.lineActions}>
        <button
          type="button"
          className={ask === "fulfilled" ? classes.okBtn : classes.dangerBtn}
          onClick={run}
          disabled={busy}
        >
          {getContent("ioConfirm")}
        </button>
        <button type="button" className={classes.ghostBtn} onClick={() => setAsk(null)} disabled={busy}>
          {getContent("cancel")}
        </button>
      </span>
    );

  return (
    <span className={classes.lineActions}>
      <button type="button" className={classes.okBtn} onClick={() => setAsk("fulfilled")}>
        <Ixon width="0.875rem">
          <CheckIcon />
        </Ixon>
        {getContent("ioMarkDone")}
      </button>
      <button
        type="button"
        className={classes.iconBtn}
        onClick={() => setAsk("cancelled")}
        aria-label={getContent("ioMarkCancel")}
        title={getContent("ioMarkCancel")}
      >
        <Ixon width="0.875rem">
          <XMarkIcon />
        </Ixon>
      </button>
    </span>
  );
};

// Incoming service orders as a to-do inbox (Practo Ray / Doctolib-style):
// what still needs doing first, each line fulfilled right on the card.
const DoctorIncomingOrdersPage = () => {
  const getContent = useScopedLocale(NS);
  const intlTag = useIntlLocale();
  const num = useMemo(() => new Intl.NumberFormat(intlTag), [intlTag]);
  const day = useMemo(
    () => new Intl.DateTimeFormat(intlTag, { timeZone: TEHRAN_TZ, day: "numeric", month: "long", hour: "2-digit", minute: "2-digit" }),
    [intlTag],
  );
  const [tab, setTab] = useState<Tab>("todo");

  const { data, error, mutate } = useSWR<IIncomingOrder[]>(`${API}/doctor/order`, (url: string) =>
    fetcher({ url }).then((res) => res.data),
  );

  useBreadCrump([
    { title: getContent("dashboard"), target: "/doctorpanel" },
    { title: getContent("incomingOrders"), target: "/doctorpanel/order" },
  ]);

  const orders = useMemo(
    () =>
      (Array.isArray(data) ? data : []).map((o) => {
        const lines = linesOf(o);
        const live = lines.filter((l) => l.status !== "cancelled");
        return {
          o,
          lines,
          live: live.length,
          ready: live.filter((l) => l.status === "fulfilled").length,
          tab: tabOf(o, lines),
        };
      }),
    [data],
  );

  const counts: Record<Tab, number> = {
    todo: orders.filter((x) => x.tab === "todo").length,
    awaiting: orders.filter((x) => x.tab === "awaiting").length,
    done: orders.filter((x) => x.tab === "done").length,
    all: orders.length,
  };
  const shown = orders.filter((x) => tab === "all" || x.tab === tab);

  return (
    <HandleLoading data={!!data} error={error}>
      {!!data && (
        <div className={classes.main}>
          <header className={classes.header}>
            <h1 className={classes.title}>{getContent("incomingOrders")}</h1>
            <div className={classes.tabs} role="tablist">
              {TABS.map((t) => (
                <button
                  key={t}
                  type="button"
                  role="tab"
                  aria-selected={tab === t}
                  className={`${classes.tab} ${tab === t ? classes.tabOn : ""}`}
                  onClick={() => setTab(t)}
                >
                  {getContent(tabKeys[t])}
                  <span className={`${classes.tabCount} ${t === "todo" && counts.todo ? classes.hot : ""}`}>
                    {num.format(counts[t])}
                  </span>
                </button>
              ))}
            </div>
          </header>

          {!shown.length ? (
            <div className={classes.empty}>{getContent("ioEmpty")}</div>
          ) : (
            <ul className={classes.grid}>
              {shown.map(({ o, lines, live, ready }) => {
                const buyer = buyerLabel(o) || "—";
                return (
                  <li key={o._id} className={classes.card}>
                    <div className={classes.top}>
                      <InitialAvatar name={buyer} seed={o.user?._id || o._id} size="2.75rem" />
                      <div className={classes.meta}>
                        <strong>{buyer}</strong>
                        <span>{o.submittedAt ? safeFormatDate(day, o.submittedAt) : "—"}</span>
                      </div>
                      <OrderStatusBadge status={o.status} />
                    </div>

                    <ul className={classes.lines}>
                      {lines.map((l, i) => (
                        <li key={`${l.model}:${l.item?._id || i}`} className={classes.line}>
                          <span className={classes.lineName}>
                            {l.item?.name || "—"}
                            {l.qty > 1 && <em> × {num.format(l.qty)}</em>}
                          </span>
                          {o.status === "paid" && l.status === "pending" ? (
                            <LineActions orderId={o._id} line={l} mutate={mutate} />
                          ) : (
                            <OrderItemStatusBadge status={l.status} />
                          )}
                        </li>
                      ))}
                    </ul>

                    {o.status === "pending" && <p className={classes.note}>{getContent("ioAwaitingNote")}</p>}

                    {o.status === "paid" && live > 0 && (
                      <div className={classes.progressBox}>
                        <span>{getContent("ioProgress", [num.format(ready), num.format(live)])}</span>
                        <div className={classes.progress} aria-hidden>
                          <span style={{ width: `${(ready / live) * 100}%` }} />
                        </div>
                      </div>
                    )}

                    <div className={classes.bottom}>
                      <span className={classes.total}>
                        {currencize(o.subtotal || 0)} <small>{getContent("toman")}</small>
                      </span>
                      <Link href={`/doctorpanel/order/${o._id}`} className={classes.ghostLink}>
                        {getContent("view")}
                      </Link>
                    </div>
                  </li>
                );
              })}
            </ul>
          )}
        </div>
      )}
    </HandleLoading>
  );
};

export default DoctorIncomingOrdersPage;
