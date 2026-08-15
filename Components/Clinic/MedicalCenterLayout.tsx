import { ReactNode } from "react";
import classes from "./MedicalCenterLayout.module.css";
import Link from "next/link";
import { txsMedium } from "../UI/Typography";
import Ixon from "../UI/Ixon";
import ChevronIcon from "../Icons/ChevronIcon";
const MedicalCenterLayout = ({
  back,
  children,
}: {
  back: { title: string; target: string };
  children?: ReactNode;
}) => {
  return (
    <div className={classes.container}>
      <Link href={back.target} className={`${classes.back} ${txsMedium}`}>
        <span>{back.title}</span>
        <Ixon width="1.25rem" style={{ transform: "rotateZ(90deg)" }}>
          <ChevronIcon />
        </Ixon>
      </Link>
      <div className={classes.main}>{children}</div>
    </div>
  );
};

export default MedicalCenterLayout;
