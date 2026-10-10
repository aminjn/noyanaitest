"use client";

import { useContext } from "react";
import ProgressContext from "../Store/ProgressContext";

// true from a useProgress() push until the next page is on screen: a
// tapped time or button can show it is working meanwhile
const useProgressBusy = () => useContext(ProgressContext).isLoading;

export default useProgressBusy;
