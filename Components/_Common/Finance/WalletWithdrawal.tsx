"use client";
import { TEHRAN_TZ } from "@/Components/helpers/tehranTime";

import { useEffect, useMemo, useState } from "react";
import useSWR from "swr";
import { API } from "@/Components/config";
import { fetcher } from "@/Components/helpers/fetcher";
import useForm from "@/Components/Hooks/useForm";
import useScopedLocale from "@/Components/Hooks/useScopedLocale";
import { ContentNamespace } from "@/Components/Enums/contentNamespaces";
import { ContentKey } from "@/Components/Enums/contentKeys";
import { useIntlLocale } from "@/Components/i18n/navigation";
import { safeFormatDate } from "@/Components/helpers/safeFormatDate";
import Input from "@/Components/UI/Input";
import Button from "@/Components/UI/Button";
import Badge, { BadgeColor } from "@/Components/UI/Badge";
import Act from "@/Components/UI/Act";
import classes from "./WalletWithdrawal.module.css";

const NS: ContentNamespace[] = ["common", "walletWithdrawal"];

type Withdrawal = {
  _id: string;
  amount: number;
  iban: string;
  holderName: string;
  status: "pending" | "paid" | "rejected" | "cancelled";
  trackingCode?: string;
  adminNote?: string;
  createdAt: string;
};

type WithdrawalData = {
  balance: number;
  // earnings in their settlement hold, not withdrawable yet
  pending?: number;
  holdDays?: number;
  minAmount: number;
  // false: a centre's team member - sees the wallet, the owner asks
  canWithdraw?: boolean;
  requests: Withdrawal[];
  last: { iban: string; holderName: string } | null;
};

const statusView: Record<Withdrawal["status"], { key: ContentKey; color: BadgeColor }> = {
  pending: { key: "wdStatusPending", color: "Warning" },
  paid: { key: "wdStatusPaid", color: "Success" },
  rejected: { key: "wdStatusRejected", color: "Error" },
  cancelled: { key: "wdStatusCancelled", color: "Disabled" },
};

// Wallet -> bank withdrawal (2026-09), the same box on every page where
// someone holds money: the user dashboard wallet, and the doctor /
// pharmacy / paraclinic finance pages work on the signed-in user's own
// wallet (a provider's payouts are credited to the owner's wallet). A
// clinic or hospital has its own wallet (2026-10, one per centre): its
// panel passes `api` ("/clinic/withdrawal"), which works on the active
// centre's wallet.
const WalletWithdrawal = ({ api = "/user/withdrawal" }: { api?: string }) => {
  const getContent = useScopedLocale(NS);
  const intlTag = useIntlLocale();
  const num = useMemo(() => new Intl.NumberFormat(intlTag), [intlTag]);
  const date = useMemo(
    () => new Intl.DateTimeFormat(intlTag, { timeZone: TEHRAN_TZ, dateStyle: "medium" }),
    [intlTag],
  );
  const { data, mutate } = useSWR<WithdrawalData>(
    `${API}${api}`,
    (url: string) => fetcher({ url }).then((res) => res.data),
  );
  const [cancelId, setCancelId] = useState<string | null>(null);

  const { submit, setInput, isLoading } = useForm<{
    amount: number;
    iban: string;
    holderName: string;
  }>({
    path: `${API}${api}`,
    method: "POST",
    successMessage: getContent("wdSuccess"),
    hasProblem: (inp) =>
      !inp.amount || !inp.iban?.trim() || !inp.holderName?.trim()
        ? getContent("wdCheckInput")
        : undefined,
    successCb: () => mutate(),
  });

  // the last account used is prefilled - and sent even if left untouched
  const lastIban = data?.last?.iban;
  const lastHolder = data?.last?.holderName;
  useEffect(() => {
    if (!lastIban && !lastHolder) return;
    setInput((prev) => ({
      ...(lastIban && { iban: lastIban }),
      ...(lastHolder && { holderName: lastHolder }),
      ...prev,
    }));
  }, [lastIban, lastHolder, setInput]);

  if (!data) return null;
  const requests = Array.isArray(data.requests) ? data.requests : [];
  const hasPending = requests.some((r) => r.status === "pending");

  return (
    <section className={classes.main}>
      <div className={classes.head}>
        <h3 className={classes.title}>{getContent("wdTitle")}</h3>
        <span className={classes.balance}>
          {getContent("wdBalance")}:
          <strong>{num.format(data.balance || 0)}</strong>
        </span>
      </div>
      <p className={classes.hint}>
        {getContent("wdHint", [num.format(data.minAmount || 0)])}
      </p>
      {(Number(data.pending) || 0) > 0 && (
        <p className={classes.hint}>
          {getContent("wdPendingNote", [
            num.format(Number(data.pending) || 0),
            num.format(Number(data.holdDays) || 0),
          ])}
        </p>
      )}
      {!hasPending && data.canWithdraw !== false && (
        <div className={classes.form}>
          <Input
            title={getContent("wdAmount")}
            inputMode="numeric"
            onChange={(e) => {
              const n = Number(
                e.target.value
                  .replace(/[۰-۹]/g, (d) => String("۰۱۲۳۴۵۶۷۸۹".indexOf(d)))
                  .replace(/[^\d]/g, ""),
              );
              setInput((prev) => ({ ...prev, amount: n || undefined }));
            }}
          />
          <Input
            title={getContent("wdIban")}
            defaultValue={data.last?.iban || ""}
            onChange={(e) => setInput((prev) => ({ ...prev, iban: e.target.value }))}
          />
          <Input
            title={getContent("wdHolder")}
            defaultValue={data.last?.holderName || ""}
            onChange={(e) =>
              setInput((prev) => ({ ...prev, holderName: e.target.value }))
            }
          />
          <Button
            isLoading={isLoading}
            onClick={submit}
          >
            {getContent("wdSubmit")}
          </Button>
        </div>
      )}
      <span className={classes.historyTitle}>{getContent("wdHistory")}</span>
      {!requests.length ? (
        <span className={classes.empty}>{getContent("wdEmpty")}</span>
      ) : (
        <div className={classes.list}>
          {requests.map((r) => (
            <div key={r._id} className={classes.item}>
              <div className={classes.itemMain}>
                <span className={classes.itemAmount}>{num.format(r.amount)}</span>
                <span className={classes.itemSub} dir="ltr">
                  {r.iban}
                </span>
                <span className={classes.itemSub}>
                  {safeFormatDate(date, r.createdAt)}
                </span>
                {r.status === "paid" && !!r.trackingCode && (
                  <span className={classes.itemSub}>
                    {getContent("wdTracking", [r.trackingCode])}
                  </span>
                )}
                {r.status === "rejected" && !!r.adminNote && (
                  <span className={classes.itemSub}>
                    {getContent("wdReason", [r.adminNote])}
                  </span>
                )}
              </div>
              <Badge size="S" radius="High" mode="Fill" color={statusView[r.status].color}>
                {getContent(statusView[r.status].key)}
              </Badge>
              {r.status === "pending" && data.canWithdraw !== false && (
                <Button
                  size="S"
                  variant="Error"
                  mode="Outline"
                  isLoading={cancelId === r._id}
                  onClick={() => setCancelId(r._id)}
                >
                  {getContent("wdCancel")}
                </Button>
              )}
            </div>
          ))}
        </div>
      )}
      <Act
        path={cancelId ? `${API}${api}/${cancelId}` : null}
        method="PUT"
        onDone={() => {
          setCancelId(null);
          mutate();
        }}
      />
    </section>
  );
};

export default WalletWithdrawal;
