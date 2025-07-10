import Ixon from "@/Components/UI/Ixon";
import classes from "./Loading.module.css";
import LoadingIcon from "@/Components/Icons/LoadingIcon";
import { CSSProperties } from "react";

export type WithStyleProps<T = unknown> = T & {
  style?: CSSProperties;
  className?: string;
};

const Loading = (props: WithStyleProps) => {
  return (
    <Ixon className={classes.main} width="5rem" {...props}>
      <LoadingIcon />
    </Ixon>
  );
};

export default Loading;
