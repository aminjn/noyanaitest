"use client";

import { useState } from "react";
import useSWR from "swr";
import WithTitle from "../UI/WithTitle";
import Box from "../UI/Box";
import HandleLoading from "../UI/HandleLoading";
import Table from "../UI/Table";
import TableActions from "../UI/TableActions";
import IconLink from "../UI/IconLink";
import EyeIcon from "@/Components/Icons/EyeIcon";
import Input from "@/Components/UI/Input";
import Button from "@/Components/UI/Button";
import Badge, { BadgeColor } from "@/Components/UI/Badge";
import Act from "@/Components/UI/Act";
import { API, adminKey } from "@/Components/config";
import { fetcher } from "@/Components/helpers/fetcher";
import { currencize } from "@/Components/helpers/currencize";
import useNotification from "@/Components/Hooks/useNotification";
import {
  GatewayPaymentStatus,
  IGatewayPayment,
  parseAmountInput,
  WalletChargeResponse,
} from "@/Components/Payment/paymentTypes";
import classes from "./AdminSepTestPage.module.css";

// Admin-only tester for the SEP (Saman) online gateway (2026-09) - see
// Services/paymentService.ts / Controllers/paymentController.ts
// (adminGetSepTest, adminStartSepTest) on noyanai-back.
//
// Takes an amount and runs a REAL payment through the normal flow: a wallet
// top-up for the logged-in admin -> SEP payment page -> callback -> verify ->
// wallet credit -> /payment/<id> result page, which offers a way back here.
// Only the public on/off switch and the minimum top-up are skipped, so the
// gateway can be tried before it's enabled for users. Plain Persian strings
// (no contentKeys), matching the other admin debug pages
// (Components/Admin/Snapp/AdminSnappTestPage.tsx).

type SepTestConfig = {
  enabled: boolean;
  configured: boolean;
  terminalId: string;
  callbackUrl: string;
  siteBaseUrl: string;
  multiplier: number;
  tokenExpiryMinutes: number;
};

type SepTestPayment = IGatewayPayment & {
  gatewayAmount: number;
  state?: string;
  verifyResultCode?: number;
  verifyResultDescription?: string;
};

type SepTestData = { config: SepTestConfig; payments: SepTestPayment[] };

const statusLabels: Record<GatewayPaymentStatus, string> = {
  created: "در انتظار پرداخت",
  verifying: "در حال تایید",
  paid: "موفق",
  failed: "ناموفق",
  reversed: "برگشت داده شد",
  needsReview: "نیازمند بررسی دستی",
};

const statusColors: Record<GatewayPaymentStatus, BadgeColor> = {
  created: "Info",
  verifying: "Warning",
  paid: "Success",
  failed: "Error",
  reversed: "Secondary",
  needsReview: "Error",
};

const CheckRow = ({
  ok,
  title,
  value,
}: {
  ok: boolean;
  title: string;
  value?: string;
}) => (
  <div className={classes.checkRow}>
    <Badge color={ok ? "Success" : "Error"}>{ok ? "✓" : "✗"}</Badge>
    <span className={classes.checkTitle}>{title}</span>
    {!!value && (
      <span className={classes.checkValue} dir="ltr">
        {value}
      </span>
    )}
  </div>
);

