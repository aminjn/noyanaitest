import useForm, {
  UseFormProps,
  UseFormReturn,
} from "@/Components/Hooks/useForm";
import Button from "@/Components/UI/Button";
import Form from "@/Components/UI/Form";
import {
  Dispatch,
  Fragment,
  ReactNode,
  SetStateAction,
  useCallback,
  useState,
} from "react";
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
import NodesSelector, {
  NodesSelectorCreatable,
} from "@/Components/UI/NodesSelector";
import ImageInput from "@/Components/UI/ImageInput";
import { UserSearchField } from "./UserSearchSelect";
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
import { ta } from "@/Components/Admin/i18n/adminText";
import dynamic from "next/dynamic";

// the map library (~1 MB) loads only when a form actually shows a map
const PointPicker = dynamic(() => import("./PointPicker"), { ssr: false });
const LocationPicker = dynamic(() => import("@/Components/Map/LocationPicker"), { ssr: false });
import { asPoint } from "@/Components/Map/point";

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
          aria-label={visible ? ta("پنهان کردن") : ta("نمایش")}
          title={visible ? ta("پنهان کردن") : ta("نمایش")}
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
        // user accounts, found by server search (GET /admin/users?q=)
        // instead of loading every user into a "nodes" list; the value is
        // the id (or ids when multi)
        type: "users";
        multi?: boolean;
        getDefaultValue?: (node: TInput) => unknown;
      }
    | {
        type: "nodes";
        // a function gets the form's current values (the saved record with
        // the unsaved edits on top): a list that depends on another field,
        // e.g. cities of the chosen province (./geoPaths.ts)
        path: string | ((values: Partial<TInput>) => string);
        getOptionLabel: (node: unknown) => string;
        getOptionValue: (node: unknown) => string;
        multi?: boolean;
        getDefaultValue?: (node: TInput) => unknown;
        clearable?: boolean;
        dataParser?: (res: unknown) => unknown[];
        // lets the admin create a missing option inline (POST to its path)
        creatable?: NodesSelectorCreatable;
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
    | {
        // a map point: search, map click, "my location", and the point's
        // address under the map
        type: "point";
        // the admin panel's picker (ta texts); otherwise the panels' one
        admin?: boolean;
        // a text field of this form the point's address fills when it is
        // empty (or on "use this address")
        addressField?: string;
        // what is sent: GeoJSON {type:"Point",coordinates:[lng,lat]}
        // (default) or the bare [lng, lat] pair some endpoints take
        store?: "geojson" | "pair";
      }
  ) & {
    title: string;
    readOnly?: boolean;
    required?: boolean;
    // a text field holding a URL, a key or a code: left to right, Latin digits
    ltr?: boolean;
    // groups the field under its own heading / tab instead of the automatic
    // one (see sectionOf)
    section?: string;
    // help shown under the field (what to enter, an example to copy)
    hint?: ReactNode;
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
  "point",
];

