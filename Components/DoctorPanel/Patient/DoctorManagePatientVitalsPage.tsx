"use client";

import useSWR from "swr";
import classes from "./DoctorManagePatientVitalsPage.module.css";
import { IUserVital } from "@/Components/Hooks/useUser";
import { API } from "@/Components/config";
import { useParams } from "next/navigation";
import { fetcher } from "@/Components/helpers/fetcher";
import HandleLoading from "@/Components/Admin/UI/HandleLoading";
import VitalList from "@/Components/Dashboard/VitalList";
import useBreadCrump from "@/Components/Hooks/useBreadCrump";
import useLocale from "@/Components/Hooks/useLocale";

const DoctorManagepatientVitalsPage = () => {
  const { nodeId } = useParams<{ nodeId: string }>();
  const { data, error, mutate } = useSWR<IUserVital[]>(
    nodeId ? `${API}/doctor/patient/vital/${nodeId}` : null,
    (url: string) => fetcher({ url }).then((res) => res.data)
  );

  const getContent = useLocale();

  useBreadCrump([
    { title: getContent("dashboard"), target: "/doctorpanel" },
    { title: getContent("patients"), target: "/doctorpanel/patient" },
  ]);

  return (
    <HandleLoading data={!!data} error={error}>
      {!!data && <VitalList vitals={data} patient={nodeId} mutate={mutate} />}
    </HandleLoading>
  );
};

export default DoctorManagepatientVitalsPage;
