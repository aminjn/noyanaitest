"use client";

import useSWR from "swr";
import { API, DOMAIN } from "@/Components/config";
import { fetcher } from "@/Components/helpers/fetcher";
import HandleLoading from "../UI/HandleLoading";
import WithTitle from "../UI/WithTitle";
import CreateForm from "../UI/CreateForm";
import { ta } from "@/Components/Admin/i18n/adminText";
import { IAppConfig } from "../AppConfig/AdminManageAppConfigPage";

// تأیید مالکیت (2026-10): Search Console lost the site after the move to
// this platform, because its HTML file lived on the old server. The site
// now serves the file (/google<code>.html) and the meta tags itself from
// these settings, so a redeploy never drops them; Bing and Yandex use the
// meta tag. Same AppConfig singleton as «تنظیمات سیستم».
type Verification = Pick<IAppConfig, "googleVerifyFiles" | "googleVerifyMeta" | "bingVerifyMeta" | "yandexVerifyMeta">;

const AdminSiteVerificationTab = () => {
  const { data, error, mutate } = useSWR<IAppConfig>(`${API}/auto/appConfig`, (url: string) =>
    fetcher({ url }).then((res) => res.data.data),
  );
  const files = Array.isArray(data?.googleVerifyFiles) ? data.googleVerifyFiles : [];

  return (
    <HandleLoading data={!!data} error={error}>
      {!!data && (
        <WithTitle title={ta("تأیید مالکیت سایت در موتورهای جستجو")}>
          <CreateForm<Verification>
            layout="flat"
            defaultValue={data}
            hookProps={{
              path: `${API}/auto/appConfig`,
              method: "POST",
              successCb: () => mutate(),
            }}
            renderer={{
              googleVerifyFiles: {
                title: ta("فایل تأیید گوگل (روش HTML file)"),
                type: "strings",
                hint: (
                  <>
                    {ta("فقط نام فایلی را که سرچ کنسول می‌دهد بنویسید، مثل google3643291f8ce14994.html. سایت خودش آن را سر آدرس اصلی نشان می‌دهد؛ بعد در سرچ کنسول «Verify» را بزنید.")}
                    {files.map((f) => (
                      <div key={f} dir="ltr">
                        <a href={`https://${DOMAIN}/${f}`} target="_blank" rel="noreferrer">
                          {`https://${DOMAIN}/${f}`}
                        </a>
                      </div>
                    ))}
                  </>
                ),
              },
              googleVerifyMeta: {
                title: ta("کد تأیید گوگل (روش HTML tag)"),
                type: "text",
                hint: ta("کد content یا کل تگ meta را بچسبانید."),
              },
              bingVerifyMeta: {
                title: ta("کد تأیید بینگ (msvalidate.01)"),
                type: "text",
              },
              yandexVerifyMeta: {
                title: ta("کد تأیید یاندکس"),
                type: "text",
              },
            }}
          />
        </WithTitle>
      )}
    </HandleLoading>
  );
};

export default AdminSiteVerificationTab;
