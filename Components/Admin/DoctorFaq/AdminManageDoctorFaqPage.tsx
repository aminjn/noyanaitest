"use client";

import { API } from "@/Components/config";
import { IDoctorFaq } from "@/Components/DoctorPanel/Profile/DoctorManageFaqTab";
import { fetcher } from "@/Components/helpers/fetcher";
import { adminPath } from "@/Components/helpers/adminPath";
import { useParams } from "next/navigation";
import useSWR from "swr";
import usePopup from "@/Components/Hooks/usePopup";
import useProgress from "@/Components/Hooks/useProgress";
import useAccessLevel from "@/Components/Hooks/useAccessLevel";
import HandleLoading from "../UI/HandleLoading";
import WithTitle from "../UI/WithTitle";
import CreateForm from "../UI/CreateForm";
import DeleteDoctorFaqPopup from "./DeleteDoctorFaqPopup";
import { ta } from "@/Components/Admin/i18n/adminText";

const AdminManageDoctorFaqPage = () => {
  const params = useParams<{ nodeId: string }>();
  const nodeId = params?.nodeId;

  const { data, error, mutate } = useSWR<IDoctorFaq | null>(
    nodeId ? `${API}/auto/doctorfaq/${nodeId}` : null,
    (url: string) => fetcher({ url }).then((res) => res?.data?.data ?? null),
  );

  const { setPopup } = usePopup();
  const push = useProgress();
  const hasAccess = useAccessLevel();

  return (
    <HandleLoading data={!!data} error={error}>
      {!!data && (
        <WithTitle
          title={data.question || ta("بدون نام")}
          actions={
            hasAccess("DoctorFaq", "delete")
              ? [
                  {
                    title: ta("حذف"),
                    danger: true,
                    action: () =>
                      setPopup(
                        "DeleteDoctorFaq",
                        <DeleteDoctorFaqPopup
                          node={data}
                          mutate={() => push(adminPath("/doctorfaq"))}
                        />,
                      ),
                  },
                ]
              : undefined
          }
        >
          <CreateForm
            defaultValue={data}
            renderer={{
              question: { type: "text", title: ta("سوال"), required: true },
              order: { type: "number", title: ta("رتبه") },
              active: { type: "bool", title: ta("فعال") },
              answer: { type: "area", title: ta("جواب"), required: true },
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
