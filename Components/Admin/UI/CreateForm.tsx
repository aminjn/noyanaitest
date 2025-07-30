import useForm, {
  UseFormProps,
  UseFormReturn,
} from "@/Components/Hooks/useForm";
import Button from "@/Components/UI/Button";
import Form from "@/Components/UI/Form";
import { Fragment, ReactNode } from "react";
import FormActions from "./FormActions";
import Input from "@/Components/UI/Input";
import SelectInput from "@/Components/UI/SelectInput";
import ToggleInput from "@/Components/UI/ToggleInput";
import AreaInput from "@/Components/UI/AreaInput";
import { WithStyleProps } from "./Loading";
import classes from "./CreateForm.module.css";
import DateInput from "@/Components/UI/DateInput";
import NodesSelector from "@/Components/UI/NodesSelector";
import ImageInput from "@/Components/UI/ImageInput";
import RTFEditor from "@/Components/UI/RTFEditor/RTFEditor";
import StringListInput from "@/Components/UI/StringListInput";

const CreateForm = <TInput,>({
  defaultValue,
  hookProps,
  renderer,
  onCancel,
  hookProvided,
  className = "",
  style,
  styleManaged = true,
  readOnly,
}: WithStyleProps<
  {
    readOnly?: boolean;
    styleManaged?: boolean;
    renderer: {
      [key in keyof Partial<TInput>]: (
        | {
            type:
              | "text"
              | "number"
              | "bool"
              | "area"
              | "range"
              | "date"
              | "image"
              | "rtf"
              | "strings";
          }
        | { type: "select" | "options"; options: Record<string, string> }
        | {
            type: "nodes";
            path: string;
            getOptionLabel: (node: unknown) => string;
            getOptionValue: (node: unknown) => string;
            multi?: boolean;
            getDefaultValue?: (node: TInput) => unknown;
          }
      ) & {
        title: string;
      };
    };
    defaultValue?: TInput;
    onCancel?: () => unknown;
  } & (
    | {
        hookProps: UseFormProps<TInput>;
        hookProvided?: never;
      }
    | {
        hookProvided: UseFormReturn<TInput>;
        hookProps?: never;
      }
  )
>) => {
  const hookResult = useForm<TInput>(hookProps || { path: "", method: "GET" });

  const { setInput, isLoading, submit, input } = hookProvided || hookResult;

  return (
    <Form
      onSubmit={() => {
        if (readOnly) return;
        submit();
      }}
      className={`${styleManaged ? classes.main : ""} ${className}`}
      style={style}
    >
      {Object.keys(renderer).map((_key) => {
        const key = _key as keyof typeof renderer;
        const segment = renderer[key];
        if (!segment) return null;
        const commons = {
          title: segment.title,
          defaultValue: defaultValue?.[key]?.toString(),
          placeholder: true,
          readOnly: isLoading || readOnly,
        } as const;
        let content: ReactNode;
        switch (segment.type) {
          case "text":
            content = (
              <Input
                {...commons}
                onChange={(e) => {
                  setInput((prev) => ({ ...prev, [key]: e.target.value }));
                }}
              />
            );
            break;
          case "select":
            content = (
              <SelectInput
                {...commons}
                options={segment.options}
                onChange={(e) => {
                  setInput((prev) => ({ ...prev, [key]: e.target.value }));
                }}
              />
            );
            break;
          case "number":
            content = (
              <Input
                {...commons}
                onChange={(e) => {
                  const val = Number(e.target.value);
                  if (isNaN(val) && e.target.value !== "") {
                    e.target.value =
                      e.target.getAttribute("prev") === null
                        ? defaultValue?.[key]?.toString() || ""
                        : e.target.getAttribute("prev") || "";
                  } else {
                    e.target.setAttribute("prev", e.target.value);
                    setInput((prev) => ({
                      ...prev,
                      [key]: Number(e.target.value),
                    }));
                  }
                }}
                type="number"
              />
            );
            break;
          case "bool":
            content = (
              <ToggleInput
                {...commons}
                onChange={() => {
                  setInput((prev) => ({
                    ...prev,
                    [key]:
                      prev[key] === undefined
                        ? !defaultValue?.[key]
                        : !prev[key],
                  }));
                }}
                value={
                  input[key] === undefined
                    ? (defaultValue?.[key] as boolean)
                    : (input[key] as boolean)
                }
              />
            );
            break;
          case "range":
            content = (
              <Input
                {...commons}
                type="range"
                min={0}
                max={100}
                step={1}
                onChange={(e) =>
                  setInput((prev) => ({
                    ...prev,
                    [key]: Number(e.target.value),
                  }))
                }
              />
            );
            break;
          case "area":
            content = (
              <AreaInput
                {...commons}
                onChange={(e) => {
                  setInput((prev) => ({ ...prev, [key]: e.target.value }));
                }}
              />
            );
            break;
          case "date":
            content = (
              <DateInput
                {...commons}
                onChange={(e) => setInput((prev) => ({ ...prev, [key]: e }))}
              />
            );
            break;
          case "nodes":
            content = (
              <NodesSelector
                {...commons}
                getOptionLabel={segment.getOptionLabel}
                getOptionValue={segment.getOptionValue}
                path={segment.path}
                defaultValue={
                  defaultValue
                    ? segment.getDefaultValue?.(defaultValue)
                    : undefined
                }
                onChange={(e) => setInput((prev) => ({ ...prev, [key]: e }))}
                multi={segment.multi}
              />
            );
            break;
          case "image":
            content = (
              <ImageInput
                {...commons}
                onChange={(e) =>
                  setInput((prev) => ({ ...prev, [key]: e.target.files?.[0] }))
                }
              />
            );
            break;
          case "rtf":
            content = (
              <RTFEditor
                {...commons}
                onChange={(e) => setInput((prev) => ({ ...prev, [key]: e }))}
              />
            );
            break;
          case "strings":
            content = (
              <StringListInput
                {...commons}
                defaultValue={
                  Array.isArray(defaultValue?.[key])
                    ? defaultValue?.[key]
                    : undefined
                }
                onChange={(e) => setInput((prev) => ({ ...prev, [key]: e }))}
              />
            );
            break;
        }
        return <Fragment key={key.toString()}>{content}</Fragment>;
      })}
      <FormActions>
        {!!onCancel ? (
          <Button type="button" variant="Neutral" onClick={onCancel}>
            انصراف
          </Button>
        ) : null}
        {!readOnly && (
          <Button type="submit" isLoading={isLoading}>
            تایید
          </Button>
        )}
      </FormActions>
    </Form>
  );
};

export default CreateForm;
