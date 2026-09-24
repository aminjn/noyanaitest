import Button from "@/Components/UI/Button";
import classes from "./LabAgent.module.css";
import { useCallback, useContext, useState } from "react";
import useSWR from "swr";
import { ITaminService } from "@/Components/Admin/Tamin/Service/AdminManageTaminServicesPage";
import { API } from "@/Components/config";
import { fetcher } from "@/Components/helpers/fetcher";
import PrescriptionContext, {
  generateRandomId,
  LabItem,
} from "../../PrescriptionContext";
import FancySelect from "@/Components/UI/FancySelect";
import FavoriteButton from "./Drug/FavoriteButton";
import LabItemGetter from "./Lab/LabItemGetter";
import Counter from "@/Components/UI/Counter";
import useScopedLocale from "@/Components/Hooks/useScopedLocale";
import { ContentNamespace } from "@/Components/Enums/contentNamespaces";
import { clamp } from "@/Components/helpers/lib";
import DateInput from "@/Components/UI/DateInput";
import useNotification from "@/Components/Hooks/useNotification";
import Input from "@/Components/UI/Input";
import { MongoDoc } from "@/Components/Hooks/useUser";

const LOCALE_NS: ContentNamespace[] = ["common", "doctorPanelPrescriptionEditor"];

const LabAgent = () => {
  const { setWorkingLab, workingLab, setLabItems } =
    useContext(PrescriptionContext);

  const getContent = useScopedLocale(LOCALE_NS);

  const pushNotification = useNotification();

  const onAdd = useCallback(() => {
    if (!workingLab.item || !workingLab.qty)
      return pushNotification(getContent("checkInput"), "Warn");
    setLabItems((prev) => {
      const clone = [...prev];
      const index = clone.findIndex((el) => el._id === workingLab._id);
      if (index === -1) {
        clone.push({ ...workingLab } as LabItem & MongoDoc);
      } else {
        clone.splice(index, 1, { ...workingLab } as LabItem & MongoDoc);
      }
      return clone;
    });
    setWorkingLab({ _id: generateRandomId() });
  }, [getContent, pushNotification, setLabItems, setWorkingLab, workingLab]);

  return (
    <div className={classes.main}>
      <LabItemGetter />
      <div className={classes.fields}>
        <Counter
          value={workingLab.qty || 0}
          title={getContent("testCount")}
          onTick={(tick) =>
            setWorkingLab((prev) => ({
              ...prev,
              qty: clamp(1, (prev.qty || 0) + tick, Number.MAX_SAFE_INTEGER),
            }))
          }
        />
        <DateInput
          title={getContent("testDoDate")}
          onChange={(e) => setWorkingLab((prev) => ({ ...prev, dateDo: e }))}
          defaultValue={workingLab.dateDo}
        />
      </div>
      <Input
        title={getContent("description")}
        onChange={(e) =>
          setWorkingLab((prev) => ({ ...prev, description: e.target.value }))
        }
        defaultValue={workingLab.description}
      />
      <div className={classes.actions}>
        <Button onClick={onAdd}>{getContent("addTest")}</Button>
      </div>
    </div>
  );
};

export default LabAgent;
