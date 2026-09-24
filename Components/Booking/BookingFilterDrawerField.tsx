import { ReactNode } from "react";
import classes from "./BookingFilterDrawerField.module.css";
import Button from "../UI/Button";
import ToggleInput from "../UI/ToggleInput";
import useScopedLocale from "../Hooks/useScopedLocale";
import { ContentNamespace } from "../Enums/contentNamespaces";

const NS: ContentNamespace[] = ["common", "booking"];

// Wraps a single field rendered inside a BookingFiltersMobile drawer so its
// closing behavior matches its input type:
// - "select": renders the field as-is, plus a "Done" button underneath that
//   closes the drawer once the user is finished picking (letting them make
//   several picks in a multi-select before dismissing).
// - "toggle": renders a ToggleInput and closes the drawer immediately after
//   the value flips, since there's nothing else to do in that drawer.
export type BookingFilterDrawerFieldProps =
  | {
      type: "select";
      close: () => unknown;
      children: ReactNode;
    }
  | {
      type: "toggle";
      close: () => unknown;
      title: string;
      value: boolean;
      onChange: () => unknown;
    };

const BookingFilterDrawerField = (props: BookingFilterDrawerFieldProps) => {
  const getContent = useScopedLocale(NS);

  if (props.type === "toggle") {
    return (
      <ToggleInput
        title={props.title}
        value={props.value}
        onChange={() => {
          props.onChange();
          props.close();
        }}
      />
    );
  }

  return (
    <div className={classes.main}>
      {props.children}
      <Button
        variant="Primary"
        mode="Fill"
        radius="High"
        size="L"
        onClick={() => props.close()}
        style={{ marginTop: "auto" }}
      >
        {getContent("done")}
      </Button>
    </div>
  );
};

export default BookingFilterDrawerField;
