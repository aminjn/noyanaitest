"use client";

import { API } from "@/Components/config";
import { IDoctorFaq } from "@/Components/DoctorPanel/Profile/DoctorManageFaqTab";
import { fetcher } from "@/Components/helpers/fetcher";
import { useParams } from "next/navigation";
import useSWR from "swr";
import HandleLoading from "../UI/HandleLoading";
import WithTitle from "../UI/WithTitle";
import CreateForm from "../UI/CreateForm";
import { ta } from "@/Components/Admin/i18n/adminText";

const AdminManageDoctorFaqPage = () => {
  const { nodeId } = useParams<{ nodeId: string }>();

  const { data, error, mutate } = useSWR<IDoctorFaq>(
    `${API}/auto/doctorfaq/${nodeId}`,
    (url: string) => fetcher({ url }).then((res) => res.data.data)
  );

  return (
    <HandleLoading data={!!data} error={error}>
      {!!data && (
        <WithTitle title="FAQ">
          <CreateForm
            defaultValue={data}
            renderer={{
              question: { type: "text", title: ta("سوال") },
              answer: { type: "text", title: ta("جواب") },
              order: { type: "number", title: ta("رتبه") },
              active: { type: "bool", title: ta("فعال") },
            }}
            hookProps={{
              path: `${API}/auto/doctorfaq/${data._id}`,
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

export default AdminManageDoctorFaqPage;
