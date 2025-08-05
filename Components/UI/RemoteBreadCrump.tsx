import { useContext } from "react";
import classes from "./RemoteBreadCrump.module.css";
import BreadCrumpContext from "../Store/BreadCrumpStore";
import BreadCrump from "./BreadCrump";

const RemoteBreadCrump = () => {
  const { trail } = useContext(BreadCrumpContext);
  return <BreadCrump trail={trail} />;
};

export default RemoteBreadCrump;
