import useForm, {
  UseFormProps,
  UseFormReturn,
} from "@/Components/Hooks/useForm";
import Button from "@/Components/UI/Button";
import Form from "@/Components/UI/Form";
import { Dispatch, Fragment, ReactNode, SetStateAction, useState } from "react";
import Ixon from "@/Components/UI/Ixon";
import EyeIcon from "@/Components/Icons/EyeIcon";
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
import ClientTabSystem from "@/Components/UI/ClientTabSystem";
import LicensePricingInput, {
  ILicensePricingEntry,
} from "./LicensePricingInput";

const LOCALE_NS: ContentNamespace[] = ["common"];

const SecretInput = ({
  onChange,
  ...props
}: {
  title: string;
  defaultValue?: string;
  placeholder?: boolean;
  readOnly?: boolean;
  required?: boolean;
  onChange: (value: string) => void;
}) => {
  const [visible, setVisible] = useState(false);
  return (
    <Input
      {...props}
      type={visible ? "text" : "password"}
      autoComplete="new-password"
      inputClass={classes.secretInput}
      onChange={(e) => onChange(e.target.value)}
      tail={
        <button
          type="button"
          className={classes.secretToggle}
          onClick={() => setVisible((prev) => !prev)}
          aria-label={visible ? "پنهان کردن" : "نمایش"}
          title={visible ? "پنهان کردن" : "نمایش"}
        >
          <Ixon width="1.25rem">
            <EyeIcon />
          </Ixon>
        </button>
      }
    />
  );
};

export type FormRenderer<TInput = Partial<Record<string, unknown>>> = {
  [key in keyof Partial<TInput>]: (
    | {
        type: "text" | "bool" | "area" | "date" | "image" | "strings";
      }
    // API keys / passwords: masked, with a show/hide toggle, no autofill.
    | { type: "secret" }
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
    // groups the field under its own heading / tab instead of the automatic
    // one (see sectionOf)
    section?: string;
  };
};

type FormSection = { id: string; title: string; fields: ReactNode[] };

// Automatic grouping (2026-09 redesign): a long form reads as a few titled
// parts - the basics, the on/off switches, each big editor (pricing,
// menus...) on its own, then content and media - instead of one wall of
// fields. `section` on an entry overrides it.
const sectionOf = (
  key: string,
  segment: { type: string; title: string; section?: string },
): { id: string; title?: string } => {
  if (segment.section) return { id: `custom:${segment.section}`, title: segment.section };
  switch (segment.type) {
    case "bool":
      return { id: "status" };
    case "licensePricing":
    case "multiselect":
      return { id: `field:${key}`, title: segment.title };
    case "area":
    case "rtf":
    case "strings":
      return { id: "content" };
    case "image":
    case "files":
      return { id: "media" };
    default:
      return { id: "main" };
  }
};

// main first, then the switches, the big editors in their order, content,
// media
const sectionRank = (id: string) =>
  id === "main" ? 0 : id === "status" ? 1 : id === "content" ? 3 : id === "media" ? 4 : 2;

export type FormLayout = "auto" | "flat" | "sections" | "tabs";

// Field types that need the full form width; the rest sit two per row.
const wideFieldTypes: string[] = [
  "rtf",
  "area",
  "image",
  "strings",
  "files",
  "multiselect",
  "licensePricing",
  "range",
  "options",
];

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
  layout = "auto",
}: WithStyleProps<
  {
    readOnly?: boolean;
    // "auto": a short form stays one grid, a longer one gets section
    // headings, a long one with several parts becomes tabs
    layout?: FormLayout;
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
  const [tab, setTab] = useState("");

  const collected: { key: string; segment: FormRenderer<TInput>[keyof TInput]; node: ReactNode }[] = [];
  Object.keys(renderer).forEach((_key) => {
        const key = _key as keyof typeof renderer;
        const segment = renderer[key];
        if (!segment) return;
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
          case "secret":
            content = (
              <SecretInput
                {...commons}
                onChange={(value) => {
                  if (segment.readOnly) return;
                  setInput((prev) => ({ ...prev, [key]: value }));
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
        if (!content) return;
        collected.push({
          key: key.toString(),
          segment,
          node: (
            <div
              key={key.toString()}
              className={
                segment.type === "bool"
                  ? classes.switchCard
                  : wideFieldTypes.includes(segment.type)
                    ? classes.wide
                    : classes.field
              }
            >
              {content}
            </div>
          ),
        });
      });

  const sectionTitles: Record<string, string> = {
    main: getContent("formSectionMain"),
    status: getContent("formSectionStatus"),
    content: getContent("formSectionContent"),
    media: getContent("formSectionMedia"),
  };
  const sections: FormSection[] = [];
  for (const field of collected) {
    const { id, title } = sectionOf(field.key, field.segment as never);
    let section = sections.find((el) => el.id === id);
    if (!section) {
      section = { id, title: title || sectionTitles[id] || id, fields: [] };
      sections.push(section);
    }
    section.fields.push(field.node);
  }
  sections.sort((x, y) => sectionRank(x.id) - sectionRank(y.id));
  const mode: Exclude<FormLayout, "auto"> =
    layout !== "auto"
      ? layout
      : collected.length >= 9 && sections.length >= 3
        ? "tabs"
        : collected.length >= 5 && sections.length >= 2
          ? "sections"
          : "flat";
  const sectionGrid = (section: FormSection) => (
    <div
      className={`${classes.grid} ${section.id === "status" ? classes.switchGrid : ""}`}
    >
      {section.fields}
    </div>
  );

  return (
    <Form
      onSubmit={() => {
        if (readOnly) return;
        submit();
      }}
      className={`${styleManaged ? classes.main : ""} ${className}`}
      style={style}
    >
      {mode === "flat" && <div className={classes.grid}>{collected.map((el) => el.node)}</div>}
      {mode === "sections" &&
        sections.map((section) => (
          <section key={section.id} className={classes.section}>
            <h3 className={classes.sectionTitle}>{section.title}</h3>
            {sectionGrid(section)}
          </section>
        ))}
      {mode === "tabs" && (
        <ClientTabSystem
          keepMounted
          className={classes.tabs}
          viewState={[tab || sections[0]?.id || "", setTab]}
          items={sections.map((section) => ({
            id: section.id,
            title: section.title,
            content: <div className={classes.tabPanel}>{sectionGrid(section)}</div>,
          }))}
        />
      )}
      <FormActions className={classes.actions}>
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
