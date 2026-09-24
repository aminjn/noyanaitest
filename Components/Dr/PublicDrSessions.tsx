import useSWR from "swr";
import { IDoctorProfile } from "../DoctorPanel/DoctorPanelPage";
import classes from "./PublicDrSessions.module.css";
import { API } from "../config";
import { Fragment, useEffect, useState } from "react";
import useScopedLocale from "../Hooks/useScopedLocale";
import { ContentNamespace } from "../Enums/contentNamespaces";
import { ISessionSettings } from "../DoctorPanel/Settings/SettingsTab";
import { IDoctorInsurance } from "../DoctorPanel/Insurance/DoctorInsurancesTab";
import { IClinicDoctor } from "../Admin/Clinic/AdminManageClinicsPage";
import { fetcher } from "../helpers/fetcher";
import { DoctorSessionType, doctorSessionTypes } from "../DoctorPanel/Calendar/DoctorCalendarDay";
import SelectInput from "../UI/SelectInput";
import { ContentKey } from "../Enums/contentKeys";
import { IOffice } from "../DoctorPanel/Office/DoctorManageOfficesPage";
import usePopup from "../Hooks/usePopup";
import BookingSessionSelectorPopup from "../Booking/BookingSessionSelectorPopup";
import { currencize } from "../helpers/currencize";
import Button from "../UI/Button";
import SelectClinicFirstPopup from "./SelectClinicFirstPopup";

const NS: ContentNamespace[] = ["common", "drSessions"];

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
  const [selectedSessionType, setSelectedSessionType] =
    useState<DoctorSessionType | null>();

  const { data: config, error: configsError } = useSWR<DoctorConfig>(
    `${API}/public/doctor/${doctor._id}/config`,
    (url: string) => fetcher({ url }).then((res) => res.data),
    {
      onSuccess: (data) => {
        setSelectedSessionType(
          doctorSessionTypes.find((st) => data[st]?.active),
        );
      },
    },
  );

  const [patientType, setPatientType] = useState<PatientType>("new");

  const [selectedClinic, setSelectedClinic] = useState<string>();

  const [selectedInsurance, setSelectedInsurance] = useState<string | null>(
    null,
  );

  const getContent = useScopedLocale(NS);

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
                  prev === inc._id ? null : inc._id,
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
            "toman",
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
      {!!config && !(selectedSessionType === "inPerson" && !selectedClinic) && (
        <div className={classes.sessions}>
          <Button
            onClick={() =>
              setPopup(
                "BookingSessionSelector",
                <BookingSessionSelectorPopup node={doctor} />,
              )
            }
          >
            {getContent("reservation")}
          </Button>
        </div>
      )}
    </div>
  );
};

export default PublicDrSessions;
