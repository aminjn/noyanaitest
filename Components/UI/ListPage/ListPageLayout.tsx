import { ReactNode } from "react";
import classes from "./ListPageLayout.module.css";
import BreadCrump from "../BreadCrump";
import { BreadCrumpTrail } from "@/Components/Store/BreadCrumpStore";

const ListPageLayout = ({
  children,
  trail,
}: {
  children: ReactNode;
  trail?: BreadCrumpTrail;
}) => {
  return (
    <div className={classes.main}>
      {!!trail?.length && (
        <BreadCrump trail={trail} className={classes.crump} />
      )}
      {children}
    </div>
  );
};

export default ListPageLayout;
