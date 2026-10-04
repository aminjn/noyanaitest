"use client";

import useSWR from "swr";
import { API } from "@/Components/config";
import { fetcher } from "@/Components/helpers/fetcher";
import HandleLoading from "../UI/HandleLoading";
import WithTitle from "../UI/WithTitle";
import CreateForm from "../UI/CreateForm";
import { IAppConfig } from "../AppConfig/AdminManageAppConfigPage";
import { ta } from "@/Components/Admin/i18n/adminText";

// The payment gateway (SEP) and the wallet top-up limit (2026-09 admin
// audit). They live on AppConfig; this is their place in the finance
// settings hub. The site address is a general setting (CRM and campaign
// links read it too), the withdrawal minimum sits with the settlement
// period, and toman -> rial is a constant, not a setting (2026-10).
const AdminPaymentSettingsTab = () => {
  const { data, error, mutate } = useSWR<IAppConfig>(
    `${API}/auto/appConfig`,
    (url: string) => fetcher({ url }).then((res) => res.data.data),
  );

  return (
    <HandleLoading data={!!data} error={error}>
      {!!data && (
        <WithTitle title={ta("درگاه پرداخت و شارژ کیف پول")}>
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
                type: "text", ltr: true,
                section: ta("درگاه پرداخت"),
              },
              sepCallbackBaseUrl: {
                title: ta(
                  "آدرس عمومی بک‌اند برای بازگشت از درگاه (مثال: https://api.example.com)",
                ),
                type: "text", ltr: true,
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
            }}
          />
        </WithTitle>
      )}
    </HandleLoading>
  );
};

export default AdminPaymentSettingsTab;
