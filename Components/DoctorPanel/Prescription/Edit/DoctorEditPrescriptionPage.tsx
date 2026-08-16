"use client";
import { useParams } from "next/navigation";
import useSWR from "swr";
import { DefaultPrescription } from "../PrescriptionContext";
import { API } from "@/Components/config";
import { fetcher } from "@/Components/helpers/fetcher";
import PrescriptionAgent from "../Create/PrescriptionAgent";
import HandleLoading from "@/Components/Admin/UI/HandleLoading";
import useBreadCrump from "@/Components/Hooks/useBreadCrump";
import useLocale from "@/Components/Hooks/useLocale";

const DoctorEditPrescriptionPage = () => {
  const { nodeId } = useParams<{ nodeId: string }>();
  const { data, error } = useSWR<DefaultPrescription>(
    `${API}/doctor/presc/${nodeId}`,
    (url: string) => fetcher({ url }).then((res) => res.data),
  );

  const getContent = useLocale();

  useBreadCrump([
    { title: getContent("dashboard"), target: "/doctorpanel" },
    { title: getContent("drugsAndPrescriptions"), target: "/doctorpanel/drug" },
    {
      title: getContent("editDraftPrescription"),
      target: `/doctorpanel/prescription/${nodeId}/edit`,
    },
  ]);

  return (
    <HandleLoading data={!!data} error={error}>
      {!!data && <PrescriptionAgent defaultValue={data} />}
    </HandleLoading>
  );
};

export default DoctorEditPrescriptionPage;
