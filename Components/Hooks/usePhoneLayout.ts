"use client";
import { useEffect, useState } from "react";

// the phone layout of the booking flow (the panels' 48rem breakpoint): a
// time tapped there is the choice itself - the next step opens at once
// (Doctolib / Zocdoc mobile), because a bottom "continue" bar can sit
// under an in-app browser's own toolbar and the tap then seems to do nothing
const QUERY = "(max-width: 48rem)";

const usePhoneLayout = () => {
  const [phone, setPhone] = useState(false);
  useEffect(() => {
    if (typeof window === "undefined" || !window.matchMedia) return;
    const mq = window.matchMedia(QUERY);
    const update = () => setPhone(mq.matches);
    update();
    mq.addEventListener?.("change", update);
    return () => mq.removeEventListener?.("change", update);
  }, []);
  return phone;
};

export default usePhoneLayout;
