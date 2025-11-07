import useSWR from "swr";
import { IDoctorProfile } from "../DoctorPanel/DoctorPanelPage";
import classes from "./PublicDrSessions.module.css";
import { API } from "../config";
import { useEffect, useMemo, useState } from "react";
import useLocale from "../Hooks/useLocale";
import { ISessionSettings } from "../DoctorPanel/Settings/SettingsTab";
import { IDoctorInsurance } from "../DoctorPanel/Insurance/DoctorInsurancesTab";
import { IClinicDoctor } from "../Admin/Clinic/AdminManageClinicsPage";
import { fetcher } from "../helpers/fetcher";
import {
  DoctorSessionType,
  doctorSessionTypes,
  IDoctorSession,
} from "../DoctorPanel/Calendar/DoctorCalendarDay";
import SelectInput from "../UI/SelectInput";
import { ContentKey } from "../Enums/contentKeys";
import { IOffice } from "../DoctorPanel/Office/DoctorManageOfficesPage";
import FormatDate from "../UI/FormatDate";
import ChevronIcon from "../Icons/ChevronIcon";
import Ixon from "../UI/Ixon";
import usePopup from "../Hooks/usePopup";
import FinalizeSessionBookingPopup from "./FinalizeSessionBookingPopup";
import { numberToTime } from "../DoctorPanel/Calendar/AddSessionsAgent";
import SelectSessionToReservePopup from "../Booking/SelectSessionToReservePopup";

type DoctorConfig = Record<DoctorSessionType, ISessionSettings | null> & {
  insurances: IDoctorInsurance<{ Insurance: Record<never, never> }>[];
  clinics: IClinicDoctor<{ ClinicPopulated: Record<never, never> }>[];
  offices: IOffice[];
};

export const patientTypes = ["new", "old"] as const;

export type PatientType = (typeof patientTypes)[number];

export const patientTypeDict: Record<PatientType, ContentKey> = {
  new: "newPatient",
  old: "oldPatient",
};