const AdminSepTestPage = () => {
  const pushNotification = useNotification();

  const { data, error } = useSWR<SepTestData>(
    `${API}/admin/sep/test`,
    (url: string) => fetcher({ url }).then((res) => res.data),
  );

  const [amount, setAmount] = useState<number>(0);
  const [payload, setPayload] = useState<{
    amount: number;
    returnPath: string;
  } | null>(null);

  const config = data?.config;

  const start = () => {
    if (payload) return;
    if (!amount || amount < 1) {
      pushNotification("مبلغ را وارد کنید", "Warn");
      return;
    }
    setPayload({ amount, returnPath: `/${adminKey}/sepTest` });
  };

  return (
    <WithTitle title="تست درگاه پرداخت سامان (سپ)">
      <HandleLoading data={!!data} error={error}>
        {!!config && (
          <Box className={classes.box}>
            <span className={classes.sectionTitle}>وضعیت پیکربندی</span>
            <CheckRow
              ok={!!config.terminalId}
              title="شماره ترمینال"
              value={config.terminalId || "تنظیم نشده"}
            />
            <CheckRow
              ok={!!config.callbackUrl}
              title="آدرس بازگشت از درگاه (باید از مرورگر در دسترس باشد)"
              value={config.callbackUrl || "تنظیم نشده"}
            />
            <CheckRow
              ok={!!config.siteBaseUrl}
              title="آدرس سایت"
              value={config.siteBaseUrl || "تنظیم نشده"}
            />
            <CheckRow
              ok={config.enabled}
              title={
                config.enabled
                  ? "پرداخت آنلاین برای کاربران فعال است"
                  : "پرداخت آنلاین برای کاربران غیرفعال است (تست ادمین همچنان ممکن است)"
              }
            />
            <p className={classes.note}>
              {`ضریب تبدیل به ریال: ${config.multiplier} - مدت اعتبار توکن: ${config.tokenExpiryMinutes} دقیقه. تنظیمات از صفحه «تنظیمات سیستم» قابل ویرایش است. IP سرور بک‌اند باید نزد سپ ثبت شده باشد.`}
            </p>
          </Box>
        )}

        {!!config && (
          <Box className={classes.box}>
            <span className={classes.sectionTitle}>پرداخت آزمایشی</span>
            <p className={classes.note}>
              این یک پرداخت واقعی است: مبلغ از کارت شما کسر و پس از تایید به
              کیف پول حساب ادمین فعلی اضافه می‌شود، دقیقا مانند شارژ کیف پول
              کاربران.
            </p>
            <Input
              title="مبلغ (تومان)"
              inputMode="numeric"
              onChange={(e) => setAmount(parseAmountInput(e.target.value))}
            />
            {amount > 0 && (
              <span className={classes.note}>
                {`${currencize(amount)} تومان = ${currencize(Math.round(amount * config.multiplier))} ریال ارسالی به درگاه`}
              </span>
            )}
            <Button
              onClick={start}
              isLoading={!!payload}
              className={classes.submit}
            >
              {config.configured
                ? "انتقال به درگاه"
                : "ابتدا تنظیمات درگاه را کامل کنید"}
            </Button>
          </Box>
        )}

        {!!data && (
          <Box className={classes.box}>
            <span className={classes.sectionTitle}>
              آخرین پرداخت‌های آنلاین شما
            </span>
            <Table
              name="AdminSepTestPayments"
              data={data.payments}
              renderer={{
                amount: {
                  name: "مبلغ (تومان)",
                  value: (node) => node.amount,
                  filter: "Number",
                  component: (node) => currencize(node.amount),
                },
                status: {
                  name: "وضعیت",
                  value: (node) => statusLabels[node.status],
                  filter: "Set",
                  component: (node) => (
                    <Badge color={statusColors[node.status]}>
                      {statusLabels[node.status]}
                    </Badge>
                  ),
                },
                createdAt: {
                  name: "زمان",
                  value: (node) => new Date(node.createdAt),
                  filter: "Date",
                },
                traceNo: {
                  name: "کد رهگیری",
                  value: (node) => node.traceNo,
                  filter: "Text",
                },
                verifyResultCode: {
                  name: "نتیجه درگاه",
                  value: (node) =>
                    node.verifyResultCode === undefined
                      ? node.state
                      : `${node.verifyResultCode} ${node.verifyResultDescription || ""}`,
                  filter: "Text",
                },
                failureReason: {
                  name: "علت خطا",
                  value: (node) => node.failureReason,
                  filter: "Text",
                },
                rrn: {
                  name: "شماره مرجع",
                  value: (node) => node.rrn,
                  filter: "Text",
                },
                actions: {
                  name: "عملیات",
                  component: (node) => (
                    <TableActions>
                      <IconLink
                        href={`/payment/${node._id}`}
                        title="مشاهده نتیجه"
                      >
                        <EyeIcon />
                      </IconLink>
                    </TableActions>
                  ),
                },
              }}
            />
          </Box>
        )}
      </HandleLoading>
      <Act<WalletChargeResponse>
        path={payload ? `${API}/admin/sep/test` : null}
        method="POST"
        payload={payload || undefined}
        onDone={(status, result) => {
          const url = result?.data?.redirectUrl;
          if (!status || !url) {
            setPayload(null);
            return;
          }
          pushNotification("در حال انتقال به درگاه پرداخت…");
          window.location.assign(url);
        }}
      />
    </WithTitle>
  );
};

export default AdminSepTestPage;
