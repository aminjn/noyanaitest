import useForm, {
  UseFormProps,
  UseFormReturn,
} from "@/Components/Hooks/useForm";
import Button from "@/Components/UI/Button";
import Form from "@/Components/UI/Form";
import { Dispatch, Fragment, ReactNode, SetStateAction } from "react";
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
import CheckboxGroupInput from "@/Components/UI/CheckboxGroupInput";
import useScopedLocale from "@/Components/Hooks/useScopedLocale";
import { ContentNamespace } from "@/Components/Enums/contentNamespaces";
import { IDoctorSecretaryAccessLevel } from "../DoctorSecretaryAccessLevel/AdminManageDoctorSecretaryAccessLevelsPage";
import RangeInput from "@/Components/UI/RangeInput";
import FilesInput from "./FilesInput";
import LicensePricingInput, {
  ILicensePricingEntry,
} from "./LicensePricingInput";

const LOCALE_NS: ContentNamespace[] = ["common"];

export type FormRenderer<TInput = Partial<Record<string, unknown>>> = {
  [key in keyof Partial<TInput>]: (
    | {
        type: "text" | "bool" | "area" | "date" | "image" | "strings";
      }
    | {
        type: "rtf";
        // Hides the image-picker/ad-inserter toolbar buttons, which browse
        // the admin-only BlogMedia/InlineAdvertisement libraries. Set this
        // for non-admin authors (org panels) who don't have access to those
        // routes.
        hideMediaLibrary?: boolean;
      }
    | { type: "select" | "options"; options: Record<string, string> }
    | { type: "multiselect"; options: Record<string, string> }
    | {
        type: "nodes";
        path: string;
        getOptionLabel: (node: unknown) => string;
        getOptionValue: (node: unknown) => string;
        multi?: boolean;
        getDefaultValue?: (node: TInput) => unknown;
        clearable?: boolean;
        dataParser?: (res: unknown) => unknown[];
      }
    | {
        type: "range";
        min?: number;
        max?: number;
        step?: number;
        markCount?: number;
      }
    | { type: "files"; getDefaultValue?: (node: TInput) => string[] }
    | { type: "number"; price?: boolean }
    | { type: "licensePricing" }
  ) & {
    title: string;
    readOnly?: boolean;
    required?: boolean;
  };
};

const CreateForm = <TInput, TResult = unknown>({
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
    renderer: FormRenderer<TInput>;
    defaultValue?: TInput;
    onCancel?: () => unknown;
    more?: ({
      input,
    }: {
      input: Partial<TInput>;
      setInput: Dispatch<SetStateAction<Partial<TInput>>>;
    }) => ReactNode;
  } & (
    | {
        hookProps: UseFormProps<TInput, TResult>;
        hookProvided?: never;
      }
    | {
        hookProvided: UseFormReturn<TInput>;
        hookProps?: never;
      }
  )
>) => {
  const hookResult = useForm<TInput, TResult>(
    hookProps || { path: "", method: "GET" },
  );

  const { setInput, isLoading, submit, input } = hookProvided || hookResult;

  const getContent = useScopedLocale(LOCALE_NS);

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
          readOnly: isLoading || readOnly || segment.readOnly,
          required: segment.required,
        } as const;
        let content: ReactNode;
        switch (segment.type) {
          case "text":
            content = (
              <Input
                {...commons}
                onChange={(e) => {
                  if (segment.readOnly) return;
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
          case "multiselect":
            content = (
              <CheckboxGroupInput
                {...commons}
                options={segment.options}
                defaultValue={
                  Array.isArray(defaultValue?.[key])
                    ? (defaultValue?.[key] as unknown as string[])
                    : undefined
                }
                onChange={(e) => setInput((prev) => ({ ...prev, [key]: e }))}
              />
            );
            break;
          case "number":
            content = (
              <Input
                price={segment.price}
                inputMode="numeric"
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
            const value =
              (input[key] as number) ||
              (defaultValue?.[key] as number) ||
              segment.min ||
              0;
            const min = segment.min || 0;
            const max = segment.max || 100;
            const step = segment.step || 1;
            const totalMarks = Math.floor(
              (max - min) / step / (segment.markCount || 1),
            );
            content = (
              <RangeInput
                {...commons}
                onChange={(e) =>
                  setInput((prev) => ({
                    ...prev,
                    [key]: Number(e[0]),
                  }))
                }
                values={[value]}
                left={min}
                right={value}
                min={min}
                max={max}
                step={step}
                thumb={() => value.toString()}
                mark={(index) =>
                  !(index % totalMarks) ? (min + index * step).toString() : ""
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
                dataParser={segment.dataParser}
                clearable={segment.clearable}
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
              <div>
                <span>{commons.title}</span>
                <RTFEditor
                  {...commons}
                  hideMediaLibrary={segment.hideMediaLibrary}
                  onChange={(e) => setInput((prev) => ({ ...prev, [key]: e }))}
                />
              </div>
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
          case "files":
            content = (
              <FilesInput
                {...commons}
                defaultValue={
                  defaultValue
                    ? segment.getDefaultValue?.(defaultValue)
                    : undefined
                }
                onChange={(e) => setInput((prev) => ({ ...prev, [key]: e }))}
              />
            );
            break;
          case "licensePricing":
            content = (
              <LicensePricingInput
                {...commons}
                defaultValue={
                  Array.isArray(defaultValue?.[key])
                    ? (defaultValue?.[key] as unknown as ILicensePricingEntry[])
                    : undefined
                }
                onChange={(e) => setInput((prev) => ({ ...prev, [key]: e }))}
              />
            );
        }
        return <Fragment key={key.toString()}>{content}</Fragment>;
      })}
      <FormActions>
        {!!onCancel ? (
          <Button type="button" variant="Neutral" onClick={onCancel}>
            {getContent("cancel")}
          </Button>
        ) : null}
        {!readOnly && (
          <Button type="submit" isLoading={isLoading}>
            {getContent("submit")}
          </Button>
        )}
      </FormActions>
    </Form>
  );
};

export default CreateForm;
