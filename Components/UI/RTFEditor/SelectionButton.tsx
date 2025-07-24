import { ReactNode, useCallback, useEffect, useState } from "react";
import { colors, lineHeights, sizes } from "./RTFConfigs";
import { CustomText } from "./RTFEditor";
import classes from "./SelectionButton.module.css";
import { useSlateSelection, useSlateStatic } from "slate-react";
import { Editor } from "slate";
import MenuIcon from "@/Components/Icons/MenuIcon";

const selectables = ["size", "color", "bg", "lineHeight"] as const;

type Selectable = (typeof selectables)[number];

const keyToValues: { [key in Selectable]: readonly CustomText[key][] } = {
  size: sizes,
  color: colors,
  bg: colors,
  lineHeight: lineHeights,
} as const;

const SelectionButton = <T extends Selectable>({
  defaultValue,
  thisKey,
  icon,
  renderer = (val) => val,
  menuClass = "",
}: {
  defaultValue: CustomText[T];
  thisKey: T;
  icon: ReactNode;
  renderer?: (value: CustomText[T]) => ReactNode;
  menuClass?: string;
}) => {
  const editor = useSlateStatic();
  const [selected, setSelected] = useState<CustomText[T]>(defaultValue);
  const [current, setCurrent] = useState<CustomText[T]>(defaultValue);
  const selection = useSlateSelection();

  useEffect(
    () => setCurrent(Editor.marks(editor)?.[thisKey] || defaultValue),
    [defaultValue, editor, thisKey, selection]
  );

  const [isMenuOpen, setIsMenuOpen] = useState<boolean>(false);

  useEffect(() => {
    const listener = () => setIsMenuOpen(false);
    if (isMenuOpen) {
      setTimeout(() => window.addEventListener("click", listener, false));
      return () => window.removeEventListener("click", listener, false);
    }
  });

  const apply = useCallback(
    (value?: CustomText[T]) =>
      Editor.addMark(editor, thisKey, value || selected),
    [editor, selected, thisKey]
  );

  return (
    <div className={classes.main}>
      <div className={classes.box}>
        <span>{renderer(selected)}</span>
        <button
          className={classes.btn}
          type="button"
          onClick={() => setIsMenuOpen(true)}
        >
          <MenuIcon />
        </button>
      </div>
      <button className={classes.btn} type="button" onClick={() => apply()}>
        {icon}
      </button>
      <span className={classes.current}>{renderer(current)}</span>
      {isMenuOpen && (
        <div className={`${classes.menu} ${menuClass}`}>
          {keyToValues[thisKey].map((value) => (
            <button
              key={`${thisKey}${value}`}
              className={`${classes.option} ${
                value === selected ? classes.active : ""
              }`}
              onClick={() => {
                setSelected(value);
                setIsMenuOpen(false);
                apply(value);
              }}
            >
              {renderer(value)}
            </button>
          ))}
        </div>
      )}
    </div>
  );
};
export default SelectionButton;
