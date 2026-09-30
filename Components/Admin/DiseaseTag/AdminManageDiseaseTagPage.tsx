"use client";

import { useParams } from "next/navigation";
import useSWR from "swr";
import { IDiseaseTag } from "./AdminManageDiseaseTagsPage";
import { API } from "@/Components/config";
import { fetcher } from "@/Components/helpers/fetcher";
import HandleLoading from "../UI/HandleLoading";
import WithTitle from "../UI/WithTitle";
import CreateForm from "../UI/CreateForm";
import { badgeColors } from "@/Components/UI/Badge";
import { ta } from "@/Components/Admin/i18n/adminText";

const AdminManageDiseaseTagPage = () => {
  const { nodeId } = useParams<{ nodeId: string }>();

  const { data, error, mutate } = useSWR<IDiseaseTag>(
    `${API}/auto/diseaseTag/${nodeId}`,
    (url: string) => fetcher({ url }).then((res) => res.data.data),
  );

  return (
    <HandleLoading data={!!data} error={error}>
      {!!data && (
        <WithTitle title={data.name || data._id}>
          <CreateForm
            defaultValue={data}
            renderer={{
              name: { type: "text", title: ta("نام") },
              isActive: { type: "bool", title: ta("فعال") },
              order: { type: "number", title: ta("رتبه") },
              level: {
                type: "select",
                title: ta("لول"),
                options: badgeColors.reduce(
                  (acc, el) => ({ ...acc, [el]: el }),
                  {},
                ),
              },
            }}
            hookProps={{
              path: `${API}/auto/diseaseTag/${nodeId}`,
              method: "POST",
              successCb: () => {
                mutate();
              },
            }}
          />
        </WithTitle>
      )}
    </HandleLoading>
  );
};

export default AdminManageDiseaseTagPage;
