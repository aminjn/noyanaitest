"use client";

import useSWR from "swr";
import { API } from "@/Components/config";
import { fetcher } from "@/Components/helpers/fetcher";
import { MongoDoc } from "@/Components/Hooks/useUser";
import HandleLoading from "../UI/HandleLoading";
import WithTitle from "../UI/WithTitle";
import CreateForm from "../UI/CreateForm";
import { ta } from "@/Components/Admin/i18n/adminText";

// Mirrors backend Models/StaticImages.ts - a singleton bucket of static
// image slots used around the app. Field names live in that file's
// staticImageFields array; add a new slot there first, then add a matching
// entry to `renderer` below. Routers/autoRouter.ts registers this model
// with `singleton: true`, so GET/POST both hit `${API}/auto/staticImages`
// (no accessLevel set - only the "admin" role, not "notadmin", can reach
// it), mirroring AdminManageAppConfigPage.tsx /
// AdminManageGlobalFinanceSettingsPage.tsx.
export interface IStaticImages extends MongoDoc {
  singleton: "SINGLETON";
  homeMain?: string;
  aboutMain?: string;
  aboutSecurity?: string;
  aboutCta?: string;
  onboadingProfile?: string;
  onboadingClinic?: string;
  onboadrdinConsult?: string;
}

const AdminManageStaticImagesPage = () => {
  const { data, error, mutate } = useSWR<IStaticImages>(
    `${API}/auto/staticImages`,
    (url: string) => fetcher({ url }).then((res) => res.data.data),
  );

  return (
    <HandleLoading data={!!data} error={error}>
      {!!data && (
        <WithTitle title={ta("تصاویر ثابت")}>
          <CreateForm<IStaticImages>
            defaultValue={data}
            hookProps={{
              path: `${API}/auto/staticImages`,
              method: "POST",
              successCb: () => mutate(),
            }}
            renderer={{
              homeMain: { title: ta("تصویر اصلی خانه"), type: "image" },
              aboutMain: { title: ta("تصویر اصلی درباره ما"), type: "image" },
              aboutSecurity: {
                title: ta("تصویر امنیت درباره ما"),
                type: "image",
              },
              aboutCta: {
                title: ta("تصویر دعوت به اقدام درباره ما"),
                type: "image",
              },
              onboadingProfile: {
                title: ta("تصویر پروفایل آنبوردینگ"),
                type: "image",
              },
              onboadingClinic: {
                title: ta("تصویر کلینیک آنبوردینگ"),
                type: "image",
              },
              onboadrdinConsult: {
                title: ta("تصویر مشاوره آنبوردینگ"),
                type: "image",
              },
            }}
          />
        </WithTitle>
      )}
    </HandleLoading>
  );
};

export default AdminManageStaticImagesPage;
