import { SetStateAction, useCallback, useState } from "react";
import classes from "./StringListInput.module.css";
import Input from "./Input";
import IconButton from "../Admin/UI/IconButton";
import PlusIcon from "../Icons/PlusIcon";
import { nanoid } from "nanoid";
import Garbageicon from "../Icons/GarbageIcon";
import ChevronIcon from "../Icons/ChevronIcon";

function swap<T>(arr: T[], i: number, j: number): T[] {
  const clone = [...arr];
  [clone[i], clone[j]] = [clone[j], clone[i]];
  return clone;
}

type StringListInput = { id: string; value: string }[];

const StringListInput = ({
  onChange,
  defaultValue,
  readOnly,
  title,
}: {
  title?: string;
  defaultValue?: string[];
  readOnly?: boolean;
  onChange?: (e: string[]) => unknown;
}) => {
  const [input, setInput] = useState<StringListInput>(
    defaultValue?.map((value) => ({ value, id: nanoid() })) || []
  );

  const onValueChange = useCallback(
    (action: (prev: StringListInput) => StringListInput) => {
      setInput(action);
      const newVal = action(input);
      onChange?.(newVal.map((el) => el.value));
    },
    [input, onChange]
  );

  return (
    <div className={classes.main}>
      <div className={classes.header}>
        {!!title && <legend className={classes.title}>{title}</legend>}
        <IconButton
          type="button"
          onClick={() =>
            onValueChange((prev) => [...prev, { id: nanoid(), value: "" }])
          }
          variant="Success"
        >
          <PlusIcon />
        </IconButton>
      </div>
      <div className={classes.values}>
        {input.map((inp, index) => (
          <div key={inp.id} className={classes.value}>
            <span className={classes.index}>{`${index + 1} :`}</span>
            <Input
              onChange={(e) =>
                onValueChange((prev) => {
                  const clone = [...prev];
                  const index = clone.findIndex((el) => el.id === inp.id);
                  clone[index] = { ...clone[index], value: e.target.value };
                  return clone;
                })
              }
              defaultValue={inp.value}
            />
            <div className={classes.actions}>
              <IconButton
                type="button"
                onClick={() => {
                  if (index === 0) return;
                  onValueChange((prev) => swap(prev, index, index - 1));
                }}
                style={{ transform: "rotateZ(180deg)" }}
                variant={index === 0 ? "Neutral" : "Info"}
              >
                <ChevronIcon />
              </IconButton>
              <IconButton
                type="button"
                variant="Danger"
                onClick={() =>
                  onValueChange((prev) => {
                    const clone = [...prev];
                    clone.splice(
                      clone.findIndex((el) => el.id === inp.id),
                      1
                    );
                    return clone;
                  })
                }
              >
                <Garbageicon />
              </IconButton>
              <IconButton
                type="button"
                onClick={() => {
                  if (index === input.length - 1) return;
                  onValueChange((prev) => swap(prev, index, index + 1));
                }}
                variant={index === input.length - 1 ? "Neutral" : "Info"}
              >
                <ChevronIcon />
              </IconButton>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default StringListInput;
