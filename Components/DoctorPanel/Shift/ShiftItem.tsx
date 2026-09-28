import Input from "@/Components/UI/Input";
import { ShiftContext } from "./DoctorManageShiftsPage";
import classes from "./ShiftItem.module.css";
import { Dispatch, SetStateAction, useMemo } from "react";
import { numberToTime } from "../Calendar/AddSessionsAgent";
import useSWR from "swr";
import { IOffice } from "../Office/DoctorManageOfficesPage";
import { API } from "@/Components/config";
import { fetcher } from "@/Components/helpers/fetcher";
import Button from "@/Components/UI/Button";
import useScopedLocale from "@/Components/Hooks/useScopedLocale";
import TimePicker from "@/Components/UI/TimePicker";
import { tmdBold } from "@/Components/UI/Typography";
import OptionInput from "@/Components/UI/OptionInput";
import MultiSelectInput from "@/Components/UI/MultiSelectInput";
import {
  doctorSessionTypes,
  patientStatuses,
} from "../Calendar/DoctorCalendarDay";
import ShiftsPreview from "./ShiftsPreview";
import useShiftUtils from "./useShiftUtils";
import Ixon from "@/Components/UI/Ixon";
import ErrorIcon from "@/Components/Icons/ErrorIcon";
import PopupCard from "@/Components/UI/PopupCard";
import FormActions from "@/Components/Admin/UI/FormActions";
import usePopup from "@/Components/Hooks/usePopup";
import { ContentNamespace } from "@/Components/Enums/contentNamespaces";

const NS: ContentNamespace[] = ["common", "doctorPanelShift"];

const ShiftProblemsPopup = ({ problems }: { problems: string[] }) => {
  const { closePopup } = usePopup();
  const getContent = useScopedLocale(NS);
  return (
    <PopupCard>
      <div className={classes.problems}>
        {problems.map((p) => (
          <p key={p}>{p}</p>
        ))}
        <FormActions>
          <Button onClick={() => closePopup()}>
            {getContent("understood")}
          </Button>
        </FormActions>
      </div>
    </PopupCard>
  );
};

const sessionDurations = [10, 15, 20, 30, 45, 60];

const sessionGaps = [0, 5, 10, 15, 20, 30];

