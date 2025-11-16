import useSWR from "swr";
import { IDoctorProfile } from "../DoctorPanel/DoctorPanelPage";
import classes from "./PublicDrSessions.module.css";
import { API } from "../config";
import { Fragment, useEffect, useMemo, useState } from "react";
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
import { currencize } from "../helpers/currencize";
import OptionsInput from "../UI/OptionsInput";
import Button from "../UI/Button";
import Loading from "../Admin/UI/Loading";
import SelectClinicFirstPopup from "./SelectClinicFirstPopup";
import Link from "next/link";

export type DoctorConfig = Record<
  DoctorSessionType,
  ISessionSettings | null
> & {
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
  const today = useMemo<Date>(() => {
    const then = new Date();
    then.setHours(0);
    then.setMinutes(0);
    then.setSeconds(0);
    then.setMilliseconds(0);
    return then;
  }, []);
  const [stamp, setStamp] = useState<Date>(today);

  const [selectedSessionType, setSelectedSessionType] =
    useState<DoctorSessionType | null>();

  const { data: config, error: configsError } = useSWR<DoctorConfig>(
    `${API}/public/doctor/${doctor._id}/config`,
    (url: string) => fetcher({ url }).then((res) => res.data),
    {
      onSuccess: (data) => {
        setSelectedSessionType(
          doctorSessionTypes.find((st) => data[st]?.active)
        );
      },
    }
  );
  const { data: sessions, error: sessionsError } = useSWR<IDoctorSession[]>(
    `${API}/public/doctor/${doctor._id}/day/${stamp.getTime()}`,
    (url: string) => fetcher({ url }).then((res) => res.data),
    { keepPreviousData: true }
  );

  const [patientType, setPatientType] = useState<PatientType>("new");

  const [selectedClinic, setSelectedClinic] = useState<string>();

  const { data: firstAvailable } = useSWR<{ _id: string }[]>(
    !(selectedSessionType === "inPerson" && !selectedClinic) &&
      selectedSessionType
      ? {
          url: `${API}/public/doctor/${doctor._id}/session`,
          payload: {
            patientStatus: `${patientType}Patient`,
            sessionType: selectedSessionType,
            clinic:
              selectedSessionType === "inPerson" ? selectedClinic : undefined,
          },
        }
      : null,
    ({ url, payload }: { url: string; payload: Record<string, string> }) =>
      fetcher({ url, payload, method: "POST" }).then((res) => res.data)
  );

  const [selectedInsurance, setSelectedInsurance] = useState<string | null>(
    null
  );

  const getContent = useLocale();

  const filteredSessions = useMemo<IDoctorSession[]>(() => {
    return (
      sessions
        ?.filter((el) => !!el[`${patientType}Patient`])
        .filter((el) => selectedSessionType && !!el[selectedSessionType])
        .filter(
          (el) =>
            selectedSessionType !== "inPerson" || selectedClinic === el.clinic
        ) || []
    );
  }, [selectedSessionType, sessions, patientType, selectedClinic]);

  const { setPopup } = usePopup();

  useEffect(() => {
    if (selectedSessionType === "inPerson" && !selectedClinic)
      setPopup("SelectClinicFirst", <SelectClinicFirstPopup />);
  }, [selectedClinic, selectedSessionType, setPopup]);

  return (
    <div className={classes.main}>
      <legend className={classes.legend}>
        {getContent("reserveYourSpot")}
      </legend>
      <legend className={classes.legend}>{getContent("timingDetails")}</legend>
      <legend className={classes.legend}>{getContent("insurance")}</legend>
      {!!config?.insurances.length && (
        <div className={classes.options}>
          {config.insurances.map((inc) => (
            <button
              key={inc._id}
              onClick={() =>
                setSelectedInsurance((prev) =>
                  prev === inc._id ? null : inc._id
                )
              }
              className={`${classes.option} ${
                selectedInsurance === inc._id ? classes.activeOption : ""
              }`}
            >
              {inc.insurance?.name}
            </button>
          ))}
        </div>
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
          {doctorSessionTypes
            .filter((st) => config[st]?.active)
            .map((sessionType) => (
              <button
                key={sessionType}
                onClick={() => setSelectedSessionType(sessionType)}
                className={`${classes.option} ${
                  selectedSessionType?.includes(sessionType)
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
      {!!selectedSessionType &&
        !!config?.[selectedSessionType]?.price &&
        !config?.[selectedSessionType].hidePrice &&
        !!config?.[selectedSessionType]?.price && (
          <p>{`${currencize(config?.[selectedSessionType].price)} ${getContent(
            "toman"
          )}`}</p>
        )}
      {!!config && selectedSessionType === "inPerson" && (
        <Fragment>
          <legend className={classes.legend}>{getContent("clinic")}</legend>
          <div className={classes.options}>
            {config.offices.map((office) => (
              <button
                onClick={() => setSelectedClinic(office._id)}
                key={office._id}
                className={`${classes.option} ${
                  selectedClinic === office._id ? classes.activeOption : ""
                }`}
              >
                {office.name}
              </button>
            ))}
          </div>
        </Fragment>
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
                  <Link
                    key={session._id}
                    href={`/session/${
                      session._id
                    }?patientType=${patientType}&sessionType=${selectedSessionType}${
                      selectedInsurance ? `&insurance=${selectedInsurance}` : ""
                    }${selectedClinic ? `&clinic=${selectedClinic}` : ""}`}
                    className={classes.session}
                  >
                    {numberToTime(session.start)}
                  </Link>
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
            <div className={classes.noSessionBox}>
              <p className={classes.noSession}>
                {getContent("noSessionMatchesFilters")}
              </p>
              {!!firstAvailable ? (
                <Fragment>
                  {firstAvailable[0] ? (
                    <Button
                      onClick={() => {
                        const then = new Date(firstAvailable[0]._id);
                        then.setDate(then.getDate() + 1);
                        setStamp(then);
                      }}
                    >
                      {getContent("findFirstAvailableSession")}
                    </Button>
                  ) : (
                    <p>{getContent("doctorHasNoSuchSession")}</p>
                  )}
                </Fragment>
              ) : (
                <Fragment>
                  {selectedSessionType === "inPerson" && !selectedClinic ? (
                    getContent("selectClinicFirstMessage")
                  ) : (
                    <Loading />
                  )}
                </Fragment>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default PublicDrSessions;