// a saved point is GeoJSON or a bare [lng, lat] pair (or garbage)
const pointOf = (value: unknown): [number, number] | undefined =>
  asPoint(
    value && typeof value === "object" && !Array.isArray(value)
      ? (value as { coordinates?: unknown }).coordinates
      : value,
  ) || undefined;

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
  tools,
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
    // helpers drawn above the fields (e.g. the encyclopedia's AI draft):
    // they read the unsaved input and can fill fields in (`fill` sets the
    // values and redraws those inputs; nothing is saved until "Save")
    tools?: (api: {
      input: Partial<TInput>;
      fill: (values: Partial<TInput>) => void;
    }) => ReactNode;
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
  // a field marked required blocks the save here, in the admin's language,
  // instead of the server answering with the database's own message
  const missingRequired = (inp: Partial<TInput>) => {
    for (const key of Object.keys(renderer) as (keyof TInput)[]) {
      const segment = renderer[key];
      if (!segment?.required || segment.readOnly || segment.type === "secret")
        continue;
      const value = inp[key] !== undefined ? inp[key] : defaultValue?.[key];
      const empty =
        value === undefined ||
        value === null ||
        (typeof value === "string" && !value.trim()) ||
        (Array.isArray(value) && !value.length);
      if (empty) return ta("«${1}» را پر کنید", [ta(segment.title)]);
    }
    return false;
  };
  const hookResult = useForm<TInput, TResult>(
    hookProps
      ? {
          ...hookProps,
          hasProblem: (inp) => missingRequired(inp) || hookProps.hasProblem?.(inp),
        }
      : { path: "", method: "GET" },
  );

  const { setInput, isLoading, submit, input, dirty } = hookProvided || hookResult;

  const getContent = useScopedLocale(LOCALE_NS);
  const [tab, setTab] = useState("");
  // text fields a map point fills: bumped to remount the (uncontrolled)
  // input with the new value
  const [refill, setRefill] = useState<Record<string, number>>({});
  // fields `tools` filled in: their inputs show the filled value
  const [filled, setFilled] = useState<string[]>([]);
  const fill = useCallback(
    (values: Partial<TInput>) => {
      const keys = Object.keys(values);
      if (!keys.length) return;
      setInput((prev) => ({ ...prev, ...values }));
      setFilled((prev) => Array.from(new Set([...prev, ...keys])));
      setRefill((prev) => {
        const next = { ...prev };
        for (const k of keys) next[k] = (next[k] || 0) + 1;
        return next;
      });
    },
    [setInput],
  );
  const filledByPoint = new Set<string>(filled);
  Object.values(renderer).forEach((segment) => {
    const seg = segment as { type?: string; addressField?: string } | undefined;
    if (seg?.type === "point" && seg.addressField) filledByPoint.add(seg.addressField);
  });

  const collected: { key: string; segment: FormRenderer<TInput>[keyof TInput]; node: ReactNode }[] = [];
  Object.keys(renderer).forEach((_key) => {
        const key = _key as keyof typeof renderer;
        const segment = renderer[key];
        if (!segment) return;
        const commons = {
          // a title built at module load is still the Persian source
          title: ta(segment.title),
          defaultValue:
            filledByPoint.has(key.toString()) && input[key] !== undefined
              ? String(input[key] ?? "")
              : defaultValue?.[key]?.toString(),
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
                inputClass={segment.ltr ? classes.ltrInput : undefined}
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
                    // a cleared box clears the value (back to the default),
                    // it doesn't save 0
                    setInput((prev) => ({
                      ...prev,
                      [key]:
                        e.target.value.trim() === ""
                          ? null
                          : Number(e.target.value),
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
          case "users":
            content = (
              <UserSearchField
                title={commons.title}
                readOnly={commons.readOnly}
                multi={segment.multi}
                defaultValue={
                  defaultValue
                    ? segment.getDefaultValue
                      ? segment.getDefaultValue(defaultValue)
                      : defaultValue[key]
                    : undefined
                }
                onChange={(e) => setInput((prev) => ({ ...prev, [key]: e }))}
              />
            );
            break;
          case "nodes": {
            const nodesPath =
              typeof segment.path === "function"
                ? segment.path({
                    ...(defaultValue || {}),
                    ...input,
                  } as Partial<TInput>)
                : segment.path;
            content = (
              <NodesSelector
                // a new list (another province...) starts from a fresh pick
                key={nodesPath}
                {...commons}
                getOptionLabel={segment.getOptionLabel}
                getOptionValue={segment.getOptionValue}
                path={nodesPath}
                defaultValue={
                  filled.includes(key.toString())
                    ? ((input[key] ?? undefined) as never)
                    : defaultValue
                      ? segment.getDefaultValue?.(defaultValue)
                      : undefined
                }
                onChange={(e) => setInput((prev) => ({ ...prev, [key]: e }))}
                multi={segment.multi}
                dataParser={segment.dataParser}
                clearable={segment.clearable}
                creatable={segment.creatable}
              />
            );
            break;
          }
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
            break;
          case "point": {
            const addressKey = segment.addressField as keyof TInput | undefined;
            const store = segment.store || "geojson";
            const pointProps = {
              defaultValue: pointOf(defaultValue?.[key]),
              onChange: (e: [number, number]) =>
                setInput((prev) => ({
                  ...prev,
                  [key]: store === "pair" ? e : { type: "Point", coordinates: e },
                })),
              ...(addressKey
                ? {
                    currentAddress: String(
                      input[addressKey] ?? defaultValue?.[addressKey] ?? "",
                    ),
                    onUseAddress: (address: string) => {
                      setInput((prev) => ({ ...prev, [addressKey]: address }));
                      setRefill((prev) => ({
                        ...prev,
                        [addressKey]: (prev[addressKey as string] || 0) + 1,
                      }));
                    },
                  }
                : {}),
            };
            content = (
              <div className={classes.point}>
                <span className={classes.pointTitle}>{commons.title}</span>
                {segment.admin ? (
                  <PointPicker {...pointProps} />
                ) : (
                  <LocationPicker {...pointProps} />
                )}
              </div>
            );
            break;
          }
        }
        if (!content) return;
        collected.push({
          key: key.toString(),
          segment,
          node: (
            <div
              key={`${key.toString()}-${refill[key.toString()] || 0}`}
              className={
                segment.type === "bool"
                  ? classes.switchCard
                  : wideFieldTypes.includes(segment.type)
                    ? classes.wide
                    : classes.field
              }
            >
              {content}
              {segment.hint ? <div className={classes.fieldHint}>{segment.hint}</div> : null}
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
      {!!tools && !readOnly && <div className={classes.tools}>{tools({ input, fill })}</div>}
      {mode === "flat" && <div className={classes.grid}>{collected.map((el) => el.node)}</div>}
      {mode === "sections" &&
        sections.map((section) => (
          <section key={section.id} className={classes.section}>
            {/* a big field in a section of its own already shows its title */}
            {!section.id.startsWith("field:") && (
              <h3 className={classes.sectionTitle}>{section.title}</h3>
            )}
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
        {!readOnly && dirty && !isLoading && (
          <span className={classes.unsaved} role="status">
            {getContent("formUnsavedChanges")}
          </span>
        )}
      </FormActions>
    </Form>
  );
};

export default CreateForm;
