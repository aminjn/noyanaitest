import { ChangeEventHandler } from "react";
import classes from "./AreaInput.module.css";

const AreaInput = ({}: {
  onChange: ChangeEventHandler<HTMLTextAreaElement>;
} & Record<string, unknown>) => {
  return <p>AreaInput</p>;
};

export default AreaInput;
