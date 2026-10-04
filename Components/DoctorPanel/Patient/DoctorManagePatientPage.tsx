"use client";

import classes from "./DoctorManagePatientPage.module.css";
import { useParams } from "next/navigation";
import useSWR from "swr";
import { IDoctorPatient } from "./DoctorManagePatientsPage";
import { API } from "@/Components/config";
import { fetcher } from "@/Components/helpers/fetcher";
import HandleLoading from "@/Components/Admin/UI/HandleLoading";
import useBreadCrump from "@/Components/Hooks/useBreadCrump";
import useScopedLocale from "@/Components/Hooks/useScopedLocale";
import { ContentNamespace } from "@/Components/Enums/contentNamespaces";
import UserIdentity from "@/Components/Dashboard/UserIdentity";
import { Fragment } from "react";
import UserVitals from "@/Components/Dashboard/UserVitals";
import UserMedicalDetails from "@/Components/Dashboard/UserMedicalDetails";
import PatientFiles, { IPatientProfile } from "./PatientFiles";
import PatientAiSummary from "./PatientAiSummary";

const LOCALE_NS: ContentNamespace[] = ["common", "doctorPanelPatient"];

const DoctorManagePatientPage = () => {
  const { nodeId } = useParams<{ nodeId: string }>();
  const { data, error } = useSWR<
    IDoctorPatient<{
      User: { Identity: Record<never, never>; Vital: Record<never, never> };
    }>
  >(nodeId ? `${API}/doctor/patient/${nodeId}` : null, (url: string) =>
    fetcher({ url }).then((res) => res.data)
  );

  const { data: files, mutate: mutatePatientprofile } = useSWR<
    IPatientProfile<{ Doctor: Record<never, never> }>[]
  >(data ? `${API}/doctor/patient/file/${data._id}` : null, (url: string) =>
    fetcher({ url }).then((res) => res.data)
  );

  const getContent = useScopedLocale(LOCALE_NS);

  useBreadCrump([
    { title: getContent("dashboard"), target: "/doctorpanel" },
    { title: getContent("patients"), target: "/doctorpanel/patient" },
  ]);

  return (
    <HandleLoading data={!!data} error={error}>
      {!!data && (
        <div className={classes.main}>
          <UserIdentity
            identity={data.user?.identity}
            avatar={data.user?.avatar}
            username={data.user?.username}
          />
          {/* the history in a few lines (clinical assistant, owner only) */}
          <PatientAiSummary patientId={data._id} />
          <UserVitals vitals={data.user?.vital} patient={data._id} />
          <UserMedicalDetails data={data.user?.medical} />
          {!!files && (
            <PatientFiles
              data={files}
              mutate={mutatePatientprofile}
              patientId={data._id}
            />
          )}
        </div>
      )}
    </HandleLoading>
  );
};

export default DoctorManagePatientPage;
