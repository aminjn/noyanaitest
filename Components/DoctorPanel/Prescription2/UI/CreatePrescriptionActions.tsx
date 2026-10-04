import Button from "@/Components/UI/Button";
import classes from "./CreatePrescriptionActions.module.css";
import { Fragment, useCallback, useState } from "react";
import useScopedLocale from "@/Components/Hooks/useScopedLocale";
import { ContentNamespace } from "@/Components/Enums/contentNamespaces";
import usePrescription from "../Store/usePrescription";
import useNotification from "@/Components/Hooks/useNotification";
import Act from "@/Components/UI/Act";
import { API } from "@/Components/config";
import { IPrescription2 } from "../Store/DoctorPrescriptionContext";
import useProgress from "@/Components/Hooks/useProgress";
import { useRxText } from "./VoiceRxBox";

const LOCALE_NS: ContentNamespace[] = ["common", "doctorPanelPrescriptionCreate"];

// lines the voice parser added and the doctor has not reviewed yet
const useUnreviewed = () => {
  const { items, aiMarks } = usePrescription();
  return items.some((i) => !!aiMarks[i._id]);
};

const Submitter = () => {
  const { items, patient, defaultValue, readOnly } = usePrescription();
  const unreviewed = useUnreviewed();
  const rx = useRxText();

  const [isDrafting, setIsDrafting] = useState<Record<string, unknown> | null>(
    null,
  );

  const [isCommiting, setIsCommiting] = useState<IPrescription2<
    Record<never, never>
  > | null>(null);

  const getContent = useScopedLocale(LOCALE_NS);

  const push = useProgress();

  const pushNotification = useNotification();

  const onSubmit = useCallback(() => {
    if (!!isDrafting || !!isCommiting) return;
    if (unreviewed) return pushNotification(rx("rxAiReviewFirst"), "Warn");
    if (!patient) return pushNotification(getContent("checkInput"), "Warn");
    if (!items.length)
      return pushNotification(getContent("checkInput"), "Warn");
    setIsDrafting({
      patient: patient._id,
      items: items.map((el) => ({
        item: el.service._id,
        qty: el.qty,
        timesADay: el.timesADay?._id,
        instruction: el.drugInstruction?._id,
        dose: el.dose,
        dateDo: el.dateDo,
      })),
    });
  }, [isDrafting, isCommiting, patient, pushNotification, getContent, items, unreviewed, rx]);

  if (readOnly || !!defaultValue) return null;
  return (
    <Fragment>
      <Button onClick={onSubmit} isLoading={!!isCommiting || !!isDrafting}>
        {getContent("commitPrescription")}
      </Button>
      <Act<{ data: IPrescription2<Record<never, never>> }>
        path={isDrafting ? `${API}/doctor/presc2` : null}
        method="POST"
        onDone={(status, result) => {
          setIsDrafting(null);
          if (!status || !result) return;
          setIsCommiting(result.data);
        }}
        payload={isDrafting || undefined}
        //TODO: remove notifs
        initMessage="Drafting"
        errorMessage="Draft Error"
        successMessage="Drafted"
      />
      <Act
        path={isCommiting ? `${API}/doctor/presc2/${isCommiting._id}` : null}
        method="PATCH"
        onDone={() => {
          if (!isCommiting) return;
          const id = isCommiting._id;
          setIsCommiting(null);
          push(`/doctorpanel/prescription/${id}`);
        }}
        initMessage="Commiting"
        successMessage="Committed"
        errorMessage="CommitFailed"
      />
    </Fragment>
  );
};

const Drafter = () => {
  const { items, patient, defaultValue, readOnly } = usePrescription();
  const unreviewed = useUnreviewed();
  const rx = useRxText();

  const [isLoading, setIsLoading] = useState<Record<string, unknown> | null>(
    null,
  );

  const getContent = useScopedLocale(LOCALE_NS);

  const pushNotification = useNotification();

  const push = useProgress();

  const onSubmit = useCallback(() => {
    if (!!isLoading) return;
    if (unreviewed) return pushNotification(rx("rxAiReviewFirst"), "Warn");
    if (!patient) return pushNotification(getContent("checkInput"), "Warn");
    if (!items.length)
      return pushNotification(getContent("checkInput"), "Warn");
    setIsLoading({
      patient: patient._id,
      items: items.map((el) => ({
        item: el.service._id,
        qty: el.qty,
        timesADay: el.timesADay?._id,
        instruction: el.drugInstruction?._id,
        dose: el.dose,
        dateDo: el.dateDo,
      })),
    });
  }, [isLoading, patient, pushNotification, getContent, items, unreviewed, rx]);

  if (readOnly) return null;
  if (!!defaultValue?.taminPrescriptions.length) return null;
  return (
    <Fragment>
      <Button isLoading={!!isLoading} onClick={onSubmit}>
        {getContent("draftPrescription")}
      </Button>
      <Act<{ data: IPrescription2<Record<never, never>> }>
        path={isLoading ? `${API}/doctor/presc2` : null}
        method="POST"
        onDone={(status, result) => {
          setIsLoading(null);
          if (!status || !result) return;
          push(`/doctorpanel/prescription/${result.data._id}`);
        }}
        payload={isLoading || undefined}
        //TODO: remove notifs
        initMessage="Drafting"
        errorMessage="Draft Error"
        successMessage="Drafted"
      />
    </Fragment>
  );
};

