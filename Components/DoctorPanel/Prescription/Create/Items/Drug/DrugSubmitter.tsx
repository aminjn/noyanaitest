import useScopedLocale from "@/Components/Hooks/useScopedLocale";
import { ContentNamespace } from "@/Components/Enums/contentNamespaces";
import Button from "@/Components/UI/Button";
import { useCallback, useContext, useMemo } from "react";
import PrescriptionContext, {
  PrescriptionItem,
} from "../../../PrescriptionContext";
import useNotification from "@/Components/Hooks/useNotification";
import CheckIcon from "@/Components/Icons/CheckIcon";
import { nanoid } from "nanoid";
import { MongoDoc } from "@/Components/Hooks/useUser";

const LOCALE_NS: ContentNamespace[] = ["common", "doctorPanelPrescriptionDrugItem"];

export const isWorkingReady = (working: Partial<PrescriptionItem>) =>
  !!working.item &&
  !!working.amount &&
  !!working.instruction &&
  !!working.qty &&
  !!working.usage;

const DrugSubmitter = () => {
  const { working, setItems, setWorking } = useContext(PrescriptionContext);

  const isComplete = useMemo<boolean>(() => isWorkingReady(working), [working]);

  const pushNotification = useNotification();

  const getContent = useScopedLocale(LOCALE_NS);

  const onAdd = useCallback(() => {
    if (!isComplete) return pushNotification(getContent("checkInput"), "Warn");
    setItems((prev) => {
      const clone = [...prev];
      const index = clone.findIndex((el) => el._id === working._id);
      if (index === -1) {
        clone.push(working as PrescriptionItem & MongoDoc);
      } else {
        clone.splice(index, 1, working as PrescriptionItem & MongoDoc);
      }
      return clone;
    });
    setWorking({ _id: `${nanoid()}${new Date().getTime()}` });
  }, [getContent, isComplete, pushNotification, setItems, setWorking, working]);

  return (
    <Button
      onClick={onAdd}
      variant={isComplete ? "Primary" : "Neutral"}
      leadIcon={<CheckIcon />}
    >
      {getContent("addDrug")}
    </Button>
  );
};

export default DrugSubmitter;
