import { Dispatch, SetStateAction, useEffect, useState } from "react";
import classes from "./EditTextContentAgent.module.css";
import useForm from "@/Components/Hooks/useForm";
import { API } from "@/Components/config";
import Form from "@/Components/UI/Form";
import Input from "@/Components/UI/Input";
import IconButton from "../UI/IconButton";
import EditIcon from "@/Components/Icons/EditIcon";
import CloseIcon from "@/Components/Icons/CloseIcon";

const EditTextContentAgent = ({
  kay,
  value,
  mutate,
  readOnly,
}: {
  kay: string;
  value: string;
  mutate: () => unknown;
  readOnly?: boolean;
}) => {
  const [isEditMode, setIsEditMode] = useState<boolean>(false);

  const { setInput, submit, isLoading } = useForm<{ value: string }>({
    path: `${API}/auto/textcontent`,
    method: "POST",
    mutator: (inp) => ({ [kay]: inp.value === undefined ? value : inp.value }),
    successCb: () => {
      mutate();
      setIsEditMode(false);
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      (window as any).isAnyOpen = false;
    },
  });

  useEffect(() => {
    if (isEditMode) {
      const listener = (e: DocumentEventMap["keyup"]) => {
        if (e.code === "Escape") {
          setIsEditMode(false);
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          (window as any).isAnyOpen = false;
        }
      };
      document.addEventListener("keyup", listener, false);
      return () => document.removeEventListener("keyup", listener, false);
    }
  }, [isEditMode]);

  useEffect(() => {
    if (!isEditMode) return;
    return () => {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      (window as any).isAnyOpen = false;
    };
  }, [isEditMode]);

  if (!isEditMode)
    return (
      <div
        onDoubleClick={() => {
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          if (readOnly || (window as any).isAnyOpen) return;
          setIsEditMode(true);
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          (window as any).isAnyOpen = true;
        }}
      >
        {value}
      </div>
    );
  return (
    <Form onSubmit={submit} className={classes.main}>
      <input
        className={classes.input}
        defaultValue={value}
        onChange={(e) =>
          setInput((prev) => ({ ...prev, value: e.target.value }))
        }
        readOnly={isLoading}
      />
      <div className={classes.actions}>
        <IconButton variant="Success" type="submit">
          <EditIcon />
        </IconButton>
        <IconButton
          variant="Neutral"
          type="button"
          onClick={() => {
            setIsEditMode(false);
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            (window as any).isAnyOpen = false;
          }}
        >
          <CloseIcon />
        </IconButton>
      </div>
    </Form>
  );
};

export default EditTextContentAgent;
