import useSWR from "swr";
import { API } from "../config";
import { fetcher } from "../helpers/fetcher";
import { MongoDoc } from "../Hooks/useUser";

// Mirrors noyanai-back Models/GatewayPayment.ts (2026-09, SEP/Saman online
// gateway) - only the fields GET /payment/:id selects.
export const gatewayPaymentStatuses = [
  "created",
  "verifying",
  "paid",
  "failed",
  "reversed",
  "needsReview",
] as const;

export type GatewayPaymentStatus = (typeof gatewayPaymentStatuses)[number];

export type GatewayPaymentPurpose = "walletCharge" | "order";

export interface IGatewayPayment extends MongoDoc {
  gateway: "sep";
  purpose: GatewayPaymentPurpose;
  amount: number;
  order?: string;
  returnPath?: string;
  status: GatewayPaymentStatus;
  refNum?: string;
  rrn?: string;
  traceNo?: string;
  maskedPan?: string;
  failureReason?: string;
  createdAt: string;
  verifiedAt?: string;
}

// Still waiting on the gateway / our verify - the result page keeps polling.
export const isPendingPaymentStatus = (status: GatewayPaymentStatus) =>
  status === "created" || status === "verifying";

// GET /payment/config - whether online payment is switched on (and fully
// configured) in the admin AppConfig, plus the minimum wallet top-up.
export interface IPaymentConfig {
  sepEnabled: boolean;
  minAmount: number;
}

export const usePaymentConfig = () =>
  useSWR<IPaymentConfig>(`${API}/payment/config`, (url: string) =>
    fetcher({ url }).then((res) => res.data),
  );

// Response shape of POST /payment/wallet/charge.
export type WalletChargeResponse = {
  data: { payment: string; redirectUrl: string };
};

// Accepts Persian/Arabic-Indic digits and thousands separators, returns an
// integer (0 when nothing numeric was typed).
export const parseAmountInput = (value: string): number => {
  const latin = value
    .replace(/[۰-۹]/g, (d) => String("۰۱۲۳۴۵۶۷۸۹".indexOf(d)))
    .replace(/[٠-٩]/g, (d) => String("٠١٢٣٤٥٦٧٨٩".indexOf(d)))
    .replace(/\D/g, "");
  return latin ? parseInt(latin, 10) : 0;
};
