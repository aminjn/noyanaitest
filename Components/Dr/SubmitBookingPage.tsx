"use client";

import classes from "./SubmitBookingPage.module.css";

import { useParams, useSearchParams } from "next/navigation";
import useSWR from "swr";
import { API } from "../config";
import { fetcher } from "../helpers/fetcher";
import HandleLoading from "../Admin/UI/HandleLoading";
import { Fragment, useEffect, useState } from "react";
import useLocale from "../Hooks/useLocale";
import Image from "next/image";
import { imagePath } from "../helpers/imagepath";
import { getDoctorProfileLabel } from "../Admin/Lib/LabelGetters";
import {
  DoctorSessionType,
  doctorSessionTypes,
  IDoctorSession,
} from "../DoctorPanel/Calendar/DoctorCalendarDay";
import useUser from "../Hooks/useUser";
import { IUserIdentity } from "../Dashboard/DashboardPage";
import { PatientType, patientTypes } from "./PublicDrSessions";
import Button from "../UI/Button";
import InfoPair from "./InfoPair";
import LinkIcon from "../Icons/LinkIcon";
import useProgress from "../Hooks/useProgress";
import { IInsurance } from "../DoctorPanel/Insurance/DoctorInsurancesTab";
import { IOffice } from "../DoctorPanel/Office/DoctorManageOfficesPage";
import Ixon from "../UI/Ixon";
import CupIcon from "../Icons/CupIcon";
import LocationIcon from "../Icons/LocationIcon";
import InfoIcon from "../Icons/InfoIcon";
import usePopup from "../Hooks/usePopup";
import FindAnotherPatientForBookingPopup from "./FindAnotherPatientForBookingPopup";
import DoctorBookingCard from "./DoctorBookingCard";
import useNotification from "../Hooks/useNotification";
import CheckoutPopup from "./CheckoutPopup";

export type BookingContext = {
  insurance?: string;
  clinic?: string;
  patientType?: PatientType;
  sessionType?: DoctorSessionType;
};

export type PopulatedBookingContext = {
  insurance?: string;
  clinic?: string;
  patientType: PatientType;
  sessionType: DoctorSessionType;
};

const SubmitBookingPage = () => {
  const { user } = useUser();

  const [patient, setPatient] = useState<IUserIdentity | null>(null);

  const { data: identity } = useSWR<IUserIdentity | null>(
    `${API}/user/identity`,
    (url: string) => fetcher({ url }).then((res) => res.data),
    { onSuccess: (data) => setPatient((prev) => prev || data) }
  );

  const { sessionId } = useParams<{ slug: string; sessionId: string }>();
  const { data, error } = useSWR<
    IDoctorSession<{
      Booking: Record<never, never>;
      Doctor: { MainSpecialityPopulated: Record<never, never> };
    }>
  >(`${API}/public/session/${sessionId}`, (url: string) =>
    fetcher({ url }).then((res) => res.data)
  );

  const [ctx, setCtx] = useState<null | BookingContext>(null);

  const { data: insurance } = useSWR<IInsurance>(
    ctx?.insurance ? `${API}/public/doctorinsurance/${ctx.insurance}` : null,
    (url: string) => fetcher({ url }).then((res) => res.data)
  );

  const { data: clinic } = useSWR<IOffice>(
    ctx?.clinic ? `${API}/public/office/${ctx.clinic}` : null,
    (url: string) => fetcher({ url }).then((res) => res.data)
  );

  const searchParams = useSearchParams();

  const [consented, setConsented] = useState<boolean>(false);

  useEffect(() => {
    if (!ctx)
      setCtx({
        insurance: searchParams.get("insurance") || undefined,
        patientType:
          patientTypes.find(
            (pt) => pt === `${searchParams.get("patientType")}`
          ) || undefined,
        sessionType: doctorSessionTypes.find(
          (st) => st === searchParams.get("sessionType") || undefined
        ),
        clinic: searchParams.get("clinic") || undefined,
      });
  }, [ctx, searchParams]);

  const push = useProgress();

  useEffect(() => {
    if (data && ctx) {
      if (
        !ctx.patientType ||
        !ctx.sessionType ||
        (ctx.sessionType === "inPerson" && !ctx.clinic)
      )
        return push("/");
    }
  }, [ctx, data, push]);

  const getContent = useLocale();

  const { setPopup } = usePopup();

  const pushNotification = useNotification();

  return (
    <HandleLoading data={!!data && !!user} error={error}>
      {!!data && (
        <Fragment>
          {data.booking ? (
            <p>{getContent("sessionAlreadyBookedErrorMessage")}</p>
          ) : (
            <div className={classes.main}>
              <h1 className={classes.title}>
                {getContent("reviewBookingDetails")}
              </h1>
              <DoctorBookingCard node={data.doctor} />
              {patient && (
                <div className={classes.patient}>
                  <span className={classes.patientTitle}>
                    {getContent("patientDetails")}
                  </span>
                  <span className={classes.patientName}>{`${
                    patient.givenName
                  } ${patient.lastName} (${getContent("myself")})`}</span>
                  <button
                    className={classes.anotherBtn}
                    onClick={() =>
                      setPopup(
                        "FindAnotherPatientForBooking",
                        <FindAnotherPatientForBookingPopup
                          onDone={setPatient}
                        />
                      )
                    }
                  >
                    {getContent("bookSessionForAnotherPatient")}
                  </button>
                  {patient._id !== identity?._id && (
                    <button
                      className={classes.anotherBtn}
                      onClick={() => setPatient(identity || null)}
                    >
                      {getContent("switchPatientToMyself")}
                    </button>
                  )}
                </div>
              )}
              <div className={classes.context}>
                {!!insurance && (
                  <InfoPair
                    title={getContent("insurance")}
                    icon={<InfoIcon />}
                    value={insurance.name || ""}
                  />
                )}
                {ctx?.patientType && (
                  <InfoPair
                    title={getContent("patientType")}
                    icon={<InfoIcon />}
                    value={getContent(`${ctx.patientType}Patient`)}
                  />
                )}
                {ctx?.sessionType && (
                  <InfoPair
                    title={getContent("sessionType")}
                    value={getContent(ctx.sessionType)}
                    icon={<InfoIcon />}
                  />
                )}
                {!!clinic && (
                  <InfoPair
                    title={getContent("clinic")}
                    icon={<InfoIcon />}
                    value={clinic.name || ""}
                  />
                )}
              </div>
              <div className={classes.consent}>
                <button
                  type="button"
                  onClick={() => setConsented((prev) => !prev)}
                  className={`${classes.checkbox} ${
                    consented ? classes.activeCheck : ""
                  }`}
                />
                <span>{getContent("submitBookingConsent")}</span>
              </div>
              {ctx && patient && (
                <Button
                  className={classes.confirm}
                  onClick={() => {
                    if (!consented)
                      return pushNotification(
                        getContent("consentFirstErrorMessage"),
                        "Warn"
                      );
                    setPopup(
                      "Checkout",
                      <CheckoutPopup
                        context={ctx as PopulatedBookingContext}
                        session={data}
                        patient={
                          patient?._id !== identity?._id ? patient : undefined
                        }
                      />
                    );
                  }}
                >
                  {getContent("confirmAndContinue")}
                </Button>
              )}
            </div>
          )}
        </Fragment>
      )}
    </HandleLoading>
  );
};

export default SubmitBookingPage;
