import useLocale from "@/Components/Hooks/useLocale";
import classes from "./AddSessionsAgent.module.css";
import { Dispatch, SetStateAction, useState } from "react";
import FormatDate from "@/Components/UI/FormatDate";
import Ixon from "@/Components/UI/Ixon";
import CloseIcon from "@/Components/Icons/CloseIcon";
import RangeInput from "@/Components/UI/RangeInput";
import OptionsInput from "@/Components/UI/OptionsInput";
import {
  DoctorSessionType,
  doctorSessionTypes,
  PatientStatus,
  patientStatuses,
} from "./DoctorCalendarDay";
import AreaInput from "@/Components/UI/AreaInput";
import Button from "@/Components/UI/Button";
import useNotification from "@/Components/Hooks/useNotification";
import Act from "@/Components/UI/Act";
import { API } from "@/Components/config";
import useSWR from "swr";
import { IOffice } from "../Office/DoctorManageOfficesPage";
import { fetcher } from "@/Components/helpers/fetcher";

export const MIN_SESSSION_START = 360;
export const MAX_SESSION_END = 1440;
const STEP = 30;

export const numberToTime = (val: number): string =>
  `${`${Math.floor(val / 60)}`.padStart(2, "0")}:${`${Math.floor(
    val % 60
  )}`.padStart(2, "0")}`;

const AddSessionsAgent = ({
  selected,
  setSelected,
  mutate,
}: {
  selected: Date[];
  setSelected: Dispatch<SetStateAction<Date[]>>;
  mutate: () => unknown;
}) => {
  const { data: clinics } = useSWR<IOffice[]>(
    `${API}/doctor/office`,
    (url: string) => fetcher({ url }).then((res) => res.data)
  );

  const [selectedClinic, setSelectedClinic] = useState<string | null>(null);

  const getContent = useLocale();

  const [businessTimes, setBusinessTimes] = useState<[number, number]>([
    480, 1080,
  ]);

  const [gap, setGap] = useState<number>(0);

  const [description, setDescription] = useState<string>("");

  const [kinds, setKinds] = useState<
    Partial<Record<DoctorSessionType, boolean>>
  >({});

  const [selectedStatuses, setSelectedStatuses] = useState<
    Partial<Record<PatientStatus, boolean>>
  >({});

  const [duration, setDuration] = useState<number>(15);

  const pushNotification = useNotification();

  const [isSaving, setIsSaving] = useState<Record<string, unknown> | null>(
    null
  );

  const onSubmit = () => {
    if (!selected.length)
      return pushNotification(getContent("noSelectedDaysError"), "Warn");
    if (businessTimes[0] === businessTimes[1])
      return pushNotification(getContent("startSameAsEndError"), "Warn");
    const start = Math.min(...businessTimes);
    const end = Math.max(...businessTimes);
    if (end - start <= gap)
      return pushNotification(getContent("gapTooLongError"), "Warn");
    if (end - start <= duration)
      return pushNotification(getContent("durationTooLongError"), "Warn");
    if (!Object.values(kinds).some(Boolean))
      return pushNotification(getContent("noSessionKindFoundError"), "Warn");
    if (!Object.values(selectedStatuses).some(Boolean))
      return pushNotification(getContent("noPatientStatusError"), "Warn");
    if (kinds.inPerson && !selectedClinic)
      return pushNotification(getContent("noClinicErrorMessage"), "Warn");
    setIsSaving({
      gap,
      start,
      end,
      note: description,
      days: selected,
      duration,
      ...kinds,
      ...selectedStatuses,
      clinic: selectedClinic,
    });
  };

  return (
    <div className={classes.main}>
      {!!selected.length && (
        <div className={classes.field}>
          <legend>{`${getContent("selectedDays")} (${
            selected.length
          } ${getContent("record")})`}</legend>
          <div className={classes.selected}>
            {selected
              .sort((a, b) => a.getTime() - b.getTime())
              .map((date) => (
                <div key={date.getTime().toString()} className={classes.date}>
                  <FormatDate value={date} time={false} />
                  <button
                    className={classes.delete}
                    type="button"
                    onClick={() =>
                      setSelected((prev) => {
                        const clone = [...prev];
                        clone.splice(
                          prev.findIndex(
                            (el) => el.getTime() === date.getTime()
                          ),
                          1
                        );
                        return clone;
                      })
                    }
                  >
                    <Ixon>
                      <CloseIcon />
                    </Ixon>
                  </button>
                </div>
              ))}
          </div>
        </div>
      )}
      <RangeInput
        min={MIN_SESSSION_START}
        max={MAX_SESSION_END}
        values={businessTimes}
        onChange={(e) => setBusinessTimes([e[0], e[1]])}
        step={STEP}
        thumb={(index) => numberToTime(businessTimes[index])}
        left={Math.min(...businessTimes)}
        right={Math.max(...businessTimes)}
        mark={(index) => numberToTime(MIN_SESSSION_START + index * 30)}
        title={getContent("businessTimes")}
        readOnly={!!isSaving}
      />
      <RangeInput
        min={5}
        max={240}
        values={[duration]}
        onChange={(e) => setDuration(e[0])}
        step={5}
        thumb={() => numberToTime(duration)}
        readOnly={!!isSaving}
        title={getContent("sessionDuration")}
        mark={(index) => numberToTime(index * 5)}
        left={5}
        right={duration}
      />
      <RangeInput
        min={0}
        max={60}
        step={5}
        values={[gap]}
        onChange={(e) => setGap(e[0])}
        thumb={() => numberToTime(gap)}
        left={0}
        right={gap}
        mark={(index) => numberToTime(index * 5)}
        title={getContent("sessionsGap")}
        readOnly={!!isSaving}
      />
      <OptionsInput
        options={doctorSessionTypes.reduce(
          (acc, el) => ({ ...acc, [el]: getContent(el) }),
          {} as Record<DoctorSessionType, string>
        )}
        value={kinds}
        title={getContent("sessionsKind")}
        onChange={(key) => setKinds((prev) => ({ ...prev, [key]: !prev[key] }))}
        readOnly={!!isSaving}
      />
      <OptionsInput
        options={patientStatuses.reduce(
          (acc, el) => ({ ...acc, [el]: getContent(el) }),
          {} as Record<PatientStatus, string>
        )}
        value={selectedStatuses}
        title={getContent("patientStatus")}
        onChange={(key) =>
          setSelectedStatuses((prev) => ({ ...prev, [key]: !prev[key] }))
        }
        readOnly={!!isSaving}
      />
      {!!clinics?.length && (
        <OptionsInput
          options={clinics.reduce(
            (acc, el) => ({ ...acc, [el._id]: el.name }),
            {}
          )}
          title={getContent("availableClinics")}
          readOnly={!!isSaving}
          value={selectedClinic ? { [selectedClinic]: true } : {}}
          onChange={(key) => setSelectedClinic(key.toString())}
        />
      )}
      <AreaInput
        title={getContent("description")}
        onChange={(e) => setDescription(e.target.value)}
        readOnly={!!isSaving}
      />
      <Button
        className={classes.submit}
        onClick={onSubmit}
        isLoading={!!isSaving}
      >
        {getContent("submitSessions")}
      </Button>
      <Act
        parser="FORM"
        method="POST"
        path={isSaving ? `${API}/doctor/calendar` : null}
        payload={isSaving || undefined}
        onDone={(status) => {
          setIsSaving(null);
          if (!status) return;
          mutate();
        }}
      />
    </div>
  );
};

export default AddSessionsAgent;
