"use client";

import useSWR from "swr";
import { API } from "@/Components/config";
import { fetcher } from "@/Components/helpers/fetcher";
import HandleLoading from "../UI/HandleLoading";
import WithTitle from "../UI/WithTitle";
import CreateForm from "../UI/CreateForm";
import { IAppConfig } from "../AppConfig/AdminManageAppConfigPage";
import { ta } from "@/Components/Admin/i18n/adminText";

// The payment gateway (SEP) and wallet limits (2026-09 admin audit): they
// were fields in the middle of "system settings", away from every other
// money setting. They still live on AppConfig; this is their place in the
// finance settings hub. The withdrawal minimum used to be hardcoded.
const AdminPaymentSettingsTab = () => {
  const { data, error, mutate } = useSWR<IAppConfig>(
    `${API}/auto/appConfig`,
    (url: string) => fetcher({ url }).then((res) => res.data.data),
  );

  return (
    <HandleLoading data={!!data} error={error}>
      {!!data && (
        <WithTitle title={ta("درگاه پرداخت و کیف پول")}>
          <CreateForm<IAppConfig>
            layout="sections"
            defaultValue={data}
            hookProps={{
              path: `${API}/auto/appConfig`,
              method: "POST",
              successCb: () => mutate(),
            }}
            renderer={{
              sepEnabled: {
                title: ta("فعال بودن پرداخت آنلاین (درگاه سامان / سپ)"),
                type: "bool",
                section: ta("درگاه پرداخت"),
              },
              sepTerminalId: {
                title: ta("شماره ترمینال درگاه سپ (TerminalId)"),
                type: "text",
                section: ta("درگاه پرداخت"),
              },
              sepCallbackBaseUrl: {
                title: ta(
                  "آدرس عمومی بک‌اند برای بازگشت از درگاه (مثال: https://api.example.com)",
                ),
                type: "text",
                section: ta("درگاه پرداخت"),
              },
              siteBaseUrl: {
                title: ta("آدرس عمومی سایت (مثال: https://example.com)"),
                type: "text",
                section: ta("درگاه پرداخت"),
              },
              sepAmountMultiplier: {
                title: ta("ضریب تبدیل مبلغ به ریال برای درگاه (تومان ← ریال = ۱۰)"),
                type: "number",
                section: ta("درگاه پرداخت"),
              },
              sepTokenExpiryMinutes: {
                title: ta("مدت اعتبار توکن پرداخت (دقیقه، ۲۰ تا ۳۶۰۰)"),
                type: "number",
                section: ta("درگاه پرداخت"),
              },
              onlinePaymentMinAmount: {
                title: ta("حداقل مبلغ شارژ کیف پول (تومان)"),
                type: "number",
                price: true,
                section: ta("کیف پول"),
              },
              withdrawalMinAmount: {
                title: ta("حداقل مبلغ برداشت از کیف پول (تومان)"),
                type: "number",
                price: true,
                section: ta("کیف پول"),
              },
            }}
          />
        </WithTitle>
      )}
    </HandleLoading>
  );
};

export default AdminPaymentSettingsTab;
