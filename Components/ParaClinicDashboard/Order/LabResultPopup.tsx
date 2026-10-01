"use client";

import { useState } from "react";
import { API } from "@/Components/config";
import { fetcher } from "@/Components/helpers/fetcher";
import PopupCard from "@/Components/UI/PopupCard";
import Button from "@/Components/UI/Button";
import AreaInput from "@/Components/UI/AreaInput";
import usePopup from "@/Components/Hooks/usePopup";
import useNotification from "@/Components/Hooks/useNotification";
import useScopedLocale from "@/Components/Hooks/useScopedLocale";
import { ContentNamespace } from "@/Components/Enums/contentNamespaces";
import classes from "./LabResult.module.css";

const NS: ContentNamespace[] = ["common", "paraClinicPanelOrder"];

// The lab sends a test's result (2026-10): PDF or image files and a note;
// only the patient and the lab can open them, the patient is notified.
const LabResultPopup = ({
  orderId,
  lineId,
  onDone,
}: {
  orderId: string;
  lineId: string;
  onDone: () => unknown;
}) => {
  const getContent = useScopedLocale(NS);
  const { closePopup } = usePopup();
  const pushNotification = useNotification();
  const [files, setFiles] = useState<File[]>([]);
  const [note, setNote] = useState("");
  const [busy, setBusy] = useState(false);

  const submit = async () => {
    if (!files.length && !note.trim()) return pushNotification(getContent("labResultHint"), "Error");
    setBusy(true);
    try {
      await fetcher({
        url: `${API}/paraClinic/order/${orderId}/result/${lineId}`,
        method: "POST",
        payload: { files, ...(note.trim() ? { note: note.trim() } : {}) },
      });
      pushNotification(getContent("labResultSent"), "Success");
      closePopup();
      onDone();
    } catch (err) {
      pushNotification((err as Error)?.message || "", "Error");
    } finally {
      setBusy(false);
    }
  };

  return (
    <PopupCard title={getContent("labUpload")}>
      <div className={classes.form}>
        <p className={classes.hint}>{getContent("labResultHint")}</p>
        <label className={classes.file}>
          <input
            className={classes.fileInput}
            type="file"
            multiple
            accept="application/pdf,image/png,image/jpeg,image/webp"
            onChange={(e) => setFiles(Array.from(e.target.files || []).slice(0, 5))}
          />
          <span className={classes.fileButton}>{getContent("labChooseFiles")}</span>
          <span className={classes.fileNames} dir="auto">
            {files.map((f) => f.name).join("، ")}
          </span>
        </label>
        <AreaInput title={getContent("labResultNote")} onChange={(e) => setNote(e.target.value)} />
        <div className={classes.actions}>
          <Button onClick={submit} isLoading={busy}>
            {getContent("labUpload")}
          </Button>
          <Button variant="Neutral" onClick={() => closePopup()}>
            {getContent("cancel")}
          </Button>
        </div>
      </div>
    </PopupCard>
  );
};

export default LabResultPopup;
