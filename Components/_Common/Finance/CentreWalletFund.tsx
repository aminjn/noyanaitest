"use client";
import { useEffect, useMemo, useState } from "react";
import useSWR from "swr";
import { API } from "@/Components/config";
import { fetcher } from "@/Components/helpers/fetcher";
import useForm from "@/Components/Hooks/useForm";
import useScopedLocale from "@/Components/Hooks/useScopedLocale";
import { ContentNamespace } from "@/Components/Enums/contentNamespaces";
import { useIntlLocale } from "@/Components/i18n/navigation";
import Input from "@/Components/UI/Input";
import Button from "@/Components/UI/Button";
import classes from "./WalletWithdrawal.module.css";

const NS: ContentNamespace[] = ["common", "walletWithdrawal"];

// A clinic's / hospital's plan and SMS are paid from its own wallet only
// (2026-10). The owner fills it from the personal wallet here (backend
// POST /<kind>/wallet/fund). Shown to the owner only: the server sends the
// personal balance to the owner alone.
const CentreWalletFund = ({
  kind,
  suggested,
  onDone,
}: {
  kind: "clinic" | "hospital";
  // the amount the next purchase is short of, prefilled
  suggested?: number;
  onDone?: () => unknown;
}) => {
  const getContent = useScopedLocale(NS);
  const intlTag = useIntlLocale();
  const num = useMemo(() => new Intl.NumberFormat(intlTag), [intlTag]);
  const { data, mutate } = useSWR<{ balance: number; personalBalance: number | null }>(
    `${API}/${kind}/wallet`,
    (url: string) =>
      fetcher({ url }).then((res) => ({
        balance: Number(res?.data?.balance) || 0,
        personalBalance: res?.data?.personalBalance == null ? null : Number(res.data.personalBalance) || 0,
      })),
  );
  const start = suggested && suggested > 0 ? Math.ceil(suggested) : undefined;
  const [shown, setShown] = useState(start ? String(start) : "");
  const { submit, setInput, isLoading } = useForm<{ amount: number }>({
    path: `${API}/${kind}/wallet/fund`,
    method: "POST",
    successMessage: getContent("cwFundDone"),
    hasProblem: (inp) => (!inp.amount ? getContent("wdCheckInput") : undefined),
    successCb: () => {
      mutate();
      onDone?.();
    },
  });

  // the suggested amount is sent even if the field is left as it is
  useEffect(() => {
    if (start) setInput((prev) => ({ amount: start, ...prev }));
  }, [start, setInput]);

  if (!data || data.personalBalance === null) return null;
  return (
    <section className={classes.main}>
      <div className={classes.head}>
        <h3 className={classes.title}>{getContent("cwFundTitle")}</h3>
        <span className={classes.balance}>
          {getContent("cwPersonal")}:<strong>{num.format(data.personalBalance)}</strong>
        </span>
      </div>
      <p className={classes.hint}>{getContent("cwFundHint")}</p>
      <div className={classes.form}>
        <Input
          title={getContent("wdAmount")}
          inputMode="numeric"
          defaultValue={shown}
          onChange={(e) => {
            const n = Number(
              e.target.value
                .replace(/[۰-۹]/g, (d) => String("۰۱۲۳۴۵۶۷۸۹".indexOf(d)))
                .replace(/[^\d]/g, ""),
            );
            setShown(e.target.value);
            setInput((prev) => ({ ...prev, amount: n || undefined }));
          }}
        />
        <Button isLoading={isLoading} onClick={submit}>
          {getContent("cwFundSubmit")}
        </Button>
      </div>
    </section>
  );
};

export default CentreWalletFund;
