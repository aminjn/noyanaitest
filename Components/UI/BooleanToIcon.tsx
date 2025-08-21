import { errorCol, successCol } from "../Enums/Colors";
import CheckIcon from "../Icons/CheckIcon";
import CloseIcon from "../Icons/CloseIcon";
import { WithStyleProps } from "../Layout/Layout";
import classes from "./BooleanToIcon.module.css";
import Ixon from "./Ixon";

export const booleanToValue = { true: "فعال", false: "غیرفعال" } as const;

const BooleanToIcon = ({
  value,
  className = "",
  style = {},
}: WithStyleProps<{ value: boolean }>) => {
  return (
    <Ixon
      className={className}
      style={{ color: value ? successCol : errorCol, ...style }}
      width="2rem"
    >
      {value ? <CheckIcon /> : <CloseIcon />}
    </Ixon>
  );
};

export default BooleanToIcon;
