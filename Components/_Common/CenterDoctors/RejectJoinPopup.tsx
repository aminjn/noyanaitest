"use client";

import { useState } from "react";
import PopupCard from "@/Components/UI/PopupCard";
import Button from "@/Components/UI/Button";
import AreaInput from "@/Components/UI/AreaInput";
import usePopup from "@/Components/Hooks/usePopup";
import useNotification from "@/Components/Hooks/useNotification";
import useScopedLocale from "@/Components/Hooks/useScopedLocale";
import { ContentNamespace } from "@/Components/Enums/contentNamespaces";
import classes from "./CenterDoctorsPage.module.css";

const NS: ContentNamespace[] = ["common", "centerDoctors"];

// declining a doctor's join request says why (the doctor is told)
const RejectJoinPopup = ({ onReject }: { onReject: (reason: string) => unknown }) => {
  const getContent = useScopedLocale(NS);
  const { closePopup } = usePopup();
  const pushNotification = useNotification();
  const [reason, setReason] = useState("");
  return (
    <PopupCard title={getContent("cdRejectReason")}>
      <div className={classes.popupBody}>
        <p className={classes.hint}>{getContent("cdRejectHint")}</p>
        <AreaInput title={getContent("cdRejectReason")} onChange={(e) => setReason(e.target.value)} />
        <div className={classes.popupActions}>
          <Button
            variant="Error"
            onClick={async () => {
              if (reason.trim().length < 3) return pushNotification(getContent("cdRejectReason"), "Error");
              await onReject(reason.trim());
              closePopup();
            }}
          >
            {getContent("reject")}
          </Button>
          <Button variant="Neutral" onClick={() => closePopup()}>
            {getContent("cancel")}
          </Button>
        </div>
      </div>
    </PopupCard>
  );
};

export default RejectJoinPopup;
