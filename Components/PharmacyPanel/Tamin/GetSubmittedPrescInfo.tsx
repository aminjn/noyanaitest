import CreateForm from "@/Components/Admin/UI/CreateForm";
import { API } from "@/Components/config";
import useLocale from "@/Components/Hooks/useLocale";
import {
  SubmissionResult,
  SubResult,
  TaminResponse,
} from "./GetPhamacyPrescription";
import { useState } from "react";
import useNotification from "@/Components/Hooks/useNotification";

const GetSubmittedPrescInfo = () => {
  const getContent = useLocale();

  const [data, setData] = useState<SubmissionResult | null>(null);

  const pushNotification = useNotification();

  if (data) return <SubResult data={data} clear={() => setData(null)} />;

  return (
    <CreateForm<{ reqid: string }, TaminResponse<{ data: SubmissionResult }>>
      renderer={{ reqid: { type: "text", title: getContent("requestId") } }}
      hookProps={{
        path: `${API}/pharmacy/taminn`,
        method: "POST",
        successCb: (result) => {
          setData(result.data.data.data);
          if (result?.data?.data?.problems?.length)
            pushNotification(
              result.data.data.problems
                .map((p) => p.complemantary_Msg)
                .join("،"),
            );
        },
      }}
    />
  );
};

export default GetSubmittedPrescInfo;
