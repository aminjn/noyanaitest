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
import PatientTimeline from "./PatientTimeline";
import Button from "@/Components/UI/Button";
import PlusIcon from "@/Components/Icons/PlusIcon";
import ChatIcon from "@/Components/Icons/ChatIcon";
import usePopup from "@/Components/Hooks/usePopup";
import useDoctorAcl from "@/Components/Hooks/useDoctorAcl";
import DeskBookingPopup from "../Desk/DeskBookingPopup";
import { formatPhone } from "../Desk/deskShared";

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
  const { setPopup } = usePopup();
  const hasAccess = useDoctorAcl();
  const identity = data?.user?.identity as { _id?: string; givenName?: string; lastName?: string } | undefined;
  const name = [identity?.givenName, identity?.lastName].filter(Boolean).join(" ");

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
            username={name || data.user?.username}
          />
          {/* what the doctor does next with this patient */}
          <div className={classes.actions}>
            {hasAccess("mutateCalendar") && !!identity?._id && (
              <Button
                size="M"
                leadIcon={<PlusIcon />}
                onClick={() =>
                  setPopup(
                    "DeskBooking",
                    <DeskBookingPopup
                      onDone={() => undefined}
                      preset={{ identity: identity._id as string, name, phone: data.user?.phone || "", nationalIdTail: "" }}
                    />,
                  )
                }
              >
                {getContent("ptBookVisit")}
              </Button>
            )}
            {hasAccess("readChat") && (
              <Button size="M" variant="Neutral" mode="Outline" leadIcon={<ChatIcon />} href="/doctorpanel/chat">
                {getContent("ptMessages")}
              </Button>
            )}
            {!!data.user?.phone && (
              <a className={classes.phone} href={`tel:${formatPhone(data.user.phone)}`} dir="ltr">
                {formatPhone(data.user.phone)}
              </a>
            )}
          </div>
          <PatientTimeline patientId={data._id} selfName={name} />
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
