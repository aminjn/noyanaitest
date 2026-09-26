import { ReactNode } from "react";
import classes from "./MedicalCenterLayout.module.css";
import Link from "@/Components/i18n/Link";
import { txsMedium } from "../UI/Typography";
import Ixon from "../UI/Ixon";
import ChevronIcon from "../Icons/ChevronIcon";
import BreadCrump from "../UI/BreadCrump";
import { BreadCrumpTrail } from "../Store/BreadCrumpStore";
const MedicalCenterLayout = ({
  back,
  trail,
  children,
}: {
  back: { title: string; target: string };
  trail?: BreadCrumpTrail;
  children?: ReactNode;
}) => {
  return (
    <div className={classes.container}>
      {trail?.length ? (
        <BreadCrump trail={trail} className={classes.crump} />
      ) : (
        <Link href={back.target} className={`${classes.back} ${txsMedium}`}>
          <span>{back.title}</span>
          <Ixon width="1.25rem" style={{ transform: "rotateZ(90deg)" }}>
            <ChevronIcon />
          </Ixon>
        </Link>
      )}
      <div className={classes.main}>{children}</div>
    </div>
  );
};

export default MedicalCenterLayout;