const PublicDrSessions = ({ doctor }: { doctor: IDoctorProfile }) => {
  const today = useMemo<Date>(() => new Date(), []);
  const [stamp, setStamp] = useState<Date>(today);
  const { data: config, error: configsError } = useSWR<DoctorConfig>(
    `${API}/public/doctor/${doctor._id}/config`,
    (url: string) => fetcher({ url }).then((res) => res.data)
  );
  const { data: sessions, error: sessionsError } = useSWR<IDoctorSession[]>(
    `${API}/public/doctor/${doctor._id}/day/${stamp.getTime()}`,
    (url: string) => fetcher({ url }).then((res) => res.data),
    { keepPreviousData: true }
  );

  const [selectedInsurance, setSelectedInsurance] = useState<string | null>(
    null
  );

  const [patientType, setPatientType] = useState<PatientType | null>(null);

  const [selectedSessionTypes, setSelectedSessionTypes] = useState<
    DoctorSessionType[] | null
  >();

  useEffect(() => {
    if (!selectedSessionTypes && config)
      setSelectedSessionTypes(
        doctorSessionTypes.filter(
          (sessionType) => !!config[sessionType]?.active
        )
      );
  }, [config, selectedSessionTypes]);

  const [selectedClinic, setSelectedClinic] = useState<string>();

  const getContent = useLocale();

  const filteredSessions = useMemo<IDoctorSession[]>(
    () =>
      sessions?.filter((session) =>
        selectedSessionTypes?.some((sessionType) => !!session[sessionType])
      ) || [],
    [selectedSessionTypes, sessions]
  );

  const { setPopup } = usePopup();

  return (
    <div className={classes.main}>
      <legend className={classes.legend}>
        {getContent("reserveYourSpot")}
      </legend>
      <legend className={classes.legend}>{getContent("timingDetails")}</legend>
      {!!config?.insurances.length && (
        <SelectInput
          className={classes.select}
          title={getContent("insuranceCoverage")}
          options={{
            none: getContent("noInsurance"),
            ...config.insurances.reduce(
              (acc, el) => ({ ...acc, [el._id]: el.insurance?.name }),
              {}
            ),
          }}
          onChange={(e) =>
            setSelectedInsurance(
              e.target.value === "none" ? null : e.target.value
            )
          }
        />
      )}
      <div className={classes.options}>
        {patientTypes.map((pType) => (
          <button
            key={pType}
            className={`${classes.option} ${
              patientType === pType ? classes.activeOption : ""
            }`}
            onClick={() => setPatientType(pType)}
            type="button"
          >
            {getContent(patientTypeDict[pType])}
          </button>
        ))}
      </div>
      <legend className={classes.legend}>
        {getContent("availableSessionTypes")}
      </legend>
      {!!config && (
        <div className={classes.options}>
          {doctorSessionTypes.map((sessionType) => (
            <button
              key={sessionType}
              onClick={() =>
                setSelectedSessionTypes((prev) => {
                  const clone = [...(prev || [])];
                  const index = clone.indexOf(sessionType);
                  if (index === -1) {
                    clone.push(sessionType);
                  } else {
                    clone.splice(index, 1);
                  }
                  return clone;
                })
              }
              className={`${classes.option} ${
                selectedSessionTypes?.includes(sessionType)
                  ? classes.activeOption
                  : ""
              }`}
              type="button"
            >
              {getContent(sessionType)}
            </button>
          ))}
        </div>
      )}
      {!!config && (
        <SelectInput
          className={classes.select}
          title={getContent("availableClinics")}
          options={{
            ...config.offices.reduce(
              (acc, el) => ({ ...acc, [el._id]: el.name }),
              {}
            ),
            ...config.clinics.reduce(
              (acc, el) => ({ ...acc, [el._id]: el.clinic?.name }),
              {}
            ),
          }}
          onChange={(e) => setSelectedClinic(e.target.value)}
        />
      )}
      {!!sessions && (
        <div className={classes.sessions}>
          <div className={classes.sessionsNav}>
            <FormatDate
              className={classes.legend}
              value={new Date(stamp)}
              time={false}
            />
            <div className={classes.dateActions}>
              <button
                type="button"
                onClick={() =>
                  setStamp((prev) => {
                    const then = new Date(prev);
                    then.setDate(then.getDate() + 1);
                    return then;
                  })
                }
              >
                <Ixon width="1.5rem" style={{ transform: "rotateZ(-90deg)" }}>
                  <ChevronIcon />
                </Ixon>
              </button>
              <button
                type="button"
                style={{ transform: "rotateZ(90deg)" }}
                onClick={() =>
                  setStamp((prev) => {
                    const then = new Date(prev);
                    then.setDate(then.getDate() - 1);
                    return then < today ? today : then;
                  })
                }
              >
                <Ixon width="1.5rem">
                  <ChevronIcon />
                </Ixon>
              </button>
            </div>
          </div>
          {!!filteredSessions.length ? (
            <div className={classes.sessionsContainer}>
              <div className={classes.sessionsList}>
                {filteredSessions.slice(0, 14).map((session) => (
                  <button
                    key={session._id}
                    onClick={() =>
                      setPopup(
                        "FinalizeSessionBooking",
                        <FinalizeSessionBookingPopup />
                      )
                    }
                    className={classes.session}
                  >
                    {numberToTime(session.start)}
                  </button>
                ))}
              </div>
              {filteredSessions.length > 14 && (
                <button
                  className={classes.moreSessions}
                  onClick={() =>
                    setPopup(
                      "SelectSessionToReserve",
                      <SelectSessionToReservePopup
                        doctor={doctor}
                        stamp={stamp.getTime().toString()}
                      />
                    )
                  }
                >
                  {getContent("seeMoreSessions")}
                </button>
              )}
            </div>
          ) : (
            <p className={classes.noSession}>
              {getContent("noSessionMatchesFilters")}
            </p>
          )}
        </div>
      )}
    </div>
  );
};

export default PublicDrSessions;