const ShiftItem = ({
  shift,
  setData,
}: {
  shift: ShiftContext[number];
  setData: Dispatch<SetStateAction<ShiftContext>>;
}) => {
  const { data: officesData } = useSWR<IOffice[]>(
    `${API}/doctor/office`,
    (url: string) => fetcher({ url }).then((res) => res.data),
  );
  // a non-array answer (error payload) must not crash the editor
  const offices = Array.isArray(officesData) ? officesData : undefined;

  const getContent = useScopedLocale(NS);

  const { shiftHasProblem } = useShiftUtils();

  const problems = useMemo<string[]>(
    () => shiftHasProblem(shift),
    [shift, shiftHasProblem],
  );

  const { setPopup } = usePopup();

  return (
    <div
      key={shift._id}
      className={`${classes.shift} ${!!problems.length ? classes.withProblem : ""}`}
    >
      <div className={classes.shiftHeader}>
        <div className={classes.shiftNameBox}>
          <Input
            className={classes.shiftName}
            defaultValue={shift.name}
            onChange={(e) =>
              setData((prev) => {
                const clone = [...prev];
                const index = clone.findIndex((el) => el._id === shift._id);
                if (index === -1) return clone;
                clone[index].name = e.target.value;
                return clone;
              })
            }
          />
          <span className={classes.subName}>
            {`${numberToTime(shift.start)} - ${numberToTime(shift.end)} - ${offices?.find((el) => el._id === shift.office)?.name || ""}`}
          </span>
        </div>
        <div className={classes.shiftError}>
          <Button
            variant="Error"
            mode="Outline"
            onClick={() =>
              setData((prev) => {
                const clone = [...prev];
                const index = clone.findIndex((el) => el._id === shift._id);
                if (index === -1) return clone;
                clone.splice(index, 1);
                return clone;
              })
            }
          >
            {getContent("deleteShift")}
          </Button>
          {!!problems.length && (
            <button
              type="button"
              onClick={() =>
                setPopup(
                  "ShiftProblems",
                  <ShiftProblemsPopup problems={problems} />,
                )
              }
            >
              <Ixon className={classes.errors} width="2rem">
                <ErrorIcon />
              </Ixon>
            </button>
          )}
        </div>
      </div>
      <div className={classes.segment}>
        <TimePicker
          fontSize={tmdBold}
          value={shift.start}
          onChange={(e) => {
            if (e === null) return;
            setData((prev) => {
              const clone = [...prev];
              const index = clone.findIndex((el) => el._id === shift._id);
              if (index === -1) return clone;
              clone[index].start = e;
              return clone;
            });
          }}
          prefix={getContent("startTime")}
          clearable={false}
        />
        <TimePicker
          fontSize={tmdBold}
          value={shift.end}
          prefix={getContent("endTime")}
          clearable={false}
          onChange={(e) => {
            if (!e) return;
            setData((prev) => {
              const clone = [...prev];
              const index = clone.findIndex((el) => el._id === shift._id);
              if (index === -1) return clone;
              clone[index].end = e;
              return clone;
            });
          }}
        />
      </div>
      {offices && (
        <div className={classes.segment}>
          <OptionInput
            options={offices.map((el) => ({
              title: el.name || el._id,
              value: el._id,
            }))}
            title={getContent("office")}
            onChange={(e) =>
              setData((prev) => {
                const clone = [...prev];
                const index = clone.findIndex((el) => el._id === shift._id);
                if (index === -1) return clone;
                clone[index].office = String(e);
                return clone;
              })
            }
            value={shift.office}
          />
        </div>
      )}
      <div className={classes.segment}>
        <OptionInput
          title={getContent("sessionDuration")}
          value={shift.duration.toString()}
          options={sessionDurations.map((d) => ({
            title: d.toString(),
            value: d.toString(),
          }))}
          onChange={(e) =>
            setData((prev) => {
              const clone = [...prev];
              const index = clone.findIndex((el) => el._id === shift._id);
              if (index === -1) return clone;
              clone[index].duration = Number(e);
              return clone;
            })
          }
        />
        <OptionInput
          title={getContent("sessionsGap")}
          options={sessionGaps.map((g) => ({
            title: g.toString(),
            value: g.toString(),
          }))}
          value={shift.gap.toString()}
          onChange={(e) => {
            setData((prev) => {
              const clone = [...prev];
              const index = clone.findIndex((el) => el._id === shift._id);
              if (index === -1) return clone;
              clone[index].gap = Number(e);
              return clone;
            });
          }}
        />
      </div>
      <div className={classes.segment}>
        <MultiSelectInput
          title={getContent("sessionType")}
          multi
          placeholder={getContent("sessionType")}
          options={doctorSessionTypes.map((el) => ({
            title: getContent(el),
            value: el,
          }))}
          value={shift.sessionTypes}
          onChange={(e) => {
            setData((prev) => {
              const clone = [...prev];
              const index = clone.findIndex((el) => el._id === shift._id);
              if (index === -1) return clone;
              clone[index].sessionTypes = doctorSessionTypes.filter((el) =>
                e.includes(el),
              );
              return clone;
            });
          }}
        />
        <MultiSelectInput
          title={getContent("patientType")}
          multi
          placeholder={getContent("patientType")}
          value={shift.patientTypes}
          options={patientStatuses.map((el) => ({
            title: getContent(el),
            value: el,
          }))}
          onChange={(e) =>
            setData((prev) => {
              const clone = [...prev];
              const index = clone.findIndex((el) => el._id === shift._id);
              if (index === -1) return clone;
              clone[index].patientTypes = patientStatuses.filter((el) =>
                e.includes(el),
              );
              return clone;
            })
          }
        />
      </div>
    </div>
  );
};

export default ShiftItem;
