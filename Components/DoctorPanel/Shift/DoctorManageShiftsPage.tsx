"use client";
import useSWR from "swr";
import classes from "./DoctorManageShiftsPage.module.css";
import { MongoDoc } from "@/Components/Hooks/useUser";
import { IOffice, OfficePopulation } from "../Office/DoctorManageOfficesPage";
import {
  DoctorSessionType,
  PatientStatus,
} from "../Calendar/DoctorCalendarDay";
import { DoctorProfilePopulation, IDoctorProfile } from "../DoctorPanelPage";
import { Population } from "@/Components/Admin/Clinic/AdminManageClinicsPage";
import { API } from "@/Components/config";
import { fetcher } from "@/Components/helpers/fetcher";
import HandleLoading from "@/Components/Admin/UI/HandleLoading";
import {
  Dispatch,
  Fragment,
  SetStateAction,
  useCallback,
  useMemo,
  useState,
} from "react";
import TabSystem from "@/Components/Admin/UI/TabSystem";
import { ContentKey } from "@/Components/Enums/contentKeys";
import useScopedLocale from "@/Components/Hooks/useScopedLocale";
import useBreadCrump from "@/Components/Hooks/useBreadCrump";
import DayShifts from "./DayShifts";
import Ixon from "@/Components/UI/Ixon";
import ErrorIcon from "@/Components/Icons/ErrorIcon";
import useShiftUtils from "./useShiftUtils";
import Button from "@/Components/UI/Button";
import useNotification from "@/Components/Hooks/useNotification";
import Act from "@/Components/UI/Act";
import { ContentNamespace } from "@/Components/Enums/contentNamespaces";

const NS: ContentNamespace[] = ["common", "doctorPanelShift"];

export const daysOfWeekContentKeys: ContentKey[] = [
  "saturday",
  "sunday",
  "monday",
  "tuesday",
  "wednesday",
  "thursday",
  "friday",
];

export const doctorShiftDays = [0, 1, 2, 3, 4, 5, 6] as const;
export type DoctorShiftDay = (typeof doctorShiftDays)[number];

export type DoctorShiftPopulation = Population<{
  Office: OfficePopulation;
  Doctor: DoctorProfilePopulation;
}>;

export interface IDoctorShift<
  T extends DoctorShiftPopulation = DoctorShiftPopulation,
> extends MongoDoc {
  day: DoctorShiftDay;
  start: number;
  end: number;
  office: T["Office"] extends OfficePopulation ? IOffice<T["Office"]> : string;
  duration: number;
  gap: number;
  sessionTypes: DoctorSessionType[];
  patientTypes: PatientStatus[];
  name: string;
  doctor: T["Doctor"] extends DoctorProfilePopulation
    ? IDoctorProfile<T["Doctor"]>
    : string;
}

export type ShiftContext = (Omit<IDoctorShift, "office" | "doctor" | "__v"> &
  Partial<{ office: string; doctor: string }>)[];

const Inner = ({
  defaultValue,
  mutate,
}: {
  defaultValue: IDoctorShift[];
  mutate: () => unknown;
}) => {
  const [offDays, setOffDays] = useState<DoctorShiftDay[]>([]);
  const [value, setValue] = useState<ShiftContext>(defaultValue);

  const [isLoading, setIsLoading] = useState<
    Partial<ShiftContext[number]>[] | null
  >(null);

  const getContent = useScopedLocale(NS);

  const getCompContent = useScopedLocale(NS);

  const { shiftHasProblem, getShiftSessions } = useShiftUtils();

  const pushNotification = useNotification();

  const onSubmit = useCallback(() => {
    if (!!isLoading) return;
    const filtered = value.filter((shift) => !offDays.includes(shift.day));
    if (filtered.some((shift) => !!shiftHasProblem(shift).length))
      return pushNotification(getContent("checkInput"), "Warn");
    for (const day of doctorShiftDays) {
      const todaysShifts = filtered.filter((shift) => shift.day === day);
      for (let i = 1; i < todaysShifts.length; i++) {
        if (todaysShifts[i].start < todaysShifts[i - 1].end) {
          return pushNotification(getContent("shiftsOverlap"), "Warn");
        }
      }
    }
    const result: Partial<ShiftContext[number]>[] = [];
    for (const shift of filtered) {
      const stripped: Partial<ShiftContext[number]> = { ...shift };
      delete stripped._id;
      delete stripped.doctor;
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      delete (stripped as any).__v;
      result.push(stripped);
    }
    setIsLoading(result);
  }, [
    getContent,
    isLoading,
    offDays,
    pushNotification,
    shiftHasProblem,
    value,
  ]);

  return (
    <div className={classes.main}>
      <TabSystem
        items={doctorShiftDays.map((day) => ({
          title: (
            <div className={classes.tabButton}>
              <div>{getContent(daysOfWeekContentKeys[day])}</div>
              {/* TODO: calc this */}
              <div className={classes.tabButtonFooter}>
                {offDays.includes(day) ? (
                  <span>{getContent("offDay")}</span>
                ) : (
                  <Fragment>
                    {value
                      .filter((shift) => shift.day === day)
                      .some((shift) => !!shiftHasProblem(shift).length) && (
                      <Ixon width="1rem" className={classes.error}>
                        <ErrorIcon />
                      </Ixon>
                    )}
                    <span>
                      {getCompContent("xSessions", [
                        value
                          .filter((shift) => shift.day === day)
                          .reduce(
                            (acc, el) => acc + getShiftSessions(el).length,
                            0,
                          )
                          .toString(),
                      ])}
                    </span>
                  </Fragment>
                )}
              </div>
            </div>
          ),
          id: `Day${day}`,
          content: (
            <DayShifts
              data={value}
              day={day}
              setData={setValue}
              offDays={offDays}
              setOffDays={setOffDays}
            />
          ),
        }))}
      />
      <div className={classes.actions}>
        <Button isLoading={!!isLoading} onClick={onSubmit}>
          {getContent("saveAndPublish")}
        </Button>
      </div>
      <Act
        path={isLoading ? `${API}/doctor/shift` : null}
        method="POST"
        onDone={(status) => {
          setIsLoading(null);
          if (!status) return;
          mutate();
        }}
        payload={{ shifts: isLoading }}
      />
    </div>
  );
};

const DoctorManageShiftsPage = () => {
  const { data, error, mutate } = useSWR<IDoctorShift[]>(
    `${API}/doctor/shift`,
    (url: string) => fetcher({ url }).then((res) => res.data),
  );

  const getContent = useScopedLocale(NS);

  useBreadCrump([
    { title: getContent("dashboard"), target: "/doctorpanel" },
    { title: getContent("shifts"), target: "/doctorpanel/shift" },
  ]);

  return (
    <HandleLoading data={!!data} error={error}>
      {!!data && <Inner defaultValue={data} mutate={mutate} />}
    </HandleLoading>
  );
};

export default DoctorManageShiftsPage;
