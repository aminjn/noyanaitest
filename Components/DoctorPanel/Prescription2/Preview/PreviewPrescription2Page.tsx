"use client";

import useSWR from "swr";
import {
  DoctorPrescriptionContextProvider,
  IPrescription2,
} from "../Store/DoctorPrescriptionContext";
import { API } from "@/Components/config";
import { useParams } from "next/navigation";
import { fetcher } from "@/Components/helpers/fetcher";
import WithTitle from "@/Components/Admin/UI/WithTitle";
import HandleLoading from "@/Components/Admin/UI/HandleLoading";
import CreatePrescriptionPatient from "../UI/CreatePrescriptionPatient";
import Prescription2Agent from "../Prescription2Agent";
import CreatePrescriptionPage from "../CreatePrescriptionPage";

export type LoadedPrescription2 = IPrescription2<{
  Patient: Record<never, never>;
  Items: {
    Service: Record<never, never>;
    DrugInstruction: Record<never, never>;
    TimesADay: Record<never, never>;
  };
  TaminPrescription: { PrescType: Record<never, never> };
}>;

const PreviewPrescription2Page = () => {
  const { nodeId } = useParams<{ nodeId: string }>();
  const { data, error } = useSWR<LoadedPrescription2>(
    `${API}/doctor/presc2/${nodeId}`,
    (url: string) => fetcher({ url }).then((res) => res.data),
  );

  return (
    <HandleLoading data={!!data} error={error}>
      {!!data && <CreatePrescriptionPage defaultValue={data} />}
    </HandleLoading>
  );
};

export default PreviewPrescription2Page;
