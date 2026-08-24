import useForm from "@/Components/Hooks/useForm";
import classes from "./OrderEditor.module.css";
import { API } from "@/Components/config";
import Form from "@/Components/UI/Form";
import IconButton from "./IconButton";
import EyeIcon from "@/Components/Icons/EyeIcon";
import CheckIcon from "@/Components/Icons/CheckIcon";
import CloseIcon from "@/Components/Icons/CloseIcon";
import { useRef, useState } from "react";
const OrderEditor = ({
  _id,
  modelName,
  value,
  mutate,
}: {
  value: number;
  modelName: string;
  _id: string;
  mutate: () => unknown;
}) => {
  const { isLoading, setInput, submit, input, reset } = useForm<{
    order: number;
  }>({
    path: `${API}/auto/${modelName}/${_id}`,
    method: "POST",
    successCb: () => {
      mutate();
    },
  });

  const inputRef = useRef<HTMLInputElement>(null);

  return (
    <Form
      className={classes.main}
      onSubmit={() => {
        if (
          isLoading ||
          (input.order !== undefined && Number(input.order) === Number(value))
        )
          return;
        submit();
      }}
    >
      <input
        ref={inputRef}
        className={classes.input}
        readOnly={isLoading}
        defaultValue={value}
        onChange={(e) => {
          const val = Number(e.target.value);
          if (isNaN(val)) {
            e.target.value = e.target.getAttribute("prev") || "0";
            return;
          }
          setInput((prev) => ({ ...prev, order: val }));
        }}
      />
      {input.order !== undefined && Number(value) !== Number(input.order) && (
        <div className={classes.actions}>
          <IconButton variant="Success" type="submit">
            <CheckIcon />
          </IconButton>
          <IconButton
            variant="Danger"
            type="button"
            onClick={() => {
              reset();
              if (inputRef.current) {
                inputRef.current.value = value.toString();
              }
            }}
          >
            <CloseIcon />
          </IconButton>
        </div>
      )}
    </Form>
  );
};

export default OrderEditor;