const Editor = () => {
  const { readOnly, defaultValue, items, refresh } = usePrescription();
  const unreviewed = useUnreviewed();
  const rx = useRxText();

  const [isLoading, setIsLoading] = useState<Record<string, unknown> | null>(
    null,
  );


  const getContent = useScopedLocale(LOCALE_NS);

  const pushNotification = useNotification();

  const onEdit = useCallback(() => {
    if (!!isLoading) return;
    if (unreviewed) return pushNotification(rx("rxAiReviewFirst"), "Warn");
    if (!items.length)
      return pushNotification(getContent("checkInput"), "Warn");
    setIsLoading({
      items: items.map((el) => ({
        item: el.service._id,
        qty: el.qty,
        timesADay: el.timesADay?._id,
        instruction: el.drugInstruction?._id,
        dose: el.dose,
        dateDo: el.dateDo,
      })),
    });
  }, [isLoading, items, getContent, pushNotification, unreviewed, rx]);

  if (readOnly || !defaultValue) return null;
  return (
    <Fragment>
      <Button isLoading={!!isLoading} onClick={onEdit}>
        {getContent("editPrescription")}
      </Button>
      <Act
        path={
          isLoading
            ? `${API}/doctor/presc2${!!defaultValue.taminPrescriptions.length ? "/tamin" : ""}/${defaultValue._id}`
            : null
        }
        method="POST"
        payload={isLoading || undefined}
        onDone={(status, result) => {
          setIsLoading(null);
          if (!status) return;
          refresh();
        }}
        initMessage="Editing"
        successMessage="edited"
        errorMessage="editFailed"
      />
    </Fragment>
  );
};

const Committer = () => {
  const { readOnly, defaultValue, refresh } = usePrescription();

  const [isLoading, setIsLoading] = useState<boolean>(false);

  const getContent = useScopedLocale(LOCALE_NS);

  if (!defaultValue || !readOnly || !!defaultValue.taminPrescriptions.length)
    return null;
  return (
    <Fragment>
      <Button onClick={() => setIsLoading(true)} isLoading={isLoading}>
        {getContent("commitPrescription")}
      </Button>
      <Act
        path={isLoading ? `${API}/doctor/presc2/${defaultValue._id}` : null}
        method="PATCH"
        onDone={(status) => {
          setIsLoading(false);
          if (!status) return;
          refresh();
        }}
        initMessage="Committing"
        errorMessage="CommitFailed"
        successMessage="CommitSuccess"
      />
    </Fragment>
  );
};

const ToggleEditMode = () => {
  const { readOnly, setReadOnly, defaultValue } = usePrescription();

  const getContent = useScopedLocale(LOCALE_NS);

  if (!defaultValue) return null;
  return (
    <Fragment>
      {readOnly ? (
        <Button onClick={() => setReadOnly(false)}>
          {getContent("enableEditPrescriptionMode")}
        </Button>
      ) : (
        <Button onClick={() => setReadOnly(true)}>
          {getContent("disableEditPrescriptionMode")}
        </Button>
      )}
    </Fragment>
  );
};

const Deleter = () => {
  const { readOnly, defaultValue, refresh } = usePrescription();

  const [isLoading, setIsLoading] = useState<boolean>(false);

  const getContent = useScopedLocale(LOCALE_NS);

  const push = useProgress();

  if (!readOnly || !defaultValue) return null;
  return (
    <Fragment>
      <Button
        isLoading={isLoading}
        onClick={() => setIsLoading(true)}
        variant="Error"
      >
        {getContent("deletePrescription")}
      </Button>
      <Act
        path={
          isLoading
            ? `${API}/doctor/presc2${!!defaultValue.taminPrescriptions.length ? "/tamin" : ""}/${defaultValue._id}`
            : null
        }
        method="PUT"
        initMessage="Deleting"
        errorMessage="DeleteFailed"
        successMessage="Deleted"
        onDone={(status) => {
          setIsLoading(false);
          if (!status) {
            if (defaultValue.taminPrescriptions.length) refresh();
            return;
          }
          push("/doctorpanel/prescription");
        }}
      />
    </Fragment>
  );
};

const CreatePrescriptionActions = () => {
  return (
    <div className={classes.main}>
      <Submitter />
      <Editor />
      <Committer />
      <Drafter />
      <Deleter />
      <ToggleEditMode />
    </div>
  );
};

export default CreatePrescriptionActions;
