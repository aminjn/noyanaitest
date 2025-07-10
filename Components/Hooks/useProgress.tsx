"use client";

import { useContext } from "react";
import ProgressContext from "../Store/ProgressContext";

const useProgress = () => {
  const { push } = useContext(ProgressContext);
  return push;
};

export default useProgress;
