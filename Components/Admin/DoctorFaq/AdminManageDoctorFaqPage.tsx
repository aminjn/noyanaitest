"use client";

import { API } from "@/Components/config";
import { IDoctorFaq } from "@/Components/DoctorPanel/Profile/DoctorManageFaqTab";
import { fetcher } from "@/Components/helpers/fetcher";
import { useParams } from "next/navigation";
import useSWR from "swr";
import HandleLoading from "../UI/HandleLoading";
import WithTitle from "../UI/WithTitle";
import CreateForm from "../UI/CreateForm";

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
              question: { type: "text", title: "سوال" },
              answer: { type: "text", title: "جواب" },
              order: { type: "number", title: "رتبه" },
              active: { type: "bool", title: "فعال" },
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
