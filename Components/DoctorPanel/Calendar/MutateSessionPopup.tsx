import PopupCard from "@/Components/UI/PopupCard";
import {
  DoctorSessionPopulation,
  DoctorSessionType,
  doctorSessionTypes,
  IDoctorSession,
} from "./DoctorCalendarDay";
import classes from "./MutateSessionPopup.module.css";
import useForm from "@/Components/Hooks/useForm";
import { API } from "@/Components/config";
import usePopup from "@/Components/Hooks/usePopup";
import RangeInput from "@/Components/UI/RangeInput";
import useLocale from "@/Components/Hooks/useLocale";
import {
  MAX_SESSION_END,
  MIN_SESSSION_START,
  numberToTime,
} from "./AddSessionsAgent";
import { useMemo } from "react";
import OptionsInput from "@/Components/UI/OptionsInput";
import AreaInput from "@/Components/UI/AreaInput";
import FormActions from "@/Components/Admin/UI/FormActions";
import Button from "@/Components/UI/Button";

const MutateSessionPopup = ({
  mutate,
  node,
  stamp,
}: {
  mutate: () => unknown;
} & (
  | { stamp: string; node?: never }
  | { node: IDoctorSession; stamp?: never }
)) => {
  const { closePopup } = usePopup();
  const getContent = useLocale();

  const { setInput, isLoading, input, submit } = useForm<IDoctorSession>({
    method: "POST",
    path: `${API}/doctor/session${node ? `/${node._id}` : ""}`,
    successCb: () => {
      mutate();
      closePopup();
    },
    mutator: (inp) => {
      if (node) {
        const clone = { ...inp };
        if (!inp.start) clone.start = node?.start;
        if (!inp.end) clone.end = node?.end;
        return clone;
      } else {
        return { ...inp, stamp };
      }
    },
    hasProblem: (inp) => {
      if (node) {
        if (
          !doctorSessionTypes
            .map((el) => (inp[el] === undefined ? node[el] : inp[el]))
            .some(Boolean)
        )
          return getContent("noSessionKindFoundError");
        if ((inp.start || node.start) === (inp.end || node.end))
          return getContent("invalidSessionDurationError");
      } else {
        if (!doctorSessionTypes.some((el) => inp[el]))
          return getContent("noSessionKindFoundError");
        if (inp.start === inp.end)
          return getContent("invalidSessionDurationError");
      }
    },
  });

  const values = useMemo<[number, number]>(
    () => [
      input.start || node?.start || MIN_SESSSION_START,
      input.end || node?.end || MAX_SESSION_END,
    ],
    [input.end, input.start, node?.end, node?.start]
  );

  return (
    <PopupCard>
      <div className={classes.main}>
        <RangeInput
          title={getContent("sessionBoundaries")}
          min={MIN_SESSSION_START}
          max={MAX_SESSION_END}
          step={30}
          left={Math.min(...values)}
          right={Math.max(...values)}
          values={values}
          thumb={(index) => numberToTime(values[index])}
          readOnly={isLoading}
          onChange={(e) =>
            setInput((prev) => ({
              ...prev,
              start: Math.min(...e),
              end: Math.max(...e),
            }))
          }
          mark={(index) => numberToTime(MIN_SESSSION_START + index * 30)}
        />
        <OptionsInput
          options={doctorSessionTypes.reduce(
            (acc, el) => ({ ...acc, [el]: getContent(el) }),
            {} as Record<DoctorSessionType, string>
          )}
          value={doctorSessionTypes.reduce(
            (acc, el) => ({
              ...acc,
              [el]: input[el] === undefined ? !!node?.[el] : input[el],
            }),
            {} as Partial<Record<DoctorSessionType, boolean>>
          )}
          title={getContent("sessionsKind")}
          onChange={(key) =>
            setInput((prev) => ({
              ...prev,
              [key]: prev[key] === undefined ? !node?.[key] : !prev[key],
            }))
          }
          readOnly={!!isLoading}
        />
        <AreaInput
          readOnly={isLoading}
          title={getContent("description")}
          defaultValue={node?.note}
          onChange={(e) =>
            setInput((prev) => ({ ...prev, note: e.target.value }))
          }
        />
        <FormActions>
          <Button variant="Neutral" onClick={() => closePopup()}>
            {getContent("cancel")}
          </Button>
          <Button onClick={submit}>{getContent("submit")}</Button>
        </FormActions>
      </div>
    </PopupCard>
  );
};

export default MutateSessionPopup;
